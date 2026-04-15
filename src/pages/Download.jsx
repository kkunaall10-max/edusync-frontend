import React from 'react';
import LandingLayout from '../components/landing/LandingLayout';
import { C } from '../components/landing/tokens';
import { motion } from 'framer-motion';

const fade = (d=0) => ({initial:{opacity:0,y:20},whileInView:{opacity:1,y:0},viewport:{once:true},transition:{delay:d,duration:.6}});

export default function Download() {
  return (
    <LandingLayout>
      <section style={{ background: C.bg, padding: '100px 48px', textAlign: 'center' }}>
        <motion.div {...fade()}>
          <div style={{ display: 'inline-block', background: `${C.blue}12`, border: `1px solid ${C.blue}25`, borderRadius: 100, padding: '5px 18px', fontSize: 11, fontWeight: 700, color: C.blue, letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: C.sans, marginBottom: 20 }}>Download</div>
          <h1 style={{ fontFamily: C.serif, fontSize: 'clamp(36px,5vw,64px)', color: C.text, lineHeight: 1.1, marginBottom: 16 }}>Get EduSync on your device.</h1>
          <p style={{ fontSize: 17, color: C.muted, maxWidth: 520, margin: '0 auto 56px', fontFamily: C.sans, lineHeight: 1.7 }}>
            Download the EduSync app to get instant access to attendance, fees, homework and results on the go.
          </p>
        </motion.div>
      </section>

      <section style={{ background: C.white, padding: '64px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20, maxWidth: 800, margin: '0 auto' }}>
          {[
            { 
              title: 'Android App', 
              icon: '', 
              desc: 'Download for Android phones and tablets.',
              action: 'Download APK',
              link: 'https://github.com/iiblamekunal/edusync-mobile/releases' 
            },
            { 
              title: 'Web Version', 
              icon: '', 
              desc: 'Access EduSync from any web browser.',
              action: 'Open Web App',
              link: 'https://edusync-frontend-beta.vercel.app/' 
            },
          ].map((item, i) => (
            <motion.div key={item.title} {...fade(.1+i*.08)}
              style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 22, padding: 32, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>{item.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.text, fontFamily: C.sans, marginBottom: 8 }}>{item.title}</div>
              <p style={{ fontSize: 14, color: C.muted, fontFamily: C.sans, lineHeight: 1.65, marginBottom: 24, flex: 1 }}>{item.desc}</p>
              <button onClick={() => window.open(item.link, '_blank')}
                style={{ background: C.blue, color: '#fff', border: 'none', borderRadius: 12, padding: '12px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: C.sans, transition: 'opacity .2s, transform .15s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity='.88'; e.currentTarget.style.transform='scale(1.02)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.transform='scale(1)'; }}
              >{item.action} →</button>
            </motion.div>
          ))}
        </div>
      </section>

      <section style={{ background: C.bg, padding: '80px 48px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: C.serif, fontSize: 'clamp(28px,3.5vw,40px)', color: C.text, marginBottom: 16 }}>Questions?</h2>
        <p style={{ fontSize: 15, color: C.muted, fontFamily: C.sans, marginBottom: 32 }}>Check our FAQ or contact support for help.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => window.location.href = '/faq'}
            style={{ background: C.blue, color: '#fff', border: 'none', borderRadius: 980, padding: '14px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: C.sans, transition: 'background .22s, transform .18s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#0055b3'; e.currentTarget.style.transform = 'scale(1.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.blue; e.currentTarget.style.transform = 'scale(1)'; }}
          >View FAQ</button>
          <button onClick={() => window.location.href = '/contact'}
            style={{ background: 'transparent', color: C.blue, border: `1.5px solid ${C.blue}`, borderRadius: 980, padding: '13px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: C.sans, transition: 'background .22s, color .22s, transform .18s' }}
            onMouseEnter={e => { e.currentTarget.style.background = C.blue; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'scale(1.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.blue; e.currentTarget.style.transform = 'scale(1)'; }}
          >Contact Us</button>
        </div>
      </section>
    </LandingLayout>
  );
}
