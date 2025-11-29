"use client";

import { useState } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
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
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { WebinarType } from "@/types/webinar";
import { useRooms } from "@/hooks/use-rooms";

const formSchema = z.object({
  title: z.string().min(1, "Название вебинара обязательно для заполнения"),
  speaker: z.string().min(1, "Спикер обязателен для заполнения"),
  type: z.enum(["live", "auto"]),
  datetime: z.string().optional(),
  description: z.string().optional(),
  streamUrl: z
    .string()
    .url("Введите корректный URL")
    .optional()
    .or(z.literal("")),
});

type FormData = z.infer<typeof formSchema>;

interface CreateWebinarModalProps {
  buttonText?: string;
  buttonClassName?: string;
  buttonVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
  onSuccess?: () => void; // Callback for successful webinar creation
}

export function CreateWebinarModal({
  buttonText = "Создать вебинар",
  buttonClassName = "",
  buttonVariant = "default",
  buttonSize = "default",
  showIcon = false,
  onSuccess,
}: CreateWebinarModalProps) {
  const { createWebinar, loading } = useRooms();
  const [open, setOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      speaker: "",
      type: "live" as WebinarType,
      datetime: "",
      description: "",
      streamUrl: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Map form data to API payload format
      const payload = {
        name: data.title,
        speaker: data.speaker,
        type: data.type as "live" | "auto",
        videoUrl: data.streamUrl || undefined,
        description: data.description || undefined,
        scheduledDate: data.datetime
          ? new Date(data.datetime).toISOString()
          : undefined,
      };

      const result = await createWebinar(payload);

      if (result) {
        // Success! Close modal and reset form
        form.reset();
        onSuccess?.(); // Call success callback if provided
        setOpen(false); // Close modal
      }
    } catch (error) {
      console.error("Webinar creation failed:", error);
      // Error is already handled by useRooms hook with toast notifications
    }
  };

  const handleCancel = () => {
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={buttonVariant}
          size={buttonSize}
          className={buttonClassName}
        >
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

        <div className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <div className="pt-0.5"> </div>
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
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base">Тип вебинара</FormLabel>
                    <FormControl>
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            id="live"
                            name="webinar-type"
                            value="live"
                            checked={field.value === "live"}
                            onChange={() => field.onChange("live")}
                            className="w-4 h-4 text-primary border-gray-300 focus:ring-primary focus:ring-2"
                          />
                          <div className="grid gap-1">
                            <Label
                              htmlFor="live"
                              className="font-normal cursor-pointer"
                            >
                              Прямой эфир (Live)
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Вебинар в прямом эфире с живым общением
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            id="auto"
                            name="webinar-type"
                            value="auto"
                            checked={field.value === "auto"}
                            onChange={() => field.onChange("auto")}
                            className="w-4 h-4 text-primary border-gray-300 focus:ring-primary focus:ring-2"
                          />
                          <div className="grid gap-1">
                            <Label
                              htmlFor="auto"
                              className="font-normal cursor-pointer"
                            >
                              Автоматический (Auto)
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Автоматический вебинар по расписанию
                            </p>
                          </div>
                        </div>
                      </div>
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
                    <div className="pt-0.5"> </div>
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
                    data-dialog-close
                  >
                    Отмена
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading || form.formState.isSubmitting}
                >
                  {loading || form.formState.isSubmitting
                    ? "Создание..."
                    : "Создать вебинар"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
