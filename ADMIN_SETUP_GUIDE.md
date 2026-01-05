# Creating Admin User in Supabase - Step by Step Guide

## 🎯 Goal
Set up `admin@chitrakalakar.com` with password `admin123` in Supabase with full admin role.

---

## 📋 Method 1: Via Supabase Dashboard (Recommended)

### Step 1: Create Auth User

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `lurvhgzauuzwftfymjym`
3. Navigate to **Authentication** → **Users** (left sidebar)
4. Click **"Add user"** → **"Create new user"**
5. Fill in:
   ```
   Email: admin@chitrakalakar.com
   Password: admin123
   Auto Confirm User: ✅ YES (check this box!)
   ```
6. Click **"Create user"**
7. **IMPORTANT**: Copy the **User ID** (UUID) - looks like `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

### Step 2: Create User Profile in Database

1. Still in Supabase Dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Paste this SQL (replace `YOUR_ADMIN_USER_ID` with the UUID from Step 1):

```sql
INSERT INTO public.users (
  id,
  name,
  email,
  role,
  categories,
  location,
  bio,
  is_approved,
  is_active,
  joined_at
) VALUES (
  'YOUR_ADMIN_USER_ID'::uuid,  -- ⚠️ REPLACE with UUID from Step 1
  'ChitraKalakar Admin',
  'admin@chitrakalakar.com',
  'admin',
  ARRAY[]::text[],
  'India',
  'Platform Administrator',
  true,
  true,
  NOW()
);
```

4. Click **"Run"**
5. Should see: "Success. No rows returned"

### Step 3: Verify Admin User

Run this query in SQL Editor:
```sql
SELECT id, name, email, role, is_approved, is_active 
FROM public.users 
WHERE email = 'admin@chitrakalakar.com';
```

You should see:
```
id: (your UUID)
name: ChitraKalakar Admin
email: admin@chitrakalakar.com
role: admin
is_approved: true
is_active: true
```

### Step 4: Test Login

1. Go to your deployed app (Vercel URL)
2. Click **Login**
3. Enter:
   - Email: `admin@chitrakalakar.com`
   - Password: `admin123`
4. Should redirect to Admin Dashboard ✅

---

## 📋 Method 2: Via SQL Script (Alternative)

If you prefer to do everything in SQL:

### Step 1: Create Auth User via API

You'll need to use Supabase's Admin API or the dashboard. The SQL method doesn't create auth users directly.

**Using curl:**
```bash
curl -X POST 'https://lurvhgzauuzwftfymjym.supabase.co/auth/v1/admin/users' \
-H "apikey: YOUR_SERVICE_ROLE_KEY" \
-H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
-H "Content-Type: application/json" \
-d '{
  "email": "admin@chitrakalakar.com",
  "password": "admin123",
  "email_confirm": true,
  "user_metadata": {
    "name": "ChitraKalakar Admin",
    "role": "admin"
  }
}'
```

This will return a user object with the `id`. Then proceed with Step 2 from Method 1.

---

## 🔐 Creating Other Role-Based Users

### Lead Chitrakar (Artwork Quality Control)

**Step 1: Create in Supabase Auth**
```
Email: lead@chitrakalakar.com
Password: lead123
Auto Confirm: YES
```

**Step 2: Create Profile**
```sql
INSERT INTO public.users (
  id,
  name,
  email,
  role,
  is_approved,
  is_active,
  joined_at
) VALUES (
  'LEAD_CHITRAKAR_UUID'::uuid,  -- Replace with UUID
  'Lead Chitrakar',
  'lead@chitrakalakar.com',
  'lead_chitrakar',
  true,
  true,
  NOW()
);
```

### Kalakar (Exhibition Manager)

**Step 1: Create in Supabase Auth**
```
Email: kalakar@chitrakalakar.com
Password: kalakar123
Auto Confirm: YES
```

**Step 2: Create Profile**
```sql
INSERT INTO public.users (
  id,
  name,
  email,
  role,
  is_approved,
  is_active,
  joined_at
) VALUES (
  'KALAKAR_UUID'::uuid,  -- Replace with UUID
  'Kalakar Manager',
  'kalakar@chitrakalakar.com',
  'kalakar',
  true,
  true,
  NOW()
);
```

### Regular Artist (Needs Approval)

**Step 1: User signs up via your app** (no manual creation needed)
- They register as artist
- Frontend creates auth user + profile
- `is_approved` = false by default

**Step 2: Admin approves**
- Admin logs in
- Goes to Admin Dashboard → Pending Artists
- Clicks "Approve"
- Backend sets `is_approved` = true

---

## 🔄 Role-Based Access Flow

```
User Login
    ↓
Supabase Auth verifies email/password
    ↓
Returns JWT with user_id
    ↓
Frontend queries public.users table for role
    ↓
Role determines dashboard redirect:
    - admin → /admin
    - lead_chitrakar → /lead-chitrakar
    - kalakar → /kalakar
    - artist → /dashboard
    - user → homepage
```

---

## ⚙️ Setting User Roles in user_metadata (Optional Enhancement)

For better integration, you can store the role in Supabase Auth's user_metadata:

```sql
-- This would be done via Supabase Admin API
-- The role is already in your public.users table, which is the source of truth
```

Your current setup queries `public.users` table for the role, which is fine!

---

## 🧪 Testing All Roles

### Test Admin Login
```
URL: https://your-app.vercel.app/login
Email: admin@chitrakalakar.com
Password: admin123
Expected: Redirect to /admin dashboard
```

### Test Lead Chitrakar Login
```
Email: lead@chitrakalakar.com
Password: lead123
Expected: Redirect to /lead-chitrakar dashboard
```

### Test Kalakar Login
```
Email: kalakar@chitrakalakar.com
Password: kalakar123
Expected: Redirect to /kalakar dashboard
```

### Test Artist Login (After Approval)
```
Email: artist@test.com
Password: artist123
Expected: Redirect to /dashboard
```

---

## 🔒 Security Best Practices

1. **Change Default Passwords**: After first login, change all default passwords
2. **Email Confirmation**: In production, enable email confirmation for new signups
3. **MFA**: Consider enabling MFA for admin accounts
4. **Service Role Key**: Keep your service role key SECRET - never commit to git
5. **RLS Policies**: Ensure Row Level Security is enabled (already done in schema)

---

## 📊 Verify Setup Checklist

Run these queries to verify everything is set up correctly:

### Check Users by Role
```sql
SELECT role, COUNT(*) as count, 
       SUM(CASE WHEN is_approved THEN 1 ELSE 0 END) as approved
FROM public.users 
GROUP BY role 
ORDER BY role;
```

### Check Admin Exists
```sql
SELECT id, name, email, role 
FROM public.users 
WHERE role = 'admin';
```

### Check Auth User Exists
Go to Authentication → Users in Supabase dashboard and verify:
- ✅ admin@chitrakalakar.com exists
- ✅ Email is confirmed
- ✅ User is not disabled

---

## 🚨 Troubleshooting

### Issue: "User not found" when logging in
**Solution:** 
- Check if user exists in Authentication → Users
- Check if profile exists in public.users table
- Verify email is confirmed

### Issue: "Invalid credentials"
**Solution:**
- Password is case-sensitive
- Try resetting password in Supabase dashboard
- Check if user is disabled

### Issue: Login works but role is wrong
**Solution:**
```sql
-- Update role in database
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'admin@chitrakalakar.com';
```

### Issue: Redirects to wrong dashboard
**Solution:**
- Check AuthContext.js - roles are case-sensitive
- Verify role in database matches exactly: 'admin', not 'Admin'

---

## 📝 Quick Reference

### All Role Names (Exact Case)
```
admin
lead_chitrakar
kalakar
artist
user
institution
```

### Dashboard URLs
```
Admin:          /admin
Lead Chitrakar: /lead-chitrakar
Kalakar:        /kalakar
Artist:         /dashboard
User:           / (homepage)
```

---

## ✅ Final Checklist

Before going live:
- [ ] Admin user created and tested
- [ ] At least one test artist created
- [ ] All role-based dashboards accessible
- [ ] Password changed from default
- [ ] Email confirmation enabled (production)
- [ ] Service role key kept secret
- [ ] RLS policies verified

---

**Your admin credentials are now set up in Supabase!** 🎉

The credentials will work across:
- ✅ Frontend login (Supabase Auth)
- ✅ Backend API calls (JWT verification)
- ✅ Database queries (RLS policies)
- ✅ Role-based access control
