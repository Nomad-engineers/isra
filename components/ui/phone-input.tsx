"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";

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

    // Если осталась только '7' (т.е. только код страны), считаем это пустым
    if (digits === "7") return "";

    // Гарантируем, что страна +7
    let result = "+7";

    // Обрабатываем код оператора (следующие 3 цифры после 7)
    // Берём срез начиная со второй цифры оригинального массива цифр (index 1)
    if (digits.length > 1) {
      const areaCode =
        digits.length >= 4 ? digits.slice(1, 4) : digits.slice(1);
      if (areaCode.length > 0) {
        result += `(${areaCode}`;
        if (areaCode.length === 3) result += ")";
      }
    }

    // Следующие 3 цифры
    if (digits.length >= 4) {
      const next3 = digits.length >= 7 ? digits.slice(4, 7) : digits.slice(4);
      if (next3.length > 0) {
        // добавляем дефис только если есть закрывающая скобка или код оператора уже был
        result += `-${next3}`;
      }
    }

    // Следующие 2 цифры
    if (digits.length >= 7) {
      const next2 = digits.length >= 9 ? digits.slice(7, 9) : digits.slice(7);
      if (next2.length > 0) {
        result += `-${next2}`;
      }
    }

    // Последние 2 цифры
    if (digits.length >= 9) {
      const last2 = digits.length >= 11 ? digits.slice(9, 11) : digits.slice(9);
      if (last2.length > 0) {
        result += `-${last2}`;
      }
    }

    return result;
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      const digits = input.replace(/\D/g, "");

      // если полностью удалили или осталось только '7', очищаем поле
      if (!digits || digits === "7") {
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
      if ([8, 9, 27, 13, 37, 39, 46].includes((e as any).keyCode)) {
        return;
      }

      // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      if (
        (e.ctrlKey || e.metaKey) &&
        [65, 67, 86, 88].includes((e as any).keyCode)
      ) {
        return;
      }

      // Ensure that it is a number and stop the keypress
      if (
        e.shiftKey ||
        (((e as any).keyCode < 48 || (e as any).keyCode > 57) &&
          ((e as any).keyCode < 96 || (e as any).keyCode > 105))
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
