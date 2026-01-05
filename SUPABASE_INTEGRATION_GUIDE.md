# Complete Supabase Integration Guide for ChitraKalakar

## 🎯 Architecture Overview

```
Browser (React/Vercel)
    ↓
    | supabase.auth.* (signup/login)
    ↓
Supabase Auth ✅ (Source of Truth)
    ↓
    | JWT (access_token)
    ↓
FastAPI (Render)
    ↓
    | Verifies Supabase JWT
    | Uses Supabase Client
    ↓
Supabase DB (PostgreSQL)
    ↓
    | Tables: users, artworks, exhibitions, etc.
    ↓
Supabase Storage
    ↓
    | Buckets: avatars, artworks, exhibitions
```

---

## 📋 Step 1: Supabase Setup

### A. Create Database Tables

1. Go to Supabase Dashboard → SQL Editor
2. Run the SQL script from `/app/SUPABASE_SCHEMA.sql`
3. Verify tables are created in Database → Tables

### B. Create Storage Buckets

1. Go to Storage → Create new bucket
2. Create these 3 PUBLIC buckets:
   - `avatars`
   - `artworks`
   - `exhibitions`

3. For each bucket, set policies (Storage → Policies):
   - **SELECT**: Public access (anyone can view)
   - **INSERT**: Authenticated users only
   - **UPDATE**: Owner only

### C. Get Your Credentials

Go to Settings → API and copy:
- **Project URL**: `https://lurvhgzauuzwftfymjym.supabase.co`
- **anon/public key**: `sb_publishable_YRUGm-45aY165zzIebAERw_QQsKtGYA`
- **service_role key**: (Keep this secret! Only for backend)
- **JWT Secret**: (Settings → API → JWT Settings)

---

## 📋 Step 2: Frontend Setup (Vercel)

### Environment Variables

Add these in Vercel → Settings → Environment Variables:

```bash
# Backend API
REACT_APP_BACKEND_URL=https://your-backend.onrender.com

# Supabase Configuration
REACT_APP_SUPABASE_URL=https://lurvhgzauuzwftfymjym.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sb_publishable_YRUGm-45aY165zzIebAERw_QQsKtGYA
```

### Build Settings

- Root Directory: `frontend`
- Build Command: `yarn build`
- Output Directory: `build`
- Install Command: `yarn install`

---

## 📋 Step 3: Backend Setup (Render)

### Environment Variables

Add these in Render → Environment:

```bash
# Supabase Configuration
SUPABASE_URL=https://lurvhgzauuzwftfymjym.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
SUPABASE_JWT_SECRET=your_jwt_secret_here

# CORS (Your Vercel domain)
CORS_ORIGINS=https://your-app.vercel.app,https://www.your-app.vercel.app

# Optional: Keep MongoDB for migration period
MONGO_URL=your_mongodb_url_if_needed
DB_NAME=chitrakalakar
```

### Install Dependencies

The backend now includes:
```
supabase==2.9.0
httpx>=0.24.1
```

---

## 🔐 Step 4: Authentication Flow

### Signup Flow
```javascript
// Frontend (React)
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: { data: { name, role } }
});

// Creates user in:
// 1. auth.users (Supabase Auth)
// 2. public.users (Your database)
```

### Login Flow
```javascript
// Frontend (React)
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});

// Returns session with access_token (JWT)
```

### API Requests
```javascript
// Frontend gets token
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

// Send to backend
fetch('/api/endpoint', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Backend Verification
```python
# Backend verifies token
from supabase_auth import verify_supabase_token

user = await verify_supabase_token(credentials)
# Returns: { id, email, role }
```

---

## 📊 Step 5: Database Operations

### Insert User Profile (After Signup)
```javascript
const { data, error } = await supabase
  .from('users')
  .insert([
    {
      id: auth_user_id,
      name,
      email,
      role,
      categories,
      is_approved: false
    }
  ]);
```

### Query Artworks
```javascript
const { data, error } = await supabase
  .from('artworks')
  .select('*')
  .eq('is_approved', true)
  .order('created_at', { ascending: false });
```

### Upload Image
```javascript
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${user_id}/${filename}`, file);

const { data: { publicUrl } } = supabase.storage
  .from('avatars')
  .getPublicUrl(filePath);
```

---

## 🔄 Step 6: Migration from MongoDB

If you need to migrate existing data:

```python
# Example migration script
from motor.motor_asyncio import AsyncIOMotorClient
from supabase_client import get_supabase_client

mongo_client = AsyncIOMotorClient(MONGO_URL)
mongo_db = mongo_client[DB_NAME]
supabase = get_supabase_client()

# Migrate users
users = await mongo_db.users.find().to_list(None)
for user in users:
    supabase.table('users').insert({
        'id': user['id'],
        'name': user['name'],
        'email': user['email'],
        # ... map other fields
    }).execute()
```

---

## ✅ Step 7: Testing

### Test Authentication
```bash
# Test signup
curl -X POST https://your-app.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Test login
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Protected Endpoint
```bash
# Get token from login response
TOKEN="your_access_token_here"

# Call protected endpoint
curl https://your-backend.onrender.com/api/artist/artworks \
  -H "Authorization: Bearer $TOKEN"
```

### Test File Upload
```javascript
// In browser console
const file = document.querySelector('input[type="file"]').files[0];
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`test/${file.name}`, file);
console.log(data, error);
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "Invalid JWT"
**Solution:** Check that:
- `SUPABASE_JWT_SECRET` is set correctly in Render
- Token is being sent in Authorization header
- Token hasn't expired (default: 1 hour)

### Issue 2: "Row Level Security violation"
**Solution:** Check RLS policies:
```sql
-- View policies
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Temporarily disable for testing (NOT in production!)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```

### Issue 3: "Storage bucket not found"
**Solution:** 
- Verify buckets exist in Supabase Dashboard
- Check bucket names match exactly (case-sensitive)
- Ensure buckets are PUBLIC

### Issue 4: CORS errors
**Solution:** Update CORS_ORIGINS in Render to include your Vercel domain

---

## 📝 Files Changed

### Frontend
- ✅ `/frontend/src/contexts/AuthContext.js` - Uses Supabase Auth
- ✅ `/frontend/src/services/api.js` - Uses Supabase JWT tokens
- ✅ `/frontend/src/lib/supabase.js` - Supabase client config
- ✅ `/frontend/src/App.js` - Logo fixes

### Backend
- ✅ `/backend/supabase_auth.py` - JWT verification
- ✅ `/backend/supabase_client.py` - Supabase client
- ✅ `/backend/requirements.txt` - Added supabase library
- ⏳ `/backend/server.py` - Needs update to use Supabase (next step)

---

## 🎯 Next Steps

1. **Run SQL Schema** in Supabase
2. **Create Storage Buckets** with policies
3. **Update Environment Variables** in Vercel and Render
4. **Deploy Frontend** to Vercel
5. **Deploy Backend** to Render
6. **Test Authentication** flow
7. **Test Image Upload** functionality

---

## 🔒 Security Checklist

- [ ] Service role key kept secret (never in frontend)
- [ ] RLS policies enabled on all tables
- [ ] Storage buckets have proper policies
- [ ] JWT secret set in backend environment
- [ ] CORS configured correctly
- [ ] HTTPS enforced everywhere
- [ ] Email confirmation enabled (Supabase Auth settings)

---

## 📞 Support

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs
2. Check Render logs: Render → Logs
3. Check Vercel logs: Vercel → Deployments → View Function Logs
4. Test locally first before deploying

---

**Status:** ✅ Frontend Auth Complete | ⏳ Backend Integration In Progress

All authentication now flows through Supabase as your single source of truth!
