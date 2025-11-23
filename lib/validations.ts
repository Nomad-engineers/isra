import { z } from "zod"

export const profileFormSchema = z.object({
  firstName: z.string().min(1, "Имя обязательно"),
  lastName: z.string().min(1, "Фамилия обязательна"),
  email: z.string().email("Некорректный email"),
  phone: z.string().regex(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/, "Некорректный номер телефона").optional().or(z.literal("")),
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
export type ChangePasswordFormData = z.infer<typeof changePasswordFormSchema>
export type WebinarFormData = z.infer<typeof webinarFormSchema>