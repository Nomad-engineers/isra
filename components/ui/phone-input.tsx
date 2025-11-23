"use client";

import { useState, useEffect, useCallback } from "react";
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
    const digits = input.replace(/\D/g, ""); // оставляем только цифры
    if (!digits) return ""; // если нет цифр, возвращаем пустую строку

    let result = "+7";

    // первые 3 цифры — код оператора
    if (digits.length > 1) {
      const areaCode =
        digits.length >= 4 ? digits.slice(1, 4) : digits.slice(1);
      result += `(${areaCode}`;
      if (areaCode.length === 3) result += ")";
    }

    // следующие 3 цифры
    if (digits.length >= 4) {
      const next3 = digits.length >= 7 ? digits.slice(4, 7) : digits.slice(4);
      result += next3 ? `-${next3}` : "";
    }

    // следующие 2 цифры
    if (digits.length >= 7) {
      const next2 = digits.length >= 9 ? digits.slice(7, 9) : digits.slice(7);
      result += next2 ? `-${next2}` : "";
    }

    // последние 2 цифры
    if (digits.length >= 9) {
      const last2 = digits.length >= 11 ? digits.slice(9, 11) : digits.slice(9);
      result += last2 ? `-${last2}` : "";
    }

    return result;
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      const digits = input.replace(/\D/g, "");

      // если полностью удалили, очищаем поле
      if (!digits) {
        onChange("");
        return;
      }

      const formatted = formatPhoneNumber(input);
      onChange(formatted);
    },
    [formatPhoneNumber, onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow backspace, delete, tab, escape, enter, left, right arrow keys
      if ([8, 9, 27, 13, 37, 39, 46].includes(e.keyCode)) {
        return;
      }

      // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      if ((e.ctrlKey || e.metaKey) && [65, 67, 86, 88].includes(e.keyCode)) {
        return;
      }

      // Ensure that it is a number and stop the keypress
      if (
        e.shiftKey ||
        ((e.keyCode < 48 || e.keyCode > 57) &&
          (e.keyCode < 96 || e.keyCode > 105))
      ) {
        e.preventDefault();
      }
    },
    []
  );

  return (
    <Input
      value={value}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={className}
      maxLength={18} // +7(XXX)-XXX-XX-XX = 18 characters
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
