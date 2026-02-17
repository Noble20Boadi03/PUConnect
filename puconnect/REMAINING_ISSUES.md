# Remaining Issues Checklist

## ⚠️ MODERATE PRIORITY (Frontend-Backend Alignment)

### 1. User Role Enum Mismatch
**Status:** 🟡 Not Critical, but should be fixed

**Backend:** `student | admin`
**Frontend:** `user | admin`

**Fix Required:**
```typescript
// frontend/src/types/auth.ts
role: 'student' | 'admin';  // Change 'user' to 'student'
```

---

### 2. Listing Type Mismatch
**Status:** 🟡 Frontend missing backend field

**Backend has:**
- `type: ListingType` (service | product)
- `is_active: boolean`
- `owner_id: UUID`

**Frontend has:**
- `sellerId: string` (should be `ownerId`)
- Missing: `type` field
- Missing: `is_active` field

**Frontend has extra:**
- `condition: string` (not in backend model)
- `imageUrls: string[]` (not in backend model)

**Fix Required:**
```typescript
// frontend/src/types/listing.ts
export interface Listing {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;  // Backend accepts any string
    type: 'service' | 'product';  // ADD THIS
    is_active: boolean;  // ADD THIS
    owner_id: string;  // Rename from sellerId
    created_at: string;
    // Remove or mark as optional: condition, imageUrls
}
```

---

### 3. Listing Category Type Mismatch
**Status:** 🟡 Type safety issue

**Backend:** Accepts any string
```python
category = Column(String, index=True, nullable=False)
```

**Frontend:** Restricts to specific values
```typescript
category: 'textbooks' | 'electronics' | 'furniture' | 'clothing' | 'other';
```

**Options:**
1. Make backend use enum (recommended for data consistency)
2. Make frontend accept any string (less type-safe)

---

## ✅ ALREADY FIXED (Backend Foundation)

- ✅ Circular imports
- ✅ Duplicate function definitions
- ✅ Missing imports (Session, deps)
- ✅ Missing schemas (PaymentInitiate)
- ✅ Missing service methods
- ✅ Wrong async/await usage
- ✅ Model field mismatches (category_id)

---

## 🔄 TODO: Implementation Stubs

### Payment Service
**Status:** 🟢 Methods exist but need real implementation

Current: Mock responses
Needed: Integrate with Paystack/Flutterwave

**Files to update:**
- `backend/app/services/payment_service.py`

**Integration steps:**
1. Add payment gateway SDK
2. Implement signature verification
3. Add database persistence
4. Handle webhooks properly

---

### Recommendation Service  
**Status:** 🟢 Basic implementation exists

Current: Returns recent listings
Needed: ML-based recommendations

**Files to update:**
- `backend/app/services/recommendation_service.py`
- Connect to `ml-service/`

**Integration steps:**
1. Implement view tracking
2. Connect to ML service
3. Add collaborative filtering
4. Cache recommendations

---

## 📋 Quick Fix Commands

### Fix Frontend Types
```bash
# 1. Update auth types
code frontend/src/types/auth.ts

# 2. Update listing types  
code frontend/src/types/listing.ts
```

### Test Backend
```bash
cd backend
python validate_foundation.py
```

### Run Full Application
```bash
# Backend
cd backend
uvicorn app.main:app --reload

# Frontend
cd frontend
npm run dev
```

---

## 🎯 Priority Order

1. **DONE** ✅ Fix backend foundation (imports, schemas, services)
2. **NEXT** 🔄 Align frontend-backend types
3. **LATER** 📝 Implement payment gateway
4. **LATER** 📝 Implement ML recommendations

---

## 🧪 Testing Strategy

### Backend Tests
```bash
# Foundation validation
python validate_foundation.py

# API tests (when ready)
pytest tests/
```

### Frontend Tests
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Unit tests
npm run test
```

### Integration Tests
```bash
# Start backend
uvicorn app.main:app --reload

# Test endpoints manually or with Postman
# Check /docs for Swagger UI
```
