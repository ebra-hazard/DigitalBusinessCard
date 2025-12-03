# Local Testing Checklist - Before Day 3 Deployment

This checklist should be completed locally to ensure everything is working correctly before deploying to the production droplet.

## 🧪 Pre-Deployment Testing

### 1. Database & Backend Setup
- [ ] PostgreSQL is running locally
- [ ] Backend virtual environment created
- [ ] Python dependencies installed from requirements.txt
- [ ] Database migrations run successfully
- [ ] Backend starts without errors: `uvicorn backend.main:app --reload`
- [ ] API health check works: `curl http://localhost:8000/health`

### 2. Frontend Setup
- [ ] Node.js dependencies installed: `npm install` in frontend/
- [ ] Frontend dev server starts: `npm run dev`
- [ ] Landing page loads at http://localhost:3000
- [ ] No console errors in browser DevTools

### 3. Authentication Flow
- [ ] Can navigate to signup page
- [ ] Can create new account with valid email/password
- [ ] Signup returns JWT token
- [ ] Can login with created account
- [ ] JWT token stored in localStorage
- [ ] Can access protected pages while logged in
- [ ] Cannot access protected pages without token

### 4. Company & Employee Management
- [ ] Can create company from signup flow
- [ ] Can view company dashboard
- [ ] Can add employee with all fields
- [ ] Employee is saved to database
- [ ] Can edit employee details
- [ ] Can delete employee
- [ ] Employee list shows all added employees
- [ ] Public slug is unique and URL-safe

### 5. Card Viewing & Sharing
- [ ] Can view public card at `/card/[company_slug]/[employee_slug]`
- [ ] Card displays employee information correctly
- [ ] Card styling matches company branding colors
- [ ] QR code displays and is scannable
- [ ] vCard download works
- [ ] Social media links open correctly
- [ ] Contact buttons (email, phone, WhatsApp) work
- [ ] Analytics event is tracked when card is viewed

### 6. Branding Customization
- [ ] Can access branding settings page
- [ ] Color picker works
- [ ] Card template selection dropdown works
- [ ] Social media fields can be edited
- [ ] Preview updates when colors change
- [ ] Save button submits data to backend
- [ ] Settings are saved to database
- [ ] Saved settings persist after page reload

### 7. Analytics Dashboard
- [ ] Can view company analytics
- [ ] Card view count updates after viewing card
- [ ] Action breakdown shows different types of interactions
- [ ] Timestamps are displayed correctly
- [ ] Analytics endpoint returns proper data

### 8. Modern UI/UX
- [ ] Landing page looks professional and modern
- [ ] Responsive design works on mobile (375px) and tablet (768px)
- [ ] Gradients render correctly
- [ ] Animations and transitions work smoothly
- [ ] Buttons have proper hover states
- [ ] Color scheme is cohesive throughout
- [ ] Typography is clear and readable
- [ ] No visual glitches or misalignments

### 9. API Endpoints (Test with curl or Postman)

```bash
# Health check
curl http://localhost:8000/health

# Signup
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@1234","full_name":"Test User"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@1234"}'

# Create employee
curl -X POST http://localhost:8000/api/company/{company_id}/employees \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"full_name":"John Doe","email":"john@example.com",...}'

# Update branding
curl -X PUT http://localhost:8000/api/company/{company_id}/branding \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"brand_color":"#0066CC","brand_secondary_color":"#FFFFFF",...}'

# Get analytics
curl http://localhost:8000/api/analytics/company/{company_id} \
  -H "Authorization: Bearer {token}"
```

### 10. Error Handling
- [ ] Invalid login returns 401
- [ ] Unauthorized access returns 403
- [ ] Non-existent card returns 404
- [ ] Invalid email returns 400
- [ ] Duplicate email returns 400
- [ ] Validation errors show meaningful messages
- [ ] Error pages display gracefully

### 11. Performance Checks
- [ ] Landing page loads in < 2 seconds
- [ ] Card page loads in < 1.5 seconds
- [ ] Dashboard loads in < 2 seconds
- [ ] API responses are < 200ms
- [ ] No memory leaks after extended use
- [ ] Images load without delays
- [ ] Animations are smooth (60fps)

### 12. Security Checks
- [ ] Passwords are hashed (never plain text in DB)
- [ ] JWT tokens include expiration
- [ ] CORS headers are properly set
- [ ] No sensitive data in API responses
- [ ] SQL injection attempts fail safely
- [ ] XSS protection is in place
- [ ] CSRF protection enabled if applicable

### 13. Browser Compatibility
- [ ] Works in Chrome/Chromium
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in Edge
- [ ] Mobile browser (iOS Safari/Chrome)

### 14. Data Validation
- [ ] Email format validation works
- [ ] Password strength validation works
- [ ] Phone number format accepted
- [ ] URL validation for website/social links
- [ ] Hex color validation for branding colors
- [ ] File upload size limits enforced
- [ ] Special characters handled properly

### 15. Mobile Responsiveness
- [ ] Mobile navigation works
- [ ] Touch interactions are responsive
- [ ] Text is readable (not too small)
- [ ] Buttons are easily tappable (48px minimum)
- [ ] Images scale appropriately
- [ ] No horizontal scrolling
- [ ] Layout adjusts for different screen sizes

---

## 🔧 Quick Local Test Script

Run this to quickly test all endpoints:

```bash
#!/bin/bash

BASE_URL="http://localhost:8000"

echo "Testing API endpoints..."

# Health check
echo "1. Health check..."
curl -s $BASE_URL/health | jq .

# Signup
echo "2. Signup..."
TOKEN=$(curl -s -X POST $BASE_URL/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@1234","full_name":"Test User"}' | jq -r .access_token)

echo "Token: $TOKEN"

# List employees
echo "3. List employees..."
curl -s -H "Authorization: Bearer $TOKEN" \
  $BASE_URL/api/employees | jq .

# List companies
echo "4. List companies..."
curl -s -H "Authorization: Bearer $TOKEN" \
  $BASE_URL/api/companies | jq .

echo "All tests completed!"
```

---

## ✅ Sign-Off Checklist

Before moving to production deployment, confirm:

- [ ] All 15 test categories have been verified
- [ ] No critical bugs found
- [ ] Performance is acceptable
- [ ] Security measures are in place
- [ ] All data persists correctly
- [ ] Mobile responsiveness is verified
- [ ] API endpoints respond correctly
- [ ] Database migrations work
- [ ] Code has been committed to GitHub
- [ ] Environment variables are documented
- [ ] Deployment script has been tested (locally simulated)
- [ ] Team is ready for deployment

---

## 📝 Issue Tracking

If any issues are found during testing:

1. Document the issue here
2. Reproduce it consistently
3. Fix in the codebase
4. Test the fix
5. Commit to GitHub
6. Repeat until all issues resolved

### Issues Found:
(Add any issues discovered during testing)

---

## 🚀 Ready for Deployment

Once all checks are complete and any issues have been resolved, the application is ready for deployment to the production droplet.

**Next Step**: Run `bash deploy.sh 174.138.12.114 digitalbc.sword-academy.net`

---

**Date Started**: [Your Date]
**Date Completed**: [Your Date]
**Tested By**: [Your Name]
**Status**: [ ] Ready for Production [ ] Issues Found (See list above)

