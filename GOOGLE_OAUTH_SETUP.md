# Google OAuth Setup Instructions

## 1. Google Cloud Console Configuration

### 1.1 Create Google OAuth App
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **+ CREATE CREDENTIALS** → **OAuth 2.0 Client IDs**

### 1.2 Configure OAuth 2.0 Client
1. Select **Web application** as application type
2. Add a name (e.g., "My Next.js App")
3. **Authorized JavaScript origins**:
   - Development: `http://localhost:3000`
   - Production: `https://your-production-domain.com`
4. **Authorized redirect URIs**:
   - Development: `http://localhost:3000`
   - Production: `https://your-production-domain.com`
5. Click **Create**

### 1.3 Get Credentials
- Copy **Client ID** → `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- Copy **Client Secret** → `GOOGLE_CLIENT_SECRET`

## 2. Frontend Configuration

### 2.1 Environment Variables
Create `.env.local` in your frontend:

```env
# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
NEXTAUTH_URL=http://localhost:3000

# Payload CMS
NEXT_PUBLIC_PAYLOAD_API_URL=https://isracms.vercel.app
```

### 2.2 Enable Required Google APIs
In Google Cloud Console, ensure these APIs are enabled:
- Google+ API (if using legacy Google+)
- People API (for user profile information)

## 3. Backend Configuration (Payload CMS)

See `BACKEND_INSTRUCTIONS.md` for detailed backend setup.

### 3.1 Required Environment Variables for Backend
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret_key
```

## 4. Testing

### 4.1 Development Testing
1. Start frontend: `npm run dev`
2. Navigate to `http://localhost:3000/auth/login`
3. Click "Continue with Google"
4. Test both sign-in and sign-up flows

### 4.2 What to Test
- Google OAuth popup appears
- User can select Google account
- Token exchange works
- User is created/verified in backend
- JWT token is stored correctly
- User is redirected correctly

## 5. Production Deployment

### 5.1 Update Production URLs
1. Update **Authorized JavaScript origins** in Google Cloud Console:
   - Add your production domain: `https://your-production-domain.com`

2. Update environment variables:
   ```env
   NEXTAUTH_URL=https://your-production-domain.com
   ```

### 5.2 Security Checklist
- [ ] Google Client ID is public (NEXT_PUBLIC_*)
- [ ] Google Client Secret is server-side only
- [ ] HTTPS is enabled in production
- [ ] Domain verification is complete
- [ ] Proper CORS configuration in backend

## 6. Troubleshooting

### 6.1 Common Issues

#### "redirect_uri_mismatch"
- Check that your redirect URI matches exactly in Google Cloud Console
- Ensure NEXTAUTH_URL is set correctly

#### "invalid_client"
- Verify Google Client ID and Client Secret are correct
- Make sure Client ID is public (NEXT_PUBLIC_*) and Secret is server-side

#### "popup_closed_by_user"
- User closed the Google sign-in popup
- This is normal user behavior, not an error

#### Token verification fails
- Check backend Google Client ID matches frontend
- Verify Google APIs are enabled
- Check backend JWT secret configuration

### 6.2 Debug Mode
Add to your frontend to debug:

```javascript
// In browser console
console.log('Google Client ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)
console.log('Google OAuth Ready:', window.google?.accounts?.id)
```

## 7. Alternative Implementation Options

### 7.1 Using NextAuth.js (Alternative)
If you prefer a complete auth solution:

```bash
npm install next-auth
```

This would replace our custom implementation but requires significant refactoring.

### 7.2 Using Firebase Auth (Alternative)
Firebase provides easy Google OAuth integration:

```bash
npm install firebase
```

## 8. Security Best Practices

1. **Never commit secrets** - Use environment variables
2. **HTTPS in production** - Always use HTTPS for OAuth
3. **Validate tokens** - Always verify Google tokens on backend
4. **Rate limiting** - Implement rate limiting on auth endpoints
5. **Domain verification** - Verify your domain in Google Cloud Console
6. **Token storage** - Store JWT tokens securely (already implemented)

## 9. User Experience Considerations

1. **Clear error messages** - Already implemented
2. **Loading states** - Already implemented
3. **Account linking** - Consider implementing for users with existing email accounts
4. **First-time user flow** - Show onboarding for Google users
5. **Profile picture sync** - Sync Google profile pictures to user avatars