# Digital Business Cards - 3-Day Revamp Plan

## 🎯 Objective
Transform the project to use Strapi CMS backend + modern Next.js frontend (inspired by Blinq.me design) without Docker.

## 📋 Tech Stack Changes

### Old Stack
- Backend: FastAPI + Python
- Frontend: Next.js 14 + Tailwind
- Database: PostgreSQL
- Deployment: Docker Compose

### New Stack
- Backend: Strapi 5 (Headless CMS + Node.js)
- Frontend: Next.js 14 + Shadcn/UI + Tailwind
- Database: PostgreSQL (same, enhanced schema)
- Deployment: Direct to server (PM2 for process management)

## 📊 Enhanced Database Schema (Strapi Content Types)

### 1. Company
- name (string)
- slug (slug - unique)
- description (text)
- logo (media)
- branding_color (string - hex color)
- branding_background (media)
- website (string)
- email (string)
- phone (string)
- published_at (date)

### 2. Employee
- first_name (string)
- last_name (string)
- email (string)
- phone (string)
- job_title (string)
- department (string)
- bio (text)
- profile_photo (media)
- company (relation to Company)
- published_at (date)
- relations (employees relation for networking)

### 3. Card
- title (string)
- slug (slug - unique)
- description (text)
- employee (relation to Employee)
- company (relation to Company)
- background_style (enum: solid, gradient, image)
- background_color (string)
- background_image (media)
- social_links (json)
- custom_fields (json)
- published_at (date)

### 4. CardView (Analytics)
- card (relation to Card)
- viewer_email (string - optional)
- viewer_name (string - optional)
- view_timestamp (date)
- ip_address (string)
- device_type (string)
- country (string)

### 5. User (Strapi Built-in)
- email (string)
- username (string)
- password (string)
- company (relation to Company)
- role (enum: admin, employee, superadmin)

## 🎨 Design Inspiration (Blinq.me)

### Key Features to Implement
1. **Card Customization**
   - Gradient backgrounds
   - Custom colors per company
   - Profile photo display
   - Social media links

2. **Sharing Options**
   - QR Code generation (already have)
   - Public link
   - vCard download
   - Share buttons (email, SMS, social)

3. **Modern UI/UX**
   - Clean, minimalist design
   - Responsive mobile-first layout
   - Smooth animations/transitions
   - Easy-to-use card editor
   - One-tap save for viewers

4. **Analytics Dashboard**
   - View count per card
   - Geographic data
   - Device breakdown
   - Engagement trends

## 📅 3-Day Timeline

### Day 1: Setup & Backend (8 hours)
**Goal: Strapi fully functional locally**

- [ ] 00:00-01:00: Create new Strapi project
- [ ] 01:00-02:00: Configure PostgreSQL connection
- [ ] 02:00-04:00: Create content types (Company, Employee, Card, CardView, User)
- [ ] 04:00-05:00: Set up authentication & permissions
- [ ] 05:00-06:00: Create API routes & test with Postman
- [ ] 06:00-07:00: Add sample data
- [ ] 07:00-08:00: Document API endpoints

**Deliverable**: Working Strapi backend on localhost:1337

---

### Day 2: Frontend Redesign (8 hours)
**Goal: Modern UI implemented, connected to Strapi**

- [ ] 00:00-01:00: Clean up old Next.js code
- [ ] 01:00-02:00: Install Shadcn/UI, set up component library
- [ ] 02:00-04:00: Build new page layouts (landing, auth, dashboard, card editor, card viewer)
- [ ] 04:00-05:00: Implement card customization UI
- [ ] 05:00-06:00: Add animations & transitions
- [ ] 06:00-07:00: Connect to Strapi API
- [ ] 07:00-08:00: Test all flows locally

**Deliverable**: Modern UI working with Strapi backend on localhost:3000

---

### Day 3: Deployment (8 hours)
**Goal: Live on droplet 174.138.12.114**

- [ ] 00:00-01:00: Prepare droplet (install Node.js, PM2, Nginx)
- [ ] 01:00-02:00: Configure environment variables
- [ ] 02:00-03:00: Deploy Strapi to droplet
- [ ] 03:00-04:00: Deploy Next.js to droplet
- [ ] 04:00-05:00: Configure Nginx reverse proxy
- [ ] 05:00-06:00: Set up SSL/TLS with Certbot
- [ ] 06:00-07:00: Test end-to-end on production
- [ ] 07:00-08:00: Performance optimization & security hardening

**Deliverable**: Live production system at https://digitalbc.sword-academy.net

---

## 🚀 Quick Start Commands

### Local Development
```bash
# Strapi
cd strapi-backend
npm install
npm run develop  # localhost:1337

# Next.js Frontend
cd frontend
npm install
npm run dev  # localhost:3000
```

### Droplet Deployment
```bash
# On droplet
ssh root@174.138.12.114

# Install dependencies
curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs postgresql postgresql-contrib nginx git

# Clone repo & setup
git clone <repo>
cd strapi-backend && npm install && npm run build
cd ../frontend && npm install && npm run build

# Start with PM2
sudo npm install -g pm2
pm2 start strapi-backend/server.js --name strapi
pm2 start "npm start" --cwd frontend --name nextjs
pm2 startup
pm2 save

# Configure Nginx
sudo nano /etc/nginx/sites-available/digital-cards
sudo systemctl reload nginx

# SSL
sudo certbot --nginx -d digitalbc.sword-academy.net -d www.digitalbc.sword-academy.net
```

## 📁 New Project Structure
```
/
├── strapi-backend/          # Strapi CMS
│   ├── src/
│   │   ├── api/             # Content types & routes
│   │   ├── extensions/
│   │   ├── config/
│   │   └── plugins/
│   ├── public/
│   ├── package.json
│   └── .env
├── frontend/                # Next.js 14
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── hooks/
│   │   └── types/
│   ├── package.json
│   └── .env.local
├── .env.production
├── REVAMP_PLAN_3DAYS.md
└── DEPLOYMENT_GUIDE.md
```

## 🔑 Key Implementation Notes

1. **Database**: Keep PostgreSQL, add new tables via Strapi migrations
2. **Authentication**: Use Strapi's JWT auth + Next.js middleware
3. **API**: Strapi auto-generates REST API for all content types
4. **Deployment**: No Docker - direct PM2 process management
5. **File uploads**: Strapi handles media uploads to local storage or cloud
6. **QR Codes**: Use `qrcode.react` for frontend QR generation

## ⚠️ Important Considerations

- **Data Migration**: Starting fresh (no data preservation needed)
- **User Access**: Anonymous view + authenticated admin dashboard
- **Performance**: Strapi caching + Next.js ISR for public cards
- **Security**: JWT tokens, rate limiting, input validation
- **Scalability**: Can upgrade to managed Strapi cloud if needed

## ✅ Success Criteria

- [ ] Strapi backend fully functional with all content types
- [ ] Next.js frontend with modern Blinq-inspired design
- [ ] User can create company, add employees, create cards
- [ ] Cards shareable via QR code, public link, vCard
- [ ] Analytics tracking card views
- [ ] Deployed and live on droplet without Docker
- [ ] SSL/TLS secured
- [ ] Responsive on mobile & desktop

---

**Start Date**: December 3, 2025
**Target Live Date**: December 6, 2025, 5 PM UTC
