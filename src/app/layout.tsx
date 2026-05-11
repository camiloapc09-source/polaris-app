import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Polaris App — Star Shine',
  description: 'Plataforma de gestión de nómina y empleados',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
