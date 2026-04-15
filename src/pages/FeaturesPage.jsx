import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LandingLayout from '../components/landing/LandingLayout';
import { C } from '../components/landing/tokens';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay, duration: .6, ease: 'easeOut' },
});

const portals = [
  {
    id: 'principal', tag: 'PRINCIPAL', color: '#0071e3', icon: '️',
    title: 'Complete Command Centre',
    desc: 'Everything a school principal needs to run a modern institution — in one powerful dashboard.',
    features: ['Real-time stats dashboard','Full student CRUD management','Teacher & class assignment','Fee tracking + auto receipts','4-type report generation','Announcement broadcasts','Leave request oversight','Attendance alert system'],
  },
  {
    id: 'teacher', tag: 'TEACHER', color: '#34c759', icon: '‍',
    title: 'Digital Classroom',
    desc: 'One-click attendance, instant marks entry, and homework tracking — built for how teachers actually work.',
    features: ['One-click P/A/L attendance','Class-locked security','Bulk marks entry system','Homework with due dates','Leave submission + tracking','Performance analytics charts','Student status grid','Achievement badge system'],
    featured: true,
  },
  {
    id: 'parent', tag: 'PARENT', color: '#5e5ce6', icon: '‍‍',
    title: 'Stay Connected',
    desc: 'Parents get real-time visibility into attendance, fees, homework, and marks — via web or Android app.',
    features: ['Auto-fetch child by email','30-day attendance calendar','Fee status with history','Recent homework view','Latest marks & grades','PDF report card download','Leave application submit','Android parent app'],
  },
];

const extras = [
  { icon: '', title: 'Reports Engine', desc: 'Generate attendance, fee, marks and class reports as PDF or Excel in seconds.', tag: 'ANALYTICS' },
  { icon: '', title: 'Announcements', desc: 'Broadcast notices to all teachers or parents instantly from the principal dashboard.', tag: 'COMMUNICATION' },
  { icon: '', title: 'Android App', desc: 'A dedicated parent app with Lottie animations, PDF download, and offline-ready data.', tag: 'MOBILE' },
  { icon: '', title: 'Role Security', desc: 'Row-level security — principals, teachers, and parents each see only what they should.', tag: 'SECURITY' },
  { icon: '', title: 'Leave System', desc: 'Teachers submit leaves, principals approve, and attendance auto-updates on approval.', tag: 'WORKFLOW' },
  { icon: '', title: 'Achievement Badges', desc: 'Teachers award badges to students — visible in the parent app in real time.', tag: 'ENGAGEMENT' },
];

export default function Features() {
  const navigate = useNavigate();
  const [hov, setHov] = useState(null);

  return (
    <LandingLayout>
      {/* Hero */}
      <section style={{ background: C.bg, padding: '80px 48px 60px', textAlign: 'center' }}>
        <motion.div {...fade()}>
          <div style={{ display: 'inline-block', background: `${C.blue}12`, border: `1px solid ${C.blue}25`, borderRadius: 100, padding: '5px 18px', fontSize: 11, fontWeight: 700, color: C.blue, letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: C.sans, marginBottom: 20 }}>Features</div>
          <h1 style={{ fontFamily: C.serif, fontSize: 'clamp(36px,5vw,64px)', color: C.text, lineHeight: 1.1, marginBottom: 20 }}>
            One platform.<br/>Every stakeholder.
          </h1>
          <p style={{ fontSize: 17, color: C.muted, maxWidth: 560, margin: '0 auto 36px', fontFamily: C.sans, lineHeight: 1.7 }}>
            EduSync covers every role in your school — Principal, Teacher, and Parent — with dedicated portals and a native Android app.
          </p>
          <button onClick={() => navigate('/download')}
            style={{ background: C.blue, color: '#fff', border: 'none', borderRadius: 980, padding: '14px 32px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: C.sans, boxShadow: `0 4px 16px ${C.blue}33`, transition: 'background .2s, transform .15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = C.blueHov; e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.blue; e.currentTarget.style.transform = 'scale(1)'; }}
          >Get EduSync Now</button>
        </motion.div>
      </section>

      {/* Portal Cards */}
      <section style={{ background: C.white, padding: '80px 48px' }}>
        <motion.h2 {...fade()} style={{ fontFamily: C.serif, fontSize: 'clamp(28px,4vw,48px)', color: C.text, textAlign: 'center', marginBottom: 52 }}>Three portals. One school.</motion.h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20, maxWidth: 1060, margin: '0 auto' }}>
          {portals.map((p, i) => (
            <motion.div key={p.id} {...fade(.1 + i * .08)}
              style={{ background: C.white, border: `1.5px solid ${p.featured ? p.color : C.border}`, borderRadius: 22, padding: 32, position: 'relative', boxShadow: p.featured ? `0 4px 28px ${p.color}18` : `0 2px 12px rgba(0,0,0,0.04)` }}>
              {p.featured && (
                <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: p.color, color: '#fff', borderRadius: 100, padding: '3px 14px', fontSize: 10, fontWeight: 700, fontFamily: C.sans, letterSpacing: '1px', whiteSpace: 'nowrap' }}>MOST POPULAR</div>
              )}
              <div style={{ fontSize: 36, marginBottom: 12 }}>{p.icon}</div>
              <div style={{ display: 'inline-block', background: `${p.color}12`, border: `1px solid ${p.color}25`, borderRadius: 100, padding: '3px 12px', fontSize: 10, fontWeight: 700, color: p.color, letterSpacing: '2px', textTransform: 'uppercase', fontFamily: C.sans, marginBottom: 12 }}>{p.tag}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.text, fontFamily: C.sans, marginBottom: 8 }}>{p.title}</div>
              <p style={{ fontSize: 13, color: C.muted, fontFamily: C.sans, lineHeight: 1.6, marginBottom: 20 }}>{p.desc}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {p.features.map(f => (
                  <div key={f} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                      <circle cx="8" cy="8" r="8" fill={p.color} fillOpacity=".1"/>
                      <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke={p.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{ fontSize: 13, color: C.muted, fontFamily: C.sans, lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Extra Features */}
      <section style={{ background: C.bg, padding: '80px 48px' }}>
        <motion.h2 {...fade()} style={{ fontFamily: C.serif, fontSize: 'clamp(28px,4vw,48px)', color: C.text, textAlign: 'center', marginBottom: 52 }}>More built-in tools</motion.h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16, maxWidth: 1060, margin: '0 auto' }}>
          {extras.map((e, i) => (
            <motion.div key={e.title} {...fade(.1 + i * .06)}
              onMouseEnter={() => setHov(e.title)} onMouseLeave={() => setHov(null)}
              style={{ background: C.white, border: `1px solid ${hov === e.title ? C.blue : C.border}`, borderRadius: 16, padding: 24, cursor: 'default', transition: 'border-color .2s, box-shadow .2s', boxShadow: hov === e.title ? `0 4px 20px ${C.blue}10` : 'none' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{e.icon}</div>
              <div style={{ display: 'inline-block', background: `${C.blue}10`, borderRadius: 6, padding: '2px 8px', fontSize: 9, fontWeight: 700, color: C.blue, letterSpacing: '1px', fontFamily: C.sans, marginBottom: 8 }}>{e.tag}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: C.sans, marginBottom: 6 }}>{e.title}</div>
              <p style={{ fontSize: 13, color: C.muted, fontFamily: C.sans, lineHeight: 1.65 }}>{e.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: `linear-gradient(160deg,#003d82,#0055c4,${C.blue})`, padding: '80px 48px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: C.serif, fontSize: 'clamp(28px,4vw,48px)', color: '#fff', marginBottom: 16 }}>Ready to transform your school?</h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.72)', fontFamily: C.sans, marginBottom: 36 }}>Download EduSync and start managing your school digitally today.</p>
        <button onClick={() => navigate('/download')}
          style={{ background: '#fff', color: C.blue, border: 'none', borderRadius: 980, padding: '14px 36px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: C.sans, boxShadow: '0 6px 24px rgba(0,0,0,0.18)', transition: 'transform .15s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >Download Now →</button>
      </section>
    </LandingLayout>
  );
}
