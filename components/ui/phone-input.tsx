'use client'

import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { FormField, FormItem, FormControl, FormLabel, FormMessage } from '@/components/ui/form'

interface PhoneInputProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function PhoneInput({ value = '', onChange, placeholder = '+7(702)-242-1618', className }: PhoneInputProps) {
  const formatPhoneNumber = useCallback((input: string): string => {
    // If input is empty or just formatting characters, return empty
    if (!input || input.replace(/\D/g, '').length === 0) {
      return ''
    }

    // Remove all non-digit characters first
    const digits = input.replace(/\D/g, '')

    // Don't format if less than 1 digit
    if (digits.length === 0) {
      return ''
    }

    let result = '+7('

    // Add first 3 digits (area code)
    if (digits.length > 0) {
      // Handle case where input starts with 8
      const areaCode = digits.startsWith('8') ? digits.slice(1, 4) :
                       digits.startsWith('7') ? digits.slice(1, 4) :
                       digits.slice(0, 3)
      result += areaCode
    }

    // Close parentheses if we have at least 1 digit after +7
    if (digits.length > 1) {
      result += ')'
    }

    // Add next 3 digits
    if (digits.length > 3) {
      const nextDigits = digits.startsWith('8') || digits.startsWith('7') ?
                        digits.slice(4, 7) :
                        digits.slice(3, 6)
      if (nextDigits.length > 0) {
        result += '-' + nextDigits
      }
    }

    // Add next 2 digits
    if (digits.length > 6) {
      const nextDigits = digits.startsWith('8') || digits.startsWith('7') ?
                        digits.slice(7, 9) :
                        digits.slice(6, 8)
      if (nextDigits.length > 0) {
        result += '-' + nextDigits
      }
    }

    // Add last 2 digits
    if (digits.length > 8) {
      const nextDigits = digits.startsWith('8') || digits.startsWith('7') ?
                        digits.slice(9, 11) :
                        digits.slice(8, 10)
      if (nextDigits.length > 0) {
        result += '-' + nextDigits
      }
    }

    return result
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value

    // If input is empty, return empty string
    if (!input.trim()) {
      onChange('')
      return
    }

    const formatted = formatPhoneNumber(input)

    // Only update if the formatted value is different from current
    if (formatted !== value) {
      onChange(formatted)
    }
  }, [formatPhoneNumber, onChange, value])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow backspace, delete, tab, escape, enter, left, right arrow keys
    if ([8, 9, 27, 13, 37, 39, 46].includes(e.keyCode)) {
      return
    }

    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if ((e.ctrlKey || e.metaKey) && [65, 67, 86, 88].includes(e.keyCode)) {
      return
    }

    // Ensure that it is a number and stop the keypress
    if (e.shiftKey || (e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault()
    }
  }, [])

  return (
    <Input
      value={value}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={className}
      maxLength={18} // +7(XXX)-XXX-XX-XX = 18 characters
    />
  )
}

interface FormPhoneInputProps {
  control: any
  name: string
  label?: string
  placeholder?: string
  className?: string
}

export function FormPhoneInput({ control, name, label = 'Телефон', placeholder, className }: FormPhoneInputProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <PhoneInput
              value={field.value || ''}
              onChange={field.onChange}
              placeholder={placeholder}
              className={className}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}