"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { addMinutes, format } from "date-fns";
import { ru } from "date-fns/locale";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  value?: Date | null;
  onChange: (date: Date | null) => void;
}

export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedTime, setSelectedTime] = React.useState("");

  const times = React.useMemo(() => {
    const result: string[] = [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    for (let i = 0; i < 24 * 4; i++) {
      result.push(format(addMinutes(start, i * 15), "HH:mm"));
    }
    return result;
  }, []);

  const handleSelectDate = (day: Date) => {
    const time = selectedTime || "00:00";
    const [h, m] = time.split(":").map(Number);

    const updated = new Date(day);
    updated.setHours(h, m, 0);

    onChange(updated);
  };

  const handleSelectTime = (time: string) => {
    setSelectedTime(time);

    if (value) {
      const [h, m] = time.split(":").map(Number);
      const updated = new Date(value);
      updated.setHours(h, m, 0);
      onChange(updated);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between bg-card text-foreground border-border"
        >
          {value
            ? format(value, "d MMMM yyyy г., HH:mm", { locale: ru })
            : "Выберите дату"}
          <CalendarIcon className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-4 w-[420px] bg-card border border-border shadow-xl rounded-xl mt-2 pb-0">
        <div className="flex gap-4">
          {}
          <Calendar
            mode="single"
            selected={value ?? undefined}
            onSelect={(day) => day && handleSelectDate(day)}
            locale={ru}
            className="bg-card text-foreground w-[250px]"
          />

          {}
          <div className="h-64 overflow-y-scroll pr-2 border-l border-border pl-3 w-[120px] custom-scroll">
            {times.map((time) => (
              <button
                key={time}
                onClick={() => handleSelectTime(time)}
                className={cn(
                  "block w-full text-left px-3 py-1 rounded text-foreground hover:bg-muted",
                  selectedTime === time && "bg-primary text-primary-foreground hover:bg-primary"
                )}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
