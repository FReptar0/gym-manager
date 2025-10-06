# Gym Manager - Neighborhood Gym Management System

A modern, mobile-first web application for managing a small neighborhood gym. Built with Next.js 15, React 19, Supabase, and a beautiful dark mode UI.

## 🚀 Features

- **Client Management**: Add, edit, and track gym members with detailed profiles
- **Payment Processing**: Register payments and automatically update membership status
- **Membership Plans**: Manage flexible plans (Weekly, Monthly, Annual, Per Class)
- **Dashboard**: Real-time KPIs including revenue, active clients, and growth metrics
- **Reports**: Monthly analytics with revenue trends and client statistics
- **Dark Mode First**: Custom dark theme optimized for gym environments
- **Mobile Optimized**: Touch-friendly interface with bottom navigation
- **Secure Authentication**: Supabase Auth with protected routes

## 📋 Tech Stack

### Frontend

- **Next.js 15.0.3** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Lucide React** - Icons
- **date-fns** - Date utilities

### Backend & Database

- **Supabase** - Backend as a Service
- **PostgreSQL** - Database (via Supabase)
- **Supabase Auth** - Authentication
- **Row Level Security** - Data protection

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ installed
- Supabase account ([supabase.com](https://supabase.com))
- Git

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to get your credentials
3. Create `.env.local` file:

```bash
cp .env.local.example .env.local
```

1. Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_NAME="Gym Manager"
NEXT_PUBLIC_MAX_FILE_SIZE=2097152
```

### 3. Setup Database

In your Supabase project:

1. Go to SQL Editor
2. Run the migration file: `supabase/migrations/001_initial_schema.sql`
3. Run the seed file: `supabase/seed.sql`

This will create:

- `plans` table with default membership plans
- `clients` table for gym members
- `payments` table for transactions
- `measurements` table for client tracking
- Row Level Security policies
- Database functions and triggers

### 4. Create Your First User

In Supabase Dashboard:

1. Go to Authentication > Users
2. Click "Add user"
3. Enter email and password
4. Confirm the user

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and login with your created credentials.

## 📱 App Structure

```tree
src/
├── app/
│   ├── (auth)/
│   │   ├── login/          # Login page
│   │   └── layout.tsx      # Auth layout
│   ├── (dashboard)/
│   │   ├── dashboard/      # Main dashboard
│   │   │   ├── clients/    # Client management
│   │   │   ├── payments/   # Payment processing
│   │   │   ├── plans/      # Membership plans
│   │   │   └── reports/    # Analytics & reports
│   │   └── layout.tsx      # Dashboard layout with navigation
│   ├── globals.css         # Global styles & dark theme
│   └── layout.tsx          # Root layout
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── layout/             # Layout components (TopBar, BottomNav)
├── lib/
│   ├── supabase/           # Supabase client config
│   └── utils.ts            # Utility functions
└── types/
    ├── database.ts         # Database types
    └── index.ts            # Exported types
```

## 🎨 Dark Mode Theme

The app uses a custom dark palette designed for gym environments:

- **black-beauty** (#232729) - Main background
- **midnight-magic** (#47484a) - Cards & panels
- **stormy-weather** (#657079) - Borders & dividers
- **coastal-vista** (#b194a1) - Primary accent
- **frontier-fort** (#c3af9f) - Secondary accent
- **silver-setting** (#d9dada) - Text & icons

## 📊 Database Schema

### Plans

- Default plans: Weekly ($150), Monthly ($500), Annual ($4800), Per Class ($50)
- Customizable duration and pricing
- Active/inactive status

### Clients

- Personal information (name, phone, email)
- Medical data (blood type, conditions)
- Emergency contacts
- Current plan and membership status
- Expiration tracking

### Payments

- Transaction history
- Linked to client and plan
- Payment method (cash/transfer)
- Period tracking (start/end dates)

### Measurements (Optional)

- Weight, height, BMI (auto-calculated)
- Body measurements
- Progress tracking

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Authentication required for all dashboard routes
- Middleware protection for routes
- Secure session management with httpOnly cookies

## 📈 Business Logic

### Payment Flow

1. Select client and plan
2. Amount auto-fills from plan price (editable)
3. System calculates membership period
4. Updates client status to "active"
5. Sets expiration date

### Membership Status

- **Active**: Current paid membership
- **Frozen**: Expired membership
- **Inactive**: No active plan

### Automatic Freezing

Clients are automatically frozen when membership expires (requires cron job setup).

## 🚀 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

```bash
# Or use Vercel CLI
npm i -g vercel
vercel
```

## 📝 Development Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Format code
npm run format
```

## 🔄 Next Steps

1. **Testing**: Create test users and clients
2. **Customize**: Adjust plans and pricing for your gym
3. **Mobile**: Test on mobile devices (primary use case)
4. **Backup**: Setup Supabase backups
5. **Monitor**: Use Vercel Analytics for insights
