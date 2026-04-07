import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LandingLayout from '../components/landing/LandingLayout';
import { C } from '../components/landing/tokens';

const team = [
  { name: 'Kunal', role: 'Founder & Developer', emoji: '‍', desc: 'Full-stack developer passionate about ed-tech. Built EduSync from scratch with modern web technologies.' },
];

const values = [
  { icon: '', title: 'Student First', desc: 'Every feature is designed with students and parents in mind, making school life simpler and more transparent.' },
  { icon: '', title: 'Speed Matters', desc: 'No bloated UI, no lag. EduSync is engineered for speed — one-click actions, instant data, zero friction.' },
  { icon: '', title: 'Trust & Privacy', desc: 'Your school data is yours. We use enterprise encryption and never share data with third parties.' },
  { icon: '', title: 'School-Centric', desc: 'Built by someone who understands Indian schools — their workflows, their constraints, their needs.' },
];

const milestones = [
  { year: '2025', event: 'EduSync concept born from real teacher feedback at DAV Centenary Public School.' },
  { year: 'Jan 2026', event: 'Principal portal launched with attendance, fees and student management.' },
  { year: 'Feb 2026', event: 'Teacher portal and parent portal shipped. Mobile app released on Android.' },
  { year: 'Mar 2026', event: 'Reports, announcements and leave management system deployed.' },
  { year: 'Apr 2026', event: 'Full platform live at edusync-frontend-beta.vercel.app.' },
];

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay, duration: .6, ease: 'easeOut' },
});

export default function About() {
  const navigate = useNavigate();
  return (
    <LandingLayout>
      {/* Hero */}
      <section style={{ background: C.bg, padding: '80px 48px 60px', textAlign: 'center' }}>
        <motion.div {...fade()}>
          <div style={{ display: 'inline-block', background: `${C.blue}12`, border: `1px solid ${C.blue}25`, borderRadius: 100, padding: '5px 18px', fontSize: 11, fontWeight: 700, color: C.blue, letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: C.sans, marginBottom: 20 }}>Our Story</div>
          <h1 style={{ fontFamily: C.serif, fontSize: 'clamp(36px,5vw,64px)', color: C.text, lineHeight: 1.1, marginBottom: 20 }}>
            We build software<br/>that schools deserve.
          </h1>
          <p style={{ fontSize: 17, color: C.muted, maxWidth: 560, margin: '0 auto 36px', fontFamily: C.sans, lineHeight: 1.7 }}>
            EduSync started from a simple frustration: schools were drowning in paperwork while powerful software existed everywhere else. We decided to change that.
          </p>
          <button onClick={() => navigate('/contact')}
            style={{ background: C.blue, color: '#fff', border: 'none', borderRadius: 980, padding: '14px 32px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: C.sans, boxShadow: `0 4px 16px ${C.blue}33`, transition: 'background .2s, transform .15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = C.blueHov; e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.blue; e.currentTarget.style.transform = 'scale(1)'; }}
          >Get in Touch</button>
        </motion.div>
      </section>

      {/* Mission */}
      <section style={{ background: C.white, padding: '80px 48px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: 60, flexWrap: 'wrap', alignItems: 'center' }}>
          <motion.div {...fade(.1)} style={{ flex: '1 1 340px' }}>
            <h2 style={{ fontFamily: C.serif, fontSize: 'clamp(28px,4vw,48px)', color: C.text, marginBottom: 16 }}>Our Mission</h2>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.8, fontFamily: C.sans, marginBottom: 16 }}>
              We believe every school — regardless of size or budget — deserves access to modern digital infrastructure. EduSync delivers enterprise-quality tools at a price that makes sense for Indian schools.
            </p>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.8, fontFamily: C.sans }}>
              Our goal is to give teachers back their time, give parents real-time visibility into their children's education, and give principals the analytics they need to run an outstanding school.
            </p>
          </motion.div>
          <motion.div {...fade(.2)} style={{ flex: '1 1 300px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[['3+','User Portals'],['25+','Core Features'],['100%','Cloud Uptime'],['24h','Setup Time']].map(([n,l]) => (
              <div key={l} style={{ background: C.bg, borderRadius: 16, padding: '24px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: C.blue, fontFamily: C.sans }}>{n}</div>
                <div style={{ fontSize: 12, color: C.muted, fontFamily: C.sans, marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section style={{ background: C.bg, padding: '80px 48px' }}>
        <motion.h2 {...fade()} style={{ fontFamily: C.serif, fontSize: 'clamp(28px,4vw,48px)', color: C.text, textAlign: 'center', marginBottom: 48 }}>What we stand for</motion.h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20, maxWidth: 960, margin: '0 auto' }}>
          {values.map((v, i) => (
            <motion.div key={v.title} {...fade(.1 + i * .08)}
              style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 20, padding: 28 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{v.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, fontFamily: C.sans, marginBottom: 8 }}>{v.title}</div>
              <p style={{ fontSize: 13, color: C.muted, fontFamily: C.sans, lineHeight: 1.7 }}>{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section style={{ background: C.white, padding: '80px 48px' }}>
        <motion.h2 {...fade()} style={{ fontFamily: C.serif, fontSize: 'clamp(28px,4vw,48px)', color: C.text, textAlign: 'center', marginBottom: 52 }}>How we got here</motion.h2>
        <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 20, top: 0, bottom: 0, width: 2, background: `${C.blue}18` }} />
          {milestones.map((m, i) => (
            <motion.div key={m.year} {...fade(.1 + i * .08)}
              style={{ display: 'flex', gap: 24, marginBottom: 32, paddingLeft: 16 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: C.blue, flexShrink: 0, marginTop: 6, boxShadow: `0 0 0 4px ${C.blue}20` }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.blue, fontFamily: C.sans, marginBottom: 4 }}>{m.year}</div>
                <p style={{ fontSize: 14, color: C.muted, fontFamily: C.sans, lineHeight: 1.7 }}>{m.event}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </LandingLayout>
  );
}
