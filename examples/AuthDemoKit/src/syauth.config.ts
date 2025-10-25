import { SyAuth } from 'nextjs-syauth';

// Validate required environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is required');
}
if (!API_KEY) {
  throw new Error('NEXT_PUBLIC_API_KEY is required');
}

const syAuthClient = new SyAuth({
  apiUrl: API_URL,
  apiKey: API_KEY,
});

export default syAuthClient;
