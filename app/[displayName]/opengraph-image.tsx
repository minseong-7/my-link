import { ImageResponse } from 'next/og';


export const alt = 'MyLink Profile';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { displayName: string } }) {
  // Await the params object before accessing its properties in Next.js 15+
  const resolvedParams = await params;
  const decodedName = decodeURIComponent(resolvedParams.displayName);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: 'linear-gradient(135deg, #09090b 0%, #171720 100%)',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Background Decorative Blobs */}
        <div style={{
          position: 'absolute',
          top: '-150px',
          left: '-150px',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(0,0,0,0) 70%)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-150px',
          right: '-150px',
          width: '700px',
          height: '700px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(0,0,0,0) 70%)',
        }} />

        {/* Content Container */}
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Card */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '40px',
            padding: '80px 120px',
            boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
          }}>
            {/* Avatar Placeholder */}
            <div style={{
              width: '200px',
              height: '200px',
              borderRadius: '100px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '40px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              border: '4px solid rgba(255,255,255,0.1)'
            }}>
              <span style={{ fontSize: '100px', fontWeight: 'bold' }}>
                {decodedName.charAt(0).toUpperCase()}
              </span>
            </div>
            
            {/* User Info */}
            <h1 style={{
              fontSize: '72px',
              fontWeight: '800',
              margin: '0 0 20px 0',
              letterSpacing: '-2px',
              color: '#ffffff',
            }}>
              @{decodedName}
            </h1>
            <p style={{
              fontSize: '36px',
              color: '#a1a1aa',
              margin: 0,
              fontWeight: '500'
            }}>
              나만의 링크 모음 공간
            </p>
          </div>

          {/* Footer Branding */}
          <div style={{
            position: 'absolute',
            bottom: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 'bold'
            }}>
              M
            </div>
            <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#e4e4e7' }}>MyLink</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
