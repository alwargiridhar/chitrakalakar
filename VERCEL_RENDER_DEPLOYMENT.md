# ChitraKalakar - Vercel, Render & Supabase Deployment Guide

## ✅ Environment Variables Status

### **NO BREAKING CHANGES** 
All existing environment variables remain unchanged. Your Vercel/Render/Supabase connectivity will work seamlessly.

---

## 📋 Environment Variables Setup

### **1. Vercel (Frontend) - Environment Variables**

Go to your Vercel project → Settings → Environment Variables and add:

```bash
# Backend Connection (Update with your Render backend URL)
REACT_APP_BACKEND_URL=https://your-render-backend.onrender.com

# Supabase Configuration
REACT_APP_SUPABASE_URL=https://lurvhgzauuzwftfymjym.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sb_publishable_YRUGm-45aY165zzIebAERw_QQsKtGYA

# Development Settings
WDS_SOCKET_PORT=443
ENABLE_HEALTH_CHECK=false
```

**Important:** Make sure these are set for all environments (Production, Preview, Development)

---

### **2. Render (Backend) - Environment Variables**

Go to your Render service → Environment → Add Environment Variables:

```bash
# MongoDB Connection (Update with your MongoDB Atlas or Supabase Postgres URL)
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/chitrakalakar?retryWrites=true&w=majority

# Database Name
DB_NAME=chitrakalakar

# CORS Settings (Allow your Vercel frontend)
CORS_ORIGINS=https://your-vercel-app.vercel.app,https://chitrakalakar.com
```

**Note:** If using Supabase for auth/database instead of MongoDB, you'll need to update the backend connection logic.

---

### **3. Supabase - Required Setup**

#### A. Storage Buckets (MUST CREATE)
Go to Supabase Dashboard → Storage → Create New Buckets:

1. **Bucket Name:** `avatars`
   - Public: ✅ Yes
   - File size limit: 5MB
   - Allowed MIME types: `image/*`

2. **Bucket Name:** `artworks`
   - Public: ✅ Yes
   - File size limit: 5MB
   - Allowed MIME types: `image/*`

3. **Bucket Name:** `exhibitions`
   - Public: ✅ Yes
   - File size limit: 5MB
   - Allowed MIME types: `image/*`

#### B. Bucket Policies
For each bucket, set this policy (Storage → Policies):

```sql
-- Policy: "Public Access"
-- Allowed operations: SELECT
-- Target roles: public

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'artworks');
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'exhibitions');

-- Policy: "Authenticated Upload"
-- Allowed operations: INSERT
-- Target roles: authenticated

CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'artworks' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'exhibitions' AND auth.role() = 'authenticated');
```

---

## 🚀 Deployment Steps

### **Step 1: Push to GitHub**
```bash
cd /app
git add .
git commit -m "feat: Complete platform upgrade - Supabase, art classes, sub-admins"
git push origin main
```

### **Step 2: Vercel Deployment**
1. Vercel will auto-deploy from your GitHub repo
2. Add environment variables listed above
3. Redeploy if needed: `Deployments → Redeploy`

### **Step 3: Render Deployment**
1. Render will auto-deploy from your GitHub repo
2. Add environment variables listed above
3. Check logs: `Logs → View Logs`

### **Step 4: Verify Connections**
Test these endpoints after deployment:

**Backend Health Check:**
```bash
curl https://your-render-backend.onrender.com/api/health
```

**Frontend Load:**
```bash
curl -I https://your-vercel-app.vercel.app
```

**Supabase Storage Test:**
- Login to your app
- Try uploading a profile picture
- Check if image appears in Supabase Storage → avatars bucket

---

## 🔧 Updated Files (No Breaking Changes)

### Files Modified:
1. `/app/backend/server.py` - Added new APIs (existing ones unchanged)
2. `/app/frontend/src/App.js` - UI updates and new features
3. `/app/frontend/src/lib/supabase.js` - **NOW USES ENV VARIABLES** ✅
4. `/app/frontend/.env` - **ADDED SUPABASE VARS** ✅
5. Multiple new pages (ArtClassesPage, LeadChitrakarDashboard, KalakarDashboard)

### Files NOT Modified:
- `/app/backend/.env` - MongoDB URL unchanged
- Backend port configuration (8001) - Unchanged
- Frontend-Backend API communication - Unchanged
- CORS settings - Unchanged

---

## ⚠️ Important Notes

### **MongoDB vs Supabase**
Your current setup uses MongoDB. If you want to fully migrate to Supabase Postgres:
1. You'll need to update backend database connection
2. Convert MongoDB queries to Supabase (PostgreSQL)
3. This requires additional work - let me know if needed

**Current Status:** Backend still uses MongoDB, Supabase only for file storage ✅

### **CORS Configuration**
Update `CORS_ORIGINS` in Render to include your Vercel domain:
```
CORS_ORIGINS=https://your-app.vercel.app,https://www.your-app.vercel.app
```

### **API Routes**
All backend routes must be prefixed with `/api` (already done):
- ✅ `/api/auth/login`
- ✅ `/api/public/art-class-enquiry`
- ✅ `/api/admin/create-sub-admin`

---

## 🧪 Testing After Deployment

1. **Login Test:**
   - Go to your Vercel URL
   - Try logging in with admin credentials
   - Verify redirect to admin dashboard

2. **Image Upload Test:**
   - Login as artist
   - Go to profile settings
   - Upload profile picture
   - Verify image saves to Supabase and displays

3. **Art Classes Test:**
   - Navigate to /art-classes
   - Submit an enquiry
   - Verify backend receives request

4. **Sub-Admin Test:**
   - Login as admin
   - Create a Lead Chitrakar or Kalakar user
   - Login with new credentials
   - Verify correct dashboard loads

---

## 🆘 Troubleshooting

### **Backend Not Connecting:**
- Check Render logs for errors
- Verify `MONGO_URL` is correct
- Ensure `CORS_ORIGINS` includes Vercel URL

### **Image Upload Failing:**
- Verify Supabase buckets are created and public
- Check browser console for CORS errors
- Confirm `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` in Vercel

### **404 Errors:**
- Vercel: Check `vercel.json` routing configuration
- Ensure all routes have `{ "source": "/(.*)", "destination": "/" }` for SPA

### **Environment Variables Not Loading:**
- Vercel: Redeploy after adding environment variables
- Render: Restart service after adding environment variables

---

## ✅ Confirmation Checklist

Before deploying to production:
- [ ] All environment variables added to Vercel
- [ ] All environment variables added to Render
- [ ] Supabase storage buckets created (avatars, artworks, exhibitions)
- [ ] Supabase bucket policies set (public read, authenticated write)
- [ ] MongoDB connection string updated in Render
- [ ] CORS origins updated to include Vercel domain
- [ ] Git repository pushed with all changes
- [ ] Vercel auto-deployed and verified
- [ ] Render auto-deployed and verified
- [ ] Tested login functionality
- [ ] Tested image upload functionality

---

## 📞 Summary

**No connectivity will break!** All your existing Vercel → Render → Database connections remain intact. I only:

1. ✅ Added new features (Art Classes, Sub-Admins, Image Upload)
2. ✅ Created new API endpoints (doesn't affect existing ones)
3. ✅ Added Supabase for file storage (optional feature)
4. ✅ Used environment variables for Supabase (production-ready)
5. ✅ Kept all existing environment variables unchanged

Your deployment will work smoothly! Just add the Supabase environment variables to Vercel, create the storage buckets, and you're good to go. 🚀
