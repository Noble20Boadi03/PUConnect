# 🔴 MODEL & ENUM AUDIT REPORT

## CRITICAL ISSUES FOUND

### ❌ **ISSUE 1: DUPLICATE ENUM DEFINITIONS**

**Problem:** Enums are defined in BOTH models AND schemas!

| Enum | Model Location | Schema Location | Status |
|------|---------------|-----------------|--------|
| `UserRole` | `models/user.py` (line 10) | `schemas/user.py` (line 7) | ❌ DUPLICATE |
| `ListingType` | `models/listing.py` (line 11) | `schemas/listing.py` (line 7) | ❌ DUPLICATE |
| `PaymentStatus` | `models/payment.py` (line 11) | `schemas/payment.py` (line 7) | ❌ DUPLICATE |

**Why This Is Critical:**
- ✗ Two sources of truth for the same data
- ✗ Easy to update one and forget the other
- ✗ Can cause subtle bugs when values drift
- ✗ Violates DRY principle

**Correct Pattern:**
```
models/enums.py (SINGLE SOURCE OF TRUTH)
    ↓
models/*.py (import and use)
    ↓
schemas/*.py (import and use)
```

---

## MODEL ANALYSIS

### ✅ **User Model**
```python
class User(Base):
    __tablename__ = "users"
    
    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Fields
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    university_id = Column(String, index=True, nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.student)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    listings → Listing (one-to-many)
    reviews → Review (one-to-many)
    sent_messages → Chat (one-to-many)
    received_messages → Chat (one-to-many)
```

**Issues:**
- ❌ UserRole enum duplicated in schemas
- ⚠️ Missing `is_admin` property (used in recommendations.py)

---

### ✅ **Listing Model**
```python
class Listing(Base):
    __tablename__ = "listings"
    
    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Fields
    title = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    category = Column(String, index=True, nullable=False)  # Free-form string
    type = Column(Enum(ListingType), nullable=False)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    owner → User (many-to-one)
    reviews → Review (one-to-many)
    messages → Chat (one-to-many)
```

**Issues:**
- ❌ ListingType enum duplicated in schemas
- ⚠️ `category` is free-form string (should it be an enum for consistency?)
- ⚠️ Missing `updated_at` field (good practice for tracking changes)

---

### ✅ **Review Model**
```python
class Review(Base):
    __tablename__ = "reviews"
    
    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Fields
    rating = Column(Integer, nullable=False)
    comment = Column(String, nullable=True)
    reviewer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user → User (many-to-one)
    listing → Listing (many-to-one)
```

**Issues:**
- ⚠️ No validation on `rating` (should be 1-5)
- ⚠️ Missing `updated_at` field

---

### ✅ **Payment Model**
```python
class Payment(Base):
    __tablename__ = "payments"
    
    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Fields
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id"), nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.pending, nullable=False)
    transaction_reference = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user → User (many-to-one) [using backref]
    listing → Listing (many-to-one) [using backref]
```

**Issues:**
- ❌ PaymentStatus enum duplicated in schemas
- ⚠️ Uses `backref` instead of `back_populates` (inconsistent with other models)
- ⚠️ Missing `updated_at` field

---

### ✅ **Chat Model**
```python
class Chat(Base):
    __tablename__ = "chats"
    
    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Fields
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    receiver_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id"), nullable=False)
    message = Column(String, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    sender → User (many-to-one)
    receiver → User (many-to-one)
    listing → Listing (many-to-one)
```

**Issues:**
- ✅ No enums to duplicate
- ⚠️ Missing `updated_at` field

---

## RELATIONSHIP VERIFICATION

### User Relationships
```python
listings = relationship("Listing", back_populates="owner")  ✅
reviews = relationship("Review", back_populates="user")  ✅
sent_messages = relationship("Chat", back_populates="sender", foreign_keys='Chat.sender_id')  ✅
received_messages = relationship("Chat", back_populates="receiver", foreign_keys='Chat.receiver_id')  ✅
```

### Listing Relationships
```python
owner = relationship("User", back_populates="listings")  ✅
reviews = relationship("Review", back_populates="listing")  ✅
messages = relationship("Chat", back_populates="listing")  ✅
```

### Review Relationships
```python
user = relationship("User", back_populates="reviews")  ✅
listing = relationship("Listing", back_populates="reviews")  ✅
```

### Payment Relationships
```python
user = relationship("User", backref="payments")  ⚠️ Uses backref
listing = relationship("Listing", backref="payments")  ⚠️ Uses backref
```

### Chat Relationships
```python
sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")  ✅
receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_messages")  ✅
listing = relationship("Listing", back_populates="messages")  ✅
```

---

## UUID CONSISTENCY CHECK

✅ **All models use UUID consistently:**
- All primary keys: `UUID(as_uuid=True)`
- All foreign keys: `UUID(as_uuid=True)`
- Default: `uuid.uuid4`

---

## FOREIGN KEY VERIFICATION

| Model | Foreign Key | References | Status |
|-------|-------------|------------|--------|
| Listing | `owner_id` | `users.id` | ✅ |
| Review | `reviewer_id` | `users.id` | ✅ |
| Review | `listing_id` | `listings.id` | ✅ |
| Payment | `user_id` | `users.id` | ✅ |
| Payment | `listing_id` | `listings.id` | ✅ |
| Chat | `sender_id` | `users.id` | ✅ |
| Chat | `receiver_id` | `users.id` | ✅ |
| Chat | `listing_id` | `listings.id` | ✅ |

---

## ENUM VALUES (CURRENT STATE)

### UserRole
**Model:** `student`, `admin`  
**Schema:** `student`, `admin`  
**Match:** ✅ (but duplicated)

### ListingType
**Model:** `service`, `product`  
**Schema:** `service`, `product`  
**Match:** ✅ (but duplicated)

### PaymentStatus
**Model:** `pending`, `successful`, `failed`  
**Schema:** `pending`, `successful`, `failed`  
**Match:** ✅ (but duplicated)

---

## REQUIRED FIXES

### 🔴 Priority 1: Eliminate Enum Duplication
1. Create `app/models/enums.py` with ALL enums
2. Update models to import from enums.py
3. Update schemas to import from enums.py
4. Delete duplicate enum definitions

### 🟡 Priority 2: Add Missing Fields
1. Add `is_admin` property to User model
2. Add `updated_at` to Listing, Review, Payment, Chat
3. Consider making `category` an enum

### 🟡 Priority 3: Standardize Relationships
1. Change Payment model to use `back_populates` instead of `backref`
2. Add corresponding relationships in User and Listing models

### 🟢 Priority 4: Add Constraints
1. Add CHECK constraint for Review.rating (1-5)
2. Add CHECK constraint for Payment.amount (> 0)

---

## NEXT STEPS

1. **Create centralized enums file** ← DO THIS FIRST
2. **Update all imports** ← CRITICAL
3. **Add missing fields** ← IMPORTANT
4. **Standardize relationships** ← GOOD PRACTICE
5. **Add constraints** ← NICE TO HAVE

