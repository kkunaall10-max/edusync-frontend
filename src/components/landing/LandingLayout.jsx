import React, { useEffect } from 'react';
import LandingNav from './LandingNav';
import LandingFooter from './LandingFooter';
import { C } from './tokens';

export default function LandingLayout({ children, bg = C.white }) {
  useEffect(() => {
    document.body.style.background = bg;
    return () => { document.body.style.background = ''; };
  }, [bg]);

  return (
    <div style={{ overflowX: 'hidden', background: bg, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <LandingNav />
      <div style={{ paddingTop: 52, flex: 1 }} className="land-wrapper">
        {children}
      </div>
      <LandingFooter />

      <style>{`
        /* Global Mobile Responsiveness for Landing Pages */
        @media (max-width: 768px) {
          .land-wrapper section {
            padding-left: 20px !important;
            padding-right: 20px !important;
            padding-top: 64px !important;
            padding-bottom: 64px !important;
          }
          .land-wrapper h1 {
            font-size: clamp(32px, 8vw, 48px) !important;
          }
          .land-wrapper h2 {
            font-size: clamp(28px, 6vw, 40px) !important;
          }
        }
      `}</style>
    </div>
  );
}
