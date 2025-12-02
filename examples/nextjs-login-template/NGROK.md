# Running with Ngrok

This guide explains how to run the Next.js login template with ngrok for local development with public URLs.

## Prerequisites

1. Sign up for a free ngrok account at https://dashboard.ngrok.com
2. Get your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken

## Setup

1. Install dependencies:

```bash
npm install
```

2. Set your ngrok authtoken (optional but recommended):

```bash
export NGROK_AUTH_TOKEN=your_ngrok_authtoken_here
```

Or add it to your `.env.local` file:

```
NGROK_AUTH_TOKEN=your_ngrok_authtoken_here
```

## Running with Ngrok

Simply run:

```bash
npm run dev:ngrok
```

This will:

1. Start an ngrok tunnel on port 3000 (or the port specified in `PORT` env var)
2. Display the public ngrok URL
3. Automatically set the `NEXT_PUBLIC_LOGIN_URL` environment variable
4. Start the Next.js dev server

## Important Notes

1. **Ngrok URL Changes**: Free ngrok URLs change each time you restart. The login URL will be displayed when you start the server.

2. **For Stable URLs**: Consider upgrading to ngrok's paid plan for static domains.

## Environment Variables

The script automatically sets:

- `NEXT_PUBLIC_LOGIN_URL` - The public ngrok URL for the login page
- `NEXT_PUBLIC_NGROK_URL` - The base ngrok URL

These override any values in your `.env.local` file when running with ngrok.


