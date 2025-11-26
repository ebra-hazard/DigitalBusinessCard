from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import List, Optional
import uuid
import slugify

import database_models as db
import models
from security import hash_password


# ========== Company Services ==========

async def create_company(session: AsyncSession, company_data: models.CompanyCreate) -> db.Company:
    """Create a new company."""
    base_slug = slugify.slugify(company_data.name)
    # Add UUID suffix to ensure uniqueness
    slug = f"{base_slug}-{str(uuid.uuid4())[:8]}"
    
    company = db.Company(
        name=company_data.name,
        domain=company_data.domain,
        logo_url=company_data.logo_url,
        brand_color=company_data.brand_color,
        slug=slug,
    )
    session.add(company)
    await session.commit()
    await session.refresh(company)
    return company


async def get_company_by_id(session: AsyncSession, company_id: uuid.UUID) -> Optional[db.Company]:
    """Get a company by ID."""
    result = await session.execute(select(db.Company).where(db.Company.id == company_id))
    return result.scalar_one_or_none()


async def get_company_by_slug(session: AsyncSession, slug: str) -> Optional[db.Company]:
    """Get a company by slug."""
    result = await session.execute(select(db.Company).where(db.Company.slug == slug))
    return result.scalar_one_or_none()


async def update_company(session: AsyncSession, company_id: uuid.UUID, company_data: dict) -> Optional[db.Company]:
    """Update company details (name, domain, logo_url, brand_color)."""
    company = await get_company_by_id(session, company_id)
    if not company:
        return None
    
    if "name" in company_data:
        company.name = company_data["name"]
    if "domain" in company_data:
        company.domain = company_data["domain"]
    if "logo_url" in company_data:
        company.logo_url = company_data["logo_url"]
    if "brand_color" in company_data:
        company.brand_color = company_data["brand_color"]
    
    session.add(company)
    await session.commit()
    await session.refresh(company)
    return company


async def update_company_branding(session: AsyncSession, company_id: uuid.UUID, branding_data: dict) -> db.Company:
    """Update company branding (brand_color and/or logo_url)."""
    company = await get_company_by_id(session, company_id)
    if not company:
        return None
    
    if "brand_color" in branding_data:
        company.brand_color = branding_data["brand_color"]
    if "logo_url" in branding_data:
        company.logo_url = branding_data["logo_url"]
    
    session.add(company)
    await session.commit()
    await session.refresh(company)
    return company


async def list_companies(session: AsyncSession) -> List[db.Company]:
    """List all companies."""
    result = await session.execute(select(db.Company))
    return result.scalars().all()


# ========== Employee Services ==========

async def create_employee(
    session: AsyncSession,
    company_id: uuid.UUID,
    employee_data: models.EmployeeCreate
) -> db.Employee:
    """Create a new employee."""
    # Generate slug from name
    base_slug = slugify.slugify(employee_data.full_name)
    public_slug = f"{base_slug}-{str(uuid.uuid4())[:8]}"
    
    employee = db.Employee(
        company_id=company_id,
        full_name=employee_data.full_name,
        job_title=employee_data.job_title,
        email=employee_data.email,
        phone=employee_data.phone,
        whatsapp=getattr(employee_data, 'whatsapp', None),
        photo_url=getattr(employee_data, 'photo_url', None),
        bio=getattr(employee_data, 'bio', None),
        social_links=getattr(employee_data, 'social_links', {}),
        public_slug=public_slug,
    )
    session.add(employee)
    await session.commit()
    await session.refresh(employee, ["company"])
    
    # Create a card for the employee
    await create_card(session, employee)
    
    return employee


async def get_employee_by_id(session: AsyncSession, employee_id: uuid.UUID) -> Optional[db.Employee]:
    """Get an employee by ID."""
    result = await session.execute(
        select(db.Employee)
        .options(selectinload(db.Employee.company))
        .where(db.Employee.id == employee_id)
    )
    return result.scalar_one_or_none()


async def get_employee_by_slug(
    session: AsyncSession,
    company_slug: str,
    employee_slug: str
) -> Optional[dict]:
    """Get an employee by company and employee slug (public lookup).

    Returns the ORM `Employee` instance with its `company` relationship loaded
    (so callers can access `employee.company.slug`).
    """
    result = await session.execute(
        select(db.Employee)
        .join(db.Company, db.Employee.company_id == db.Company.id)
        .where(db.Company.slug == company_slug)
        .where(db.Employee.public_slug == employee_slug)
        .options(selectinload(db.Employee.company))
    )
    return result.scalar_one_or_none()


async def list_employees(session: AsyncSession, company_id: uuid.UUID, skip: int = 0, limit: int = 100) -> List[db.Employee]:
    """List all employees in a company with pagination."""
    result = await session.execute(
        select(db.Employee)
        .where(db.Employee.company_id == company_id)
        .options(selectinload(db.Employee.company))
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


async def update_employee(
    session: AsyncSession,
    employee_id: uuid.UUID,
    employee_data: models.EmployeeUpdate
) -> Optional[db.Employee]:
    """Update an employee."""
    employee = await get_employee_by_id(session, employee_id)
    if not employee:
        return None
    
    update_data = employee_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        if hasattr(employee, key):
            setattr(employee, key, value)
    
    session.add(employee)
    await session.commit()
    await session.refresh(employee)
    return employee


async def delete_employee(
    session: AsyncSession,
    employee_id: uuid.UUID
) -> bool:
    """Delete an employee and associated card."""
    employee = await get_employee_by_id(session, employee_id)
    if not employee:
        return False
    
    # Delete associated card first (foreign key constraint)
    card = await get_card_by_employee(session, employee_id)
    if card:
        await session.delete(card)
    
    # Delete employee
    await session.delete(employee)
    await session.commit()
    return True


# ========== Card Services ==========

async def create_card(session: AsyncSession, employee: db.Employee) -> db.Card:
    """Create a digital card for an employee."""
    # Resolve company slug so public URLs use human-friendly slugs (not UUIDs)
    company = await get_company_by_id(session, employee.company_id)
    company_slug = company.slug if company else str(employee.company_id)

    # Use environment variables for URLs - allows dynamic configuration on network changes
    import os
    API_HOST = os.getenv("API_HOST", "localhost")
    API_PORT = os.getenv("API_PORT", "8000")
    FRONTEND_HOST = os.getenv("FRONTEND_HOST", "localhost")
    FRONTEND_PORT = os.getenv("FRONTEND_PORT", "3000")
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
    
    # Determine protocol based on environment
    PROTOCOL = "https" if ENVIRONMENT == "production" else "http"
    
    # Card URL for viewing the digital card
    card_url = f"{PROTOCOL}://{FRONTEND_HOST}:{FRONTEND_PORT}/card/{company_slug}/{employee.public_slug}"
    
    # QR code URL - points to the new QR endpoint that redirects to the QR image
    qr_url = f"{PROTOCOL}://{API_HOST}:{API_PORT}/api/card/{company_slug}/{employee.public_slug}/qr-vcard"

    # vCard URL - points to the API endpoint that returns the .vcf file
    vcard_url = f"{PROTOCOL}://{API_HOST}:{API_PORT}/api/card/{company_slug}/{employee.public_slug}/vcard"
    
    card = db.Card(
        employee_id=employee.id,
        url=card_url,
        qr_code=qr_url,
        vcard_url=vcard_url,
    )
    session.add(card)
    await session.commit()
    await session.refresh(card)
    return card


async def get_card_by_employee(session: AsyncSession, employee_id: uuid.UUID) -> Optional[db.Card]:
    """Get a card for an employee."""
    result = await session.execute(
        select(db.Card)
        .options(selectinload(db.Card.employee))
        .where(db.Card.employee_id == employee_id)
    )
    return result.scalar_one_or_none()


# ========== User Services ==========

async def create_user(
    session: AsyncSession,
    user_data: models.UserCreate,
    company_id: uuid.UUID
) -> db.User:
    """Create a new user."""
    user = db.User(
        company_id=company_id,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        full_name=user_data.full_name,
        role=getattr(user_data, 'role', 'admin'),
        is_active=True,
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


async def get_user_by_email(session: AsyncSession, email: str) -> Optional[db.User]:
    """Get a user by email."""
    result = await session.execute(
        select(db.User)
        .options(selectinload(db.User.company))
        .where(db.User.email == email)
    )
    return result.scalar_one_or_none()


async def get_user_by_id(session: AsyncSession, user_id: uuid.UUID) -> Optional[db.User]:
    """Get a user by ID."""
    result = await session.execute(
        select(db.User)
        .options(selectinload(db.User.company))
        .where(db.User.id == user_id)
    )
    return result.scalar_one_or_none()


# ========== Analytics Services ==========

async def track_event(
    session: AsyncSession,
    company_id: uuid.UUID,
    event_data: models.AnalyticsEventCreate,
    employee_id: Optional[uuid.UUID] = None,
) -> db.AnalyticsEvent:
    """Track an analytics event."""
    from datetime import datetime
    
    event = db.AnalyticsEvent(
        company_id=company_id,
        employee_id=employee_id,
        timestamp=datetime.utcnow(),
        device=event_data.device,
        region=event_data.region,
        action=event_data.action,
        ip_address=getattr(event_data, 'ip_address', None),
    )
    session.add(event)
    await session.commit()
    await session.refresh(event)
    return event


async def get_analytics_by_company(
    session: AsyncSession,
    company_id: uuid.UUID
) -> List[db.AnalyticsEvent]:
    """Get all analytics events for a company."""
    result = await session.execute(
        select(db.AnalyticsEvent)
        .where(db.AnalyticsEvent.company_id == company_id)
        .order_by(db.AnalyticsEvent.timestamp.desc())
    )
    return result.scalars().all()


async def get_analytics_by_employee(
    session: AsyncSession,
    employee_id: uuid.UUID
) -> List[db.AnalyticsEvent]:
    """Get all analytics events for an employee."""
    result = await session.execute(
        select(db.AnalyticsEvent)
        .where(db.AnalyticsEvent.employee_id == employee_id)
        .order_by(db.AnalyticsEvent.timestamp.desc())
    )
    return result.scalars().all()


async def get_analytics_summary(session: AsyncSession, company_id: uuid.UUID) -> dict:
    """Get analytics summary for a company."""
    result = await session.execute(
        select(
            db.AnalyticsEvent.action,
            func.count(db.AnalyticsEvent.id).label('count')
        )
        .where(db.AnalyticsEvent.company_id == company_id)
        .group_by(db.AnalyticsEvent.action)
    )
    
    summary = {}
    for action, count in result.all():
        summary[action] = count
    
    return summary
