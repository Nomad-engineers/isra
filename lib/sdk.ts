import { PayloadSDK } from '@payloadcms/sdk'

import { BASE_URL } from './constants'


export const sdk = new PayloadSDK({
  baseURL: BASE_URL,
  // Make sure the API path is included in requests
  // Remove credentials for user login - we don't need admin credentials for login
  // credentials: {
  //   email: process.env.PAYLOAD_ADMIN_EMAIL || 'admin@example.com',
  //   password: process.env.PAYLOAD_ADMIN_PASSWORD || 'admin',
  // },
})