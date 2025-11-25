# Backend Instructions for Google OAuth Integration

## Payload CMS Setup

These instructions are for implementing the backend part of Google OAuth in your Payload CMS repository.

### 1. Required Environment Variables

Add these to your Payload CMS `.env`:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# JWT
JWT_SECRET=your_jwt_secret_key
```

### 2. Google OAuth API Endpoint

Create a new API endpoint in your Payload CMS: `/api/auth/google`

```javascript
// In your Payload CMS backend (example using Express)
import payload from 'payload';
import { google } from 'googleapis';

export const authGoogleHandler = async (req, res) => {
  try {
    const { idToken, accessToken, profile, isSignUp } = req.body;

    if (!idToken) {
      return res.status(400).json({
        message: 'Missing required tokens'
      });
    }

    // Verify Google ID token
    const ticket = await google.auth.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({
        message: 'Invalid Google token'
      });
    }

    // Check if user already exists
    const existingUser = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: payload.email,
        },
      },
    });

    if (isSignUp && existingUser.docs.length > 0) {
      return res.status(409).json({
        message: 'User with this email already exists'
      });
    }

    let user;
    if (existingUser.docs.length > 0) {
      // Existing user - update Google info if needed
      user = existingUser.docs[0];

      // You might want to add Google-specific fields
      if (!user.googleId) {
        await payload.update({
          collection: 'users',
          id: user.id,
          data: {
            googleId: payload.sub,
            googlePicture: payload.picture,
          },
        });
        user.googleId = payload.sub;
        user.googlePicture = payload.picture;
      }
    } else {
      // Create new user
      const newUser = await payload.create({
        collection: 'users',
        data: {
          email: payload.email,
          name: payload.given_name || '',
          surname: payload.family_name || '',
          avatar: payload.picture,
          emailVerified: true,
          googleId: payload.sub,
          // Set a random password for Google users (optional)
          password: Math.random().toString(36).slice(-8),
        },
      });
      user = newUser;
    }

    // Generate JWT token using Payload's auth system
    const { token } = await payload.login({
      collection: 'users',
      data: {
        email: user.email,
      },
      // You might need to handle Google users differently
      overrideAccess: true,
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        surname: user.surname,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      message: 'Authentication failed'
    });
  }
};
```

### 3. User Collection Schema

Update your User collection schema to include Google-specific fields:

```javascript
// In your Payload config
const Users = {
  slug: 'users',
  auth: true,
  fields: [
    // Your existing fields
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'surname',
      type: 'text',
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'avatar',
      type: 'text',
    },

    // Google-specific fields
    {
      name: 'googleId',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'googlePicture',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
  ],
};
```

### 4. Dependencies

Install required packages in your Payload CMS backend:

```bash
npm install googleapis
# or
yarn add googleapis
```

### 5. CORS Configuration

Make sure your Payload CMS allows requests from your frontend:

```javascript
// In your Payload config
export default buildConfig({
  cors: [
    'http://localhost:3000', // Development
    'https://your-production-domain.com', // Production
  ],
  // ... rest of config
});
```

### 6. Testing the Integration

1. Set up Google OAuth credentials in Google Cloud Console
2. Add environment variables to both frontend and backend
3. Deploy backend changes
4. Test Google sign-in flow from frontend

### 7. Security Considerations

- Always verify Google tokens on the backend
- Use HTTPS in production
- Validate email domains if needed
- Implement rate limiting for auth endpoints
- Store secrets securely using environment variables

### 8. Error Handling

The backend should handle these scenarios:
- Invalid/expired Google tokens
- Users trying to sign up with existing email
- Network failures during Google verification
- Missing required environment variables

### 9. Account Linking Logic

Consider how to handle users who:
- Already have an email/password account and want to add Google
- Want to switch between auth methods
- Need to merge accounts

You might want to implement account linking UI/UX flows for these cases.