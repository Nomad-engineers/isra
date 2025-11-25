# 🔧 Google Cloud Console Updates Required

## ✅ Required Changes

### 1. Update Authorized Redirect URIs

В вашем OAuth 2.0 Client ID добавьте этот **Authorized redirect URI**:

```
http://abc123.ngrok-free.app/auth/google-callback
```

или для localhost (если работаете локально):

```
http://localhost:3000/auth/google-callback
```

### 2. Current OAuth Flow

Теперь flow работает так:

1. **User clicks** "Continue with Google" на `/auth/login`
2. **Redirect** на Google OAuth
3. **User selects** Google аккаунт на странице Google
4. **Redirect** на `/auth/google-callback` с `id_token`
5. **Callback page** обрабатывает токен и отправляет в бэкенд
6. **Backend** возвращает JWT и редиректит в `/rooms`

### 3. Complete Required URIs

В Google Cloud Console у вас должно быть:

**Authorized JavaScript origins:**
```
http://abc123.ngrok-free.app
http://localhost:3000
http://127.0.0.1:3000
```

**Authorized redirect URIs:**
```
http://abc123.ngrok-free.app/auth/google-callback
http://localhost:3000/auth/google-callback
```

## 🚀 После обновления:

1. Сохраните изменения в Google Cloud Console
2. Подождите 5-10 минут
3. Протестируйте Google OAuth

## 🔄 Flow Diagram

```
/auth/login → Google OAuth → /auth/google-callback → Backend API → /rooms
     ↓               ↓                    ↓            ↓
  Click button   Select account    Process idToken   Get JWT
```

Теперь `idToken` будет корректно получен и отправлен в бэкенд! 🎯