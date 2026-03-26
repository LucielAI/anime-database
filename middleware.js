import { next } from '@vercel/edge'

export default function middleware(request) {
  const url = new URL(request.url)

  // Trailing slash redirect (but preserve root /)
  if (url.pathname.endsWith('/') && url.pathname !== '/') {
    url.pathname = url.pathname.replace(/\/+$/, '')
    return Response.redirect(url.toString(), 308)
  }

  // Mixed-case /universe/ redirect to lowercase
  const universeMatch = url.pathname.match(/^\/universe\/([a-z0-9-]+)$/i)
  if (universeMatch) {
    const lower = universeMatch[1].toLowerCase()
    if (universeMatch[1] !== lower) {
      url.pathname = `/universe/${lower}`
      return Response.redirect(url.toString(), 301)
    }
  }

  return next()
}

export const config = {
  matcher: ['/universe/:path*'],
}
