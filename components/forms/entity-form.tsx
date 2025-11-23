'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { BaseFormData } from '@/types/common'
import { z } from 'zod'

interface EntityFormProps<T extends BaseFormData> {
  initialData?: Partial<T>
  onSubmit: (data: T) => Promise<void>
  schema: z.ZodSchema<T>
  submitText?: string
  loading?: boolean
  fields: {
    name: {
      label: string
      placeholder: string
    }
    description?: {
      label: string
      placeholder: string
    }
    active?: {
      label: string
    }
  }
}

export function EntityForm<T extends BaseFormData>({
  initialData,
  onSubmit,
  schema,
  submitText = 'Сохранить',
  loading = false,
  fields,
}: EntityFormProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      active: true,
      ...initialData,
    },
  })

  const handleSubmit = async (data: T) => {
    await onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{fields.name.label}</FormLabel>
              <FormControl>
                <Input placeholder={fields.name.placeholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {fields.description && (
          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fields.description.label}</FormLabel>
                <FormControl>
                  <Textarea placeholder={fields.description.placeholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {fields.active && (
          <FormField
            control={form.control}
            name='active'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                <div className='space-y-0.5'>
                  <FormLabel className='text-base'>{fields.active.label}</FormLabel>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <Button type='submit' className='w-full' disabled={loading}>
          {loading ? 'Сохранение...' : submitText}
        </Button>
      </form>
    </Form>
  )
}