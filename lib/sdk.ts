import { PayloadSDK } from '@payloadcms/sdk'

export const BASE_URL = process.env.PAYLOAD_API_URL || 'https://isracms.vercel.app/api'

export const sdk = new PayloadSDK({
  serverURL: BASE_URL,
  // Add authentication credentials for admin operations
  // For user creation, we might need admin-level access
  credentials: {
    email: process.env.PAYLOAD_ADMIN_EMAIL || 'admin@example.com',
    password: process.env.PAYLOAD_ADMIN_PASSWORD || 'admin',
  },
})