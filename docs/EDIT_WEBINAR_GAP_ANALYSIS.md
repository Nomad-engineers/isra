# Edit Webinar - Gap Analysis

> Сравнение текущей реализации со спецификацией

---

## ✅ Что уже есть (сохранить)

| Поле | Файл | Комментарий |
|------|------|-------------|
| `name` | edit/page.tsx | Название комнаты |
| `speaker` | edit/page.tsx | Ведущий |
| `scheduledDate` | edit/page.tsx | DateTimePicker |
| `type` (live/auto) | edit/page.tsx | Select dropdown |
| `videoUrl` | edit/page.tsx | URL видео |
| `btnUrl` | edit/page.tsx | URL кнопки |
| `logoUrl` + File upload | edit/page.tsx | GenericImagePicker ✨ |
| `bannerUrl` + File upload | edit/page.tsx | GenericImagePicker ✨ |
| `description` | edit/page.tsx | Textarea |
| `showBanner` | edit/page.tsx | Toggle Switch |
| `showBtn` | edit/page.tsx | Toggle Switch |
| `showChat` | edit/page.tsx | Toggle Switch |
| `isVolumeOn` | edit/page.tsx | Toggle Switch |

**✨ GenericImagePicker** - отличный компонент, сохранить!

---

## ❌ Что отсутствует

### Вкладка 1: Настройки комнаты

| Поле | Тип | Куда добавить |
|------|-----|---------------|
| `welcome_message` | textarea | roomFormSchema + Room Tab |
| `redirect_url` | url | roomFormSchema + Room Tab |
| `timezone` | select | roomFormSchema + Room Tab |
| `language` | select | roomFormSchema + Room Tab |

### Настройки авто-вебинара

| Поле | Тип | Куда добавить |
|------|-----|---------------|
| `startTime` | time | roomFormSchema (показывать если type=auto) |
| `scenario_id` | select | roomFormSchema (показывать если type=auto) |
| Загрузка сценария | file input | Новый компонент |

### Кнопки (макс 3) - **НОВАЯ СЕКЦИЯ**

```typescript
// Добавить в roomFormSchema
buttons: z.array(z.object({
  title: z.string(),
  url: z.string().url()
})).max(3).optional()
```

| Поле | Куда добавить |
|------|---------------|
| Динамический список кнопок | Room Tab после btnUrl |

### Баннеры (макс 5) - **НОВАЯ СЕКЦИЯ**

```typescript
// Добавить в roomFormSchema
banners: z.array(z.object({
  title: z.string(),
  url: z.string().url(),
  image: z.string(),
  timer: z.number().min(1).max(60),
  selected: z.boolean()
})).max(5).optional()
```

| Поле | Куда добавить |
|------|---------------|
| Динамический список баннеров | Room Tab после bannerUrl |

---

### Вкладка 2: Модерация - **НОВАЯ ВКЛАДКА**

| Элемент | Тип | Описание |
|---------|-----|----------|
| Запустить вебинар | Button | POST /api/rooms/{id}/start |
| Завершить вебинар | Button | POST /api/rooms/{id}/stop |
| Показать баннер | Toggle | Realtime toggle |
| Показать кнопки | Toggle | Realtime toggle |
| Чат модерация | Component | Новый компонент |
| Список пользователей | Component | Новый компонент |

---

### Вкладка 3: Режим вебинара - **ОБНОВИТЬ СУЩЕСТВУЮЩУЮ**

| Поле | Тип | Куда добавить |
|------|-----|---------------|
| `max_participants` | number | webinarFormSchema |
| `duration` | number | webinarFormSchema |
| `record_events` | checkbox | webinarFormSchema |
| `recording_target` | select | webinarFormSchema |
| `target_room_id` | select | webinarFormSchema (условно) |

---

### 🆕 Расписание автовебинара - **НОВАЯ СЕКЦИЯ**

| Поле | Тип |
|------|-----|
| `schedule_type` | select: specific/daily/interval/weekly/monthly |
| `specific_dates` | multi-datetime picker |
| `daily_times` | multi-time picker |
| `interval_days` | number |
| `weekly_days` | multi-select (Пн-Вс) |
| `monthly_days` | multi-select (1-31) |
| `start_date` | date |
| `end_date` | date |
| `max_runs` | number |
| `timezone` | select |
| `is_active` | toggle |

---

## 📋 План действий

### Фаза 1: Базовые поля (1-2 дня)

1. **roomFormSchema** - добавить:
   - `welcome_message`
   - `redirect_url`
   - `timezone`

2. **Room Tab UI** - добавить поля после `description`

### Фаза 2: Кнопки и баннеры (2-3 дня)

1. Создать `components/forms/ButtonsEditor.tsx`
2. Создать `components/forms/BannersEditor.tsx`
3. Добавить в Room Tab

### Фаза 3: Вкладка модерации (3-4 дня)

1. Добавить третью вкладку в Tabs
2. Создать `components/moderation/ChatModeration.tsx`
3. Создать `components/moderation/UsersOnline.tsx`
4. API endpoints для start/stop

### Фаза 4: Расписание (4-5 дней)

1. Создать `components/forms/ScheduleEditor.tsx`
2. Создать `components/ui/multi-datetime-picker.tsx`
3. Создать `components/ui/weekday-selector.tsx`
4. API для сохранения расписания

---

## 🔧 Быстрые исправления (сейчас)

### 1. Вкладка "Вебинар" - добавить текстовые поля

В файле `app/(auth)/rooms/[id]/edit/page.tsx` строки 1061-1161:

Добавить ПЕРЕД секцией "Настройки отображения":

```tsx
{/* Title field */}
<FormField
  control={webinarForm.control}
  name='title'
  render={({ field }) => (
    <FormItem>
      <FormLabel>Название вебинара *</FormLabel>
      <FormControl>
        <Input placeholder='Введите название' disabled={isSubmitting} {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

{/* Host name field */}
<FormField
  control={webinarForm.control}
  name='hostName'
  render={({ field }) => (
    <FormItem>
      <FormLabel>Ведущий *</FormLabel>
      <FormControl>
        <Input placeholder='Имя ведущего' disabled={isSubmitting} {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

{/* DateTime field */}
<FormField
  control={webinarForm.control}
  name='datetime'
  render={({ field }) => (
    <FormItem>
      <FormLabel>Дата и время</FormLabel>
      <DateTimePicker
        value={field.value ? new Date(field.value) : null}
        onChange={(date) => field.onChange(date?.toISOString() || '')}
      />
      <FormMessage />
    </FormItem>
  )}
/>

{/* Link/Video URL field */}
<FormField
  control={webinarForm.control}
  name='link'
  render={({ field }) => (
    <FormItem>
      <FormLabel>Ссылка на видео</FormLabel>
      <FormControl>
        <Input type='url' placeholder='https://...' disabled={isSubmitting} {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

{/* Description field */}
<FormField
  control={webinarForm.control}
  name='description'
  render={({ field }) => (
    <FormItem>
      <FormLabel>Описание</FormLabel>
      <FormControl>
        <Textarea placeholder='Описание вебинара' rows={4} disabled={isSubmitting} {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

## 📁 Структура файлов (рекомендуемая)

```
components/
├── forms/
│   ├── ButtonsEditor.tsx      # NEW
│   ├── BannersEditor.tsx      # NEW
│   └── ScheduleEditor.tsx     # NEW
├── moderation/
│   ├── ChatModeration.tsx     # NEW
│   ├── UsersOnline.tsx        # NEW
│   └── ScenarioTimeline.tsx   # NEW
└── ui/
    ├── multi-datetime-picker.tsx  # NEW
    ├── weekday-selector.tsx       # NEW
    └── generic-image-picker.tsx   # ✅ EXISTS
```

---

## Приоритет

| # | Задача | Важность |
|---|--------|----------|
| 1 | Добавить текстовые поля в вкладку "Вебинар" | 🔴 Высокая |
| 2 | welcome_message, redirect_url, timezone | 🔴 Высокая |
| 3 | Кнопки (массив до 3) | 🟡 Средняя |
| 4 | Баннеры (массив до 5) | 🟡 Средняя |
| 5 | Вкладка модерации | 🟡 Средняя |
| 6 | Расписание автовебинара | 🟢 Низкая (v2) |

