# 🎯 Admin Setup - Complete Guide

## Quick Answer

Your admin credentials (`admin@chitrakalakar.com` / `admin123`) are **NOT YET** in Supabase. You need to create them following one of the methods below.

---

## 🚀 Method 1: Automated Script (Easiest)

### Prerequisites
```bash
cd /app
pip install supabase python-dotenv
```

### Set Environment Variable
Create/update `/app/.env`:
```bash
SUPABASE_URL=https://lurvhgzauuzwftfymjym.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
```

**Get Service Key:**
1. Go to Supabase Dashboard → Settings → API
2. Copy the **service_role** key (NOT the anon key!)

### Run Script
```bash
cd /app
python scripts/create_admin.py
```

This creates:
- ✅ `admin@chitrakalakar.com` (password: admin123)
- ✅ `lead@chitrakalakar.com` (password: lead123)
- ✅ `kalakar@chitrakalakar.com` (password: kalakar123)

---

## 🚀 Method 2: Manual Setup (Dashboard)

### Step 1: Create Auth User
1. Go to Supabase Dashboard
2. Authentication → Users → **Add user**
3. Fill in:
   - Email: `admin@chitrakalakar.com`
   - Password: `admin123`
   - **Auto Confirm User: ✅ CHECK THIS**
4. Click **Create user**
5. **Copy the User ID (UUID)**

### Step 2: Create Profile
1. Go to SQL Editor
2. Run this (replace `YOUR_UUID`):

```sql
INSERT INTO public.users (
  id, name, email, role, is_approved, is_active
) VALUES (
  'YOUR_UUID'::uuid,
  'ChitraKalakar Admin',
  'admin@chitrakalakar.com',
  'admin',
  true,
  true
);
```

### Step 3: Test
1. Go to your app
2. Login with `admin@chitrakalakar.com` / `admin123`
3. Should redirect to `/admin` dashboard

---

## 📋 All Role-Based Users

### Admin
- **Email:** admin@chitrakalakar.com
- **Password:** admin123
- **Dashboard:** /admin
- **Permissions:** Full access

### Lead Chitrakar
- **Email:** lead@chitrakalakar.com
- **Password:** lead123
- **Dashboard:** /lead-chitrakar
- **Permissions:** Approve artworks

### Kalakar
- **Email:** kalakar@chitrakalakar.com
- **Password:** kalakar123
- **Dashboard:** /kalakar
- **Permissions:** Manage exhibitions, view analytics

### Artist (Regular Users)
- **Created via:** App signup
- **Default:** is_approved = false
- **Dashboard:** /dashboard (after admin approval)

### User (Buyers)
- **Created via:** App signup
- **Default:** is_approved = true (auto-approved)
- **Dashboard:** None (browse site)

---

## 🔄 How Role-Based Access Works

```
1. User logs in with email/password
    ↓
2. Supabase Auth verifies credentials
    ↓
3. Returns JWT with user_id
    ↓
4. Frontend queries: SELECT role FROM users WHERE id = user_id
    ↓
5. Redirect based on role:
   - admin → /admin
   - lead_chitrakar → /lead-chitrakar
   - kalakar → /kalakar
   - artist → /dashboard
   - user → /
```

---

## 🗂️ Where Credentials Are Stored

### Supabase Auth (auth.users table)
- ✅ Email: admin@chitrakalakar.com
- ✅ Password: (hashed)
- ✅ Email confirmed: true
- ✅ User ID: UUID

### Supabase Database (public.users table)
- ✅ id: (same UUID as auth.users)
- ✅ email: admin@chitrakalakar.com
- ✅ role: admin
- ✅ is_approved: true
- ✅ is_active: true

**Both tables must have the user for login to work!**

---

## 🧪 Testing After Setup

### Test Admin Login
```bash
# Via browser
URL: https://your-app.vercel.app/login
Email: admin@chitrakalakar.com
Password: admin123

# Expected:
- Login successful
- Redirect to /admin
- See "Admin Panel" button in navbar
```

### Test via API
```bash
# Get access token
curl -X POST 'https://lurvhgzauuzwftfymjym.supabase.co/auth/v1/token?grant_type=password' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@chitrakalakar.com",
    "password": "admin123"
  }'

# Use token to call backend
curl https://your-backend.onrender.com/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🔒 Security Checklist

After creating admin user:

- [ ] Test login works
- [ ] Change password from default
- [ ] Enable MFA (optional but recommended)
- [ ] Keep service_role key secret
- [ ] Don't commit credentials to git
- [ ] Set up password reset email (Supabase settings)
- [ ] Enable email confirmation for production
- [ ] Review RLS policies

---

## 📂 Files You Need

1. **`/app/SUPABASE_SCHEMA.sql`** - Run first (creates tables)
2. **`/app/SUPABASE_INITIAL_DATA.sql`** - SQL method for creating admin
3. **`/app/scripts/create_admin.py`** - Python script (automated)
4. **`/app/ADMIN_SETUP_GUIDE.md`** - Detailed guide (this file)

---

## 🚨 Troubleshooting

### "User not found"
**Problem:** User exists in auth.users but not in public.users
**Solution:** Run the INSERT query for public.users table

### "Invalid credentials"
**Problem:** Email not confirmed or wrong password
**Solution:** 
- Check Authentication → Users → verify email is confirmed
- Reset password in Supabase dashboard

### "Forbidden" / "Access denied"
**Problem:** Role is wrong in public.users table
**Solution:**
```sql
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'admin@chitrakalakar.com';
```

### Script fails with "Invalid API key"
**Problem:** Using anon key instead of service_role key
**Solution:** Get the **service_role** key from Settings → API

---

## ✅ Summary

**Current Status:**
- ❌ Admin credentials NOT created yet
- ✅ Database schema ready
- ✅ Authentication system ready
- ✅ Scripts/guides ready

**What You Need To Do:**
1. Choose method (Automated script OR Manual dashboard)
2. Create admin user in Supabase Auth
3. Create admin profile in public.users table
4. Test login

**After Setup:**
- ✅ Admin can login and access /admin dashboard
- ✅ Can approve pending artists
- ✅ Can manage exhibitions
- ✅ Can create sub-admins
- ✅ All role-based features work

---

## 📞 Quick Reference

**Supabase Dashboard:** https://supabase.com/dashboard
**Your Project:** lurvhgzauuzwftfymjym
**Admin Email:** admin@chitrakalakar.com
**Admin Password:** admin123 (change after first login!)

**Files Location:**
- Schema: `/app/SUPABASE_SCHEMA.sql`
- Setup Data: `/app/SUPABASE_INITIAL_DATA.sql`
- Python Script: `/app/scripts/create_admin.py`
- This Guide: `/app/ADMIN_SETUP_GUIDE.md`
