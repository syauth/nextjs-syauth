import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Secure authentication powered by OAuth 2.0',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
