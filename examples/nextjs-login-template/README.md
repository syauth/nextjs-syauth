# Next.js Login Template

**A white-label, production-ready OAuth 2.0 login page template** that developers can clone, customize, and deploy as their own branded login subdomain (e.g., `login.yourdomain.com`).

## Features

✨ **Fully Customizable** - Complete white-label experience
🎨 **Dynamic Branding** - Logo, colors, company name, theme
🔒 **OAuth 2.0 Compliant** - Integrates with SyAuth
📱 **Mobile Responsive** - Works on all devices
🌓 **Dark/Light/Auto Theme** - Theme support with CSS variables
⚡ **Production Ready** - Built with Next.js 14 + TypeScript
🚀 **Easy Deployment** - Deploy to Vercel in 2 minutes
🛡️ **Secure** - HTTPS required, CSRF protection

---

## Quick Start

### 1. Clone or Fork

```bash
git clone <repository-url>
cd nextjs-syauth/examples/nextjs-login-template
```

### 2. Install

```bash
npm install
```

### 3. Configure

```bash
cp .env.example .env
# Edit .env with your settings
```

### 4. Run

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## Deploy to Vercel

1. Push to GitHub
2. Import to [Vercel](https://vercel.com/new)
3. Add environment variables
4. Deploy!

Configure custom domain: `login.yourdomain.com`

---

## Configuration

### Required

```bash
NEXT_PUBLIC_S0011_API_URL=https://api.yourdomain.com/e/v1
NEXT_PUBLIC_OAUTH_CLIENT_ID=your-oauth-client-id
NEXT_PUBLIC_LOGIN_URL=https://login.yourdomain.com
```

### Optional Branding Overrides

```bash
NEXT_PUBLIC_COMPANY_NAME=Acme Corporation
NEXT_PUBLIC_LOGO_URL=https://yourdomain.com/logo.png
NEXT_PUBLIC_PRIMARY_COLOR=#4F46E5
```

---

## Customization

**Via SyAuth Dashboard**: Configure branding in the UI
**Via Code**: Edit `src/components/LoginForm.tsx` and styles

---

## License

MIT

**Built with ❤️ by Nexorix**
