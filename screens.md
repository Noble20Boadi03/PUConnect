# PUConnect — screen inventory

This document lists **all user-facing screens** in the mobile app (`mobile/app/`), using **Expo Router** file-based routes. Layout files (`_layout.tsx`) are navigation shells, not standalone screens.

## Navigation overview

- **Root stack** (`app/_layout.tsx`): entry, auth, and main tab group (`index`, `login`, `register`, `(tabs)`).
- **Tab navigator** (`app/(tabs)/_layout.tsx`): bottom tabs — **Market** (`home`), **Messages**, **Explore** (`search`), **Profile**. **`onboarding`** is registered but hidden from the tab bar (`href: null`).

---

## Screens (numbered)

1. **`/`** — `LandingScreen` (`app/index.tsx`) — Branded splash, then onboarding carousel; primary action leads to login.

2. **`/login`** — `LoginScreen` (`app/login.tsx`) — Email/password sign-in and navigation to registration or the main app after success.

3. **`/register`** — `RegisterScreen` (`app/register.tsx`) — New account registration and link back to login.

4. **`/(tabs)/home`** — `HomeScreen` (`app/(tabs)/home.tsx`) — **Market** tab: home feed with listing sections, quick search, and shortcuts to create a listing or open results.

5. **`/(tabs)/messages`** — `MessagesScreen` (`app/(tabs)/messages.tsx`) — **Messages** tab: conversation list and entry points to search or login when needed.

6. **`/(tabs)/search`** — `SearchScreen` (`app/(tabs)/search.tsx`) — **Explore** tab: browse categories and jump into search results or subcategory listings.

7. **`/(tabs)/profile`** — `ProfileScreen` (`app/(tabs)/profile.tsx`) — **Profile** tab: signed-in profile, stats, links to settings, onboarding, and my listings.

8. **`/(tabs)/onboarding`** — `OnboardingScreen` (`app/(tabs)/onboarding.tsx`) — Hidden from the tab bar; extended profile and skills setup (photo, department, bio, services) for users offering help, finishing on the profile tab.

9. **`/settings`** — `SettingsScreen` (`app/settings.tsx`) — Appearance (e.g. theme), account helpers (e.g. password reset modal), and sign out.

10. **`/listing/[id]`** — `ListingDetailsScreen` (`app/listing/[id].tsx`) — Full listing view, owner actions, and links to seller profile or chat.

11. **`/listing/create`** — `CreateListingScreen` (`app/listing/create.tsx`) — Form to publish a new listing or edit an existing one (via params), with success paths to my listings or login.

12. **`/chat/[id]`** — `ChatScreen` (`app/chat/[id].tsx`) — Thread UI for a single conversation, including navigation related to the listing or peer.

13. **`/review/[id]`** — `ReviewScreen` (`app/review/[id].tsx`) — Rate and review after a transaction; confirmation returns toward home.

14. **`/profile/[id]`** — `PublicProfileScreen` (`app/profile/[id].tsx`) — Read-only view of another user, their listings, and shortcuts to message or open a listing.

15. **`/profile/my-listings`** — `MyListingsScreen` (`app/profile/my-listings.tsx`) — Manage the current user’s listings and requests (tabbed via params), with create/edit entry points.

16. **`/search/results`** — `SearchResultsScreen` (`app/search/results.tsx`) — Search query or curated section results (e.g. popular, trending) as a filterable list of listings.

17. **`/search/[id]`** — `CategoryDetailScreen` (`app/search/[id].tsx`) — Category hub: subcategories and navigation into listing lists.

18. **`/search/listings/[subcategory]`** — `SubcategoryListingsScreen` (`app/search/listings/[subcategory].tsx`) — Listings filtered to one subcategory with navigation to listing detail.

---

## Layout files (not counted as screens)

| File | Role |
|------|------|
| `app/_layout.tsx` | Root providers + stack for index, login, register, tabs |
| `app/(tabs)/_layout.tsx` | Bottom tab bar and tab screen options |

---

## Count summary

- **18** route screens (default-export page components under `mobile/app/`).
- **2** layout files.

*Generated from the `mobile/app` tree; no other `app/` route trees were found in this repo.*
