"use client"

import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
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
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"

const formSchema = z.object({
  title: z.string().min(1, "Название вебинара обязательно для заполнения"),
  speaker: z.string().min(1, "Спикер обязателен для заполнения"),
  datetime: z.string().optional(),
  description: z.string().optional(),
  streamUrl: z.string().url("Введите корректный URL").optional().or(z.literal("")),
})

type FormData = z.infer<typeof formSchema>

interface CreateWebinarModalProps {
  buttonText?: string
  buttonClassName?: string
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  buttonSize?: "default" | "sm" | "lg" | "icon"
  showIcon?: boolean
}

export function CreateWebinarModal({
  buttonText = "Создать вебинар",
  buttonClassName = "",
  buttonVariant = "default",
  buttonSize = "default",
  showIcon = false
}: CreateWebinarModalProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      speaker: "",
      datetime: "",
      description: "",
      streamUrl: "",
    },
  })

  const onSubmit = (data: FormData) => {
    console.log("Creating webinar:", data)
    // Здесь в будущем будет логика сохранения
    // Сейчас просто закрываем модальное окно после успешной валидации
    form.reset()
  }

  const handleCancel = () => {
    form.reset()
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize} className={buttonClassName}>
          {showIcon && <Plus className="h-4 w-4 mr-2" />}
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-xl p-6 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Создать вебинар
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название вебинара *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Введите название вебинара"
                      {...field}
                      className={cn(
                        form.formState.errors.title && "border-destructive"
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="speaker"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Спикер *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Введите имя спикера"
                      {...field}
                      className={cn(
                        form.formState.errors.speaker && "border-destructive"
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="datetime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Время проведения</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Введите описание вебинара"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="streamUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ссылка на трансляцию</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com/stream"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleCancel}
                >
                  Отмена
                </Button>
              </DialogClose>
              <Button
                type="submit"
                className="flex-1"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Создание..." : "Создать вебинар"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}