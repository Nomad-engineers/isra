# Ngrok Setup for Google OAuth Development

## Installation
```bash
# Install ngrok
npm install -g ngrok
# or
brew install ngrok
```

## Usage
```bash
# Start ngrok for port 3000
ngrok http 3000

# You'll get something like:
# https://abc123.ngrok-free.app -> http://localhost:3000
```

## Update Google Cloud Console
Add ngrok URL to Authorized JavaScript origins:
```
https://abc123.ngrok-free.app
```

## Update .env.local
```env
NEXTAUTH_URL=https://abc123.ngrok-free.app
```

## Restart app with ngrok
```bash
# Terminal 1: Start ngrok
ngrok http 3000

# Terminal 2: Start Next.js
npm run dev
```

## Use ngrok URL
Open your app at: https://abc123.ngrok-free.app/auth/login