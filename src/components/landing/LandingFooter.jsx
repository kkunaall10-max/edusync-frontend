import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { C, footerCols } from './tokens';

const socials = [
  { label: 'GitHub', href: '#', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg> },
  { label: 'LinkedIn', href: '#', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
  { label: 'Email', href: 'mailto:kkunaall10@gmail.com', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/></svg> },
];

export default function LandingFooter() {
  const navigate = useNavigate();
  const [hov, setHov] = useState(null);

  return (
    <footer style={{ background: C.bg, borderTop: `1px solid ${C.border}`, overflow: 'hidden', position: 'relative' }}>
      <div className="footer-mobile-pad" style={{ maxWidth: 1140, margin: '0 auto', padding: '60px 48px 0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, justifyContent: 'space-between', marginBottom: 40 }}>

          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ delay: .05, duration: .7 }}
            style={{ flex: '1 1 220px', maxWidth: 280 }}
          >
            <div
              onClick={() => navigate('/')}
              style={{ fontFamily: C.serif, fontSize: 28, color: C.text, marginBottom: 6, cursor: 'pointer', transition: 'color .2s' }}
              onMouseEnter={e => e.currentTarget.style.color = C.blue}
              onMouseLeave={e => e.currentTarget.style.color = C.text}
            >EduSync</div>
            <div style={{ fontSize: 13, color: C.muted, fontFamily: C.sans, marginBottom: 18, lineHeight: 1.7 }}>
              Empowering Schools. Inspiring Futures.
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
              {socials.map(s => (
                <a key={s.label} href={s.href} aria-label={s.label}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 34, height: 34, borderRadius: 8,
                    background: '#fff', border: `1px solid ${C.border}`,
                    color: hov === s.label ? C.blue : C.muted,
                    textDecoration: 'none',
                    transform: hov === s.label ? 'scale(1.12)' : 'scale(1)',
                    transition: 'color .18s, transform .18s',
                  }}
                  onMouseEnter={() => setHov(s.label)}
                  onMouseLeave={() => setHov(null)}
                >{s.icon}</a>
              ))}
            </div>
            {['+91 99965 84341', 'kkunaall10@gmail.com'].map(c => (
              <div key={c} style={{
                display: 'inline-block', marginRight: 6, marginBottom: 6,
                background: '#fff', border: `1px solid ${C.border}`,
                borderRadius: 100, padding: '4px 12px',
                fontSize: 11, color: C.muted, fontFamily: C.sans,
              }}>{c}</div>
            ))}
          </motion.div>

          {/* Columns */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '36px 52px', flex: '1 1 380px', justifyContent: 'flex-start' }}>
            {footerCols.map((col, ci) => (
              <motion.div key={col.heading}
                initial={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: true }}
                transition={{ delay: .1 + ci * .1, duration: .7 }}
              >
                <div style={{
                  fontSize: 11, fontWeight: 700, color: C.muted,
                  fontFamily: C.sans, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 14,
                }}>{col.heading}</div>
                {col.links.map(lk => (
                  <button key={lk.label}
                    onClick={() => navigate(lk.path)}
                    style={{
                      display: 'block', background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 13, fontFamily: C.sans, marginBottom: 9, padding: 0, textAlign: 'left',
                      color: hov === col.heading + lk.label ? C.blue : C.muted,
                      transform: hov === col.heading + lk.label ? 'translateX(4px)' : 'translateX(0)',
                      transition: 'color .18s, transform .18s',
                    }}
                    onMouseEnter={() => setHov(col.heading + lk.label)}
                    onMouseLeave={() => setHov(null)}
                  >{lk.label}</button>
                ))}
              </motion.div>
            ))}
          </div>
        </div>

        <div style={{
          borderTop: `1px solid ${C.border}`, paddingTop: 18, paddingBottom: 18,
          display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6,
        }}>
          <span style={{ fontSize: 12, color: C.muted, fontFamily: C.sans }}>© 2026 EduSync. Built in India.</span>
          <span style={{ fontSize: 12, color: C.muted, fontFamily: C.sans }}>Made with dedication by Kunal</span>
        </div>
      </div>

      {/* Ghost wordmark */}
      <div style={{ position: 'relative', pointerEvents: 'none', textAlign: 'center', overflow: 'hidden', height: 'clamp(48px,12vw,140px)' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: `linear-gradient(to bottom, transparent 0%, ${C.bg} 100%)` }} />
        <div style={{
          fontFamily: C.serif, fontSize: 'clamp(52px,14vw,180px)', fontWeight: 700,
          lineHeight: 1, letterSpacing: '-4px', color: 'rgba(0,0,0,0.04)',
          position: 'relative', zIndex: 1, whiteSpace: 'nowrap', userSelect: 'none',
        }}>EDUSYNC</div>
      </div>
    </footer>
  );
}
