import sys
import os
from sqlalchemy.orm import Session
from uuid import uuid4

# Add parent directory to path so we can import app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Mock environment variables to avoid validation errors if .env is missing or incomplete
# Although .env seems to be present, we ensure defaults for safety
os.environ.setdefault("DATABASE_URL", "postgresql://postgres:StrongPass123@localhost:5432/puconnect")
os.environ.setdefault("SECRET_KEY", "vDxu0i3NJjn6VHK91b8jlzmtUhSaxDUN-aK4qjcdOSYbDMqWyldonD4pCxEaW3V1EowWx1EtyMfQXHykReDM1A")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379")
os.environ.setdefault("MTN_MOMO_API_KEY", "seed-dummy-key")

try:
    from app.db.session import SessionLocal, engine, Base
    import app.db.base  # Import all models to register them
    from app.models.user import User
    from app.models.listing import Listing
    from app.models.chat import Chat
    from app.models.payment import Payment
    from app.models.enums import UserRole, ListingType, PaymentStatus
    from app.schemas.user import UserCreate
    from app.schemas.listing import ListingCreate
    from app.services.auth_service import AuthService
    from app.services.listing_service import ListingService
except ImportError as e:
    print(f"Import Error: {e}")
    print("Paths searched:")
    for path in sys.path:
        print(f"  {path}")
    sys.exit(1)

def seed_db():
    db = SessionLocal()
    try:
        # Create tables if they don't exist
        print("Ensuring tables are created...")
        Base.metadata.create_all(bind=engine)
        
        # Check if users exist
        user_count = db.query(User).count()
        if user_count > 0:
            print(f"Database already has {user_count} users. Skipping user seeding.")
        else:
            print("Seeding users...")
            users_data = [
                {
                    "email": "john@example.com",
                    "fullName": "John Doe",
                    "universityId": "PU123456",
                    "password": "password123",
                    "role": UserRole.student
                },
                {
                    "email": "jane@example.com",
                    "fullName": "Jane Smith",
                    "universityId": "PU654321",
                    "password": "password123",
                    "role": UserRole.student
                },
                {
                    "email": "admin@puconnect.com",
                    "fullName": "Admin User",
                    "universityId": "ADMIN001",
                    "password": "adminpassword",
                    "role": UserRole.admin
                }
            ]
            
            for u in users_data:
                user_in = UserCreate(**u)
                AuthService.register_user(db, user_in)
            print(f"Seeded {len(users_data)} users.")

        # Check if listings exist
        listing_count = db.query(Listing).count()
        if listing_count > 0:
            print(f"Database has {listing_count} listings. Clearing for fresh seeding...")
            db.query(Listing).delete()
            db.commit()
            print("Existing listings cleared.")
        
        print("Seeding listings...")
        owner = db.query(User).filter(User.role == UserRole.student).first()
        if not owner:
            print("No student user found to own listings. Check user seeding.")
            return

        listings_data = [
            {
                "title": "MacBook Pro M1 2020",
                "description": "Used MacBook Pro M1 8GB RAM 256GB SSD. Silver color, 85% battery health. Comes with original charger and box.",
                "price": 850.0,
                "category": "electronics",
                "type": ListingType.product,
                "is_active": True
            },
            {
                "title": "Calculus II Tutoring",
                "description": "Expert tutoring for Calculus II and Linear Algebra. I have 2 years of experience and high success rate among students.",
                "price": 25.0,
                "category": "other",
                "type": ListingType.service,
                "is_active": True
            },
            {
                "title": "Nike Air Max 270",
                "description": "Size 42 Nike Air Max, brand new. Navy blue and white. Selling because they are too small for me.",
                "price": 120.0,
                "category": "clothing",
                "type": ListingType.product,
                "is_active": True
            },
            {
                "title": "Laundry Service",
                "description": "I will do your laundry, dry it and fold it. Pick up from dorms and delivery included. Same-day service available.",
                "price": 15.0,
                "category": "other",
                "type": ListingType.service,
                "is_active": True
            },
            {
                "title": "Dorm Fridge",
                "description": "Small fridge perfect for dorm rooms. Energy efficient, quiet, and very clean. Used for only one semester.",
                "price": 50.0,
                "category": "electronics",
                "type": ListingType.product,
                "is_active": True
            },
            {
                "title": "Graphic Design Consultation",
                "description": "Professional help with posters, logos, and academic presentations. High-quality work with quick turnaround.",
                "price": 40.0,
                "category": "other",
                "type": ListingType.service,
                "is_active": True
            },
            {
                "title": "Physics Textbook 10th Ed",
                "description": "University Physics with Modern Physics, 10th Edition. No markings, looks like new.",
                "price": 45.0,
                "category": "textbooks",
                "type": ListingType.product,
                "is_active": True
            },
            {
                "title": "Study Desk",
                "description": "Wooden study desk with 3 drawers. Sturdy and in good condition. Perfect for students.",
                "price": 35.0,
                "category": "furniture",
                "type": ListingType.product,
                "is_active": True
            },
            {
                "title": "Acoustic Guitar",
                "description": "Yamaha F310 Acoustic Guitar. Great for beginners. Comes with a bag and some picks.",
                "price": 90.0,
                "category": "other",
                "type": ListingType.product,
                "is_active": True
            }
        ]

        for l in listings_data:
            listing_in = ListingCreate(**l)
            ListingService.create(db, listing_in, owner.id)
        print(f"Seeded {len(listings_data)} listings.")
            
        # Seed chats
        if db.query(Chat).count() == 0:
            print("Seeding chats...")
            student_users = db.query(User).filter(User.role == UserRole.student).all()
            if len(student_users) >= 2:
                u1, u2 = student_users[0], student_users[1]
                listing = db.query(Listing).first()
                if listing:
                    chats = [
                        Chat(sender_id=u2.id, receiver_id=u1.id, listing_id=listing.id, message="Hi, is this still available?"),
                        Chat(sender_id=u1.id, receiver_id=u2.id, listing_id=listing.id, message="Yes, it is! When would you like to check it out?"),
                        Chat(sender_id=u2.id, receiver_id=u1.id, listing_id=listing.id, message="Maybe tomorrow afternoon?"),
                    ]
                    db.add_all(chats)
                    db.commit()
                    print(f"Seeded {len(chats)} chats.")

        # Seed payments
        if db.query(Payment).count() == 0:
            print("Seeding payments...")
            user = db.query(User).filter(User.role == UserRole.student).first()
            listing = db.query(Listing).filter(Listing.category == "textbooks").first()
            if user and listing:
                payments = [
                    Payment(
                        user_id=user.id,
                        listing_id=listing.id,
                        amount=listing.price,
                        status=PaymentStatus.successful,
                        transaction_reference=f"TRX-{uuid4().hex[:8].upper()}"
                    ),
                    Payment(
                        user_id=user.id,
                        listing_id=listing.id,
                        amount=15.0,
                        status=PaymentStatus.pending,
                        transaction_reference=f"TRX-{uuid4().hex[:8].upper()}"
                    )
                ]
                db.add_all(payments)
                db.commit()
                print(f"Seeded {len(payments)} payments.")

        print("Database seeding completed successfully!")

    except Exception as e:
        print(f"An error occurred DURING seeding: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
