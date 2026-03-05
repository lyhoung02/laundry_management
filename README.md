# 🫧 LaundryPro - Laundry Management System

A full-stack Laundry Management System built with **Next.js** (frontend), **Node.js/Express** (backend), and **MySQL** (Aiven Cloud database).

## 🌐 Bilingual Support
- English 🇬🇧
- Khmer (ភាសាខ្មែរ) 🇰🇭

---

## 📁 Project Structure

```
laundry-system/
├── backend/           # Node.js + Express API
│   ├── config/
│   │   ├── database.js    # MySQL connection pool
│   │   └── schema.sql     # Database schema + seed data
│   ├── middleware/
│   │   └── auth.js        # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js        # Login / Register
│   │   ├── dashboard.js   # Dashboard statistics
│   │   ├── orders.js      # Orders CRUD + status updates
│   │   ├── customers.js   # Customer management
│   │   ├── inventory.js   # Inventory tracking
│   │   ├── schedules.js   # Schedule management
│   │   ├── quality.js     # Quality control records
│   │   ├── compliance.js  # Audit trail
│   │   └── reports.js     # Analytics & KPIs
│   ├── server.js          # Main Express app
│   ├── package.json
│   └── .env
│
└── frontend/          # Next.js application
    ├── components/
    │   └── Layout.js      # Sidebar + navigation
    ├── lib/
    │   ├── api.js          # Axios API client
    │   ├── authContext.js  # Auth state management
    │   ├── langContext.js  # Language state management
    │   └── translations.js # EN/KM translations
    ├── pages/
    │   ├── index.js        # Redirect
    │   ├── login.js        # Login page
    │   ├── dashboard.js    # Main dashboard
    │   ├── orders.js       # Orders management
    │   ├── inventory.js    # Inventory management
    │   ├── customers.js    # Customer management
    │   ├── schedule.js     # Schedule management
    │   ├── quality.js      # Quality control
    │   ├── reports.js      # Analytics reports
    │   └── compliance.js   # Audit trail
    ├── styles/
    │   └── globals.css     # Global styles
    └── package.json
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
# Edit .env if needed (DB credentials already configured)
npm start
# or for development: npm run dev
```

The backend runs on **http://localhost:5000**

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on **http://localhost:3000**

---

## 🗄️ Database

The system auto-initializes the database schema on first run. Tables created:
- `lms_users` - System users
- `lms_customers` - Customer profiles
- `lms_inventory_items` - Inventory with RFID support
- `lms_orders` - Laundry orders
- `lms_order_items` - Items per order
- `lms_schedules` - Pickup/delivery/washing schedules
- `lms_quality_checks` - QC records
- `lms_compliance_logs` - Full audit trail

### Default Login
```
Email: admin@laundry.com
Password: password
```

---

## 🔧 Environment Variables

### Backend (.env)
```
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_db_password
MYSQL_DATABASE=laundry
MYSQL_PORT=3306
JWT_SECRET=your_jwt_secret
PORT=5001
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 📋 Features

| Module | Features |
|--------|----------|
| **Dashboard** | Real-time stats, charts, revenue trends, recent orders |
| **Orders** | Create/manage orders, status tracking, priority levels, item-level tracking |
| **Inventory** | RFID tagging, low stock alerts, multi-category tracking, condition monitoring |
| **Customers** | Healthcare, hospitality, individual, business profiles |
| **Schedule** | Pickup/delivery/washing/maintenance scheduling |
| **Quality Control** | Temperature, detergent, wash cycle recording, pass/fail tracking |
| **Reports** | Revenue trends, KPIs, customer analytics, wash type distribution |
| **Compliance** | Full digital audit trail, inspection-ready logs |

---

## 🌍 Language Toggle
Click the 🌐 button in the sidebar to switch between **English** and **ភាសាខ្មែរ (Khmer)**. Preference is saved in localStorage.
