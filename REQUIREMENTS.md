# PUConnect - Campus Talent Marketplace Requirements

PUConnect is a peer-to-peer marketplace designed for university campus communities to connect students with specialized skills to those in need of assistance.

## 1. Core Purpose
The platform facilitates the exchange of services and talent between students, enabling peer-to-peer freelancing and collaboration.

## 2. Key User Personas
*   **Base / default (Seeker)**: On registration, every user is a **Seeker** first. Seekers browse the marketplace and can post **service requests** and **need-help** ads so that skilled users can discover and respond.
*   **Provider**: A user who has **upgraded** their account by submitting provider-oriented information—skills they can offer and additional **trust and security**-relevant details required to offer services credibly on campus. Providers can publish **service offerings** (not only respond to requests).
*   **Dual-role**: A user may act as **Seeker only**, **Provider only**, or **both**. Seeking is always in scope by default; provider capabilities are **additive** after upgrade.

## 3. Core Functional Pillars

### 3.0. User Roles & Permissions
*   **Seeker by default**: New accounts are Seekers. All signed-in Seekers may create **service requests** (need-help / request listings).
*   **Provider eligibility**: Publishing **service offerings** requires completing the **provider upgrade** (skills offered, plus trust/security fields as defined by the product). Until then, the user cannot post as a provider.
*   **Modes**: The same person may remain seeker-only, become provider-only in practice, or use **both** request and offer listing types according to the rules above.

### 3.1. Unified Discovery Feed
*   **Mixed Feed**: Both "Service Offerings" and "Service Requests" appear in the same primary feed.
*   **Tabbed Filtering**: Users can toggle between "Services" and "Requests" using tabs.
*   **Discovery**: Providers skew toward finding **Requests**; Seekers skew toward finding **Services**—while everyone can use both tabs.

### 3.2. Lifecycle & Trust
*   **Negotiation Bridge**: Interacting with any ad leads to Chat.
*   **Hiring/Completion**: A "Mark as Hired" or "Complete Service" action in the Chat interface officially concludes the negotiation/work.
*   **Review System**: Completion triggers the ability to leave a rating/review, building trust without a payment gateway.

### 3.3. Identity & Privacy
*   **Basic Identity**: Cards and profiles highlight basic info (e.g., Level/Year, Department) to establish campus credibility.
*   **Identity Source**: Information is pulled from account creation to ensure a smooth, non-intrusive experience.
*   **Provider upgrade**: Collects **additional** identity and trust-oriented fields beyond minimal registration (e.g. skills offered, verification or other security signals as the product requires).

### 3.4. Payment & Transactions
*   **No Payment Gateway**: The platform does not handle financial transactions.
*   Payments are negotiated and settled externally between the users.

## 4. UI/UX Principles
*   **Mobile-First & Responsive**: Full support for portrait and landscape orientations across all device sizes.
*   **Premium Aesthetics**: Modern, fluid, and high-fidelity "Liquid Glass" design system.
*   **Interaction-Focused**: Minimizing friction between finding a service and starting a conversation.

---

## 5. Mobile (Android) — Screen QA Checklist

> **Already addressed (But can be verified and improved):** Layout, Theming, State Management, Navigation.
> The checklist below covers the **remaining audit categories** for every screen.

Legend: `[ ]` = TODO · `[/]` = In Progress · `[x]` = Done



---

---

> [!NOTE]
> **Scope:** Development is currently focused exclusively on the **`mobile/`** directory. All updates must respect and build upon the existing implementation patterns and logical foundations already established in the codebase.
[!NOTE]
>Checklist items might not be up to date with latest screen implementation.
---


### 5.1 Landing / Splash (`app/index.tsx`)

#### Purpose & Logic
- [x] Splash logo fades in for ~2.5 s then transitions to the landing content
- [x] Dynamic horizontal carousel with 4 slides (Welcome, Seek, Offer, Start)
- [x] "Let's Go" CTA conditionally appears only on the final slide and navigates to `/login`
- [x] Carousel indicators are interactive and sync with the active scroll index
- [x] Next/Back navigation buttons conditionally display based on slide index
- [x] Header contains Language stub and functional Light/Dark Theme toggle

#### User Feedback & Interactions
- [x] Staggered `FadeInDown` animations fire on slide content mount
- [x] Images feature cinematic top/bottom gradient fades 
- [x] No flash of unstyled/white background during splash → landing transition
- [x] Smooth scrolling behavior on manual swipe or programmatic button taps

#### Accessibility
- [x] All `Pressable` elements have `accessibilityRole="button"` and meaningful `accessibilityLabel`
- [x] Theme toggle and Language buttons have explicit `accessibilityLabel`
- [x] Prev/Next buttons announce properly

#### Edge Cases
- [x] Images scale horizontally to full `width` dynamically without aspect ratio warping
- [x] Last slide properly disables/hides "Next" button; First slide hides "Back"

#### Performance
- [x] Image assets are heavily optimized locally (Sharp)
- [x] Splash timer cleanup runs on unmount (`clearTimeout`)
- [x] Scroll events are natively throttled (`scrollEventThrottle={16}`)

#### Input & Keyboard
- [x] N/A (no text inputs on this screen)

---

### 5.2 Login (`app/login.tsx`)

#### Purpose & Logic
- [ ] Email + Password fields authenticate the user via `signIn()`
- [ ] On success, navigates to `/(tabs)/home`
- [ ] On failure, shows `Alert` with meaningful error message
- [ ] "Forgot password?" is tappable (stub or actual flow)
- [ ] "Create Account" navigates to `/register`
- [ ] Back button navigates to previous screen

#### User Feedback & Interactions
- [ ] "Sign In" button shows loading spinner (`isLoading`) while authenticating
- [ ] Button is visually disabled during loading
- [ ] Password eye-toggle works (show/hide password)
- [ ] Press states on all interactive elements

#### Accessibility
- [ ] Email input has `accessibilityLabel="Email Address"`
- [ ] Password input has `accessibilityLabel="Password"` and toggle has `accessibilityLabel="Toggle password visibility"`
- [ ] Back button has `accessibilityLabel="Go back"`
- [ ] Error alert is announced to screen readers

#### Edge Cases
- [ ] Empty fields: does not crash; shows validation or error feedback
- [ ] Extremely long email/password input: text does not overflow container
- [ ] Rapid multi-tap on "Sign In" does not fire multiple requests
- [ ] Network timeout / server error handled gracefully

#### Performance
- [ ] No unnecessary re-renders during typing (controlled input)
- [ ] FadeInDown animations do not jank on low-end devices

#### Input & Keyboard
- [ ] `keyboardType="email-address"` on email field
- [ ] `autoCapitalize="none"` on email field
- [ ] Keyboard dismiss on tapping outside inputs (`TouchableWithoutFeedback`)
- [ ] `KeyboardAvoidingView` keeps the form visible when keyboard is open
- [ ] Return key on email moves focus to password (or submits if only field)
- [ ] Return key on password triggers sign-in

---

### 5.3 Register (`app/register.tsx`)

#### Purpose & Logic
- [ ] All required fields collected: Full Name, University Email, University ID, Password, Confirm Password
- [ ] On success, shows success `Alert` then navigates to `/login`
- [ ] On failure, shows error `Alert`
- [ ] "Sign In" link navigates to `/login`
- [ ] Back button navigates back

#### User Feedback & Interactions
- [ ] "Create Account" button shows loading state while processing
- [ ] Password eye-toggle works across both Password & Confirm Password fields
- [ ] Animated stagger entrances fire on mount
- [ ] Press states on all buttons and links

#### Accessibility
- [ ] Each input field has a proper `accessibilityLabel` matching its label text
- [ ] Back button has `accessibilityLabel="Go back"`
- [ ] Alerts are accessible to screen readers

#### Edge Cases
- [ ] Password mismatch (Password ≠ Confirm Password) — should show user feedback before API call
- [ ] Empty required fields — validation feedback
- [ ] Special characters in Full Name handled
- [ ] Email format validation (e.g., must be a valid email pattern)
- [ ] Rapid multi-tap on "Create Account" guarded

#### Performance
- [ ] Many animated inputs on one screen — verify no frame drops during entrance animations
- [ ] No memory leak from animations on unmount

#### Input & Keyboard
- [ ] `autoCapitalize="words"` on Full Name
- [ ] `autoCapitalize="none"` on Email and University ID
- [ ] `keyboardType="email-address"` on Email
- [ ] Keyboard dismiss on outside tap
- [ ] `KeyboardAvoidingView` keeps all fields reachable
- [ ] Tab / next-field flow: Full Name → Email → University ID → Password → Confirm Password → Submit

---

### 5.4 Home / Market (`app/(tabs)/home.tsx`)

#### Purpose & Logic
- [ ] Shows 5 horizontal sections: Popular, Recommended, Recently Viewed, Based on Last Order, Trending
- [ ] Each `ServiceCard` press navigates to `/listing/[id]` with correct `id`
- [ ] "See All" stubs are tappable (stub handler or navigates to filtered view)
- [ ] Promo banner "Invite now" is tappable
- [ ] Search bar is visible and tappable (redirects to search or filters)
- [ ] Grid / apps button in header is tappable

#### User Feedback & Interactions
- [ ] Pull-to-refresh triggers `onRefresh()`; spinner appears at top
- [ ] Loading state shows `ActivityIndicator`
- [ ] Error state shows icon + error message
- [ ] Empty state shows "No listings available" message
- [ ] Horizontal scroll sections scroll smoothly with hidden indicators

#### Accessibility
- [ ] Section headers have proper heading semantics
- [ ] Each `ServiceCard` has `accessibilityLabel` describing the listing
- [ ] Search bar input has `accessibilityLabel="Search services"`
- [ ] Grid button has `accessibilityLabel`

#### Edge Cases
- [ ] 0 items in a section: section header still renders but scroll area is empty
- [ ] Very long listing titles truncated properly on cards
- [ ] Works correctly after login and after returning from detail screens

#### Performance
- [ ] Horizontal `ScrollView` sections use key props correctly
- [ ] No nested `VirtualizedList` warnings
- [ ] Images in `ServiceCard` use lazy loading or caching

#### Input & Keyboard
- [ ] Search `TextInput` shows keyboard on focus
- [ ] Search `TextInput` has appropriate `placeholder` and `placeholderTextColor`

---

### 5.5 Messages (`app/(tabs)/messages.tsx`)

#### Purpose & Logic
- [ ] Unauthenticated: shows lock icon + "Sign In" button → navigates to `/login`
- [ ] Authenticated + no messages: shows empty state with "Explore Market" → navigates to `/(tabs)/home`
- [ ] Authenticated + messages: shows `FlatList` of conversation previews
- [ ] Each conversation press navigates to `/chat/[id]` with correct sender ID
- [ ] Unread dot appears on unread messages from other users
- [ ] Displays sender name, last message (truncated), and timestamp
- [ ] New chat button (pencil icon) is visible and tappable

#### User Feedback & Interactions
- [ ] `Pressable` chat items show pressed background color (`surfaceVariant`)
- [ ] Unread messages have bold text weight (`600`)
- [ ] Read messages have muted text color

#### Accessibility
- [ ] Each chat item has `accessibilityLabel` including sender name + preview
- [ ] Unread indicator is communicated to screen readers (`accessibilityHint` or state)
- [ ] "Sign In" and "Explore Market" buttons have labels
- [ ] Empty states are screen-reader friendly

#### Edge Cases
- [ ] Very long message preview text: truncated with `numberOfLines={1}`
- [ ] Sender ID is missing or malformed: graceful fallback
- [ ] Rapidly scrolling through a long list doesn't crash

#### Performance
- [ ] `FlatList` is used (not `ScrollView`) for message list — good for virtualization
- [ ] `keyExtractor` is unique and stable
- [ ] Tab bar bottom padding prevents list items from hiding behind tab bar

#### Input & Keyboard
- [ ] N/A (no text inputs on this screen)

---

### 5.6 Search / Categories (`app/(tabs)/search.tsx`)

#### Purpose & Logic
- [ ] Displays two tabs: "Categories" and "Interests"
- [ ] "Categories" tab lists all `CAMPUS_CATEGORIES` with icon, title, subtitle
- [ ] Each category press navigates to `/search/[id]` with correct category ID
- [ ] "Interests" tab shows placeholder empty state
- [ ] Search (magnify) icon in header is tappable

#### User Feedback & Interactions
- [ ] Active tab has primary color underline + bold text
- [ ] Inactive tab uses muted text color
- [ ] Category items show pressed state
- [ ] Tab switching is instant (no flicker)

#### Accessibility
- [ ] Tab buttons have `accessibilityRole="tab"` and `accessibilityState={{ selected }}`
- [ ] Category items have `accessibilityLabel` with title + subtitle
- [ ] Search icon has `accessibilityLabel="Search"`

#### Edge Cases
- [ ] 0 categories: should show empty state (defensive check)
- [ ] Categories with very long titles/subtitles don't break layout
- [ ] Switching tabs rapidly doesn't cause layout glitches

#### Performance
- [ ] Category list uses `ScrollView` (categories are finite and small)
- [ ] Tab bar height padding applied at bottom of scroll content

#### Input & Keyboard
- [ ] N/A (no text inputs on this screen)

---

### 5.7 Category Detail (`app/search/[id].tsx`)

#### Purpose & Logic
- [ ] Receives category `id` from route params
- [ ] Looks up category from `CAMPUS_CATEGORIES`
- [ ] Shows hero section with icon, title, tagline
- [ ] Lists subcategory groups with headers and items
- [ ] Each subcategory item navigates to `/search/listings/[subcategory]` with correct params
- [ ] "NEW" badge appears on items with `isNew: true`
- [ ] Not-found state: shows "Category not found" + "Go Back" link
- [ ] Back button navigates back
- [ ] Search icon in header is tappable

#### User Feedback & Interactions
- [ ] Subcategory items have pressed state
- [ ] Back button has pressed state

#### Accessibility
- [ ] Hero title has heading semantics
- [ ] Each subcategory item is labelled
- [ ] "NEW" badge is communicated to screen readers

#### Edge Cases
- [ ] Invalid or garbage `id` parameter: shows not-found state gracefully
- [ ] Category with 0 groups/items: renders without crashing

#### Performance
- [ ] Entire screen uses `ScrollView` — appropriate for finite category content

#### Input & Keyboard
- [ ] N/A (no text inputs on this screen)

---

### 5.8 Subcategory Listings (`app/search/listings/[subcategory].tsx`)

#### Purpose & Logic
- [ ] Receives `subcategory`, `category`, `description` from route params
- [ ] Loads listings filtered by subcategory via view model
- [ ] Shows header with title, description, and horizontal filter pills
- [ ] "All" filter pill clears all active filters
- [ ] Dynamic filter pills open a bottom-sheet modal for option selection
- [ ] Selected filter shows its value + close icon; tapping clears it
- [ ] Each listing card shows image, rating, title, price
- [ ] Listing card press navigates to `/listing/[id]`
- [ ] Pull-to-refresh works
- [ ] Empty state shows "No students offering this service yet"
- [ ] Back button navigates back

#### User Feedback & Interactions
- [ ] Filter modal slides up from bottom, dimmed overlay
- [ ] Filter modal close button works
- [ ] Active filter pills change style (primary border + surfaceVariant bg)
- [ ] Listing cards show pressed state
- [ ] Loading state shows `ActivityIndicator`
- [ ] Error state shows error icon + message

#### Accessibility
- [ ] Filter pills have meaningful `accessibilityLabel` (e.g., "Filter by Budget")
- [ ] Modal has `accessibilityViewIsModal` or proper focus management
- [ ] Listing cards are labelled with title + price
- [ ] Back and search buttons have labels

#### Edge Cases
- [ ] 0 matching listings: empty state renders
- [ ] Modal with 0 filter options: doesn't crash
- [ ] Missing `subcategory` param: handled gracefully
- [ ] Very long subcategory titles or descriptions wrap correctly

#### Performance
- [ ] Uses `FlatList` for listings (virtualized)
- [ ] Filter pills use horizontal `ScrollView` (appropriate for few items)
- [ ] Modal renders only when visible

#### Input & Keyboard
- [ ] N/A (no text inputs on this screen)

---

### 5.9 Listing Detail (`app/listing/[id].tsx`)

#### Purpose & Logic
- [ ] Receives `id` from route params, loads listing via view model
- [ ] Shows image header, title, category, price, meta info (date, rating, verified)
- [ ] Shows description section
- [ ] Shows expertise/skills tags if listing has `requiredSkills`
- [ ] Shows seller/provider card with "View Profile" button
- [ ] Bottom action bar shows "Send Message" + chat icon for non-owners
- [ ] "Send Message" navigates to `/chat/[id]` with `ownerId` and `listingId`
- [ ] "View Profile" button is tappable (stub or navigates)
- [ ] Back button navigates back
- [ ] Owner view: bottom bar hidden

#### User Feedback & Interactions
- [ ] Loading state shows activity indicator
- [ ] Error state shows error icon + message
- [ ] Not-found state handled
- [ ] Back button has visual pressed state
- [ ] Bottom bar is anchored to screen bottom

#### Accessibility
- [ ] Hero image has `accessibilityLabel`
- [ ] Title is heading-level
- [ ] Price, rating, meta items are labelled
- [ ] "Send Message" and "View Profile" buttons have labels
- [ ] Back button has `accessibilityLabel="Go back"`

#### Edge Cases
- [ ] Invalid listing `id`: shows error/not-found
- [ ] Listing with no `requiredSkills`: skills section hidden (not crashing)
- [ ] Listing with no price/budget: defaults to "$25" — evaluate if fallback is appropriate
- [ ] Very long description: scrollable
- [ ] External image fails to load: placeholder or graceful fallback

#### Performance
- [ ] Single `ScrollView` for content — appropriate
- [ ] Bottom bar uses `position: absolute` — doesn't scroll with content
- [ ] Image loaded from remote URL — consider caching

#### Input & Keyboard
- [ ] N/A (no text inputs on this screen)

---

### 5.10 Chat (`app/chat/[id].tsx`)

#### Purpose & Logic
- [ ] Receives `id` (user to chat with) and optional `listingId` from params
- [ ] Displays mock message thread with time separators, text bubbles, and job cards
- [ ] Sent messages appear on the right with `primaryContainer` background
- [ ] Received messages appear on the left with avatar + `surfaceVariant` background
- [ ] Job/service cards render inline with details (company, title, salary, location)
- [ ] Send button appends a new message to the list
- [ ] Send button is disabled (dimmed) when input is empty
- [ ] "Mute" action in header is tappable
- [ ] Attachment (+) button is tappable (stub)
- [ ] Back button navigates back

#### User Feedback & Interactions
- [ ] New messages appear instantly in the list after send
- [ ] Send button opacity changes based on input content
- [ ] Back button has pressed state
- [ ] Chat scrolls to bottom on new message (if implemented)
- [ ] Input clears after sending

#### Accessibility
- [ ] Each message bubble has `accessibilityLabel` with sender + content
- [ ] Time separators are labelled
- [ ] Send button has `accessibilityLabel="Send message"`
- [ ] Attachment button has `accessibilityLabel="Attach file"`
- [ ] Mute button has `accessibilityLabel="Mute conversation"`
- [ ] Back button has `accessibilityLabel="Go back"`
- [ ] Job card contents are accessible

#### Edge Cases
- [ ] Empty message (whitespace only): send is blocked
- [ ] Very long messages: text wraps within bubble, bubble doesn't overflow
- [ ] Rapidly sending messages: no crashes or visual glitches
- [ ] Avatar image fails to load: fallback or broken image handling
- [ ] Chat opened with invalid `id`: graceful handling

#### Performance
- [ ] `ScrollView` for messages — consider `FlatList` if message count grows
- [ ] `KeyboardAvoidingView` in place for input area
- [ ] Multiline input expansion capped at `maxHeight: 100`

#### Input & Keyboard
- [ ] Text input is `multiline`
- [ ] Keyboard pushing input area up (via `keyboardAvoiding` on `ScreenLayout`)
- [ ] Placeholder text "Type a message..." visible
- [ ] Input retains value while typing (controlled component)
- [ ] Submit (return key) behavior on multiline: should add newline (not send)

---

### 5.11 Profile — Guest State (`app/(tabs)/profile.tsx · uiState.status === 'guest'`)

#### Purpose & Logic
- [ ] Shows "Welcome Back" card with email + password fields
- [ ] "Sign In" triggers `handleLogin()` with email/password
- [ ] On success, transitions to authenticated profile state
- [ ] On failure, shows error `Alert`
- [ ] "Forgot password?" is tappable

#### User Feedback & Interactions
- [ ] Loading state on button during login
- [ ] Password toggle eye icon works
- [ ] Animated card entrance (`FadeInDown`)
- [ ] Press states on button and "Forgot password"

#### Accessibility
- [ ] Email and Password inputs have labels
- [ ] Button has label
- [ ] "Forgot password" has `accessibilityRole="link"`

#### Edge Cases
- [ ] Empty fields: error handling without crash
- [ ] Double-tap guarded on "Sign In"

#### Performance
- [ ] `keyboardAvoiding` enabled — keyboard doesn't cover form
- [ ] `keyboardShouldPersistTaps="handled"` keeps taps working with keyboard open

#### Input & Keyboard
- [ ] `keyboardType="email-address"` on email
- [ ] `autoCapitalize="none"` on email
- [ ] Password field secure text entry
- [ ] Keyboard avoidance works in portrait and landscape

---

### 5.12 Profile — Authenticated State (`app/(tabs)/profile.tsx · uiState.status === 'content'`)

#### Purpose & Logic
- [ ] Shows hero card with avatar, name, department, graduation year
- [ ] Avatar press navigates to onboarding/edit screen
- [ ] Verified badge appears if `user.verifiedStudent`
- [ ] Camera edit badge shown on avatar
- [ ] Stats row: Projects count, Rating (star), Availability status
- [ ] "Edit Talent Profile" navigates to onboarding screen
- [ ] Profile incomplete alert banner navigates to onboarding
- [ ] About card shows bio (or fallback "No bio added yet")
- [ ] Skills card shows up to 3 tags + "+N more" overflow
- [ ] Account menu: My Services, Preferences, Log Out
- [ ] Theme toggle (sun/moon icon) toggles light/dark mode
- [ ] Settings (cog) button is tappable
- [ ] "Log Out" triggers `handleLogout()` then navigates to landing

#### User Feedback & Interactions
- [ ] Animated hero entrance (`FadeInUp`)
- [ ] Animated about/skills cards (`FadeInDown`)
- [ ] Animated menu section (`FadeInDown`)
- [ ] Menu items show pressed states
- [ ] Theme toggle icon switches between sun and moon
- [ ] Logout shows no confirmation dialog (evaluate if one should be added)

#### Accessibility
- [ ] Avatar is labelled (profile picture of [user name])
- [ ] Stats are labelled (e.g., "12 completed projects", "4.8 star rating")
- [ ] Availability dot status communicated to screen readers
- [ ] Menu items have labels
- [ ] Theme toggle has `accessibilityLabel` (e.g., "Switch to dark mode")
- [ ] Profile incomplete alert has `accessibilityLabel`

#### Edge Cases
- [ ] User with no bio, no skills, no avatar: all fallbacks render
- [ ] User with >3 skills: overflow "+N more" text shown
- [ ] Very long bio text: truncated with `numberOfLines={3}`
- [ ] Very long user name: text wraps within container

#### Performance
- [ ] Scroll content has `paddingBottom` equal to tab bar height (no overlap)
- [ ] Staggered entrance animations don't cause jank
- [ ] Theme toggle re-render is instant

#### Input & Keyboard
- [ ] N/A (no text inputs on this screen in authenticated state)

---

### 5.13 Onboarding / Professional Setup (`app/(tabs)/onboarding.tsx`)

#### Purpose & Logic
- [ ] Pre-fills fields from existing user data (`user?.bio`, `user?.skillTags`, etc.)
- [ ] Profile picture picker: opens image library, shows preview, uploads on save
- [ ] University Info: Department + Graduation Year fields
- [ ] Professional Bio: multiline input with 300 char max
- [ ] Skills & Expertise: tappable skill tags from `POPULAR_SKILLS` list
- [ ] Portfolio & Links: add link via text input + "+" button; remove via "x" icon
- [ ] Available for Hire: toggle switch
- [ ] "Complete Professional Profile" saves all data via `api.updateProfile()`
- [ ] On save success: shows `Alert` with "View Profile" → navigates to profile
- [ ] On save failure: shows error `Alert`
- [ ] `handleSave` uploads local image first if `profilePictureUrl.startsWith("file://")`

#### User Feedback & Interactions
- [ ] Save button shows `ActivityIndicator` while submitting
- [ ] Save button disabled during submission
- [ ] Skill tags toggle on/off with color change (primary vs surfaceVariant)
- [ ] Portfolio link items show remove icon; tapping removes them
- [ ] Switch toggles with track color change
- [ ] Camera badge overlay on avatar indicates editability

#### Accessibility
- [ ] Avatar picker has `accessibilityLabel="Change profile picture"`
- [ ] Each text input has a label
- [ ] Skill tags have `accessibilityRole="button"` and state (selected/not)
- [ ] Switch has associated label ("Available for Hire")
- [ ] Remove portfolio link buttons have labels
- [ ] Save button has label

#### Edge Cases
- [ ] No token (user not authenticated): `handleSave` returns early safely
- [ ] Graduating year is non-numeric: `parseInt` returns `NaN` — validate
- [ ] Duplicate portfolio link: prevented by `!portfolioLinks.includes(newLink)`
- [ ] Empty portfolio link: prevented by `newLink &&` check
- [ ] Image picker permission denied: handle gracefully
- [ ] Image upload fails: error caught and alert shown
- [ ] Bio exceeds 300 chars: `maxLength={300}` enforces limit
- [ ] 0 skills selected: should still save without error

#### Performance
- [ ] Full-screen scrollable form — scrolls smoothly with many fields
- [ ] Image picker library loading does not block UI
- [ ] `keyboardAvoiding` prevents content from being hidden

#### Input & Keyboard
- [ ] Department and Graduation Year inputs have proper keyboard types (`numeric` for year)
- [ ] Bio `TextInput` is multiline with `textAlignVertical="top"`
- [ ] Portfolio link input has `returnKeyType="done"` and `onSubmitEditing` that adds the link
- [ ] Keyboard avoidance works for all fields, especially the portfolio link input near the bottom
- [ ] Keyboard dismiss when scrolling or tapping outside inputs

---

### 5.14 Explore (Hidden Tab — `app/(tabs)/explore.tsx`)

> This screen is a scaffolding/example screen (`href: null` in tabs). Verify it doesn't break anything.

#### Purpose & Logic
- [ ] Shows Expo starter template collapsible sections
- [ ] External links open in browser
- [ ] Does not appear in tab bar (`href: null`)

#### Edge Cases
- [ ] Deep-linking to this route directly doesn't crash

---

### 5.15 Modal (`app/modal.tsx`)

#### Purpose & Logic
- [ ] Shows "This is a modal" text
- [ ] "Go to home screen" link dismisses modal and navigates to root
- [ ] Presented as a modal (slide-up presentation)

#### Edge Cases
- [ ] Dismissing via system back gesture works on Android

---

### 5.16 Create Listing (`app/listing/create.tsx`)

#### Purpose & Logic
- [ ] Handles both new listings and editing existing listings (`editId` via params)
- [ ] Gated logic: Service offers demand provider eligibility (`canOfferServices`); blocks plain seekers
- [ ] Requires Title, Description, Budget/Price, and a Category
- [ ] On save, sends data to API and navigates to `/profile/my-listings`

#### User Feedback & Interactions
- [ ] Submit button shows loading indicator and is disabled during API submission
- [ ] Pressable chips for listing type / categories show active visual status
- [ ] Immediate alerts/errors for validation failures (e.g., negative price, empty title)

#### Accessibility
- [ ] Input fields and text sections must be labelled for screen readers
- [ ] Back button has an accessible label (`accessibilityLabel="Go back"`)

#### Edge Cases
- [ ] Non-authenticated user block / redirect handles safely
- [ ] Attempting to change to `service_offer` without `user.canOfferServices` reverts state safely
- [ ] Editing an invalid `id` catches gracefully and navigates back

#### Performance
- [ ] ScrollView contains all text inputs efficiently without lag

#### Input & Keyboard
- [ ] `KeyboardAvoidingView` manages the form pushing up above the OS keyboard
- [ ] Description uses multiline text input with `textAlignVertical="top"`
- [ ] Price field restricts input to `decimal-pad` type

---

### 5.17 Public Profile (`app/profile/[id].tsx`)

#### Purpose & Logic
- [ ] Loads target user by `id` parameter
- [ ] Displays avatar, name, verification badge, department, class year, bio, and skill tags
- [ ] Displays horizontal list of the user's active listings
- [ ] "Message" button navigates to `/chat/[id]` (hidden if viewing own profile)

#### User Feedback & Interactions
- [ ] Full screen `ActivityIndicator` during initial API fetch
- [ ] Horizontal scroll handles active listings fluidly
- [ ] Not-found state dynamically handles missing IDs with a "Go back" option

#### Accessibility
- [ ] User's name is structured as the primary heading
- [ ] Tags and bio are structured for assistive tech reading
- [ ] Avatar image has an explicit descriptive label

#### Edge Cases
- [ ] Profile with 0 listings safely renders string fallback ("No active listings yet")
- [ ] Very long bio text formats correctly without breaking layout
- [ ] Profile with missing/empty optional fields (bio, department) resolves without crashing

#### Performance
- [ ] Avatar relies on fallback icons when external URL is empty/failing

#### Input & Keyboard
- [ ] N/A

---

### 5.18 My Listings (`app/profile/my-listings.tsx`)

#### Purpose & Logic
- [ ] Displays an exclusive list of the authenticated user's active listings
- [ ] Tabbed filters toggle locally between 'All', 'Requests', and 'Offers'
- [ ] Each item offers 'Edit' (navigates to create with `editId`) and 'Remove' (fires delete API)

#### User Feedback & Interactions
- [ ] Pull-to-refresh mechanism active via `RefreshControl`
- [ ] Deletion requires a destructive confirmation dialog (`Alert`)
- [ ] Dynamic empty state matches current tab filter ('No request listings...' vs 'No active listings...')

#### Accessibility
- [ ] Filter chips have tab or button semantics with selected state definitions
- [ ] Empty states announce accurately to screen readers

#### Edge Cases
- [ ] Tab initialization from URL params (`?tab=requests`) works accurately on load
- [ ] Deletion of the final listing falls back cleanly to the empty state without crash

#### Performance
- [ ] Utilizes `FlatList` for virtualized rendering of listings

#### Input & Keyboard
- [ ] N/A

---

### 5.19 Review (`app/review/[id].tsx`)

#### Purpose & Logic
- [ ] Pulls `listingId` and `targetUserId` from route params
- [ ] Collects a rating selection (1 to 5 stars) and a text area comment
- [ ] Submits review and navigates explicitly back to Home

#### User Feedback & Interactions
- [ ] Visual selection state on star buttons highlights up to the selected value limit
- [ ] "Submit review" button shows disabled opacity during transaction

#### Accessibility
- [ ] Star buttons describe their integer value clearly to screen readers
- [ ] Comment input is securely labelled

#### Edge Cases
- [ ] Block system intercepts and prevents submit with whitespace-only/empty string
- [ ] Missing URL parameters halt UI sequence and prompt user to back out

#### Performance
- [ ] Component is minimal; rendering handles fast response times

#### Input & Keyboard
- [ ] `KeyboardAvoidingView` offsets inputs flawlessly
- [ ] Multiline comment box maintains physical integrity (min height setup)

---

### 5.20 Search Results (`app/search/results.tsx`)

#### Purpose & Logic
- [ ] Consumes global query input (`q`) and optional specific `section` strings
- [ ] Initiates a dedicated search API request dynamically on load and re-submission
- [ ] Display list dynamically reacts to returns

#### User Feedback & Interactions
- [ ] Dynamic spinner triggers over list, not blocking the persistent header / query input
- [ ] Distinct "No listings match your search" empty state with clear iconography

#### Accessibility
- [ ] Search input has explicit label defining its action
- [ ] Standardized list view maps descriptions per item cleanly

#### Edge Cases
- [ ] Empty or whitespace query doesn't overload system constraints
- [ ] Cleanup sequences drop inflight requests if user quickly exits

#### Performance
- [ ] Standardized optimization through standard `FlatList` arrays

#### Input & Keyboard
- [ ] Device "Search" / "Enter" submits explicitly via `onSubmitEditing`
- [ ] Keyboard dismissal activates upon scroll

---

### 5.21 Settings (`app/settings.tsx`)

#### Purpose & Logic
- [ ] Houses core local preferences (Appearance, Demo notification toggles, Account actions)
- [ ] Dark Mode toggle explicitly executes `setMode` within the `useTheme` context
- [ ] Mocks "Forgot password" interaction via simplistic alert

#### User Feedback & Interactions
- [ ] Switch interactions reliably match the active system status visually
- [ ] Stubs/Alerts react instantly upon press commands

#### Accessibility
- [ ] `Switch` items possess explicit `accessibilityRole="switch"` or correlated text logic
- [ ] Section headers structured with clear reading flow

#### Edge Cases
- [ ] Changing theme repeatedly resolves fast with no visible deadlock

#### Performance
- [ ] Re-renders execute effortlessly given small scale of DOM layout

#### Input & Keyboard
- [ ] N/A

---

### 5.22 Cross-Screen Global Checks

#### System UI (Root Layout — `app/_layout.tsx`)
- [ ] Status bar style syncs with theme (light ↔ dark)
- [ ] Android navigation bar button style syncs with theme
- [ ] System root background color syncs with `theme.background` (prevents white flash)
- [ ] `AppState` listener doesn't leak (cleanup on unmount)

#### Tab Bar (`app/(tabs)/_layout.tsx`)
- [ ] Tab bar height adjusts in landscape vs portrait
- [ ] Tab bar respects safe area insets (bottom, left, right in landscape)
- [ ] Active tab shows filled icon, inactive shows outline icon
- [ ] Tab labels display correctly
- [ ] Hidden tabs (explore, onboarding) don't appear in tab bar
- [ ] Tab bar background is semi-translucent
- [ ] iOS: BlurView behind tab bar

#### Auth Flow
- [ ] Guest user can browse Home/Market and Categories without signing in
- [ ] Messages tab enforces sign-in (shows lock icon)
- [ ] Profile tab shows guest login form when not authenticated
- [ ] After sign-in, profile and messages populate from user data
- [ ] After sign-out, user returns to landing and auth state is cleared

#### Orientation & Responsiveness
- [ ] All screens render correctly in portrait
- [ ] All screens render correctly in landscape
- [ ] Content does not clip behind system bars (notch, nav bar) in landscape
- [ ] Horizontal scroll sections on Home still work in landscape

