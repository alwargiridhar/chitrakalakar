from fastapi import FastAPI, APIRouter, HTTPException, Depends, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import hashlib
import secrets

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'chitrakalakar')]

# Create the main app
app = FastAPI(title="ChitraKalakar API")

# Create routers
api_router = APIRouter(prefix="/api")
auth_router = APIRouter(prefix="/auth", tags=["Authentication"])
admin_router = APIRouter(prefix="/admin", tags=["Admin"])
artist_router = APIRouter(prefix="/artist", tags=["Artist"])
public_router = APIRouter(prefix="/public", tags=["Public"])

# Security
security = HTTPBearer(auto_error=False)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ============ MODELS ============

class UserBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    email: str
    role: str = "user"  # user, artist, institution, admin, lead_chitrakar, kalakar
    location: Optional[str] = None
    bio: Optional[str] = None
    categories: Optional[List[str]] = []  # Multiple categories support
    category: Optional[str] = None  # Legacy single category
    avatar: Optional[str] = None
    phone: Optional[str] = None
    teaching_rate: Optional[float] = None  # Cost per session for art classes
    teaches_online: bool = False
    teaches_offline: bool = False

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    is_approved: bool = True
    is_active: bool = True
    is_featured: bool = False  # Featured artist flag
    joined_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    categories: Optional[List[str]] = None
    avatar: Optional[str] = None
    phone: Optional[str] = None
    teaching_rate: Optional[float] = None
    teaches_online: Optional[bool] = None
    teaches_offline: Optional[bool] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class ArtworkBase(BaseModel):
    title: str
    category: str
    price: float
    image: str
    description: Optional[str] = None

class Artwork(ArtworkBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    artist_id: str
    is_for_exhibition: bool = False
    is_approved: bool = False
    views: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Exhibition(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    artist_id: str
    name: str
    description: Optional[str] = None
    start_date: str
    end_date: str
    artwork_ids: List[str] = []
    status: str = "upcoming"  # upcoming, active, completed, archived
    views: int = 0
    fees: float = 1000
    days_paid: int = 3  # Number of days paid for
    is_approved: bool = False
    archived_at: Optional[str] = None  # When it was archived
    archive_expires_at: Optional[str] = None  # When archive access expires
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_number: str = Field(default_factory=lambda: f"ORD-{datetime.now().strftime('%Y%m%d')}-{secrets.token_hex(3).upper()}")
    artist_id: str
    artwork_id: Optional[str] = None
    artwork_title: str
    customer_id: str
    customer_name: str
    customer_email: str
    amount: float
    commission_fee: float = 0
    artist_receives: float = 0
    status: str = "pending"
    notes: Optional[str] = None
    start_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    due_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Featured Artist (Contemporary artist added by admin)
class FeaturedArtistCreate(BaseModel):
    name: str
    bio: str  # Up to 2500 words
    avatar: str  # Picture URL
    categories: List[str] = []
    location: Optional[str] = None
    artworks: List[dict] = []  # Up to 10 artworks [{title, image, category, price, description}]

class ArtistApprovalRequest(BaseModel):
    artist_id: str
    approved: bool
    rejection_reason: Optional[str] = None

class ArtworkApprovalRequest(BaseModel):
    artwork_id: str
    approved: bool

class ExhibitionApprovalRequest(BaseModel):
    exhibition_id: str
    approved: bool

class FeatureRegisteredArtistRequest(BaseModel):
    artist_id: str
    featured: bool

# ============ HELPER FUNCTIONS ============

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Optional[dict]:
    if not credentials:
        return None
    token = credentials.credentials
    user = await db.users.find_one({"id": token})
    return user

async def require_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    user = await get_current_user(credentials)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

async def require_admin(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    user = await require_user(credentials)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

async def require_artist(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    user = await require_user(credentials)
    if user.get("role") != "artist":
        raise HTTPException(status_code=403, detail="Artist access required")
    if not user.get("is_approved", False):
        raise HTTPException(status_code=403, detail="Artist account pending approval")
    return user

# ============ STARTUP ============

@app.on_event("startup")
async def startup_event():
    # Create default admin if not exists
    admin = await db.users.find_one({"email": "admin@chitrakalakar.com"})
    if not admin:
        admin_user = {
            "id": str(uuid.uuid4()),
            "name": "Admin",
            "email": "admin@chitrakalakar.com",
            "password": hash_password("admin123"),
            "role": "admin",
            "is_approved": True,
            "is_active": True,
            "joined_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(admin_user)
        logger.info("Default admin user created: admin@chitrakalakar.com / admin123")

# ============ AUTH ROUTES ============

@auth_router.post("/signup")
async def signup(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    
    user_dict = user_data.model_dump()
    user_dict["id"] = str(uuid.uuid4())
    user_dict["password"] = hash_password(user_data.password)
    user_dict["is_active"] = True
    user_dict["is_featured"] = False
    user_dict["joined_at"] = datetime.now(timezone.utc).isoformat()
    
    # Handle categories - ensure it's a list
    if user_dict.get("categories") is None:
        user_dict["categories"] = []
    if user_dict.get("category") and user_dict["category"] not in user_dict["categories"]:
        user_dict["categories"].append(user_dict["category"])
    
    # Artists need approval
    user_dict["is_approved"] = user_data.role != "artist"
    
    await db.users.insert_one(user_dict)
    
    del user_dict["password"]
    if "_id" in user_dict:
        del user_dict["_id"]
    
    return {
        "success": True,
        "message": "Account created" + (" - pending admin approval" if user_data.role == "artist" else ""),
        "user": user_dict,
        "token": user_dict["id"]
    }

@auth_router.post("/login")
async def login(data: LoginRequest):
    user = await db.users.find_one({"email": data.email})
    if not user or not verify_password(data.password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is deactivated")
    
    user_response = {k: v for k, v in user.items() if k not in ["password", "_id"]}
    
    return {
        "success": True,
        "message": "Login successful",
        "user": user_response,
        "token": user["id"]
    }

@auth_router.get("/me")
async def get_me(user: dict = Depends(require_user)):
    user_response = {k: v for k, v in user.items() if k not in ["password", "_id"]}
    return {"success": True, "user": user_response}

@auth_router.put("/profile")
async def update_profile(updates: ProfileUpdateRequest, user: dict = Depends(require_user)):
    """Update user profile including categories"""
    update_data = {}
    if updates.name is not None:
        update_data["name"] = updates.name
    if updates.bio is not None:
        update_data["bio"] = updates.bio
    if updates.location is not None:
        update_data["location"] = updates.location
    if updates.categories is not None:
        update_data["categories"] = updates.categories
        # Update legacy category field too
        if updates.categories:
            update_data["category"] = updates.categories[0]
    if updates.avatar is not None:
        update_data["avatar"] = updates.avatar
    
    if update_data:
        await db.users.update_one({"id": user["id"]}, {"$set": update_data})
    
    updated_user = await db.users.find_one({"id": user["id"]}, {"password": 0, "_id": 0})
    return {"success": True, "user": updated_user}

# ============ PUBLIC ROUTES ============

@public_router.get("/stats")
async def get_public_stats():
    total_artists = await db.users.count_documents({"role": "artist", "is_approved": True})
    # Also count featured artists
    featured_artists = await db.featured_artists.count_documents({})
    total_artworks = await db.artworks.count_documents({"is_approved": True})
    total_orders = await db.orders.count_documents({"status": "completed"})
    total_exhibitions = await db.exhibitions.count_documents({"is_approved": True})
    
    completed = await db.orders.count_documents({"status": "completed"})
    cancelled = await db.orders.count_documents({"status": "cancelled"})
    total = completed + cancelled
    satisfaction_rate = round((completed / total * 100) if total > 0 else 0, 1)
    
    return {
        "total_artists": total_artists + featured_artists,
        "total_artworks": total_artworks,
        "completed_projects": total_orders,
        "total_exhibitions": total_exhibitions,
        "satisfaction_rate": satisfaction_rate
    }

@public_router.get("/featured-artists")
async def get_featured_artists():
    """Get featured and approved artists for homepage"""
    # Get featured registered artists first
    featured = await db.users.find(
        {"role": "artist", "is_approved": True, "is_active": True, "is_featured": True},
        {"password": 0, "_id": 0}
    ).limit(4).to_list(4)
    
    # Get contemporary featured artists
    contemporary = await db.featured_artists.find({}, {"_id": 0}).limit(4).to_list(4)
    
    # Get regular approved artists
    regular = await db.users.find(
        {"role": "artist", "is_approved": True, "is_active": True, "is_featured": {"$ne": True}},
        {"password": 0, "_id": 0}
    ).limit(8 - len(featured) - len(contemporary)).to_list(8)
    
    all_artists = featured + contemporary + regular
    
    # Add artwork info for registered artists
    for artist in all_artists:
        if "artist_type" not in artist:  # Registered artist
            artwork_count = await db.artworks.count_documents({"artist_id": artist["id"], "is_approved": True})
            completed_orders = await db.orders.count_documents({"artist_id": artist["id"], "status": "completed"})
            artist["artwork_count"] = artwork_count
            artist["completed_projects"] = completed_orders
            artist["rating"] = 5.0 if completed_orders > 0 else 0
    
    return {"artists": all_artists[:8]}

@public_router.get("/exhibitions/active")
async def get_active_exhibitions():
    """Get active/upcoming exhibitions"""
    exhibitions = await db.exhibitions.find(
        {"is_approved": True, "status": {"$in": ["upcoming", "active"]}},
        {"_id": 0}
    ).sort("start_date", 1).to_list(50)
    
    for exhibition in exhibitions:
        artist = await db.users.find_one({"id": exhibition["artist_id"]}, {"name": 1, "_id": 0})
        exhibition["artist_name"] = artist.get("name", "Unknown") if artist else "Unknown"
        exhibition["artwork_count"] = len(exhibition.get("artwork_ids", []))
    
    return {"exhibitions": exhibitions}

@public_router.get("/exhibitions/archived")
async def get_archived_exhibitions():
    """Get archived exhibitions that are still within their free archive period"""
    now = datetime.now(timezone.utc).isoformat()
    
    exhibitions = await db.exhibitions.find(
        {
            "is_approved": True,
            "status": "archived",
            "$or": [
                {"archive_expires_at": {"$gt": now}},
                {"archive_expires_at": None}  # Legacy without expiry
            ]
        },
        {"_id": 0}
    ).sort("archived_at", -1).to_list(50)
    
    for exhibition in exhibitions:
        artist = await db.users.find_one({"id": exhibition["artist_id"]}, {"name": 1, "_id": 0})
        exhibition["artist_name"] = artist.get("name", "Unknown") if artist else "Unknown"
        exhibition["artwork_count"] = len(exhibition.get("artwork_ids", []))
    
    return {"exhibitions": exhibitions}

@public_router.get("/exhibitions")
async def get_public_exhibitions():
    """Get all approved exhibitions"""
    exhibitions = await db.exhibitions.find(
        {"is_approved": True},
        {"_id": 0}
    ).sort("created_at", -1).limit(10).to_list(10)
    
    for exhibition in exhibitions:
        artist = await db.users.find_one({"id": exhibition["artist_id"]}, {"name": 1, "_id": 0})
        exhibition["artist_name"] = artist.get("name", "Unknown") if artist else "Unknown"
        exhibition["artwork_count"] = len(exhibition.get("artwork_ids", []))
    
    return {"exhibitions": exhibitions}

@public_router.get("/featured-artist/{artist_id}")
async def get_featured_artist_detail(artist_id: str):
    """Get detailed info about a featured artist"""
    # Check featured_artists collection first
    artist = await db.featured_artists.find_one({"id": artist_id}, {"_id": 0})
    if artist:
        return {"artist": artist, "type": "contemporary"}
    
    # Check registered artists
    artist = await db.users.find_one(
        {"id": artist_id, "role": "artist"},
        {"password": 0, "_id": 0}
    )
    if artist:
        # Get their artworks
        artworks = await db.artworks.find(
            {"artist_id": artist_id, "is_approved": True},
            {"_id": 0}
        ).sort("views", -1).limit(10).to_list(10)
        artist["artworks"] = artworks
        return {"artist": artist, "type": "registered"}
    
    raise HTTPException(status_code=404, detail="Artist not found")

# ============ ADMIN ROUTES ============

@admin_router.get("/dashboard")
async def admin_dashboard(admin: dict = Depends(require_admin)):
    pending_artists = await db.users.count_documents({"role": "artist", "is_approved": False})
    pending_artworks = await db.artworks.count_documents({"is_approved": False})
    pending_exhibitions = await db.exhibitions.count_documents({"is_approved": False})
    total_users = await db.users.count_documents({})
    total_orders = await db.orders.count_documents({})
    featured_artists = await db.featured_artists.count_documents({})
    
    pipeline = [
        {"$match": {"status": "completed"}},
        {"$group": {"_id": None, "total": {"$sum": "$commission_fee"}}}
    ]
    revenue_result = await db.orders.aggregate(pipeline).to_list(1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0
    
    return {
        "pending_artists": pending_artists,
        "pending_artworks": pending_artworks,
        "pending_exhibitions": pending_exhibitions,
        "total_users": total_users,
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "featured_artists": featured_artists
    }

@admin_router.get("/pending-artists")
async def get_pending_artists(admin: dict = Depends(require_admin)):
    artists = await db.users.find(
        {"role": "artist", "is_approved": False},
        {"password": 0, "_id": 0}
    ).to_list(100)
    return {"artists": artists}

@admin_router.post("/approve-artist")
async def approve_artist(request: ArtistApprovalRequest, admin: dict = Depends(require_admin)):
    result = await db.users.update_one(
        {"id": request.artist_id, "role": "artist"},
        {"$set": {"is_approved": request.approved}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Artist not found")
    
    return {"success": True, "message": f"Artist {'approved' if request.approved else 'rejected'}"}

@admin_router.get("/pending-artworks")
async def get_pending_artworks(admin: dict = Depends(require_admin)):
    artworks = await db.artworks.find({"is_approved": False}, {"_id": 0}).to_list(100)
    
    for artwork in artworks:
        artist = await db.users.find_one({"id": artwork["artist_id"]}, {"name": 1, "_id": 0})
        artwork["artist_name"] = artist.get("name", "Unknown") if artist else "Unknown"
    
    return {"artworks": artworks}

@admin_router.post("/approve-artwork")
async def approve_artwork(request: ArtworkApprovalRequest, admin: dict = Depends(require_admin)):
    if request.approved:
        result = await db.artworks.update_one(
            {"id": request.artwork_id},
            {"$set": {"is_approved": True}}
        )
    else:
        result = await db.artworks.delete_one({"id": request.artwork_id})
    
    if result.modified_count == 0 and getattr(result, 'deleted_count', 0) == 0:
        raise HTTPException(status_code=404, detail="Artwork not found")
    
    return {"success": True, "message": f"Artwork {'approved' if request.approved else 'rejected'}"}

@admin_router.get("/pending-exhibitions")
async def get_pending_exhibitions(admin: dict = Depends(require_admin)):
    exhibitions = await db.exhibitions.find({"is_approved": False}, {"_id": 0}).to_list(100)
    
    for exhibition in exhibitions:
        artist = await db.users.find_one({"id": exhibition["artist_id"]}, {"name": 1, "_id": 0})
        exhibition["artist_name"] = artist.get("name", "Unknown") if artist else "Unknown"
    
    return {"exhibitions": exhibitions}

@admin_router.post("/approve-exhibition")
async def approve_exhibition(request: ExhibitionApprovalRequest, admin: dict = Depends(require_admin)):
    if request.approved:
        result = await db.exhibitions.update_one(
            {"id": request.exhibition_id},
            {"$set": {"is_approved": True, "status": "upcoming"}}
        )
    else:
        result = await db.exhibitions.delete_one({"id": request.exhibition_id})
    
    return {"success": True, "message": f"Exhibition {'approved' if request.approved else 'rejected'}"}

@admin_router.post("/archive-exhibition/{exhibition_id}")
async def archive_exhibition(exhibition_id: str, admin: dict = Depends(require_admin)):
    """Archive an exhibition - it stays free in archive for same days paid"""
    exhibition = await db.exhibitions.find_one({"id": exhibition_id})
    if not exhibition:
        raise HTTPException(status_code=404, detail="Exhibition not found")
    
    days_paid = exhibition.get("days_paid", 3)
    archived_at = datetime.now(timezone.utc)
    archive_expires_at = archived_at + timedelta(days=days_paid)
    
    await db.exhibitions.update_one(
        {"id": exhibition_id},
        {"$set": {
            "status": "archived",
            "archived_at": archived_at.isoformat(),
            "archive_expires_at": archive_expires_at.isoformat()
        }}
    )
    
    return {"success": True, "message": f"Exhibition archived. Available in archive for {days_paid} days."}

@admin_router.get("/all-users")
async def get_all_users(admin: dict = Depends(require_admin)):
    users = await db.users.find({}, {"password": 0, "_id": 0}).to_list(1000)
    return {"users": users}

@admin_router.post("/toggle-user-status/{user_id}")
async def toggle_user_status(user_id: str, admin: dict = Depends(require_admin)):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_status = not user.get("is_active", True)
    await db.users.update_one({"id": user_id}, {"$set": {"is_active": new_status}})
    
    return {"success": True, "is_active": new_status}

@admin_router.get("/all-orders")
async def get_all_orders(admin: dict = Depends(require_admin)):
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return {"orders": orders}

# ============ ADMIN - FEATURE CONTEMPORARY ARTIST ============

@admin_router.post("/feature-contemporary-artist")
async def create_featured_artist(artist_data: FeaturedArtistCreate, admin: dict = Depends(require_admin)):
    """Admin can add a contemporary artist with bio, picture, and artworks"""
    # Validate bio length (roughly 2500 words = ~15000 characters)
    if len(artist_data.bio) > 15000:
        raise HTTPException(status_code=400, detail="Bio exceeds 2500 words limit")
    
    # Validate artworks count
    if len(artist_data.artworks) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 artworks allowed")
    
    featured_artist = {
        "id": str(uuid.uuid4()),
        "name": artist_data.name,
        "bio": artist_data.bio,
        "avatar": artist_data.avatar,
        "categories": artist_data.categories,
        "location": artist_data.location,
        "artworks": artist_data.artworks,
        "artist_type": "contemporary",  # Mark as admin-added
        "is_featured": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": admin["id"]
    }
    
    await db.featured_artists.insert_one(featured_artist)
    
    if "_id" in featured_artist:
        del featured_artist["_id"]
    
    return {"success": True, "artist": featured_artist}

@admin_router.get("/featured-artists")
async def get_admin_featured_artists(admin: dict = Depends(require_admin)):
    """Get all featured artists (both contemporary and registered)"""
    # Contemporary artists
    contemporary = await db.featured_artists.find({}, {"_id": 0}).to_list(100)
    
    # Featured registered artists
    registered = await db.users.find(
        {"role": "artist", "is_featured": True},
        {"password": 0, "_id": 0}
    ).to_list(100)
    
    # Add artworks for registered artists
    for artist in registered:
        artworks = await db.artworks.find(
            {"artist_id": artist["id"], "is_approved": True},
            {"_id": 0}
        ).sort("views", -1).limit(10).to_list(10)
        artist["artworks"] = artworks
        artist["artist_type"] = "registered"
    
    return {
        "contemporary": contemporary,
        "registered": registered
    }

@admin_router.put("/featured-artist/{artist_id}")
async def update_featured_artist(
    artist_id: str,
    artist_data: FeaturedArtistCreate,
    admin: dict = Depends(require_admin)
):
    """Update a contemporary featured artist"""
    result = await db.featured_artists.update_one(
        {"id": artist_id},
        {"$set": {
            "name": artist_data.name,
            "bio": artist_data.bio,
            "avatar": artist_data.avatar,
            "categories": artist_data.categories,
            "location": artist_data.location,
            "artworks": artist_data.artworks,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Featured artist not found")
    
    return {"success": True, "message": "Featured artist updated"}

@admin_router.delete("/featured-artist/{artist_id}")
async def delete_featured_artist(artist_id: str, admin: dict = Depends(require_admin)):
    """Delete a contemporary featured artist"""
    result = await db.featured_artists.delete_one({"id": artist_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Featured artist not found")
    return {"success": True, "message": "Featured artist deleted"}

# ============ ADMIN - FEATURE REGISTERED ARTIST ============

@admin_router.get("/approved-artists")
async def get_approved_artists(admin: dict = Depends(require_admin)):
    """Get all approved registered artists for featuring"""
    artists = await db.users.find(
        {"role": "artist", "is_approved": True},
        {"password": 0, "_id": 0}
    ).to_list(100)
    
    # Add artwork info
    for artist in artists:
        artworks = await db.artworks.find(
            {"artist_id": artist["id"], "is_approved": True},
            {"_id": 0}
        ).sort("views", -1).limit(10).to_list(10)
        artist["artworks"] = artworks
        artist["artwork_count"] = len(artworks)
    
    return {"artists": artists}

@admin_router.post("/feature-registered-artist")
async def feature_registered_artist(
    request: FeatureRegisteredArtistRequest,
    admin: dict = Depends(require_admin)
):
    """Feature or unfeature a registered artist"""
    result = await db.users.update_one(
        {"id": request.artist_id, "role": "artist"},
        {"$set": {"is_featured": request.featured}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Artist not found")
    
    return {
        "success": True,
        "message": f"Artist {'featured' if request.featured else 'unfeatured'}"
    }

@admin_router.get("/artist-preview/{artist_id}")
async def get_artist_preview(artist_id: str, admin: dict = Depends(require_admin)):
    """Get artist details for preview before featuring"""
    artist = await db.users.find_one(
        {"id": artist_id, "role": "artist"},
        {"password": 0, "_id": 0}
    )
    
    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")
    
    # Get their artworks sorted by views
    artworks = await db.artworks.find(
        {"artist_id": artist_id, "is_approved": True},
        {"_id": 0}
    ).sort("views", -1).to_list(10)
    
    # If no artworks with views, get random
    if not artworks:
        artworks = await db.artworks.find(
            {"artist_id": artist_id, "is_approved": True},
            {"_id": 0}
        ).limit(10).to_list(10)
    
    artist["artworks"] = artworks
    
    return {"artist": artist}

# ============ ARTIST ROUTES ============

@artist_router.get("/dashboard")
async def artist_dashboard(artist: dict = Depends(require_artist)):
    artist_id = artist["id"]
    
    total_artworks = await db.artworks.count_documents({"artist_id": artist_id})
    approved_artworks = await db.artworks.count_documents({"artist_id": artist_id, "is_approved": True})
    
    total_exhibitions = await db.exhibitions.count_documents({"artist_id": artist_id})
    active_exhibitions = await db.exhibitions.count_documents({"artist_id": artist_id, "status": "active", "is_approved": True})
    
    total_orders = await db.orders.count_documents({"artist_id": artist_id})
    completed_orders = await db.orders.count_documents({"artist_id": artist_id, "status": "completed"})
    in_progress_orders = await db.orders.count_documents({"artist_id": artist_id, "status": "in_progress"})
    
    pipeline = [
        {"$match": {"artist_id": artist_id, "status": "completed"}},
        {"$group": {"_id": None, "total": {"$sum": "$artist_receives"}}}
    ]
    earnings_result = await db.orders.aggregate(pipeline).to_list(1)
    total_earnings = earnings_result[0]["total"] if earnings_result else 0
    
    portfolio_pipeline = [
        {"$match": {"artist_id": artist_id}},
        {"$group": {"_id": None, "total": {"$sum": "$price"}}}
    ]
    portfolio_result = await db.artworks.aggregate(portfolio_pipeline).to_list(1)
    portfolio_value = portfolio_result[0]["total"] if portfolio_result else 0
    
    views_pipeline = [
        {"$match": {"artist_id": artist_id}},
        {"$group": {"_id": None, "total": {"$sum": "$views"}}}
    ]
    views_result = await db.exhibitions.aggregate(views_pipeline).to_list(1)
    total_views = views_result[0]["total"] if views_result else 0
    
    return {
        "total_earnings": total_earnings,
        "portfolio_views": total_views,
        "completed_orders": completed_orders,
        "in_progress_orders": in_progress_orders,
        "active_exhibitions": active_exhibitions,
        "total_artworks": total_artworks,
        "approved_artworks": approved_artworks,
        "total_exhibitions": total_exhibitions,
        "portfolio_value": portfolio_value
    }

@artist_router.get("/portfolio")
async def get_portfolio(artist: dict = Depends(require_artist)):
    artworks = await db.artworks.find(
        {"artist_id": artist["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return {"artworks": artworks}

@artist_router.post("/portfolio")
async def add_artwork(artwork: ArtworkBase, artist: dict = Depends(require_artist)):
    artwork_dict = artwork.model_dump()
    artwork_dict["id"] = str(uuid.uuid4())
    artwork_dict["artist_id"] = artist["id"]
    artwork_dict["is_approved"] = False
    artwork_dict["is_for_exhibition"] = False
    artwork_dict["views"] = 0
    artwork_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.artworks.insert_one(artwork_dict)
    if "_id" in artwork_dict:
        del artwork_dict["_id"]
    
    return {"success": True, "artwork": artwork_dict, "message": "Artwork submitted for approval"}

@artist_router.put("/portfolio/{artwork_id}")
async def update_artwork(artwork_id: str, artwork: ArtworkBase, artist: dict = Depends(require_artist)):
    result = await db.artworks.update_one(
        {"id": artwork_id, "artist_id": artist["id"]},
        {"$set": artwork.model_dump()}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Artwork not found")
    return {"success": True, "message": "Artwork updated"}

@artist_router.delete("/portfolio/{artwork_id}")
async def delete_artwork(artwork_id: str, artist: dict = Depends(require_artist)):
    result = await db.artworks.delete_one({"id": artwork_id, "artist_id": artist["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Artwork not found")
    return {"success": True, "message": "Artwork deleted"}

@artist_router.get("/orders")
async def get_artist_orders(artist: dict = Depends(require_artist)):
    orders = await db.orders.find(
        {"artist_id": artist["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    total_earnings = sum(o.get("artist_receives", 0) for o in orders if o.get("status") == "completed")
    
    return {"orders": orders, "total_earnings": total_earnings}

@artist_router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str, artist: dict = Depends(require_artist)):
    valid_statuses = ["in_progress", "pending_approval", "completed"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    result = await db.orders.update_one(
        {"id": order_id, "artist_id": artist["id"]},
        {"$set": {"status": status}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"success": True, "message": "Order status updated"}

@artist_router.get("/exhibitions")
async def get_artist_exhibitions(artist: dict = Depends(require_artist)):
    exhibitions = await db.exhibitions.find(
        {"artist_id": artist["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return {"exhibitions": exhibitions}

@artist_router.post("/exhibitions")
async def create_exhibition(
    name: str = Body(...),
    description: str = Body(""),
    start_date: str = Body(...),
    end_date: str = Body(...),
    artwork_ids: List[str] = Body([]),
    days_paid: int = Body(3),
    artist: dict = Depends(require_artist)
):
    exhibition = {
        "id": str(uuid.uuid4()),
        "artist_id": artist["id"],
        "name": name,
        "description": description,
        "start_date": start_date,
        "end_date": end_date,
        "artwork_ids": artwork_ids,
        "status": "upcoming",
        "views": 0,
        "fees": days_paid * 333,  # ~1000 for 3 days
        "days_paid": days_paid,
        "is_approved": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.exhibitions.insert_one(exhibition)
    
    return {"success": True, "exhibition": exhibition, "message": "Exhibition submitted for approval"}

# ============ ROOT ROUTE ============

@api_router.get("/")
async def root():
    return {"message": "ChitraKalakar API", "version": "1.0.0"}

# Include all routers
api_router.include_router(auth_router)
api_router.include_router(admin_router)
api_router.include_router(artist_router)
api_router.include_router(public_router)
app.include_router(api_router)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
