# PuConnect — Data Storage Audit

> Produced prior to Supabase integration. Every layer of data storage is catalogued here.

---

## Summary Table

| Layer | Technology | What's Stored | Persisted? | File(s) |
|---|---|---|---|---|
| 1 | **Hardcoded static data** | Listings, users, messages, reviews, filters | ❌ No | `services/api.ts` |
| 2 | **Mutable in-memory arrays** | Newly created listings, submitted reviews, lifecycle state | ❌ No (lost on reload) | `services/api.ts` |
| 3 | **React `useState`** | UI state, active filters, form inputs, auth session | ❌ No | All view models & screens |
| 4 | **`AsyncStorage`** | Theme preference (`light`/`dark`/`system`) | ✅ Yes (device) | `context/theme-context.tsx` |
| 5 | **`expo-secure-store`** | JWT auth token (`userToken`) | ✅ Yes (device keychain) | `context/auth-context.tsx` |
| 6 | **Hardcoded category config** | Service categories & subcategory structure | ❌ No | `constants/categories.ts` |

**No SQLite, Firebase, Redux, MMKV, Zustand, or any other database was found.**

---

## Layer 1 — Hardcoded Static Mock Data (`services/api.ts`)

This is the single most important layer. The entire app's data is fabricated here. Everything currently reads from this file.

### `MOCK_LISTINGS` (19 listings)
Fixed array of `Listing` objects covering every category. Fields per listing:
- `id`, `title`, `description`, `price`, `budget`, `category`, `subcategory`
- `type`: `service_offer` | `service_request`
- `ownerId`, `isActive`, `tags`, `level`, `media_url`
- `average_rating`, `review_count`

### `MOCK_PEER_USERS` (10 users)
A `Record<string, User>` map of all non-session users. Fields:
- `id`, `email`, `fullName`, `universityId`, `department`, `graduationYear`
- `skillTags`, `bio`, `canOfferServices`, `profilePictureUrl`

### `MOCK_USER` (session user)
The hardcoded logged-in user (`mock-user-001`), mutated by `updateProfile`.

### `MOCK_MESSAGES` (12 messages across 3 conversations)
- Conversations: Alex Rivera (listing-001), Jordan Kim (listing-002), Riley Chen (listing-004)
- Fields: `id`, `senderId`, `receiverId`, `listingId`, `message`, `isRead`, `senderName`, `senderAvatar`

### `MOCK_SUBCATEGORY_FILTERS` (18 filter definitions across 14 subcategories)
Nested object keyed by subcategory name. Matches the `subcategory_filters` table in the schema.

### `submittedReviews` (5 seed reviews, then mutable — see Layer 2)

---

## Layer 2 — Mutable In-Memory Runtime State (`services/api.ts`)

These are `let` variables (not `const`) that get mutated at runtime. **They reset every time the JS bundle reloads or the app is killed.**

| Variable | Type | Mutated By | Supabase Table |
|---|---|---|---|
| `mockSessionUser` | `User` | `api.updateProfile()` | `profiles` |
| `extraListings` | `Listing[]` | `api.createListing()`, `api.deleteListing()` | `listings` |
| `submittedReviews` | `Review[]` | `api.submitReview()` | `reviews` |
| `conversationLifecycle` | `Record<string, ConversationLifecycle>` | `api.setConversationLifecycle()` | `conversation_lifecycles` |

> [!WARNING]
> Any listing created, review submitted, or hire action taken by the user is **wiped on app reload**. This will be fixed when these calls go through Supabase.

---

## Layer 3 — React `useState` (In-Memory, Per-Session)

Every view model and screen manages its own ephemeral state. This is correct — these don't need to persist and will remain as `useState` after the migration.

| File | State Held |
|---|---|
| `use-home-view-model.ts` | `uiState` (listing feed), `activeFilter` |
| `use-subcategory-view-model.ts` | `uiState` (providers + filter config), `activeFilters`, `activeModalFilter` |
| `use-messages-view-model.ts` | `uiState` (inbox messages) |
| `use-profile-view-model.ts` | Derived from `AuthContext`, no own state |
| `use-listing-view-model.ts` | `uiState` (single listing detail) |
| `app/(tabs)/onboarding.tsx` | Form fields (name, bio, skills, photo) |
| `app/listing/create.tsx` | Form fields (title, price, category, etc.) |
| `app/chat/[id].tsx` | Messages list, conversation lifecycle state, input text |
| `app/(tabs)/profile.tsx` | Edit mode, form fields |
| `app/search/results.tsx` | Search results, query |

---

## Layer 4 — `AsyncStorage` (Persisted on Device)

**File:** `context/theme-context.tsx`

| Key | Value | Used For |
|---|---|---|
| `theme_mode` | `"light"` \| `"dark"` \| `"system"` | Restores user's dark/light mode preference on next launch |

> [!NOTE]
> This is fine to keep as-is after the migration. Theme preference is a local device setting, not a server concern. No change needed here.

> [!WARNING]
> There is a **bug** on line 34: `await AsyncStorage.getItem('theme_mode')` is called instead of `setItem` — it reads the value and discards it, right before the `setItem`. The save still works because line 35 does call `setItem`, but the `getItem` on line 34 is a no-op and should be removed.

---

## Layer 5 — `expo-secure-store` (Encrypted On-Device Keychain)

**File:** `context/auth-context.tsx`

| Key | Value | Used For |
|---|---|---|
| `userToken` | JWT access token string | Persists login session across app restarts |

**Current state (bypassed for dev):**
- `signIn()` is hardcoded — it sets a dummy token `"dev_dummy_token"` and a hardcoded user object **without** calling `SecureStore.setItemAsync`. The real code is commented out (lines 83–90).
- `loadStorageData()` still reads from SecureStore on startup, but since nothing was written, it always finds nothing.
- `signOut()` correctly calls `SecureStore.deleteItemAsync('userToken')`.

**After Supabase integration**, `SecureStore` will be replaced by Supabase Auth's own session management (which handles its own token storage internally via `AsyncStorage` or `SecureStore` depending on configuration).

---

## Layer 6 — Hardcoded Config (`constants/categories.ts`)

This file defines the **entire category/subcategory tree** as a static TypeScript constant (`CAMPUS_CATEGORIES`). It drives:
- The browse/search categories screen
- Navigation to `[subcategory]` listing pages
- Category cards on the home page

**5 categories, 14 subcategories total.** This is config data, not transactional data — it's reasonable to keep it hardcoded or optionally move it to a `categories` table in Supabase for admin control.

---

## API Call Map — Screen → `services/api.ts` Function

| Screen | API Functions Called |
|---|---|
| `home.tsx` (via view model) | `api.getListings()` |
| `search.tsx` + `results.tsx` | `api.searchListings()` |
| `search/listings/[subcategory].tsx` | `api.getProvidersBySubcategory()`, `api.getSubcategoryFilters()` |
| `profile/[id].tsx` | `api.getUserById()`, `api.getListingsByOwner()`, `api.getReviewsByTargetUser()` |
| `profile/my-listings.tsx` | `api.getListingsByOwner()`, `api.deleteListing()` |
| `listing/[id].tsx` | `api.getListing()`, `api.getUserById()` |
| `listing/create.tsx` | `api.getListing()` (edit), `api.createListing()`, `api.updateListing()` |
| `chat/[id].tsx` | `api.getListing()`, `api.getConversation()`, `api.getUserById()`, `api.getConversationLifecycle()`, `api.setConversationLifecycle()`, `api.sendMessage()` |
| `messages.tsx` (inbox) | `api.getMessages()` |
| `onboarding.tsx` | `api.uploadImage()`, `api.updateProfile()` |
| `review/[id].tsx` | `api.submitReview()` |
| `auth-context.tsx` | `api.login()`, `api.register()`, `api.getMe()`, `api.updateProfile()` |

---

## Migration Priority (Recommended Order)

> [!IMPORTANT]
> Replace these layers in this order for the smoothest Supabase migration:

1. **Auth** — `auth-context.tsx` → Supabase Auth (`supabase.auth.signIn`, `signUp`, `signOut`, session listener). Unblocks everything else.
2. **Profiles** — `api.getMe()`, `api.updateProfile()` → `supabase.from('profiles')`
3. **Listings** — `api.getListings()`, `api.createListing()`, `api.updateListing()`, `api.deleteListing()`, `api.searchListings()` → `supabase.from('listings')`
4. **Subcategory Filters** — `api.getSubcategoryFilters()` → `supabase.from('subcategory_filters')`
5. **Users/Providers** — `api.getUserById()`, `api.getProvidersBySubcategory()` → `supabase.from('profiles')`
6. **Messages** — `api.getMessages()`, `api.getConversation()`, `api.sendMessage()` → `supabase.from('messages')` + Realtime subscription
7. **Reviews** — `api.submitReview()`, `api.getReviewsByTargetUser()` → `supabase.from('reviews')`
8. **Conversation Lifecycle** — `api.getConversationLifecycle()`, `api.setConversationLifecycle()` → `supabase.from('conversation_lifecycles')`
9. **Image Uploads** — `api.uploadImage()` → `supabase.storage.from('listing-media')` / `supabase.storage.from('profile-pictures')`
