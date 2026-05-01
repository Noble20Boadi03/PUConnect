# PuConnect

PuConnect is a university student marketplace designed to connect students for peer-to-peer services, item sales, and project collaborations.

## Architecture

The platform uses a modern, serverless architecture:
- **Frontend**: Expo (React Native) mobile application.
- **Backend**: Supabase (PostgreSQL, Auth, Storage, and Realtime).
- **Database**: PostgreSQL with Row Level Security (RLS) for data protection.

## Getting Started (Mobile App)

1.  Navigate to the `mobile` directory:
    ```bash
    cd mobile
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment variables:
    Create a `.env` file in the `mobile` directory with your Supabase credentials:
    ```env
    EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
    EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
4.  Start the app:
    ```bash
    npx expo start
    ```

## Features

- **Realtime Chat**: Instant peer-to-peer messaging powered by Supabase Realtime.
- **Marketplace**: Browse, search, and filter service offers and requests.
- **Profile Management**: Professional profiles with skill tags and verification.
- **Secure Media**: Profile pictures and listing images hosted on Supabase Storage.
- **Unread Notifications**: Live unread message badges.

## Contributing

1.  Fork the repository.
2.  Create a feature branch.
3.  Submit a pull request.

---
© 2026 PuConnect
