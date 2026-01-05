import os
import jwt
import httpx
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional

security = HTTPBearer()

# Supabase configuration
SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://lurvhgzauuzwftfymjym.supabase.co')
SUPABASE_JWT_SECRET = os.environ.get('SUPABASE_JWT_SECRET', '')  # Get from Supabase settings

# Cache for JWKS
_jwks_cache = None

async def get_jwks():
    """Fetch JWKS from Supabase"""
    global _jwks_cache
    if _jwks_cache:
        return _jwks_cache
    
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json")
        _jwks_cache = response.json()
        return _jwks_cache

async def verify_supabase_token(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    """
    Verify Supabase JWT token
    Returns user data from token
    """
    token = credentials.credentials
    
    try:
        # Decode and verify JWT
        # Note: For production, verify with JWKS
        if SUPABASE_JWT_SECRET:
            payload = jwt.decode(
                token,
                SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated"
            )
        else:
            # For development/testing - decode without verification
            payload = jwt.decode(token, options={"verify_signature": False})
        
        user_id = payload.get('sub')
        email = payload.get('email')
        role = payload.get('user_metadata', {}).get('role', 'user')
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        return {
            "id": user_id,
            "email": email,
            "role": role
        }
    
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

async def require_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    """Require any authenticated user"""
    return await verify_supabase_token(credentials)

async def require_artist(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    """Require artist role"""
    user = await verify_supabase_token(credentials)
    if user.get("role") not in ["artist", "admin"]:
        raise HTTPException(status_code=403, detail="Artist access required")
    return user

async def require_admin(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    """Require admin role"""
    user = await verify_supabase_token(credentials)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

async def require_lead_chitrakar(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    """Require Lead Chitrakar role"""
    user = await verify_supabase_token(credentials)
    if user.get("role") not in ["admin", "lead_chitrakar"]:
        raise HTTPException(status_code=403, detail="Lead Chitrakar access required")
    return user

async def require_kalakar(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    """Require Kalakar role"""
    user = await verify_supabase_token(credentials)
    if user.get("role") not in ["admin", "kalakar"]:
        raise HTTPException(status_code=403, detail="Kalakar access required")
    return user

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(lambda: None)) -> Optional[dict]:
    """Get current user if authenticated, otherwise return None"""
    if not credentials:
        return None
    
    try:
        return await verify_supabase_token(credentials)
    except:
        return None
