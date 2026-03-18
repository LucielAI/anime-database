import { ImageResponse } from '@vercel/og'
import { UNIVERSE_CATALOG_MAP } from '../src/data/catalog.js'
import { getClassificationLabel } from '../src/utils/getClassificationLabel.js'

export const config = {
  runtime: 'edge',
}

const FALLBACK = {
  anime: 'Anime Architecture Archive',
  tagline: 'Fictional Universe Intelligence System',
  visualizationHint: 'standard-cards',
  themeColors: { primary: '#22d3ee' },
}

function normalizePreview(id) {
  const normalizedId = (id || '').trim().toLowerCase()
  return UNIVERSE_CATALOG_MAP[normalizedId] || FALLBACK
}

export default async function handler(request) {
  try {
    console.log('OG endpoint called', request.url)
    const { searchParams } = new URL(request.url)
    const preview = normalizePreview(searchParams.get('id'))

    const title = preview.anime.toUpperCase()
    const subtitle = preview.tagline.toUpperCase()
    const typeLabel = `${getClassificationLabel(preview.visualizationHint).toUpperCase()} ARCHIVE`
    const themeColor = preview.themeColors?.primary || '#22d3ee'

    const fontData = await fetch(new URL('./assets/RobotoMono-Bold.ttf', import.meta.url)).then((res) => res.arrayBuffer())

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#050508',
            backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.05) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.05) 2%, transparent 0%)',
            backgroundSize: '100px 100px',
            fontFamily: '"Roboto Mono", monospace',
            padding: '40px',
          }}
        >
          <div style={{ display: 'flex', border: '2px solid rgba(255,255,255,0.1)', padding: '60px', borderRadius: '24px', backgroundColor: 'rgba(255,255,255,0.03)', flexDirection: 'column', width: '100%', height: '100%', justifyContent: 'space-between', boxShadow: `inset 0 0 100px ${themeColor}20` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: themeColor, fontSize: '28px', letterSpacing: '0.2em', fontWeight: 'bold' }}>// {typeLabel}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', padding: '12px 24px', borderRadius: '50px' }}>
                <span style={{ color: '#fff', fontSize: '20px', letterSpacing: '0.2em', fontWeight: 'bold' }}>SYSTEM PROFILE</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
              <h1 style={{ fontSize: '84px', fontWeight: '900', color: '#fff', margin: '0 0 20px 0', letterSpacing: '-0.02em', lineHeight: '1.1', textShadow: `0 0 40px ${themeColor}60`, maxWidth: '1000px' }}>
                {title}
              </h1>
              <p style={{ fontSize: '26px', color: themeColor, margin: 0, letterSpacing: '0.08em', fontWeight: 'bold', maxWidth: '1000px' }}>
                {subtitle}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '24px', letterSpacing: '0.3em', fontWeight: 'bold' }}>ANIME_ARCHITECTURE_ARCHIVE</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Roboto Mono',
            data: fontData,
            style: 'normal',
          },
        ],
      }
    )
  } catch (error) {
    console.error('OG API Error:', error)
    return new Response('Failed to generate OG image', { status: 500 })
  }
}
