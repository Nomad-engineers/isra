import { z } from "zod"

// Password validation: min 8 chars, at least one uppercase, one lowercase, one number
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Phone validation (supports international formats)
const phoneRegex = /^\+?[\d\s-()]+$/

export const profileFormSchema = z.object({
  firstName: z.string().min(1, "Имя обязательно"),
  lastName: z.string().min(1, "Фамилия обязательна"),
  email: z.string().email("Некорректный email"),
  phone: z.string()
    .regex(/^\+7\(\d{3}\)-\d{3}-\d{2}-\d{2}$/, "Телефон должен быть в формате +7(XXX)-XXX-XX-XX")
    .optional()
    .or(z.literal("")),
  avatar: z.instanceof(File).optional().nullable(),
})

export const changePasswordFormSchema = z.object({
  currentPassword: z.string().min(1, "Текущий пароль обязателен"),
  newPassword: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
  confirmPassword: z.string().min(1, "Подтверждение пароля обязательно"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
})

export const webinarFormSchema = z.object({
  title: z.string().min(1, "Название вебинара обязательно"),
  description: z.string().optional(),
  scheduledAt: z.string().optional(),
  maxParticipants: z.number().min(1).optional(),
  tags: z.array(z.string()).optional(),
  roomSettings: z.object({
    allowRecording: z.boolean().default(true),
    allowChat: z.boolean().default(true),
    allowScreenShare: z.boolean().default(false),
    requirePassword: z.boolean().default(false),
    password: z.string().optional(),
  }).optional(),
})

export type ProfileFormData = z.infer<typeof profileFormSchema>

export type ProfileFormDataWithAvatar = Omit<ProfileFormData, 'avatar'> & {
  avatar?: File | null
}
export type ChangePasswordFormData = z.infer<typeof changePasswordFormSchema>
export type WebinarFormData = z.infer<typeof webinarFormSchema>

// Authentication validations
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .regex(emailRegex, 'Invalid email format'),
  password: z
    .string()
    .min(1, 'Password is required'),
})

export const signUpSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .regex(emailRegex, 'Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      passwordRegex,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Zа-яА-Я\s]+$/, 'Name can only contain letters and spaces'),
  surname: z
    .string()
    .min(2, 'Surname must be at least 2 characters')
    .max(50, 'Surname must be less than 50 characters')
    .regex(/^[a-zA-Zа-яА-Я\s]+$/, 'Surname can only contain letters and spaces'),
  phone: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (!value || value.trim() === '') return true
        return phoneRegex.test(value)
      },
      {
        message: 'Invalid phone number format',
      }
    ),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  }
)

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .regex(emailRegex, 'Invalid email format'),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type SignUpFormData = z.infer<typeof signUpSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>