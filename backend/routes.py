from fastapi import APIRouter, Depends, HTTPException, Query, Header, Body
from fastapi.responses import FileResponse, RedirectResponse, Response
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import uuid
import urllib.parse

import services
import models
import vcard_utils
from database import get_db
from security import create_access_token, decode_token, verify_password, hash_password

router = APIRouter(prefix="/api", tags=["digital-cards"])


# ========== Dependency: Extract user from token ==========

async def get_current_user(
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Extract current user from JWT token.
    
    Supports two authentication methods:
    1. Header: Authorization: Bearer <token>
    2. Query parameter: ?token=<token>
    """
    # Extract token from Authorization header or query parameter
    extracted_token = None
    
    if authorization:
        # Extract Bearer token from Authorization header
        if authorization.startswith("Bearer "):
            extracted_token = authorization[7:]  # Remove "Bearer " prefix
        else:
            raise HTTPException(status_code=401, detail="Invalid authorization header")
    elif token:
        # Use token from query parameter
        extracted_token = token
    else:
        raise HTTPException(status_code=401, detail="Missing token")
    
    try:
        payload = decode_token(extracted_token)
        user_id = uuid.UUID(payload.get("sub"))
        company_id = payload.get("company_id")
        if company_id:
            company_id = uuid.UUID(company_id)
        role = payload.get("role", "employee")
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    
    user = await services.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return {"user_id": user_id, "company_id": company_id, "role": role, "user": user}


# ========== Public Routes ==========

@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


@router.post("/auth/signup", response_model=models.TokenResponse)
async def signup(user_data: models.UserCreate, db: AsyncSession = Depends(get_db)):
    """Sign up a new user (company admin)."""
    existing_user = await services.get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create company for new user
    company_data = models.CompanyCreate(
        name=f"{user_data.full_name}'s Company",
        domain=None,
    )
    company = await services.create_company(db, company_data)
    
    # Create admin user
    user = await services.create_user(db, user_data, company_id=company.id)
    
    # Generate token
    access_token = create_access_token(
        user_id=user.id,
        company_id=company.id,
        role=user.role,
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "company_id": company.id,
        "role": user.role,
    }


@router.post("/auth/change-password")
async def change_password(
    password_data: dict = Body(...),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Change user password (authenticated users only)."""
    user_id = current_user.get("user_id")
    current_password = password_data.get("current_password")
    new_password = password_data.get("new_password")
    
    if not user_id or not current_password or not new_password:
        raise HTTPException(status_code=400, detail="Missing required fields")
    
    user = await services.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify current password
    if not verify_password(current_password, user.password_hash):
        raise HTTPException(status_code=401, detail="Current password is incorrect")
    
    # Update password
    user.password_hash = hash_password(new_password)
    db.add(user)
    await db.commit()
    
    return {"message": "Password changed successfully"}


@router.post("/auth/reset-password-request")
async def reset_password_request(
    reset_data: dict = Body(...),
    db: AsyncSession = Depends(get_db),
):
    """Request password reset via email (placeholder implementation)."""
    email = reset_data.get("email")
    
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    
    user = await services.get_user_by_email(db, email)
    if not user:
        # Don't reveal if email exists for security
        return {"message": "If an account with this email exists, a reset link has been sent"}
    
    # TODO: In production, send email with reset token
    # For now, just return success message
    # In a real app, you would:
    # 1. Generate a reset token
    # 2. Store it in database with expiration
    # 3. Send email with reset link containing the token
    
    return {"message": "Password reset link sent to email"}


@router.post("/auth/login", response_model=models.TokenResponse)
async def login(credentials: models.UserLogin, db: AsyncSession = Depends(get_db)):
    """Login user."""
    user = await services.get_user_by_email(db, credentials.email)
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(
        user_id=user.id,
        company_id=user.company_id,
        role=user.role,
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "company_id": user.company_id,
        "role": user.role,
    }


# ========== Public Card View ==========

@router.get("/card/{company_slug}/{employee_slug}", response_model=models.BusinessCardResponse)
async def get_public_card(
    company_slug: str,
    employee_slug: str,
    db: AsyncSession = Depends(get_db),
):
    """Get public digital card view (no auth required)."""
    employee = await services.get_employee_by_slug(db, company_slug, employee_slug)
    if not employee:
        raise HTTPException(status_code=404, detail="Card not found")
    
    card = await services.get_card_by_employee(db, employee.id)
    
    return models.BusinessCardResponse(
        employee_id=employee.id,
        employee_name=employee.full_name,
        company_name=employee.company.name,
        company_id=employee.company.id,
        job_title=employee.job_title,
        email=employee.email,
        phone=employee.phone,
        whatsapp=employee.whatsapp,
        bio=employee.bio,
        photo_url=employee.photo_url,
        social_links=employee.social_links,
        qr_code=card.qr_code if card else None,
        vcard_url=card.vcard_url if card else None,
        company_logo=employee.company.logo_url,
        company_brand_color=employee.company.brand_color,
    )


# ========== Company Admin Routes ==========

@router.post("/company", response_model=models.CompanyResponse)
async def create_company_endpoint(
    company_data: models.CompanyCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new company (admin only)."""
    if current_user["role"] not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    company = await services.create_company(db, company_data)
    return company


@router.get("/company/{company_id}", response_model=models.CompanyResponse)
async def get_company_endpoint(
    company_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get company details."""
    if current_user["company_id"] != company_id and current_user["role"] != "superadmin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    company = await services.get_company_by_id(db, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    return company


@router.put("/company/{company_id}", response_model=models.CompanyResponse)
async def update_company_endpoint(
    company_id: uuid.UUID,
    company_update: models.CompanyUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update company details (name, domain, logo, brand color)."""
    if current_user["company_id"] != company_id and current_user["role"] != "superadmin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    company = await services.get_company_by_id(db, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Validate brand_color if provided
    if company_update.brand_color:
        color = company_update.brand_color
        if not isinstance(color, str) or (not color.startswith("#") or len(color) not in (7, 4)):
            raise HTTPException(status_code=400, detail="Invalid color format. Use hex format: #RGB or #RRGGBB")
    
    # Update company
    updated_data = company_update.dict(exclude_unset=True)
    company = await services.update_company(db, company_id, updated_data)
    
    return company


# ========== Employee Routes ==========

@router.post("/company/{company_id}/employees", response_model=models.EmployeeResponse)
async def create_employee_endpoint(
    company_id: uuid.UUID,
    employee_data: models.EmployeeCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new employee for a company."""
    if current_user["company_id"] != company_id and current_user["role"] != "superadmin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    employee = await services.create_employee(db, company_id, employee_data)
    # Convert to dict and add company slug
    emp_data = models.EmployeeResponse.from_orm(employee).dict()
    if hasattr(employee, 'company') and employee.company:
        emp_data['company_slug'] = employee.company.slug
    return emp_data


@router.get("/company/{company_id}/employees", response_model=List[models.EmployeeResponse])
async def list_employees_endpoint(
    company_id: uuid.UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List employees for a company."""
    if current_user["company_id"] != company_id and current_user["role"] != "superadmin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    employees = await services.list_employees(db, company_id, skip, limit)
    # Add company slug to each employee
    result = []
    for employee in employees:
        emp_data = models.EmployeeResponse.from_orm(employee).dict()
        if hasattr(employee, 'company') and employee.company:
            emp_data['company_slug'] = employee.company.slug
        result.append(emp_data)
    return result


@router.get("/employees/{employee_id}", response_model=models.EmployeeResponse)
async def get_employee_endpoint(
    employee_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get employee details."""
    employee = await services.get_employee_by_id(db, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Multi-tenant check
    if employee.company_id != current_user["company_id"] and current_user["role"] != "superadmin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Convert to dict and add company slug
    emp_data = models.EmployeeResponse.from_orm(employee).dict()
    if hasattr(employee, 'company') and employee.company:
        emp_data['company_slug'] = employee.company.slug
    return emp_data


@router.put("/employees/{employee_id}", response_model=models.EmployeeResponse)
async def update_employee_endpoint(
    employee_id: uuid.UUID,
    employee_data: models.EmployeeUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update employee profile."""
    employee = await services.get_employee_by_id(db, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Multi-tenant check: employee can only update their own, admin can update all in their company
    if current_user["role"] == "employee" and current_user["user"].id != employee_id:
        raise HTTPException(status_code=403, detail="Can only update your own profile")
    
    if employee.company_id != current_user["company_id"] and current_user["role"] != "superadmin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    updated_employee = await services.update_employee(db, employee_id, employee_data)
    # Convert to dict and add company slug
    emp_data = models.EmployeeResponse.from_orm(updated_employee).dict()
    if hasattr(updated_employee, 'company') and updated_employee.company:
        emp_data['company_slug'] = updated_employee.company.slug
    return emp_data


@router.delete("/employees/{employee_id}")
async def delete_employee_endpoint(
    employee_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete an employee (admin only)."""
    employee = await services.get_employee_by_id(db, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Admin can only delete employees from their own company
    if employee.company_id != current_user["company_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Only admins can delete employees
    if current_user["role"] not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Only admins can delete employees")
    
    success = await services.delete_employee(db, employee_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete employee")
    
    return {"message": "Employee deleted successfully", "employee_id": employee_id}


# ========== Branding Routes ==========

@router.get("/company/{company_id}/branding")
async def get_company_branding(
    company_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get company branding settings (admin only)."""
    # Verify user owns this company
    if company_id != current_user["company_id"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    company = await services.get_company_by_id(db, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    return {
        "brand_color": company.brand_color or "#3B82F6",
        "logo_url": company.logo_url,
        "company_name": company.name,
        "slug": company.slug,
    }


@router.put("/company/{company_id}/branding")
async def update_company_branding(
    company_id: uuid.UUID,
    branding_update: dict,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update company branding settings (admin only)."""
    # Verify user owns this company
    if company_id != current_user["company_id"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    company = await services.get_company_by_id(db, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Validate brand_color if provided
    if "brand_color" in branding_update:
        color = branding_update["brand_color"]
        if not isinstance(color, str) or (not color.startswith("#") or len(color) not in (7, 4)):
            raise HTTPException(status_code=400, detail="Invalid color format. Use hex format: #RGB or #RRGGBB")
    
    # Update company branding
    company = await services.update_company_branding(db, company_id, branding_update)
    
    return {
        "status": "updated",
        "brand_color": company.brand_color,
        "logo_url": company.logo_url,
        "message": "Branding updated successfully",
    }


# ========== Analytics Routes ==========

@router.post("/analytics/track")
async def track_analytics(
    event_data: models.AnalyticsEventCreate,
    company_slug: str = Query(...),
    employee_slug: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """Track an analytics event (public, no auth required)."""
    employee = await services.get_employee_by_slug(db, company_slug, employee_slug)
    if not employee:
        raise HTTPException(status_code=404, detail="Card not found")
    
    event = await services.track_event(
        db,
        employee.company_id,
        employee.id,
        event_data,
    )
    
    return {"status": "tracked", "event_id": event.id}


@router.get("/analytics/company/{company_id}")
async def get_company_analytics(
    company_id: uuid.UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(1000, ge=1, le=10000),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get analytics for a company."""
    if current_user["company_id"] != company_id and current_user["role"] != "superadmin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    events = await services.get_analytics_by_company(db, company_id, skip, limit)
    summary = await services.get_analytics_summary(db, company_id)
    
    return {
        "events": [models.AnalyticsResponse.from_orm(e) for e in events],
        "summary": summary,
    }


@router.get("/analytics/employee/{employee_id}")
async def get_employee_analytics(
    employee_id: uuid.UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(1000, ge=1, le=10000),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get analytics for an employee."""
    employee = await services.get_employee_by_id(db, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    if employee.company_id != current_user["company_id"] and current_user["role"] != "superadmin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    events = await services.get_analytics_by_employee(db, employee_id, skip, limit)
    
    return {
        "events": [models.AnalyticsResponse.from_orm(e) for e in events],
    }


# ========== vCard & QR Code Routes ==========

@router.get("/card/{company_slug}/{employee_slug}/vcard")
async def get_vcard(
    company_slug: str,
    employee_slug: str,
    db: AsyncSession = Depends(get_db),
):
    """Download vCard file for a business card (RFC 3.0 format).
    
    This endpoint returns a .vcf file that can be imported into contacts apps.
    When accessed, it triggers a download of the vCard file.
    """
    # Get employee and verify card exists
    employee = await services.get_employee_by_slug(db, company_slug, employee_slug)
    if not employee:
        raise HTTPException(status_code=404, detail="Card not found")
    
    # Generate vCard content
    vcard_content = vcard_utils.generate_vcard(
        full_name=employee.full_name,
        job_title=employee.job_title,
        email=employee.email,
        phone=employee.phone,
        whatsapp=employee.whatsapp,
        company_name=employee.company.name if employee.company else None,
        photo_url=employee.photo_url,
        bio=employee.bio,
        social_links=employee.social_links,
    )
    
    # Track analytics event
    await services.track_event(
        db,
        employee.company_id,
        models.AnalyticsEventCreate(
            action="download_vcard",
        ),
        employee.id,
    )
    
    # Return as downloadable file
    filename = f"{employee.full_name.replace(' ', '_')}.vcf"
    return Response(
        content=vcard_content.encode('utf-8'),
        media_type="text/vcard; charset=utf-8",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        },
    )


@router.get("/card/{company_slug}/{employee_slug}/qr-vcard")
async def get_qr_vcard(
    company_slug: str,
    employee_slug: str,
    db: AsyncSession = Depends(get_db),
):
    """Generate QR code that links to vCard download.
    
    This endpoint generates a QR code image that, when scanned, directs users
    to the vCard download endpoint. Users can then save the contact to their device.
    
    The QR code is generated server-side and returned as a redirect to the QR Server API.
    """
    # Get employee and verify card exists
    employee = await services.get_employee_by_slug(db, company_slug, employee_slug)
    if not employee:
        raise HTTPException(status_code=404, detail="Card not found")
    
    # Build vCard URL using environment variables for dynamic configuration
    import os
    API_HOST = os.getenv("API_HOST", "localhost")
    API_PORT = os.getenv("API_PORT", "8000")
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
    PROTOCOL = "https" if ENVIRONMENT == "production" else "http"
    
    vcard_url = f"{PROTOCOL}://{API_HOST}:{API_PORT}/api/card/{company_slug}/{employee_slug}/vcard"
    
    # Generate QR code URL from QR Server API
    qr_image_url = f"https://api.qrserver.com/v1/create-qr-code/?size=400x400&data={urllib.parse.quote(vcard_url)}"
    
    # Track analytics event
    await services.track_event(
        db,
        employee.company_id,
        models.AnalyticsEventCreate(
            action="scan_qr",
        ),
        employee.id,
    )
    
    # Redirect to QR Server API to get the image
    return RedirectResponse(url=qr_image_url)
