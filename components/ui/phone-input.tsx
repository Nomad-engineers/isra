"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface PhoneInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function PhoneInput({
  value = "",
  onChange,
  placeholder = "+77022421618",
  className,
}: PhoneInputProps) {
  const formatPhoneNumber = useCallback((input: string): string => {
    const digits = input.replace(/\D/g, "");

    // Allow complete deletion
    if (!digits || digits.length === 0) return "";

    // If only "7" is left, keep it
    if (digits === "7" || digits.length === 1) return "+7";

    let result = "+7";

    // Add all remaining digits without formatting
    if (digits.length > 1) {
      result += digits.slice(1);
    }

    return result;
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // Allow complete deletion
      if (inputValue === "" || inputValue === "+7" || inputValue === "+") {
        onChange("");
        return;
      }

      const digits = inputValue.replace(/\D/g, "");

      // Clear if only "7" or empty
      if (!digits || digits === "7" || digits.length <= 1) {
        onChange("");
        return;
      }

      onChange(formatPhoneNumber(inputValue));
    },
    [formatPhoneNumber, onChange]
  );

  return (
    <Input
      value={value}
      onChange={handleInputChange}
      placeholder={placeholder}
      className={className}
      maxLength={12}
      inputMode="tel"
    />
  );
}

interface FormPhoneInputProps {
  control: any;
  name: string;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function FormPhoneInput({
  control,
  name,
  label = "Телефон",
  placeholder,
  className,
}: FormPhoneInputProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <PhoneInput
              value={field.value || ""}
              onChange={field.onChange}
              placeholder={placeholder}
              className={className}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
