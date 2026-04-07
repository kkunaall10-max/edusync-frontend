import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { C, navLinks } from './tokens';

export default function LandingNav() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);
  const [hovered, setHovered]   = useState(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 52,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px',
        background: scrolled ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: scrolled ? `1px solid ${C.border}` : '1px solid transparent',
        transition: 'border-color .3s, background .3s',
      }}>
        {/* Logo */}
        <div
          onClick={() => navigate('/')}
          style={{
            fontFamily: C.serif, fontSize: 22, fontWeight: 700,
            color: C.text, cursor: 'pointer', letterSpacing: '-0.5px',
            transition: 'color .2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = C.blue}
          onMouseLeave={e => e.currentTarget.style.color = C.text}
        >
          EduSync
        </div>

        {/* Desktop Links */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }} className="ln-desk">
          {navLinks.map(lk => {
            const active = isActive(lk.path);
            const hov    = hovered === lk.label;
            return (
              <button key={lk.label}
                onClick={() => navigate(lk.path)}
                onMouseEnter={() => setHovered(lk.label)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: C.sans, fontSize: 13, fontWeight: active ? 600 : 500,
                  color: active ? C.blue : hov ? C.blue : C.muted,
                  padding: '6px 12px', borderRadius: 8,
                  backgroundColor: hov ? `${C.blue}0e` : 'transparent',
                  transition: 'color .18s, background-color .18s',
                  position: 'relative',
                }}
              >
                {lk.label}
                {/* Active underline */}
                {active && (
                  <span style={{
                    position: 'absolute', bottom: 2, left: '50%',
                    transform: 'translateX(-50%)',
                    width: '60%', height: 2,
                    background: C.blue, borderRadius: 2,
                  }}/>
                )}
              </button>
            );
          })}
          <button
            onClick={() => navigate('/login')}
            style={{
              marginLeft: 8,
              background: hovered === '__login' ? C.blueHov : C.blue,
              color: '#fff', border: 'none', borderRadius: 980,
              padding: '8px 20px', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: C.sans,
              boxShadow: hovered === '__login' ? `0 4px 18px ${C.blue}55` : `0 4px 14px ${C.blue}33`,
              transform: hovered === '__login' ? 'scale(1.04)' : 'scale(1)',
              transition: 'background .18s, box-shadow .18s, transform .15s',
            }}
            onMouseEnter={() => setHovered('__login')}
            onMouseLeave={() => setHovered(null)}
          >Login →</button>
        </div>

        {/* Hamburger */}
        <button className="ln-burger"
          onClick={() => setOpen(true)}
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
        >
          {[0,1,2].map(i => (
            <span key={i} style={{display:'block',width:22,height:2,background:C.text,borderRadius:2,margin:'5px 0'}}/>
          ))}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(24px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28,
        }}>
          <button onClick={() => setOpen(false)}
            style={{ position: 'absolute', top: 18, right: 24, background: 'none', border: 'none', fontSize: 26, cursor: 'pointer', color: C.muted }}></button>
          {navLinks.map(lk => (
            <button key={lk.label}
              onClick={() => { navigate(lk.path); setOpen(false); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 24, fontWeight: 600, fontFamily: C.sans,
                color: isActive(lk.path) ? C.blue : C.text,
                transition: 'color .2s',
              }}
            >{lk.label}</button>
          ))}
          <button onClick={() => { navigate('/login'); setOpen(false); }}
            style={{ background: C.blue, color: '#fff', border: 'none', borderRadius: 980, padding: '14px 36px', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: C.sans }}>
            Login →
          </button>
        </div>
      )}

      <style>{`
        @media(max-width:768px){ .ln-desk{display:none!important} .ln-burger{display:block!important} }
      `}</style>
    </>
  );
}
