# NexoAuth Demo Application

A Next.js application demonstrating the implementation of NexoAuth, an authentication SDK for Next.js applications.

## Features

- User authentication (login/logout/register/profile/reset password)  
- Protected routes  
- Authentication status display  
- Responsive navigation  
- Bootstrap styling  

## Technologies Used

- Next.js 15  
- React 19  
- NexoAuth SDK  
- React Bootstrap  
- TypeScript  

## Installation

#### 1. Clone the repository
git clone https://github.com/nexoauth/nexoauth-test-app.git

#### 2. Navigate to project directory
cd nexoauth-test-app

#### 3. Install dependencies
npm install

#### 4. Edit .env.local with your credentials
cp .env.example .env.local

#### 5. Run development server
npm run dev

## Configuration

### Environment Variables

Create a `.env.local` file with:

```typescript
NEXT_PUBLIC_API_URL=your_api_url
NEXT_PUBLIC_API_KEY=your_api_key
```

### NexoAuth Setup

Configured in `nexoauth.config.ts`:

```typescript
const nexoAuthClient = new NexoAuth({
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  apiKey: process.env.NEXT_PUBLIC_API_KEY
});
```

## Middleware Protection

Protected routes are configured in `middleware.ts`:

protectedRoutes: ['/dashboard', '/profile'],
loginUrl: '/login',
defaultProtectedRoute: '/dashboard'

## Available Scripts


| Command | Description |
| --- | --- |
| `npm run dev` | Starts development server |
| `npm run build` | Builds for production |
| `npm start` | Runs production build |
| `npm lint` | Runs ESLint |

## License

[MIT] © NexoAuth