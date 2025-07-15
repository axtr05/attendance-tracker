import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function middleware(request) {
  // Get token from cookies
  const token = request.cookies.get('token')?.value
  
  // Get the current path
  const { pathname } = request.nextUrl
  
  // Define public paths that don't require authentication
  const publicPaths = ['/login', '/signup', '/api/auth/session', '/api/auth/logout', '/']
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
  
  // If path is public, allow access
  if (isPublicPath) {
    // If user is already logged in and trying to access login/signup, redirect to homepage
    if (token && (pathname === '/login' || pathname === '/signup')) {
      try {
        jwt.verify(token, process.env.JWT_SECRET)
        return NextResponse.redirect(new URL('/homepage', request.url))
      } catch {
        // Invalid token, allow access to login/signup
      }
    }
    return NextResponse.next()
  }
  
  // For protected routes, verify authentication
  if (!token) {
    // Redirect to login if no token
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  try {
    // Verify JWT
    jwt.verify(token, process.env.JWT_SECRET)
    return NextResponse.next()
  } catch (error) {
    // Invalid token, redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

// Configure which paths should be processed by the middleware
export const config = {
  matcher: [
    // Protected routes
    '/homepage/:path*',
    '/setup/:path*',
    '/attendance/:path*',
    '/leaderboard/:path*',
    '/profile/:path*',
    '/subject/:path*',
    '/api/user/:path*',
    '/api/attendance/:path*',
    '/api/leaderboard/:path*',
    '/api/profile/:path*',
    
    // Auth pages (to redirect if already logged in)
    '/login',
    '/signup',
  ],
}