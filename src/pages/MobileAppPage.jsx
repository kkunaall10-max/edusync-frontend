import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LandingLayout from '../components/landing/LandingLayout';
import { C } from '../components/landing/tokens';

const fade = (d=0) => ({initial:{opacity:0,y:24},whileInView:{opacity:1,y:0},viewport:{once:true},transition:{delay:d,duration:.6,ease:'easeOut'}});

const screens = [
  {n:'1',title:'Splash Screen',desc:'Lottie animation on launch — smooth, branded, instant.'},
  {n:'2',title:'Secure Login',desc:'Parent email login powered by Supabase Auth.'},
  {n:'3',title:'Dashboard',desc:'Child\'s name, class, section, recent highlights.'},
  {n:'4',title:'Attendance',desc:'30-day calendar — Present, Absent, Late color-coded.'},
  {n:'5',title:'Fees',desc:'Fee card with Paid / Pending / Overdue status.'},
  {n:'6',title:'Homework',desc:'Due-date badges, subject tags, description.'},
  {n:'7',title:'Marks',desc:'Subject-wise marks with grade badge (A+ to F).'},
  {n:'8',title:'Report Card',desc:'Tap to generate & download full PDF report card.'},
];

const tech = ['React Native (Expo)','Supabase Auth & DB','Lottie Animations','PDF Generation','AsyncStorage Cache','React Navigation','Environment Config','Railway API Backend'];

export default function MobileAppPage() {
  const navigate = useNavigate();
  return (
    <LandingLayout>
      {/* Hero */}
      <section style={{ background: C.bg, padding: '80px 48px 60px', textAlign: 'center' }}>
        <motion.div {...fade()}>
          <div style={{ display: 'inline-block', background: 'rgba(52,199,89,0.1)', border: '1px solid rgba(52,199,89,0.25)', borderRadius: 100, padding: '5px 18px', fontSize: 11, fontWeight: 700, color: '#34c759', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: C.sans, marginBottom: 20 }}>Android App</div>
          <h1 style={{ fontFamily: C.serif, fontSize: 'clamp(36px,5vw,64px)', color: C.text, lineHeight: 1.1, marginBottom: 20 }}>
            Your child's school.<br/>In your pocket.
          </h1>
          <p style={{ fontSize: 17, color: C.muted, maxWidth: 560, margin: '0 auto 36px', fontFamily: C.sans, lineHeight: 1.7 }}>
            The EduSync parent app brings attendance, fees, homework and marks to your Android phone — with a beautiful native experience.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/download')}
              style={{ background: C.blue, color: '#fff', border: 'none', borderRadius: 980, padding: '14px 32px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: C.sans, boxShadow: `0 4px 16px ${C.blue}33`, transition: 'background .2s, transform .15s' }}
              onMouseEnter={e => { e.currentTarget.style.background=C.blueHov; e.currentTarget.style.transform='scale(1.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.background=C.blue; e.currentTarget.style.transform='scale(1)'; }}
            >Download APK</button>
            <button onClick={() => window.open('https://edusync-frontend-beta.vercel.app')}
              style={{ background: 'transparent', color: C.blue, border: `1.5px solid ${C.blue}`, borderRadius: 980, padding: '14px 32px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: C.sans, transition: 'background .2s, transform .15s' }}
              onMouseEnter={e => { e.currentTarget.style.background=`${C.blue}0e`; e.currentTarget.style.transform='scale(1.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='scale(1)'; }}
            >Try Web Version</button>
          </div>
        </motion.div>
      </section>

      {/* Screens grid */}
      <section style={{ background: C.white, padding: '80px 48px' }}>
        <motion.h2 {...fade()} style={{ fontFamily: C.serif, fontSize: 'clamp(28px,4vw,48px)', color: C.text, textAlign: 'center', marginBottom: 52 }}>8 screens. Complete experience.</motion.h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16, maxWidth: 1000, margin: '0 auto' }}>
          {screens.map((s, i) => (
            <motion.div key={s.n} {...fade(.06*i)}
              style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 20px' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff', fontFamily: C.sans, marginBottom: 12 }}>{s.n}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: C.sans, marginBottom: 5 }}>{s.title}</div>
              <p style={{ fontSize: 12, color: C.muted, fontFamily: C.sans, lineHeight: 1.6 }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tech stack + stats */}
      <section style={{ background: C.bg, padding: '80px 48px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: 60, flexWrap: 'wrap' }}>
          <motion.div {...fade(.1)} style={{ flex: '1 1 300px' }}>
            <h2 style={{ fontFamily: C.serif, fontSize: 'clamp(24px,3.5vw,40px)', color: C.text, marginBottom: 20 }}>Built with modern tech</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {tech.map(t => (
                <div key={t} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 100, padding: '6px 14px', fontSize: 12, color: C.muted, fontFamily: C.sans }}>{t}</div>
              ))}
            </div>
          </motion.div>
          <motion.div {...fade(.2)} style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[['8','Complete screens'],['1','APK file'],['100%','Free for parents'],['Android','Platform']].map(([n,l]) => (
              <div key={l} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: C.blue, fontFamily: C.sans, minWidth: 48 }}>{n}</div>
                <div style={{ fontSize: 13, color: C.muted, fontFamily: C.sans }}>{l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Key features */}
      <section style={{ background: C.white, padding: '80px 48px' }}>
        <motion.h2 {...fade()} style={{ fontFamily: C.serif, fontSize: 'clamp(24px,3.5vw,40px)', color: C.text, textAlign: 'center', marginBottom: 48 }}>What makes it special</motion.h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16, maxWidth: 900, margin: '0 auto' }}>
          {[
            {icon:'',title:'Glassmorphism UI',desc:'Beautiful frosted glass cards with smooth dark theme throughout the app.'},
            {icon:'',title:'Lottie Animations',desc:'Smooth animated splash screen and loading states for a polished native feel.'},
            {icon:'',title:'PDF Report Cards',desc:'One tap to generate a full academic report card and share it instantly.'},
            {icon:'',title:'Real-time Data',desc:'Data syncs with the same backend as the web portal — always live and accurate.'},
          ].map((f,i) => (
            <motion.div key={f.title} {...fade(.08*i)}
              style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: C.sans, marginBottom: 6 }}>{f.title}</div>
              <p style={{ fontSize: 13, color: C.muted, fontFamily: C.sans, lineHeight: 1.65 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </LandingLayout>
  );
}
