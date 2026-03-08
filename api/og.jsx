import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || 'aot';
    
    let title = 'Anime Architecture Archive';
    let subtitle = 'Fictional Universe Intelligence System';
    let themeColor = '#22d3ee'; // cyan
    let typeLab = 'ARCHIVE';

    if (id === 'aot') {
      title = 'ATTACK ON TITAN';
      subtitle = 'CAUSALITY, DETERMINISM & THE TIMELINE';
      themeColor = '#ef4444'; // red
      typeLab = 'TIMELINE ARCHIVE';
    } else if (id === 'jjk') {
      title = 'JUJUTSU KAISEN';
      subtitle = 'NEGATIVE ENERGY ECONOMY & COUNTERPLAY';
      themeColor = '#3b82f6'; // blue
      typeLab = 'COUNTER-TREE ARCHIVE';
    } else if (id === 'hxh') {
      title = 'HUNTER x HUNTER';
      subtitle = 'STRATEGIC INTERDEPENDENCE & CONTRACTS';
      themeColor = '#10b981'; // green
      typeLab = 'NODE GRAPH ARCHIVE';
    }

    const fontData = await fetch(new URL('./assets/RobotoMono-Bold.ttf', import.meta.url)).then((res) => res.arrayBuffer());

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
                <span style={{ color: themeColor, fontSize: '28px', letterSpacing: '0.3em', fontWeight: 'bold' }}>// {typeLab}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', padding: '12px 24px', borderRadius: '50px' }}>
                <span style={{ color: '#fff', fontSize: '20px', letterSpacing: '0.2em', fontWeight: 'bold' }}>SYS_MODE: ONLINE</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
              <h1 style={{ fontSize: '110px', fontWeight: '900', color: '#fff', margin: '0 0 20px 0', letterSpacing: '-0.02em', lineHeight: '1.1', textShadow: `0 0 40px ${themeColor}60` }}>
                {title}
              </h1>
              <p style={{ fontSize: '32px', color: themeColor, margin: 0, letterSpacing: '0.2em', fontWeight: 'bold' }}>
                {subtitle}
              </p>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '24px', letterSpacing: '0.4em', fontWeight: 'bold' }}>ANIME_ARCHITECTURE_ARCHIVE</span>
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
    );
  } catch (e) {
    console.error('OG API Error:', e);
    return new Response('Failed to generate OG image', { status: 500 });
  }
}
