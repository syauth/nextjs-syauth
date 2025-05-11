import { SyAuth } from 'nextjs-syauth'

// Initialize SyAuth client
const syAuthClient = new SyAuth({
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://localhost/api/e/v1',
  apiKey: process.env.NEXT_PUBLIC_API_KEY || 'you-api-key',
})

export default syAuthClient
