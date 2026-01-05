"""
Script to create initial users in Supabase
Run this after setting up your Supabase database schema

Prerequisites:
1. pip install supabase python-dotenv
2. Set environment variables in .env:
   - SUPABASE_URL
   - SUPABASE_SERVICE_KEY (service_role key, not anon key!)

Usage:
python create_admin.py
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://lurvhgzauuzwftfymjym.supabase.co')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY', '')

if not SUPABASE_SERVICE_KEY:
    print("❌ ERROR: SUPABASE_SERVICE_KEY not set!")
    print("Get it from: Supabase Dashboard → Settings → API → service_role key")
    exit(1)

# Create Supabase client with service role
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def create_user(email: str, password: str, name: str, role: str):
    """
    Create a user in Supabase Auth and users table
    """
    print(f"\n🔄 Creating user: {email} with role: {role}")
    
    try:
        # Step 1: Create user in Supabase Auth
        auth_response = supabase.auth.admin.create_user({
            "email": email,
            "password": password,
            "email_confirm": True,
            "user_metadata": {
                "name": name,
                "role": role
            }
        })
        
        user_id = auth_response.user.id
        print(f"✅ Auth user created with ID: {user_id}")
        
        # Step 2: Create profile in users table
        profile_data = {
            "id": user_id,
            "name": name,
            "email": email,
            "role": role,
            "categories": [],
            "is_approved": role in ['admin', 'lead_chitrakar', 'kalakar', 'user'],
            "is_active": True
        }
        
        profile_response = supabase.table('users').insert(profile_data).execute()
        print(f"✅ Profile created in users table")
        
        return {
            "success": True,
            "user_id": user_id,
            "email": email,
            "role": role
        }
        
    except Exception as e:
        print(f"❌ Error creating user: {str(e)}")
        return {"success": False, "error": str(e)}

def main():
    print("=" * 60)
    print("ChitraKalakar - Initial User Setup")
    print("=" * 60)
    
    users_to_create = [
        {
            "email": "admin@chitrakalakar.com",
            "password": "admin123",
            "name": "ChitraKalakar Admin",
            "role": "admin"
        },
        {
            "email": "lead@chitrakalakar.com",
            "password": "lead123",
            "name": "Lead Chitrakar",
            "role": "lead_chitrakar"
        },
        {
            "email": "kalakar@chitrakalakar.com",
            "password": "kalakar123",
            "name": "Kalakar Manager",
            "role": "kalakar"
        }
    ]
    
    results = []
    for user_data in users_to_create:
        result = create_user(**user_data)
        results.append(result)
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    
    successful = [r for r in results if r.get('success')]
    failed = [r for r in results if not r.get('success')]
    
    print(f"\n✅ Successfully created: {len(successful)} users")
    for r in successful:
        print(f"   - {r['email']} ({r['role']})")
    
    if failed:
        print(f"\n❌ Failed to create: {len(failed)} users")
        for r in failed:
            print(f"   - {r.get('email', 'Unknown')}: {r.get('error', 'Unknown error')}")
    
    print("\n" + "=" * 60)
    print("CREDENTIALS")
    print("=" * 60)
    print("\nAdmin Login:")
    print("  Email: admin@chitrakalakar.com")
    print("  Password: admin123")
    print("  Dashboard: /admin")
    
    print("\nLead Chitrakar Login:")
    print("  Email: lead@chitrakalakar.com")
    print("  Password: lead123")
    print("  Dashboard: /lead-chitrakar")
    
    print("\nKalakar Login:")
    print("  Email: kalakar@chitrakalakar.com")
    print("  Password: kalakar123")
    print("  Dashboard: /kalakar")
    
    print("\n⚠️  IMPORTANT: Change these passwords after first login!")
    print("=" * 60)

if __name__ == "__main__":
    main()
