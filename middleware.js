import { NextResponse } from 'next/server'

export function middleware(request) {
  const url = new URL(request.url)

  // Trailing slash redirect (but preserve root /)
  if (url.pathname.endsWith('/') && url.pathname !== '/') {
    url.pathname = url.pathname.replace(/\/+$/, '')
    return NextResponse.redirect(url, 308)
  }

  // Mixed-case /universe/ redirect to lowercase
  const universeMatch = url.pathname.match(/^\/universe\/([a-z0-9-]+)$/i)
  if (universeMatch) {
    const lower = universeMatch[1].toLowerCase()
    if (universeMatch[1] !== lower) {
      url.pathname = `/universe/${lower}`
      return NextResponse.redirect(url, 301)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/universe/:path*'],
}
