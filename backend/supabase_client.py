import os
from supabase import create_client, Client

SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://lurvhgzauuzwftfymjym.supabase.co')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY', '')  # Service role key for admin operations

# Create Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_KEY else None

def get_supabase_client() -> Client:
    """Get Supabase client instance"""
    if not supabase:
        raise Exception("Supabase client not initialized. Set SUPABASE_SERVICE_KEY environment variable.")
    return supabase
