"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { Webinar } from "@/types/webinar";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { apiFetch } from "@/lib/api-fetch";

// Form schema with validation
const webinarFormSchema = z.object({
  title: z.string().min(1, "Название вебинара обязательно"),
  hostName: z.string().min(1, "Имя ведущего обязательно"),
  datetime: z.string().optional(),
  description: z.string().optional(),
  link: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === "") return true;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Некорректный URL" }
    ),
});

type WebinarFormData = z.infer<typeof webinarFormSchema>;

interface EditWebinarModalProps {
  webinar: Webinar;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditWebinarModal({
  webinar,
  open,
  onOpenChange,
}: EditWebinarModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse date for DateTimePicker from scheduledAt if it exists
  const parseDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  };

  // Initialize form with webinar data
  const form = useForm<WebinarFormData>({
    resolver: zodResolver(webinarFormSchema),
    defaultValues: {
      title: webinar.title,
      hostName: webinar.hostName || "",
      datetime: webinar.scheduledAt || "",
      description: webinar.description || "",
      link: webinar.streamUrl || "",
    },
  });

  // Handle form submission with API call
  const onSubmit = async (data: WebinarFormData) => {
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("payload-token");

      if (!token) {
        toast({
          title: "Требуется авторизация",
          description: "Авторизуйтесь, чтобы продолжить",
          variant: "destructive",
        });
        return;
      }

      // Prepare the update payload matching API expectations
      const updatePayload = {
        name: data.title,
        speaker: data.hostName,
        description: data.description || "",
        videoUrl: data.link || "",
        scheduledDate: data.datetime ? new Date(data.datetime).toISOString() : null,
      };

      console.log("Updating webinar:", webinar.id, updatePayload);

      await apiFetch(`/rooms/${webinar.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `JWT ${token}`,
        },
        body: JSON.stringify(updatePayload),
      });

      console.log("Update successful");

      toast({
        title: "Успешно обновлено",
        description: "Вебинар был успешно обновлен",
      });

      // Close modal after successful save
      onOpenChange(false);

      // Reset form
      form.reset();
    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "Ошибка обновления",
        description:
          error instanceof Error
            ? error.message
            : "Не удалось обновить вебинар",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel - close modal and reset form
  const handleCancel = () => {
    onOpenChange(false);
    form.reset();
  };

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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
              name="datetime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Время проведения</FormLabel>
                  <div className="pt-0.5" />

                  <DateTimePicker
                    value={field.value ? new Date(field.value) : null}
                    onChange={(date) =>
                      field.onChange(date?.toISOString() || "")
                    }
                  />

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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                disabled={isSubmitting}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  "Сохранить изменения"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
