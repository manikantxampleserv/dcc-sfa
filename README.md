# DCC-SFA - Sales Force Automation System

A comprehensive Sales Force Automation system built with a modern monorepo architecture, designed to streamline sales operations, inventory management, customer relationship management, and field force tracking.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Scripts Reference](#scripts-reference)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## 🎯 Overview

DCC-SFA is an enterprise-grade Sales Force Automation platform that provides:

- **Field Force Management**: Track sales representatives, attendance, GPS tracking, and route planning
- **Customer Management**: Comprehensive CRM with customer categorization, complaints, and visit tracking
- **Inventory & Orders**: Real-time inventory management, order processing, invoicing, and payments
- **Asset Management**: Track and manage company assets, coolers, and equipment installations
- **Approval Workflows**: Multi-level approval system for orders, returns, and requests
- **Analytics & Reporting**: Executive dashboards, KPI tracking, and comprehensive reports
- **Mobile-First Design**: Optimized for field sales teams working on mobile devices

## 🏗️ Architecture

This project uses a **monorepo architecture** managed with Concurrently:

```
┌─────────────────────────────────────────────────────────┐
│                    DCC-SFA Monorepo                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐         ┌──────────────────┐    │
│  │   Frontend (FE)  │ ◄─────► │   Backend (BE)   │    │
│  │                  │  REST   │                  │    │
│  │  React + Vite    │  API    │  Express + TS    │    │
│  │  TypeScript      │         │  Prisma ORM      │    │
│  │  Material-UI     │         │  GraphQL         │    │
│  │  TanStack Query  │         │  JWT Auth        │    │
│  └──────────────────┘         └──────────────────┘    │
│                                        │               │
│                                        ▼               │
│                              ┌──────────────────┐     │
│                              │  SQL Server DB   │     │
│                              │  (MS SQL)        │     │
│                              └──────────────────┘     │
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │         External Services                    │    │
│  │  • Backblaze B2 (File Storage)              │    │
│  │  • SMTP (Email Notifications)               │    │
│  │  • GPS Tracking                             │    │
│  └──────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Architecture Highlights

- **Backend**: RESTful API with GraphQL support for complex queries
- **Frontend**: SPA with code-splitting and lazy loading
- **Database**: Microsoft SQL Server with Prisma ORM
- **Authentication**: JWT-based with role-based access control (RBAC)
- **File Storage**: Backblaze B2 for scalable cloud storage
- **Real-time**: GPS tracking and live notifications

## 🛠️ Tech Stack

### Backend (`dcc-sfa-be`)

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **TypeScript** | Type-safe development |
| **Prisma** | ORM for database operations |
| **Apollo Server** | GraphQL server |
| **JWT** | Authentication & authorization |
| **Winston** | Logging |
| **Bcrypt** | Password hashing |
| **Nodemailer** | Email notifications |
| **ExcelJS** | Excel report generation |
| **PDFKit** | PDF generation |
| **Multer** | File upload handling |
| **Helmet** | Security headers |

### Frontend (`dcc-sfa-fe`)

| Technology | Purpose |
|------------|---------|
| **React 19** | UI library |
| **TypeScript** | Type-safe development |
| **Vite** | Build tool & dev server |
| **Material-UI (MUI)** | Component library |
| **TanStack Query** | Data fetching & caching |
| **React Router** | Client-side routing |
| **Formik + Yup** | Form handling & validation |
| **Axios** | HTTP client |
| **Chart.js** | Data visualization |
| **Day.js** | Date manipulation |
| **Tailwind CSS** | Utility-first CSS |

### Database

- **Microsoft SQL Server**: Enterprise-grade relational database
- **Prisma**: Type-safe database client with migrations

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: >= 16.0.0 (Recommended: 18.x or 20.x)
- **npm**: >= 8.0.0 (comes with Node.js)
- **SQL Server**: Microsoft SQL Server 2016 or later
- **Git**: For version control

### Optional Tools

- **SQL Server Management Studio (SSMS)**: For database management
- **Postman**: For API testing
- **VS Code**: Recommended IDE with extensions:
  - Prisma
  - ESLint
  - Prettier
  - TypeScript

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/manikantxampleserv/dcc-sfa.git
cd dcc-sfa
```

### 2. Install Dependencies

```bash
# Install all dependencies for both frontend and backend
npm run setup
```

This command will:
- Install root dependencies
- Install backend dependencies
- Install frontend dependencies
- Generate Prisma client

### 3. Database Setup

```bash
# Navigate to backend
cd dcc-sfa-be

# Run Prisma migrations
npx prisma migrate dev

# Seed the database (optional)
npm run seed:all
```

## ⚙️ Configuration

### Backend Configuration

Create environment files in `dcc-sfa-be/`:

#### `.env.development` (Development)

```env
# Database
DATABASE_URL="sqlserver://localhost:1433;initial catalog=DCC_SFA;user=sa;password=YourPassword;TrustServerCertificate=true;"

# Server
PORT=4000
NODE_ENV=development

# Authentication
JWT_SECRET="your-secret-key-change-in-production"

# Backblaze B2 Storage
BACKBLAZE_B2_KEY_ID=your_key_id
BACKBLAZE_B2_APPLICATION_KEY=your_application_key
BACKBLAZE_B2_BUCKET_NAME=your_bucket_name
BACKBLAZE_B2_BUCKET_ID=your_bucket_id
BACKBLAZE_BUCKET_URL=https://your-bucket-url

# Email Configuration
MAIL_MAILER=smtp
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=your_email@example.com
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@example.com
MAIL_FROM_NAME="DCC SalesForce"
```

#### `.env.production` (Production)

Copy `.env.development` and update with production values.

### Frontend Configuration

Create `.env` files in `dcc-sfa-fe/`:

#### `.env.development`

```env
VITE_API_BASE_URL=http://localhost:4000/api
VITE_GRAPHQL_URL=http://localhost:4000/graphql
```

#### `.env.production`

```env
VITE_API_BASE_URL=https://your-production-api.com/api
VITE_GRAPHQL_URL=https://your-production-api.com/graphql
```

## 💻 Development

### Start Development Servers

```bash
# From root directory - starts both frontend and backend
npm run dev
```

This will start:
- **Backend**: http://localhost:4000
- **Frontend**: http://localhost:5173
- **GraphQL Playground**: http://localhost:4000/graphql

### Start Individual Services

```bash
# Backend only
cd dcc-sfa-be
npm run dev

# Frontend only
cd dcc-sfa-fe
npm run dev
```

### Database Management

```bash
cd dcc-sfa-be

# Generate Prisma client after schema changes
npm run prisma:generate

# Create a new migration
npx prisma migrate dev --name your_migration_name

# View database in Prisma Studio
npx prisma studio

# Seed database
npm run seed:all

# Clear database
npm run seed:clean
```

## 📁 Project Structure

```
dcc-sfa/
├── dcc-sfa-be/                    # Backend Application
│   ├── src/
│   │   ├── configs/               # Configuration files
│   │   │   ├── env.ts            # Environment variables
│   │   │   ├── jwt.config.ts     # JWT configuration
│   │   │   ├── logger.ts         # Winston logger setup
│   │   │   ├── permissions.config.ts
│   │   │   └── prisma.client.ts  # Prisma client instance
│   │   ├── graphql/              # GraphQL setup
│   │   │   ├── resolvers.ts      # GraphQL resolvers
│   │   │   ├── server.ts         # Apollo Server setup
│   │   │   └── typeDefs.ts       # GraphQL schema
│   │   ├── helpers/              # Helper functions
│   │   │   ├── approvalWorkflow.helper.ts
│   │   │   └── notification.helper.ts
│   │   ├── jobs/                 # Background jobs
│   │   │   └── customerCategoryAssignment.job.ts
│   │   ├── middlewares/          # Express middlewares
│   │   │   ├── auth.middleware.ts
│   │   │   ├── audit.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   └── response.middleware.ts
│   │   ├── routes/               # API routes
│   │   │   └── index.ts
│   │   ├── services/             # Business logic
│   │   │   └── contractGeneration.service.ts
│   │   ├── types/                # TypeScript types
│   │   │   ├── express.d.ts
│   │   │   ├── attendance.types.ts
│   │   │   └── import-export.types.ts
│   │   ├── utils/                # Utility functions
│   │   │   ├── mailer.ts
│   │   │   ├── blackbaze.ts      # B2 storage
│   │   │   ├── paginate.ts
│   │   │   └── seeders/          # Database seeders
│   │   ├── v1/                   # API v1
│   │   │   ├── controllers/      # Request handlers
│   │   │   ├── routes/           # Route definitions
│   │   │   ├── services/         # Business logic
│   │   │   └── validations/      # Input validation
│   │   ├── app.ts                # Express app setup
│   │   ├── index.ts              # Entry point
│   │   └── server.ts             # Server startup
│   ├── prisma/
│   │   └── schema.prisma         # Database schema
│   ├── scripts/                  # Build scripts
│   ├── .env.development
│   ├── .env.production
│   ├── package.json
│   └── tsconfig.json
│
├── dcc-sfa-fe/                    # Frontend Application
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   │   ├── AuthGuard/
│   │   │   ├── ProtectedRoute/
│   │   │   ├── ErrorBoundary/
│   │   │   └── WorkflowTimeline/
│   │   ├── configs/              # Configuration
│   │   │   └── axio.config.ts    # Axios setup
│   │   ├── context/              # React Context
│   │   │   ├── AuthContext/
│   │   │   ├── ThemeContext/
│   │   │   └── CurrencyContext/
│   │   ├── hooks/                # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useApiMutation.ts
│   │   │   ├── useCustomers.ts
│   │   │   ├── useOrders.ts
│   │   │   └── ... (90+ hooks)
│   │   ├── layout/               # Layout components
│   │   │   └── index.tsx
│   │   ├── pages/                # Page components
│   │   │   ├── auth/             # Login, Register
│   │   │   ├── dashboards/       # Dashboard pages
│   │   │   ├── masters/          # Master data pages
│   │   │   ├── transactions/     # Transaction pages
│   │   │   ├── reports/          # Report pages
│   │   │   ├── settings/         # Settings pages
│   │   │   ├── tracking/         # GPS tracking
│   │   │   └── workflows/        # Approval workflows
│   │   ├── routes/               # Route configuration
│   │   │   └── index.tsx
│   │   ├── schemas/              # Validation schemas
│   │   │   ├── customer.schema.ts
│   │   │   ├── order.schema.ts
│   │   │   └── ... (50+ schemas)
│   │   ├── services/             # API services
│   │   │   ├── auth/
│   │   │   ├── masters/
│   │   │   ├── dashboards/
│   │   │   └── ... (organized by domain)
│   │   ├── shared/               # Shared components
│   │   │   ├── Table/
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Select/
│   │   │   └── ... (30+ components)
│   │   ├── types/                # TypeScript types
│   │   │   └── api.types.ts
│   │   ├── utils/                # Utility functions
│   │   │   ├── dateUtils.ts
│   │   │   ├── currencyUtils.ts
│   │   │   └── toast.ts
│   │   ├── App.tsx               # Root component
│   │   ├── main.tsx              # Entry point
│   │   └── index.css             # Global styles
│   ├── public/                   # Static assets
│   ├── scripts/                  # Build scripts
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── .gitignore
├── .prettierrc                    # Prettier configuration
├── .prettierignore
├── package.json                   # Root package.json
└── README.md
```

## ✨ Key Features

### 1. User Management & Authentication
- Role-based access control (RBAC)
- JWT authentication
- Multi-level user hierarchy
- Login history tracking
- API token management

### 2. Customer Relationship Management
- Customer master data
- Customer categorization & grading
- Customer complaints management
- Visit tracking & scheduling
- Customer documents & contracts

### 3. Sales & Orders
- Order management with approval workflows
- Price lists & discounts
- Promotions & offers
- Invoice generation
- Payment collection
- Credit notes & returns

### 4. Inventory Management
- Multi-warehouse inventory
- Van inventory for field sales
- Stock movements & transfers
- Batch & lot tracking
- Product master data
- Serial number tracking

### 5. Asset Management
- Asset tracking (coolers, equipment)
- Asset maintenance records
- Asset movements
- Installation tracking
- Warranty management
- NFC/Barcode scanning

### 6. Field Force Management
- GPS tracking
- Attendance management (punch in/out)
- Route planning
- Visit scheduling
- Competitor activity tracking
- Survey responses

### 7. Approval Workflows
- Multi-level approval system
- Configurable workflow steps
- Order approvals
- Return request approvals
- Price change approvals
- Asset movement approvals

### 8. Reports & Analytics
- Executive dashboard
- Sales reports
- Inventory reports
- Customer reports
- KPI tracking
- Target vs achievement
- Excel & PDF export

### 9. Notifications
- Real-time notifications
- Email notifications
- Approval notifications
- System alerts

### 10. Import/Export
- Bulk data import (Excel)
- Data export (Excel, PDF)
- Error handling & validation
- Template downloads

## 📚 API Documentation

### Base URL

- **Development**: `http://localhost:4000/api`
- **Production**: `https://your-domain.com/api`

### Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### API Endpoints Structure

```
/api/v1/
├── auth/
│   ├── POST /login
│   ├── POST /register
│   ├── POST /logout
│   ├── POST /refresh-token
│   └── GET /me
├── users/
│   ├── GET /users
│   ├── GET /users/:id
│   ├── POST /users
│   ├── PUT /users/:id
│   └── DELETE /users/:id
├── customers/
│   ├── GET /customers
│   ├── GET /customers/:id
│   ├── POST /customers
│   ├── PUT /customers/:id
│   └── DELETE /customers/:id
├── orders/
│   ├── GET /orders
│   ├── GET /orders/:id
│   ├── POST /orders
│   ├── PUT /orders/:id
│   └── POST /orders/:id/approve
├── inventory/
│   ├── GET /inventory
│   ├── GET /inventory/:id
│   ├── POST /inventory/transfer
│   └── GET /inventory/stock-levels
├── assets/
│   ├── GET /assets
│   ├── GET /assets/:id
│   ├── POST /assets
│   ├── PUT /assets/:id
│   └── POST /assets/:id/maintenance
├── reports/
│   ├── GET /reports/sales
│   ├── GET /reports/inventory
│   ├── GET /reports/customers
│   └── GET /reports/kpi
└── ... (many more endpoints)
```

### GraphQL Endpoint

```
POST /graphql
```

Access GraphQL Playground at: `http://localhost:4000/graphql`

## 🗄️ Database Schema

The application uses Microsoft SQL Server with Prisma ORM. Key tables include:

### Core Tables
- `users` - User accounts and authentication
- `roles` - User roles
- `permissions` - Permission definitions
- `role_permissions` - Role-permission mapping

### Customer Management
- `customers` - Customer master data
- `customer_category` - Customer categories
- `customer_complaints` - Customer complaints
- `visits` - Customer visits

### Sales & Orders
- `orders` - Sales orders
- `order_items` - Order line items
- `invoices` - Invoice records
- `invoice_items` - Invoice line items
- `payments` - Payment records

### Inventory
- `products` - Product master
- `inventory_stock` - Stock levels
- `van_inventory` - Van stock
- `stock_movements` - Stock transactions

### Assets
- `asset_master` - Asset records
- `asset_types` - Asset type definitions
- `asset_maintenance` - Maintenance records
- `asset_movements` - Asset transfers

### Workflows
- `approval_workflows` - Workflow instances
- `workflow_steps` - Workflow step definitions
- `sfa_d_requests` - Dynamic requests

### Tracking
- `attendance` - Attendance records
- `gps_logs` - GPS tracking data
- `routes` - Route definitions
- `route_plans` - Route schedules

## 🚢 Deployment

### Building for Production

```bash
# Build both frontend and backend
npm run build

# Or build individually
cd dcc-sfa-be && npm run build:production
cd dcc-sfa-fe && npm run build:production
```

### Backend Deployment

1. **Build the application**:
```bash
cd dcc-sfa-be
npm run build:production
```

2. **Set environment variables** in `.env.production`

3. **Run migrations**:
```bash
npx prisma migrate deploy
```

4. **Start the server**:
```bash
npm run start:production
```

### Frontend Deployment

1. **Build the application**:
```bash
cd dcc-sfa-fe
npm run build:production
```

2. **Deploy the `dist-production` folder** to your hosting service:
   - Netlify
   - Vercel
   - AWS S3 + CloudFront
   - Azure Static Web Apps
   - Traditional web server (Apache, Nginx)

### Environment-Specific Builds

The project supports multiple environments:

```bash
# Development build
npm run build

# Staging build
npm run build:staging

# Production build
npm run build:production
```

### Docker Deployment (Optional)

Create `Dockerfile` for backend:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist-production ./dist-production
COPY prisma ./prisma
RUN npx prisma generate
EXPOSE 4000
CMD ["node", "dist-production/index.js"]
```

## 📜 Scripts Reference

### Root Scripts

| Script | Description |
|--------|-------------|
| `npm run setup` | Install all dependencies and generate Prisma client |
| `npm run dev` | Start both frontend and backend in development mode |
| `npm run build` | Build both packages for production |
| `npm run start` | Start production servers |
| `npm run format` | Format code with Prettier |
| `npm run clean` | Clean build artifacts |

### Backend Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for development |
| `npm run build:staging` | Build for staging |
| `npm run build:production` | Build for production |
| `npm run start` | Start development build |
| `npm run start:production` | Start production build |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run seed:all` | Seed database with initial data |
| `npm run seed:clean` | Clear database |

### Frontend Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for development |
| `npm run build:staging` | Build for staging |
| `npm run build:production` | Build for production |
| `npm run preview` | Preview development build |
| `npm run preview:production` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run generate:permissions` | Generate permission constants |

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Errors

**Problem**: Cannot connect to SQL Server

**Solution**:
```bash
# Check DATABASE_URL in .env file
# Ensure SQL Server is running
# Verify firewall settings
# Test connection:
cd dcc-sfa-be
npx prisma db pull
```

#### 2. Prisma Client Not Generated

**Problem**: `@prisma/client` not found

**Solution**:
```bash
cd dcc-sfa-be
npm run prisma:generate
```

#### 3. Port Already in Use

**Problem**: Port 4000 or 5173 already in use

**Solution**:
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Or change port in .env (backend) or vite.config.ts (frontend)
```

#### 4. CORS Errors

**Problem**: CORS policy blocking requests

**Solution**: Check `cors` configuration in `dcc-sfa-be/src/app.ts`

#### 5. Build Errors

**Problem**: TypeScript compilation errors

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear TypeScript cache
rm -rf dist dist-production dist-staging
npm run build
```

### Getting Help

- Check existing issues on GitHub
- Review error logs in `logs/` directory
- Enable debug logging: Set `LOG_LEVEL=debug` in `.env`
- Contact the development team

## 🤝 Contributing

### Development Workflow

1. **Create a feature branch**:
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes** and commit:
```bash
git add .
git commit -m "feat: add your feature description"
```

3. **Push and create a pull request**:
```bash
git push origin feature/your-feature-name
```

### Commit Message Convention

Follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

### Code Style

- Run Prettier before committing: `npm run format`
- Follow TypeScript best practices
- Write meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

## 📄 License

MIT License - see LICENSE file for details

## 👥 Team

- **Author**: MKX
- **Organization**: Ampleserv

## 📞 Support

For support and questions:
- Email: manikant.sharma@ampleserv.com
- GitHub Issues: [Create an issue](https://github.com/manikantxampleserv/dcc-sfa/issues)

---

**Built with ❤️ for efficient sales force automation**
