# Running with Ngrok

This guide explains how to run the Next.js app with ngrok for local development with public URLs.

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

1. Start an ngrok tunnel on port 3002 (or the port specified in `PORT` env var)
2. Display the public ngrok URL
3. Display the public ngrok URL and instructions for updating your OAuth redirect URI

**Note:** Make sure your Next.js server is already running (e.g., `npm run dev`) before starting ngrok.

## Important Notes

1. **Update OAuth Redirect URI**: When you start ngrok, it will display a URL like `https://abc123.ngrok-free.app`. You need to:

   - Copy the callback URL (e.g., `https://abc123.ngrok-free.app/auth/callback`)
   - Update your OAuth client in the SyAuth Dashboard with this redirect URI

2. **Ngrok URL Changes**: Free ngrok URLs change each time you restart. You'll need to update the redirect URI in your SyAuth Dashboard each time.

3. **For Stable URLs**: Consider upgrading to ngrok's paid plan for static domains.

## Environment Variables

The script automatically sets:

- `NEXT_PUBLIC_SYAUTH_REDIRECT_URI` - OAuth callback URL
- `NEXT_PUBLIC_OAUTH_REDIRECT_URI` - OAuth callback URL (alias)
- `NEXT_PUBLIC_NGROK_URL` - The base ngrok URL

These override any values in your `.env.local` file when running with ngrok.

### Optional Configuration

You can set these environment variables to customize the connection:

- `SERVER_HOST` - The hostname/IP to connect to (default: `localhost`)

  - Example: `SERVER_HOST=127.0.0.1 npm run dev:ngrok`

- `PORT` - Override the port (default: `3002`)
  - Example: `PORT=3003 npm run dev:ngrok`

**Note:** If your Next.js server uses HTTPS (with `--experimental-https`), the script will automatically connect via HTTPS. Make sure your server is accessible on the specified host and port.

### Alternative: Using ngrok CLI directly (for self-signed certificates)

If you're getting `ERR_NGROK_3200` errors due to self-signed certificates, you can use the ngrok CLI directly with the `--upstream-tls-skip-verify` flag:

```bash
./scripts/start-with-ngrok-cli.sh
```

Or manually:

```bash
ngrok http https://localhost:3002
```

This connects to your local HTTPS server. For self-signed certificates, ngrok should handle them automatically.

### Troubleshooting ERR_NGROK_3200

If you see `ERR_NGROK_3200` (endpoint offline), it usually means ngrok can't verify your server's SSL certificate. This happens with self-signed certificates.

**Solutions:**

1. **Make sure your Next.js server is running** on `localhost:3002` (or the port you specified)

2. **Use the CLI script** which handles HTTPS connections better:

   ```bash
   npm run dev:ngrok:cli
   ```

3. **Check that ngrok can reach your server:**

   ```bash
   curl -k https://localhost:3002
   ```

4. **If using ngrok CLI directly:**
   ```bash
   ngrok http https://localhost:3002
   ```

