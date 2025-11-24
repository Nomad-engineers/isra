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
  placeholder = "+7(702)-242-1618",
  className,
}: PhoneInputProps) {
  const formatPhoneNumber = useCallback((input: string): string => {
    const digits = input.replace(/\D/g, "");

    // Allow complete deletion
    if (!digits || digits.length === 0) return "";

    // If only "7" is left, clear it
    if (digits === "7" || digits.length === 1) return "";

    let result = "+7";

    if (digits.length > 1) {
      const areaCode = digits.slice(1, 4);
      if (areaCode.length) {
        result += `(${areaCode}`;
        if (areaCode.length === 3) result += ")";
      }
    }

    if (digits.length >= 5) {
      const next3 = digits.slice(4, 7);
      if (next3.length) result += `-${next3}`;
    }

    if (digits.length >= 8) {
      const next2 = digits.slice(7, 9);
      if (next2.length) result += `-${next2}`;
    }

    if (digits.length >= 10) {
      const last2 = digits.slice(9, 11);
      if (last2.length) result += `-${last2}`;
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
      maxLength={18}
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
