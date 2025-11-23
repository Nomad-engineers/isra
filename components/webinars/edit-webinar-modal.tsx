"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Webinar } from "@/types/webinar"

// Form schema with validation
const webinarFormSchema = z.object({
  title: z.string().min(1, "Название вебинара обязательно"),
  hostName: z.string().min(1, "Имя ведущего обязательно"),
  scheduledAt: z.string().optional(),
  description: z.string().optional(),
  link: z.string().optional().refine((val) => {
    if (!val || val === "") return true
    try {
      new URL(val)
      return true
    } catch {
      return false
    }
  }, { message: "Некорректный URL" }),
})

type WebinarFormData = z.infer<typeof webinarFormSchema>

interface EditWebinarModalProps {
  webinar: Webinar
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditWebinarModal({
  webinar,
  open,
  onOpenChange,
}: EditWebinarModalProps) {
  // Format datetime-local value from scheduledAt if it exists
  const formatDateTimeLocal = (dateString?: string) => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      return date.toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:mm
    } catch {
      return ""
    }
  }

  // Initialize form with webinar data
  const form = useForm<WebinarFormData>({
    resolver: zodResolver(webinarFormSchema),
    defaultValues: {
      title: webinar.title,
      hostName: webinar.hostName || "",
      scheduledAt: formatDateTimeLocal(webinar.scheduledAt),
      description: webinar.description || "",
      link: webinar.link || "",
    },
  })

  // Handle form submission (UI only - no API calls)
  const onSubmit = (data: WebinarFormData) => {
    console.log("Updated webinar data:", {
      id: webinar.id,
      ...data,
    })

    // Close modal after "saving"
    onOpenChange(false)

    // Reset form to initial values
    form.reset()
  }

  // Handle cancel - close modal and reset form
  const handleCancel = () => {
    onOpenChange(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl p-6 gap-4 max-w-md">
        <DialogHeader>
          <DialogTitle>Редактировать вебинар</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Title field - required */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название вебинара *</FormLabel>
                                    <div className="pt-0.5"> </div>
                  <FormControl>
                    <Input
                      placeholder="Введите название вебинара"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Host field - required */}
            <FormField
              control={form.control}
              name="hostName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ведущий *</FormLabel>
                                    <div className="pt-0.5"> </div>

                  <FormControl>
                    <Input
                      placeholder="Введите имя ведущего"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Scheduled time field - optional */}
            <FormField
              control={form.control}
              name="scheduledAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Время проведения</FormLabel>
                                    <div className="pt-0.5"> </div>

                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description field - optional */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                                    <div className="pt-0.5"> </div>

                  <FormControl>
                    <Textarea
                      placeholder="Введите описание вебинара"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Link field - optional */}
            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ссылка на вебинар</FormLabel>
                                    <div className="pt-0.5"> </div>

                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com/webinar-link"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
              >
                Отмена
              </Button>
              <Button type="submit">
                Сохранить изменения
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}