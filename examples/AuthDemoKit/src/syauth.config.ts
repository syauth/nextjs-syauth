import { SyAuth } from 'nextjs-syauth';

// Validate required environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const OAUTH_CLIENT_ID = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is required');
}
if (!API_KEY) {
  throw new Error('NEXT_PUBLIC_API_KEY is required');
}
if (!OAUTH_CLIENT_ID) {
  throw new Error('NEXT_PUBLIC_OAUTH_CLIENT_ID is required. Please create an OAuth Client in the developer portal and add its UUID to .env.local');
}

const syAuthClient = new SyAuth({
  apiUrl: API_URL,
  apiKey: API_KEY,
  oauthClientId: OAUTH_CLIENT_ID,
});

export default syAuthClient;
