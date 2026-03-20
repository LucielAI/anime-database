import { useEffect } from 'react'
import { SITE_NAME } from '../utils/seo'

function ensureMeta(selector, attrs) {
  let node = document.head.querySelector(selector)
  if (!node) {
    node = document.createElement('meta')
    document.head.appendChild(node)
  }

  Object.entries(attrs).forEach(([key, value]) => {
    node.setAttribute(key, value)
  })
}

function ensureLink(selector, attrs) {
  let node = document.head.querySelector(selector)
  if (!node) {
    node = document.createElement('link')
    document.head.appendChild(node)
  }

  Object.entries(attrs).forEach(([key, value]) => {
    node.setAttribute(key, value)
  })
}

export default function SeoHead({ title, description, canonicalUrl, image, type = 'website', keywords = '', structuredData = [] }) {
  useEffect(() => {
    if (!title) return

    document.title = title

    ensureMeta('meta[name="description"]', { name: 'description', content: description || '' })
    if (keywords) ensureMeta('meta[name="keywords"]', { name: 'keywords', content: keywords })
    ensureMeta('meta[name="robots"]', { name: 'robots', content: 'index, follow, max-image-preview:large' })

    ensureMeta('meta[property="og:title"]', { property: 'og:title', content: title })
    ensureMeta('meta[property="og:description"]', { property: 'og:description', content: description || '' })
    ensureMeta('meta[property="og:type"]', { property: 'og:type', content: type })
    ensureMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl || '' })
    ensureMeta('meta[property="og:image"]', { property: 'og:image', content: image || '' })
    ensureMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE_NAME })

    ensureMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
    ensureMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title })
    ensureMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description || '' })
    ensureMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image || '' })

    if (canonicalUrl) {
      ensureLink('link[rel="canonical"]', { rel: 'canonical', href: canonicalUrl })
    }

    document.head.querySelectorAll('script[data-seo-jsonld="true"]').forEach((node) => node.remove())

    structuredData.forEach((schema, index) => {
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.setAttribute('data-seo-jsonld', 'true')
      script.setAttribute('data-seo-schema-index', String(index))
      script.textContent = JSON.stringify(schema)
      document.head.appendChild(script)
    })
  }, [title, description, canonicalUrl, image, type, keywords, structuredData])

  return null
}
