import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Payload CMS configuration
const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || 'https://isracms.vercel.app/api'
const PAYLOAD_ADMIN_EMAIL = process.env.PAYLOAD_ADMIN_EMAIL
const PAYLOAD_ADMIN_PASSWORD = process.env.PAYLOAD_ADMIN_PASSWORD

// Validation schema for signup
const signupSchema = z.object({
  email: z.string().email('Некорректный формат email'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
  first_name: z.string().min(1, 'Имя обязательно для заполнения'),
  last_name: z.string().min(1, 'Фамилия обязательна для заполнения'),
})

// Authentication cache to avoid repeated login attempts
let authCache: {
  token: string | null
  expiresAt: number | null
} = {
  token: null,
  expiresAt: null,
}

// Authenticate with Payload CMS admin
async function getPayloadToken(): Promise<string> {
  // Check if we have a valid cached token
  if (authCache.token && authCache.expiresAt && Date.now() < authCache.expiresAt) {
    return authCache.token
  }

  // Validate environment variables
  if (!PAYLOAD_ADMIN_EMAIL || !PAYLOAD_ADMIN_PASSWORD) {
    throw new Error('Отсутствуют учетные данные администратора Payload CMS')
  }

  if (!PAYLOAD_API_URL) {
    throw new Error('Не указан URL API Payload CMS')
  }

  try {
    console.log('Attempting to authenticate with Payload CMS...')

    const response = await fetch(`${PAYLOAD_API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: PAYLOAD_ADMIN_EMAIL,
        password: PAYLOAD_ADMIN_PASSWORD,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Payload CMS authentication failed:', {
        status: response.status,
        error: errorData,
      })

      if (response.status === 401) {
        throw new Error('Неверные учетные данные администратора Payload CMS')
      }
      if (response.status >= 500) {
        throw new Error('Сервер Payload CMS недоступен')
      }

      throw new Error('Не удалось аутентифицироваться с Payload CMS')
    }

    const data = await response.json()
    const token = data.token

    if (!token) {
      throw new Error('Не получен токен аутентификации от Payload CMS')
    }

    // Cache token for 1 hour (3600000 ms)
    authCache = {
      token,
      expiresAt: Date.now() + 3600000,
    }

    console.log('Successfully authenticated with Payload CMS')
    return token

  } catch (error) {
    console.error('Payload CMS authentication error:', error)

    if (error instanceof Error) {
      throw error
    }

    throw new Error('Ошибка подключения к Payload CMS')
  }
}

// Create user in Payload CMS
async function createUser(data: {
  email: string
  password: string
  first_name: string
  last_name: string
}) {
  try {
    console.log('Creating user in Payload CMS:', {
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
    })

    const response = await fetch(`${PAYLOAD_API_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        name: data.first_name,
        surname: data.last_name,
        phone: '',
        role: 'client',
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Payload CMS user creation failed:', {
        status: response.status,
        error: errorData,
      })
      console.log(
        'Payload CMS user creation failed: ', errorData
      )

      // Handle specific Payload CMS error responses
      if (response.status === 400) {
        const errorMessage = errorData.message || errorData.errors?.[0]?.message || ''

        if (errorMessage.includes('email') && errorMessage.includes('exists')) {
          throw new Error('Этот email уже используется')
        }
        if (errorMessage.includes('email') && errorMessage.includes('invalid')) {
          throw new Error('Некорректный формат email')
        }
        if (errorMessage.includes('password')) {
          throw new Error('Пароль не соответствует требованиям')
        }

        throw new Error('Ошибка валидации данных пользователя')
      }

      if (response.status === 401) {
        // Token expired, clear cache and retry once
        authCache.token = null
        authCache.expiresAt = null

        const newToken = await getPayloadToken()
        if (newToken) {
          // Retry with new token
          const retryResponse = await fetch(`${PAYLOAD_API_URL}/users`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `JWT ${newToken}`,
            },
            body: JSON.stringify({
              email: data.email,
              password: data.password,
              name: data.first_name,
              surname: data.last_name,
              phone: '',
              role: 'client',
            }),
          })

          if (retryResponse.ok) {
            return await retryResponse.json()
          }
        }

        throw new Error('Ошибка аутентификации с Payload CMS')
      }

      if (response.status >= 500) {
        throw new Error('Сервер Payload CMS недоступен. Попробуйте позже')
      }

      throw new Error('Не удалось создать аккаунт. Попробуйте снова')
    }

    const user = await response.json()
    console.log('Successfully created user:', {
      id: user.id,
      email: user.email,
      name: user.name,
      surname: user.surname
    })

    return user

  } catch (error) {
    console.error('User creation error:', error)

    if (error instanceof Error) {
      throw error
    }

    throw new Error('Не удалось создать аккаунт. Попробуйте снова')
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()

    // Validate input data
    const validatedData = signupSchema.parse(body)

    console.log('Signup request validated:', {
      email: validatedData.email,
      first_name: validatedData.first_name,
      last_name: validatedData.last_name,
    })

    // Create user in Payload CMS
    const userData = await createUser(validatedData)

    // Return success response without sensitive data
    return NextResponse.json({
      success: true,
      message: 'Аккаунт успешно создан',
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        surname: userData.surname,
        phone: userData.phone,
        role: userData.role,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      },
    }, { status: 201 })

  } catch (error) {
    console.error('Signup API error:', error)

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Ошибка валидации данных',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      }, { status: 400 })
    }

    // Handle specific error messages
    if (error instanceof Error) {
      switch (error.message) {
        case 'Этот email уже используется':
          return NextResponse.json({
            error: error.message,
          }, { status: 409 })

        case 'Некорректный формат email':
        case 'Пароль не соответствует требованиям':
        case 'Ошибка валидации данных пользователя':
          return NextResponse.json({
            error: error.message,
          }, { status: 400 })

        case 'Неверные учетные данные администратора Payload CMS':
        case 'Отсутствуют учетные данные администратора Payload CMS':
        case 'Не указан URL API Payload CMS':
          console.error('Configuration error:', error.message)
          return NextResponse.json({
            error: 'Внутренняя ошибка сервера. Обратитесь к администратору',
          }, { status: 500 })

        case 'Сервер Payload CMS недоступен. Попробуйте позже':
        case 'Ошибка подключения к Payload CMS':
        case 'Не удалось аутентифицироваться с Payload CMS':
        case 'Ошибка аутентификации с Payload CMS':
          return NextResponse.json({
            error: 'Сервис временно недоступен. Попробуйте позже',
          }, { status: 503 })

        default:
          return NextResponse.json({
            error: error.message || 'Не удалось создать аккаунт. Попробуйте снова',
          }, { status: 400 })
      }
    }

    // Handle unexpected errors
    return NextResponse.json({
      error: 'Внутренняя ошибка сервера',
    }, { status: 500 })
  }
}