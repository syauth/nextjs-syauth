import { NexoAuth } from 'nextjs-nexoauth'

// Initialize NexoAuth client
const nexoAuthClient = new NexoAuth({
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://localhost/api/e/v1',
  apiKey: process.env.NEXT_PUBLIC_API_KEY || 'you-api-key',
})

export default nexoAuthClient
