import { ImageResponse } from 'next/og';


export const alt = 'MyLink - 하나의 링크로 모든 것을 연결하세요';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
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
          top: '-200px',
          left: '-200px',
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, rgba(0,0,0,0) 70%)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-200px',
          right: '-200px',
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(0,0,0,0) 70%)',
        }} />

        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
        }}>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '60px',
            background: 'rgba(255,255,255,0.05)',
            padding: '20px 40px',
            borderRadius: '100px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 'bold',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            }}>M</div>
            <span style={{ fontSize: '48px', fontWeight: 'bold' }}>MyLink</span>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}>
            <div style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              padding: '12px 24px',
              borderRadius: '100px',
              color: '#a78bfa',
              fontSize: '24px',
              fontWeight: '600',
              marginBottom: '32px',
              display: 'flex',
            }}>
              쉽고 빠른 링크 관리
            </div>
            <h1 style={{ 
              fontSize: '84px', 
              fontWeight: '900', 
              margin: '0 0 24px 0', 
              lineHeight: 1.2,
              letterSpacing: '-2px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
              <span>하나의 링크로</span>
              <span style={{ color: '#a78bfa' }}>모든 것을 연결하세요</span>
            </h1>
            <p style={{ 
              fontSize: '32px', 
              color: '#a1a1aa', 
              margin: 0,
              maxWidth: '800px',
              lineHeight: 1.5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
              <span>나만의 맞춤형 프로필 페이지를 만들고</span>
              <span>SNS, 블로그, 포트폴리오를 한 곳에 모아 공유해보세요</span>
            </p>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
