import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session

  const isLoginPage = nextUrl.pathname === '/login'
  const isPublic = nextUrl.pathname === '/' || isLoginPage

  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  if (isLoggedIn && isLoginPage) {
    const role = (session?.user as any)?.role
    const dest = role === 'ADMIN' ? '/admin' : role === 'CLIENT' ? '/client' : '/employee'
    return NextResponse.redirect(new URL(dest, nextUrl))
  }

  if (isLoggedIn && nextUrl.pathname === '/') {
    const role = (session?.user as any)?.role
    const dest = role === 'ADMIN' ? '/admin' : role === 'CLIENT' ? '/client' : '/employee'
    return NextResponse.redirect(new URL(dest, nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
