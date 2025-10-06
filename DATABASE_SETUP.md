# 🏋️ Gym Manager - Database Setup & Admin Registration Guide

## 📋 Overview

This guide walks you through setting up the database schema and registering the first gym administrator user.

## 🗄️ Database Schema Overview

The corrected schema includes:

### Core Tables

- **`plans`** - Membership plans (weekly, monthly, annual, etc.)
- **`clients`** - Gym members and guest client
- **`payments`** - Payment transactions and history
- **`measurements`** - Client body measurements (optional feature)
- **`user_profiles`** - Gym staff/admin user profiles

### Key Features

- ✅ **Proper RLS (Row Level Security)** - Secure access control
- ✅ **Complete constraints** - Data validation at database level
- ✅ **Optimized indexes** - Fast queries for reporting
- ✅ **Trigger functions** - Auto-update timestamps, user profile creation
- ✅ **Useful views** - Pre-built queries for common reports
- ✅ **Guest client support** - Special client for daily payments

## 🚀 Database Setup Instructions

### Step 1: Reset Database (Development Only)

⚠️ **WARNING: This will delete all existing data!**

```bash
# Navigate to your project
cd /Users/freptar0/Desktop/Projects/gym-manager

# Reset the database (development only)
npx supabase db reset
```

### Step 2: Apply New Schema

```bash
# Apply the corrected schema
npx supabase db push

# Or apply specific migrations
npx supabase migration up
```

### Step 3: Verify Schema

```bash
# Check migration status
npx supabase migration list

# Connect to database to verify
npx supabase db shell
```

In the database shell, verify tables:

```sql
\dt
SELECT COUNT(*) FROM plans;
SELECT COUNT(*) FROM clients;
```

## 👤 Gym Admin Registration

### Step 1: Set Registration Secret

Add this to your `.env.local` file:

```bash
# Add a secure secret phrase for admin registration
REGISTRATION_SECRET_PHRASE="your-super-secret-gym-admin-phrase-2024"
```

### Step 2: Start the Application

```bash
# Start the development server
npm run dev
```

### Step 3: Register the First Admin

#### Option A: Using the UI (Recommended)

1. Open your browser and go to: `http://localhost:3000/auth/register`
2. Fill out the registration form:
   - **Full Name**: Your name (e.g., "Juan Pérez")
   - **Email**: Your admin email (e.g., <admin@mygym.com>)
   - **Password**: Strong password (min 8 characters)
   - **Secret Phrase**: The exact phrase from your `.env.local`
3. Click "Register"
4. You should be automatically logged in

#### Option B: Using API Call (Advanced)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Juan Pérez",
    "email": "admin@mygym.com",
    "password": "your-secure-password",
    "secret_phrase": "your-super-secret-gym-admin-phrase-2024"
  }'
```

### Step 4: Login

1. Go to: `http://localhost:3000/auth/login`
2. Use your email and password
3. You should be redirected to the dashboard

## 🔧 Environment Variables Needed

Create/update your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Admin Registration
REGISTRATION_SECRET_PHRASE="your-super-secret-gym-admin-phrase-2024"

# App Configuration
NEXT_PUBLIC_APP_NAME="Gym Manager"
NEXT_PUBLIC_MAX_FILE_SIZE=2097152
```

## ✅ Verification Checklist

After setup, verify everything works:

### Database Verification

- [ ] All 5 tables created (plans, clients, payments, measurements, user_profiles)
- [ ] 5 default plans inserted
- [ ] Special guest client created
- [ ] Sample data inserted (development only)
- [ ] RLS policies active and working

### Authentication Verification

- [ ] Admin user successfully registered
- [ ] Login works correctly
- [ ] User profile created in database
- [ ] Dashboard loads without errors

### Application Verification

- [ ] Can create new clients
- [ ] Can register payments
- [ ] Can manage plans
- [ ] Dashboard shows correct data
- [ ] No console errors

## 📊 Default Plans Created

The system creates these default plans:

| Plan | Duration | Price | Description |
|------|----------|--------|-------------|
| Per Class | 1 day | $50.00 | Single class entry |
| Weekly | 7 days | $150.00 | Weekly membership |
| Monthly | 30 days | $500.00 | Monthly membership |
| Quarterly | 90 days | $1,350.00 | Save 10% |
| Annual | 365 days | $4,800.00 | Save 20% |

## 🎯 Sample Data (Development Only)

In development, the system creates:

- 4 sample clients (including 1 inactive)
- 5 sample payments
- 4 measurement records
- Mix of payment methods and statuses

## 🔒 Security Features

### Row Level Security (RLS)

- **Plans**: Read access for all authenticated users, full access for admins
- **Clients/Payments/Measurements**: Full access only for active gym staff
- **User Profiles**: Users can only access their own profile

### Data Validation

- Phone numbers must be exactly 10 digits
- Email format validation
- Blood type validation (A+, A-, B+, B-, AB+, AB-, O+, O-)
- Gender validation (male, female, other, prefer_not_to_say)
- Payment amount must be positive
- Plan prices and durations must be positive

### Automatic Functions

- **Auto-freeze expired memberships**: Call `SELECT freeze_expired_memberships();`
- **Auto-update timestamps**: Updated automatically on record changes
- **Auto-create user profiles**: Created when new auth user is registered

## 🚨 Troubleshooting

### Common Issues

#### "Registration is currently disabled"

- Check that `REGISTRATION_SECRET_PHRASE` is set in `.env.local`
- Restart your development server after adding the environment variable

#### "Invalid secret phrase"

- Verify the exact phrase matches in your request and `.env.local`
- Check for extra spaces or special characters

#### "Failed to create client" / RLS errors

- Verify your user was created with a `user_profiles` record
- Check that you're logged in and authenticated
- Verify RLS policies are correctly applied

#### Database connection issues

- Verify Supabase credentials in `.env.local`
- Check your Supabase project is active
- Ensure database migrations have been applied

### Debug Commands

```bash
# Check migration status
npx supabase migration list

# View database logs
npx supabase logs db

# Reset and reapply migrations
npx supabase db reset

# Check user profile exists
npx supabase db shell
SELECT * FROM user_profiles;
```
