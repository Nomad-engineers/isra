# Требования к данным Backend для модуля отчетов

## Текущее состояние

Сейчас frontend использует **mock данные** для большинства полей отчетов. Реальный backend предоставляет только базовую информацию о вебинарах.

---

## 📌 Данные которые ЕСТЬ от backend

### Вебинар (базовая информация)
```typescript
{
  id: number
  name: string
  description: string
  speaker: string
  type: 'live' | 'auto'
  videoUrl: string
  scheduledDate: string
  roomStarted: boolean
  startedAt: string | null
  stoppedAt: string | null
  showChat: boolean
  showBanner: boolean
  showBtn: boolean
  bannerUrl: string | null
  btnUrl: string | null
  createdAt: string
  updatedAt: string
  user: { id, firstName, lastName, email, role }
}
```

---

## ❌ Данные которых НЕТ (нужны от backend)

### 1. Зрители вебинара (высокий приоритет)
```typescript
interface WebinarViewer {
  id: string
  name: string
  email: string
  phone?: string
  
  // Время присутствия
  joinedAt: string        // Когда зашел
  leftAt: string | null   // Когда вышел
  totalWatchTime: number  // Общее время просмотра в секундах
  isOnline: boolean       // Сейчас онлайн?
  
  // Интервалы присутствия (ключевая фича!)
  presenceIntervals: {
    startTime: string     // Время входа
    endTime: string       // Время выхода
    duration: number      // Длительность в секундах
  }[]
  
  // Устройство и локация
  device: 'desktop' | 'mobile' | 'tablet'
  browser: string
  browserVersion: string
  os: string
  ip: string
  city?: string
  country?: string
  
  // UTM метки
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}
```

### 2. Статистика зрителей (высокий приоритет)
```typescript
interface ViewersStats {
  total: number           // Всего уникальных зрителей
  currentlyOnline: number // Сейчас онлайн
  peakOnline: number      // Пик онлайн
  peakTime: string        // Время пика
  
  // Устройства
  deviceStats: {
    desktop: number
    mobile: number
    tablet: number
  }
  
  // География
  geoStats: {
    countries: { name: string, code: string, count: number }[]
    cities: { name: string, count: number }[]
  }
}
```

### 3. График удержания (высокий приоритет)
```typescript
interface RetentionDataPoint {
  timestamp: string       // Время
  onlineCount: number     // Сколько онлайн
  joinedCount: number     // Сколько зашло в этот момент
  leftCount: number       // Сколько вышло
}
```

### 4. Чат вебинара (средний приоритет)
```typescript
interface ChatMessage {
  id: string
  oderId: string          // ID зрителя
  userName: string
  message: string
  timestamp: string
  isModerator: boolean
}

interface ChatStats {
  totalMessages: number
  participantsCount: number    // Сколько писали в чат
  messagesPerViewer: number    // Среднее сообщений на зрителя
}
```

### 5. Клики и действия (средний приоритет)
```typescript
interface ClickStats {
  buttonClicks: number         // Клики по кнопке
  buttonClicksViewers: string[] // ID зрителей кликнувших
  bannerClicks: number         // Клики по баннеру
  bannerClicksViewers: string[]
}
```

### 6. Модераторы (низкий приоритет)
```typescript
interface Moderator {
  id: string
  name: string
  email: string
  role: 'moderator' | 'assistant'
  joinedAt: string
  permissions: string[]
}
```

---

## ⚠️ Данные которые НЕ НУЖНЫ показывать

Следующие данные сейчас показываются как mock, но их **НЕТ в реальности** и показывать не нужно пока backend не предоставит:

1. **Конверсии и покупки** - `purchases`, `totalRevenue`, `registrations`
2. **Страница заказа** - `orderPageVisits`
3. **Средняя оценка качества связи** - `averageConnectionQuality`
4. **Buffering events** - `bufferingEvents`

---

## 📡 Предлагаемые API endpoints

### GET /api/webinars/:id/report
Полный отчет вебинара

### GET /api/webinars/:id/viewers
Список зрителей с пагинацией
Query params: `page`, `limit`, `search`, `device`

### GET /api/webinars/:id/viewers/:viewerId
Детали конкретного зрителя с интервалами присутствия

### GET /api/webinars/:id/retention
График удержания (данные для построения графика)

### GET /api/webinars/:id/chat
Сообщения чата с пагинацией
Query params: `page`, `limit`, `search`

### GET /api/webinars/:id/clicks
Статистика кликов по кнопке/баннеру

---

## 🔄 Формат ответа

Рекомендуемый формат:
```json
{
  "success": true,
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 164,
    "totalPages": 4
  }
}
```

---

## Контакт

По вопросам интеграции обращаться к frontend команде.

