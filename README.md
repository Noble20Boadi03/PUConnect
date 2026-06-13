# PUConnect

This repository contains two main projects:

- `mobile/`: Expo React Native app
- `server/`: Node.js + Express backend with Prisma and JWT authentication

## Requirements

- Node.js 18 or newer
- npm (or yarn)
- Expo CLI (optional, can use `npx expo`)

## Setup

### 1. Install dependencies

Open a terminal in the repository root and run:

```bash
cd mobile
npm install
```

Then open a second terminal and run:

```bash
cd server
npm install
```

### 2. Configure the server environment

Create a `.env` file inside `server/` with at least the following variables:

```env
PORT=5000
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="your_jwt_secret"
JWT_EXPIRES_IN="7d"
```

- `DATABASE_URL` and `DIRECT_URL` are used by Prisma.
- `JWT_SECRET` is required for signing and verifying access tokens.
- `JWT_EXPIRES_IN` is optional; default is `7d`.

### 3. Generate Prisma client

From `server/`:

```bash
cd server
npx prisma generate
```

If you need to apply Prisma migrations or inspect the schema, use Prisma commands from the `server/` folder.

## Running the app

### Backend server

From `server/` run:

```bash
npm run dev
```

This starts the Express API server with TypeScript auto-reloading.

### Mobile app

From `mobile/` run:

```bash
npm start
```

Then choose one of the Expo options:

- `a` for Android
- `i` for iOS
- `w` for web

If you do not have Expo CLI installed globally, use `npx expo start`.

## Notes

- The mobile app and server run independently.
- Make sure the mobile app is configured to call the correct backend URL.
- If the server is running on `http://localhost:5000`, configure the mobile API base URL accordingly.

## Troubleshooting

- If the server fails to start, confirm `.env` variables are present and valid.
- If the mobile app fails to load, run `npm install` again inside `mobile/` and restart Expo.
- If Prisma reports missing schema values, verify `DATABASE_URL` and `DIRECT_URL` in `server/.env`.
