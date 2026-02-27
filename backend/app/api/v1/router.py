from fastapi import APIRouter

from app.api.v1.endpoints import auth, listings, reviews, payments, recommendations, chat, users

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(listings.router, prefix="/listings", tags=["listings"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["recommendations"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
