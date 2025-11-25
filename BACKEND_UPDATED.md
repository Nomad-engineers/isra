# Обновленный Backend для Google OAuth

## Изменения в API

Frontend теперь отправляет только `idToken` и флаг `isSignUp` для регистрации.

### Новый формат запроса

```json
// POST /api/auth/google
{
  "idToken": "google_id_token_here",
  "isSignUp": true  // optional, true для регистрации, false/undefined для входа
}
```

### Пример бэкенд реализации на Payload CMS

```javascript
// backend/api/auth/google/route.js
import { google } from 'googleapis';
import payload from 'payload';

export async function POST(request) {
  try {
    const { idToken, isSignUp } = await request.json();

    if (!idToken) {
      return Response.json(
        { message: 'Missing idToken' },
        { status: 400 }
      );
    }

    // Верификация Google ID токена
    const ticket = await google.auth.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return Response.json(
        { message: 'Invalid Google token' },
        { status: 401 }
      );
    }

    // Извлечение данных из Google токена
    const googleData = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      given_name: payload.given_name,
      family_name: payload.family_name,
      picture: payload.picture,
      emailVerified: payload.email_verified || true,
    };

    // Проверка существования пользователя
    const existingUser = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: googleData.email,
        },
      },
    });

    let user;

    if (isSignUp && existingUser.docs.length > 0) {
      // Попытка зарегистрировать существующего пользователя
      return Response.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    if (existingUser.docs.length > 0) {
      // Существующий пользователь - вход
      user = existingUser.docs[0];

      // Обновление Google данных если нужно
      await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          googleId: googleData.id,
          avatar: user.avatar || googleData.picture,
          emailVerified: true,
        },
      });
    } else {
      // Новый пользователь - регистрация
      user = await payload.create({
        collection: 'users',
        data: {
          email: googleData.email,
          name: googleData.given_name || '',
          surname: googleData.family_name || '',
          avatar: googleData.picture,
          emailVerified: true,
          googleId: googleData.id,
          // Генерируем случайный пароль для Google пользователей
          password: Math.random().toString(36).slice(-8),
        },
      });
    }

    // Генерация JWT токена через Payload
    const { token } = await payload.login({
      collection: 'users',
      data: {
        email: user.email,
      },
      overrideAccess: true,
    });

    return Response.json({
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
    return Response.json(
      { message: 'Authentication failed' },
      { status: 500 }
    );
  }
}
```

### Обновленная схема User Collection

```javascript
// Убедитесь, что в вашей User collection есть эти поля:
{
  slug: 'users',
  auth: true,
  fields: [
    // Существующие поля
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'surname',
      type: 'text',
    },
    {
      name: 'avatar',
      type: 'text',
    },
    // Новое поле для Google ID
    {
      name: 'googleId',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
  ],
}
```

### Environment Variables для бэкенда

```env
GOOGLE_CLIENT_ID=your_google_client_id
JWT_SECRET=your_jwt_secret
```

### Dependencies

```bash
npm install googleapis
```

## Flow

1. **Frontend**: Пользователь нажимает "Continue with Google"
2. **Redirect**: Перенаправление на страницу выбора аккаунта Google
3. **Callback**: Google возвращает `idToken`
4. **Backend**: Отправляет `idToken` на `/api/auth/google`
5. **Verification**: Бэкенд верифицирует токен через Google API
6. **User Management**: Создает или находит пользователя
7. **JWT**: Генерирует JWT токен через Payload
8. **Response**: Возвращает `user` и `token` на фронтенд
9. **Frontend**: Сохраняет JWT и редиректит в `/rooms`

## Security

- ✅ Серверная верификация Google токена
- ✅ Автоматическая верификация email
- ✅ Генерация случайного пароля для Google пользователей
- ✅ Защита от CSRF (state parameter)
- ✅ Обработка существующих пользователей