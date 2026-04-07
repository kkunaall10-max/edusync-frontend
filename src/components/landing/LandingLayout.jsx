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
    <div style={{ overflowX: 'hidden', background: bg }}>
      <LandingNav />
      <div style={{ paddingTop: 52 }}>
        {children}
      </div>
      <LandingFooter />
    </div>
  );
}
