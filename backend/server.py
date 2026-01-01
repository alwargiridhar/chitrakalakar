from fastapi import FastAPI, APIRouter, HTTPException, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')

# Pydantic Models
class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str  # 'user', 'artist', 'institution'
    
class UserCreate(UserBase):
    password: str
    
class UserLogin(BaseModel):
    email: EmailStr
    password: str
    
class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    role: str
    has_membership: bool = False
    created_at: str

class ArtistProfileCreate(BaseModel):
    user_id: str
    bio: Optional[str] = ""
    skills: List[str] = []  # ['Acrylic Colors', 'Watercolors', 'Pencil Work', etc.]
    city: str
    pincode: str
    portfolio_images: List[str] = []
    annual_fee_paid: bool = False
    
class ArtistProfileResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    bio: str
    skills: List[str]
    city: str
    pincode: str
    portfolio_images: List[str]
    annual_fee_paid: bool
    commission_rate: float = 0.10
    total_earnings: float = 0.0
    rating: float = 0.0
    total_orders: int = 0

class ArtworkCreate(BaseModel):
    artist_id: str
    title: str
    description: str
    category: str
    price: float
    currency: str = "INR"
    image_url: str
    dimensions: Optional[str] = ""
    
class ArtworkResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    artist_id: str
    title: str
    description: str
    category: str
    price: float
    currency: str
    image_url: str
    dimensions: str
    status: str  # 'available', 'sold', 'in_exhibition'
    created_at: str

class CustomOrderCreate(BaseModel):
    user_id: str
    title: str
    description: str
    category: str
    budget: float
    currency: str = "INR"
    preferred_city: str
    preferred_pincode: Optional[str] = ""
    
class CustomOrderResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    title: str
    description: str
    category: str
    budget: float
    currency: str
    preferred_city: str
    preferred_pincode: str
    matched_artists: List[str] = []
    selected_artist_id: Optional[str] = None
    status: str  # 'pending', 'matched', 'accepted', 'in_progress', 'completed'
    estimated_days: Optional[int] = None
    created_at: str

class ExhibitionCreate(BaseModel):
    artist_id: str
    title: str
    description: str
    artwork_ids: List[str]  # Max 10 artworks for base price
    duration_days: int = 3  # Base duration
    
class ExhibitionResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    artist_id: str
    title: str
    description: str
    artwork_ids: List[str]
    duration_days: int
    price_paid: float
    currency: str
    status: str  # 'pending_payment', 'active', 'archived'
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    archive_until: Optional[str] = None
    created_at: str

class CheckoutRequest(BaseModel):
    user_id: str
    order_type: str  # 'membership', 'artist_annual', 'exhibition', 'artwork_purchase', 'custom_order'
    amount: float
    currency: str = "INR"
    metadata: Dict[str, str] = {}

# Helper Functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

# Auth Routes
@api_router.post(\"/auth/register\", response_model=UserResponse)
async def register(user: UserCreate):
    existing_user = await db.users.find_one({\"email\": user.email}, {\"_id\": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail=\"Email already registered\")
    
    user_dict = user.model_dump()
    user_dict['password'] = hash_password(user_dict['password'])
    user_dict['id'] = str(uuid.uuid4())
    user_dict['has_membership'] = False
    user_dict['created_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.users.insert_one(user_dict)
    
    return UserResponse(**{k: v for k, v in user_dict.items() if k != 'password'})

@api_router.post(\"/auth/login\", response_model=UserResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({\"email\": credentials.email}, {\"_id\": 0})
    if not user or not verify_password(credentials.password, user['password']):
        raise HTTPException(status_code=401, detail=\"Invalid credentials\")
    
    return UserResponse(**{k: v for k, v in user.items() if k != 'password'})

# Artist Profile Routes
@api_router.post(\"/artists/profile\", response_model=ArtistProfileResponse)
async def create_artist_profile(profile: ArtistProfileCreate):
    user = await db.users.find_one({\"id\": profile.user_id, \"role\": \"artist\"}, {\"_id\": 0})
    if not user:
        raise HTTPException(status_code=404, detail=\"Artist user not found\")
    
    existing_profile = await db.artist_profiles.find_one({\"user_id\": profile.user_id}, {\"_id\": 0})
    if existing_profile:
        raise HTTPException(status_code=400, detail=\"Artist profile already exists\")
    
    profile_dict = profile.model_dump()
    profile_dict['id'] = str(uuid.uuid4())
    profile_dict['commission_rate'] = 0.10\n    profile_dict['total_earnings'] = 0.0\n    profile_dict['rating'] = 0.0\n    profile_dict['total_orders'] = 0\n    \n    await db.artist_profiles.insert_one(profile_dict)\n    \n    return ArtistProfileResponse(**profile_dict)

@api_router.get(\"/artists/profile/{user_id}\", response_model=ArtistProfileResponse)
async def get_artist_profile(user_id: str):
    profile = await db.artist_profiles.find_one({\"user_id\": user_id}, {\"_id\": 0})
    if not profile:
        raise HTTPException(status_code=404, detail=\"Artist profile not found\")
    return ArtistProfileResponse(**profile)

@api_router.get(\"/artists\", response_model=List[ArtistProfileResponse])
async def get_all_artists(city: Optional[str] = None, skill: Optional[str] = None):
    query = {\"annual_fee_paid\": True}\n    if city:\n        query[\"city\"] = city\n    if skill:\n        query[\"skills\"] = skill\n    \n    artists = await db.artist_profiles.find(query, {\"_id\": 0}).to_list(100)\n    return [ArtistProfileResponse(**artist) for artist in artists]

# Artwork Routes
@api_router.post(\"/artworks\", response_model=ArtworkResponse)
async def create_artwork(artwork: ArtworkCreate):
    profile = await db.artist_profiles.find_one({\"id\": artwork.artist_id}, {\"_id\": 0})
    if not profile:
        raise HTTPException(status_code=404, detail=\"Artist not found\")
    
    artwork_dict = artwork.model_dump()
    artwork_dict['id'] = str(uuid.uuid4())
    artwork_dict['status'] = 'available'
    artwork_dict['created_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.artworks.insert_one(artwork_dict)
    
    return ArtworkResponse(**artwork_dict)

@api_router.get(\"/artworks\", response_model=List[ArtworkResponse])
async def get_artworks(artist_id: Optional[str] = None, category: Optional[str] = None, status: str = \"available\"):
    query = {\"status\": status}
    if artist_id:
        query[\"artist_id\"] = artist_id
    if category:
        query[\"category\"] = category
    
    artworks = await db.artworks.find(query, {\"_id\": 0}).to_list(100)
    return [ArtworkResponse(**artwork) for artwork in artworks]

@api_router.get(\"/artworks/{artwork_id}\", response_model=ArtworkResponse)
async def get_artwork(artwork_id: str):
    artwork = await db.artworks.find_one({\"id\": artwork_id}, {\"_id\": 0})
    if not artwork:
        raise HTTPException(status_code=404, detail=\"Artwork not found\")
    return ArtworkResponse(**artwork)

# Custom Order Routes
@api_router.post(\"/orders/custom\", response_model=CustomOrderResponse)
async def create_custom_order(order: CustomOrderCreate):
    order_dict = order.model_dump()
    order_dict['id'] = str(uuid.uuid4())
    order_dict['status'] = 'pending'
    order_dict['created_at'] = datetime.now(timezone.utc).isoformat()
    
    # Match artists by city/pincode and category
    artist_query = {\"annual_fee_paid\": True, \"city\": order.preferred_city}
    if order.category:\n        artist_query[\"skills\"] = order.category\n    \n    matched_artists = await db.artist_profiles.find(artist_query, {\"_id\": 0, \"id\": 1}).to_list(20)\n    order_dict['matched_artists'] = [artist['id'] for artist in matched_artists]\n    order_dict['status'] = 'matched' if matched_artists else 'pending'\n    \n    await db.custom_orders.insert_one(order_dict)\n    \n    return CustomOrderResponse(**order_dict)

@api_router.get(\"/orders/custom/{order_id}\", response_model=CustomOrderResponse)
async def get_custom_order(order_id: str):
    order = await db.custom_orders.find_one({\"id\": order_id}, {\"_id\": 0})
    if not order:
        raise HTTPException(status_code=404, detail=\"Order not found\")
    return CustomOrderResponse(**order)

@api_router.get(\"/orders/custom/user/{user_id}\", response_model=List[CustomOrderResponse])
async def get_user_orders(user_id: str):
    orders = await db.custom_orders.find({\"user_id\": user_id}, {\"_id\": 0}).to_list(100)
    return [CustomOrderResponse(**order) for order in orders]

@api_router.patch(\"/orders/custom/{order_id}/select-artist\")
async def select_artist_for_order(order_id: str, artist_id: str):
    order = await db.custom_orders.find_one({\"id\": order_id}, {\"_id\": 0})
    if not order:
        raise HTTPException(status_code=404, detail=\"Order not found\")
    
    await db.custom_orders.update_one(\n        {\"id\": order_id},\n        {\"$set\": {\"selected_artist_id\": artist_id, \"status\": \"accepted\", \"estimated_days\": 14}}\n    )\n    \n    return {\"message\": \"Artist selected successfully\"}

# Exhibition Routes
@api_router.post(\"/exhibitions\", response_model=ExhibitionResponse)
async def create_exhibition(exhibition: ExhibitionCreate):
    if len(exhibition.artwork_ids) > 10:
        raise HTTPException(status_code=400, detail=\"Maximum 10 artworks allowed for base price\")
    
    # Base price: 1000 INR or 10 USD for 3 days and 10 artworks
    base_price = 1000.0 if exhibition.duration_days <= 3 else 1000.0 * (exhibition.duration_days / 3)\n    \n    exhibition_dict = exhibition.model_dump()
    exhibition_dict['id'] = str(uuid.uuid4())
    exhibition_dict['status'] = 'pending_payment'
    exhibition_dict['price_paid'] = base_price\n    exhibition_dict['currency'] = 'INR'\n    exhibition_dict['created_at'] = datetime.now(timezone.utc).isoformat()
    \n    await db.exhibitions.insert_one(exhibition_dict)
    \n    return ExhibitionResponse(**exhibition_dict)

@api_router.get(\"/exhibitions\", response_model=List[ExhibitionResponse])
async def get_exhibitions(artist_id: Optional[str] = None, status: str = \"active\"):
    query = {\"status\": status}
    if artist_id:
        query[\"artist_id\"] = artist_id
    
    exhibitions = await db.exhibitions.find(query, {\"_id\": 0}).to_list(100)
    return [ExhibitionResponse(**exhibition) for exhibition in exhibitions]

@api_router.get(\"/exhibitions/{exhibition_id}\", response_model=ExhibitionResponse)
async def get_exhibition(exhibition_id: str):
    exhibition = await db.exhibitions.find_one({\"id\": exhibition_id}, {\"_id\": 0})
    if not exhibition:
        raise HTTPException(status_code=404, detail=\"Exhibition not found\")
    return ExhibitionResponse(**exhibition)

@api_router.patch(\"/exhibitions/{exhibition_id}/activate\")
async def activate_exhibition(exhibition_id: str):
    exhibition = await db.exhibitions.find_one({\"id\": exhibition_id}, {\"_id\": 0})
    if not exhibition:
        raise HTTPException(status_code=404, detail=\"Exhibition not found\")
    
    start_date = datetime.now(timezone.utc)
    end_date = start_date + timedelta(days=exhibition['duration_days'])
    archive_until = end_date + timedelta(days=exhibition['duration_days'])
    
    await db.exhibitions.update_one(\n        {\"id\": exhibition_id},\n        {\"$set\": {\n            \"status\": \"active\",\n            \"start_date\": start_date.isoformat(),\n            \"end_date\": end_date.isoformat(),\n            \"archive_until\": archive_until.isoformat()\n        }}\n    )\n    \n    # Update artwork status\n    await db.artworks.update_many(\n        {\"id\": {\"$in\": exhibition['artwork_ids']}},\n        {\"$set\": {\"status\": \"in_exhibition\"}}\n    )\n    \n    return {\"message\": \"Exhibition activated successfully\"}

# Payment Routes
@api_router.post(\"/payments/checkout\")\nasync def create_checkout(request: Request, checkout_req: CheckoutRequest):\n    host_url = str(request.base_url)\n    webhook_url = f\"{host_url}api/webhook/stripe\"\n    \n    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)\n    \n    origin_url = request.headers.get('origin', host_url.rstrip('/'))\n    success_url = f\"{origin_url}/payment-success?session_id={{CHECKOUT_SESSION_ID}}\"\n    cancel_url = f\"{origin_url}/payment-cancel\"\n    \n    checkout_request = CheckoutSessionRequest(\n        amount=checkout_req.amount,\n        currency=checkout_req.currency.lower(),\n        success_url=success_url,\n        cancel_url=cancel_url,\n        metadata={**checkout_req.metadata, \"user_id\": checkout_req.user_id, \"order_type\": checkout_req.order_type}\n    )\n    \n    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)\n    \n    # Create payment transaction record\n    transaction = {\n        \"id\": str(uuid.uuid4()),\n        \"session_id\": session.session_id,\n        \"user_id\": checkout_req.user_id,\n        \"order_type\": checkout_req.order_type,\n        \"amount\": checkout_req.amount,\n        \"currency\": checkout_req.currency,\n        \"payment_status\": \"pending\",\n        \"metadata\": checkout_req.metadata,\n        \"created_at\": datetime.now(timezone.utc).isoformat()\n    }\n    await db.payment_transactions.insert_one(transaction)\n    \n    return {\"url\": session.url, \"session_id\": session.session_id}

@api_router.get(\"/payments/status/{session_id}\")\nasync def check_payment_status(session_id: str):\n    webhook_url = f\"{os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')}/api/webhook/stripe\"\n    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)\n    \n    status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)\n    \n    # Update transaction if payment completed\n    transaction = await db.payment_transactions.find_one({\"session_id\": session_id}, {\"_id\": 0})\n    if transaction and status.payment_status == \"paid\" and transaction['payment_status'] != \"paid\":\n        await db.payment_transactions.update_one(\n            {\"session_id\": session_id},\n            {\"$set\": {\"payment_status\": \"paid\", \"updated_at\": datetime.now(timezone.utc).isoformat()}}\n        )\n        \n        # Process payment based on order type\n        order_type = transaction.get('order_type')\n        user_id = transaction.get('user_id')\n        \n        if order_type == \"membership\":\n            await db.users.update_one({\"id\": user_id}, {\"$set\": {\"has_membership\": True}})\n        elif order_type == \"artist_annual\":\n            await db.artist_profiles.update_one({\"user_id\": user_id}, {\"$set\": {\"annual_fee_paid\": True}})\n        elif order_type == \"exhibition\":\n            exhibition_id = transaction['metadata'].get('exhibition_id')\n            if exhibition_id:\n                await db.exhibitions.update_one({\"id\": exhibition_id}, {\"$set\": {\"status\": \"paid\"}})\n    \n    return {\n        \"status\": status.status,\n        \"payment_status\": status.payment_status,\n        \"amount_total\": status.amount_total,\n        \"currency\": status.currency\n    }

@api_router.post(\"/webhook/stripe\")\nasync def stripe_webhook(request: Request):\n    body = await request.body()\n    signature = request.headers.get(\"Stripe-Signature\")\n    \n    webhook_url = f\"{os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')}/api/webhook/stripe\"\n    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)\n    \n    try:\n        webhook_response = await stripe_checkout.handle_webhook(body, signature)\n        return {\"received\": True}\n    except Exception as e:\n        raise HTTPException(status_code=400, detail=str(e))

# Featured Content Routes
@api_router.get(\"/featured/artists\", response_model=List[ArtistProfileResponse])
async def get_featured_artists():\n    artists = await db.artist_profiles.find(\n        {\"annual_fee_paid\": True},\n        {\"_id\": 0}\n    ).sort(\"rating\", -1).limit(6).to_list(6)\n    return [ArtistProfileResponse(**artist) for artist in artists]

@api_router.get(\"/featured/artworks\", response_model=List[ArtworkResponse])
async def get_featured_artworks():\n    artworks = await db.artworks.find(\n        {\"status\": \"available\"},\n        {\"_id\": 0}\n    ).limit(8).to_list(8)\n    return [ArtworkResponse(**artwork) for artwork in artworks]

@api_router.get(\"/\")\nasync def root():\n    return {\"message\": \"ChitraKalakar API - Give Life To Your Imagination\"}

app.include_router(api_router)

app.add_middleware(\n    CORSMiddleware,\n    allow_credentials=True,\n    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),\n    allow_methods=[\"*\"],\n    allow_headers=[\"*\"],\n)

logging.basicConfig(\n    level=logging.INFO,\n    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'\n)
logger = logging.getLogger(__name__)

@app.on_event(\"shutdown\")
async def shutdown_db_client():\n    client.close()
