import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import LandingNav from '../components/landing/LandingNav';
import LandingFooter from '../components/landing/LandingFooter';

/* ── DESIGN TOKENS ─────────────────────────────── */
const C = {
  white:   '#ffffff',
  bg:      '#f5f5f7',
  text:    '#1d1d1f',
  muted:   '#6e6e73',
  blue:    '#0071e3',
  blueHov: '#0077ed',
  border:  'rgba(0,0,0,0.08)',
  card:    '0 2px 20px rgba(0,0,0,0.06)',
  serif:   "'Instrument Serif', Georgia, serif",
  sans:    "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
};

/* ── HELPERS ─────────────────────────────────── */
const Pill = ({ children, color = C.blue }) => (
  <div style={{
    display:'inline-block', background:`${color}15`, border:`1px solid ${color}30`,
    borderRadius:100, padding:'5px 16px', fontSize:11, fontWeight:700, color,
    letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:20, fontFamily:C.sans,
  }}>{children}</div>
);

const Check = ({ color = C.blue }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{flexShrink:0,marginTop:2}}>
    <circle cx="8" cy="8" r="8" fill={color} fillOpacity=".12"/>
    <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Cross = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{flexShrink:0,marginTop:2}}>
    <circle cx="8" cy="8" r="8" fill="#ff3b30" fillOpacity=".1"/>
    <path d="M5 5l6 6M11 5l-6 6" stroke="#ff3b30" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const Star = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="#f59e0b">
    <path d="M8 1l1.8 5.5H15l-4.6 3.3 1.8 5.5L8 12l-4.2 3.3 1.8-5.5L1 6.5h5.2z"/>
  </svg>
);

/* ── PRIMARY BUTTON ──────────────────────────── */
function BtnPrimary({ children, onClick, style = {} }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: h ? C.blueHov : C.blue,
        color: '#fff',
        border: 'none', borderRadius: 980, padding: '14px 28px',
        fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: C.sans,
        transition: 'background .22s, transform .18s, box-shadow .22s',
        transform: h ? 'scale(1.06)' : 'scale(1)',
        boxShadow: h
          ? `0 8px 28px rgba(0,113,227,0.55), 0 2px 8px rgba(0,113,227,0.3)`
          : '0 4px 14px rgba(0,113,227,0.28)',
        letterSpacing: h ? '0.3px' : '0px',
        ...style,
      }}
    >{children}</button>
  );
}

/* ── GHOST BUTTON ────────────────────────────── */
function BtnGhost({ children, onClick, style = {} }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: h ? C.blue : 'transparent',
        color: h ? '#fff' : C.blue,
        border: `1.5px solid ${C.blue}`,
        borderRadius: 980, padding: '13px 28px',
        fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: C.sans,
        transition: 'background .22s, color .22s, transform .18s, box-shadow .22s',
        transform: h ? 'scale(1.06)' : 'scale(1)',
        boxShadow: h ? `0 8px 24px rgba(0,113,227,0.35)` : 'none',
        ...style,
      }}
    >{children}</button>
  );
}

/* ── NAVBAR ──────────────────────────────────── */
function Navbar({ navigate }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const links = ['Features','Mobile App','Security','FAQ'];

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <>
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:100,
        height:52, padding:'0 24px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        background: scrolled ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.72)',
        backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.1)' : '1px solid transparent',
        transition:'border-color .3s, background .3s',
      }}>
        <div style={{fontFamily:C.serif, fontSize:22, fontWeight:700, color:C.text, cursor:'pointer', letterSpacing:'-0.5px'}}
          onClick={() => window.scrollTo({top:0,behavior:'smooth'})}>EduSync</div>

        {/* Desktop nav */}
        <div className="hs-nav" style={{display:'flex', gap:28, alignItems:'center'}}>
          {links.map(l => (
            <a key={l} href={`#sec-${l.replace(' ','-').toLowerCase()}`}
              style={{fontSize:13, fontWeight:500, color:C.muted, textDecoration:'none', fontFamily:C.sans, transition:'color .2s'}}
              onMouseEnter={e => e.currentTarget.style.color = C.text}
              onMouseLeave={e => e.currentTarget.style.color = C.muted}
            >{l}</a>
          ))}
          <BtnPrimary onClick={() => navigate('/login')} style={{padding:'8px 20px', fontSize:13}}>Login</BtnPrimary>
        </div>

        {/* Hamburger */}
        <button className="hs-burger" onClick={() => setOpen(true)}
          style={{display:'none', background:'none', border:'none', cursor:'pointer', flexDirection:'column', gap:5, padding:4}}>
          {[0,1,2].map(i => <span key={i} style={{display:'block',width:22,height:2,background:C.text,borderRadius:2}}/>)}
        </button>
      </nav>

      {open && (
        <div style={{
          position:'fixed', inset:0, zIndex:200,
          background:'rgba(255,255,255,0.97)', backdropFilter:'blur(20px)',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:36,
        }}>
          <button onClick={() => setOpen(false)}
            style={{position:'absolute', top:20, right:24, background:'none', border:'none', fontSize:26, cursor:'pointer', color:C.text}}></button>
          {links.map(l => (
            <a key={l} href={`#sec-${l.replace(' ','-').toLowerCase()}`} onClick={() => setOpen(false)}
              style={{fontSize:22, fontWeight:600, color:C.text, textDecoration:'none', fontFamily:C.sans}}>{l}</a>
          ))}
          <BtnPrimary onClick={() => { setOpen(false); navigate('/login'); }}>Login</BtnPrimary>
        </div>
      )}

      <style>{`
        @media(max-width:768px){ .hs-nav{display:none!important} .hs-burger{display:flex!important} }
        @media(max-width:768px){ section{padding:64px 20px!important} }
      `}</style>
    </>
  );
}

/* ── HERO ─────────────────────────────────────── */
function Hero({ navigate }) {
  return (
    <section style={{position:'relative', minHeight:'100vh', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center'}}>
      {/* Raw video — zero overlay */}
      <video autoPlay loop muted playsInline style={{
        position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', zIndex:0,
      }}>
        <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4" type="video/mp4"/>
      </video>

      {/* Transparent glass card — video visible through */}
      <div className="animate-fade-rise" style={{
        position: 'relative', zIndex: 2,
        background: 'rgba(0,0,0,0.18)',
        backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)',
        border: '1px solid rgba(255,255,255,0.18)',
        borderRadius: 28, padding: 'clamp(32px, 6vw, 52px) clamp(20px, 5vw, 48px)',
        maxWidth: 660, width: '90%', textAlign: 'center',
        boxShadow: '0 8px 48px rgba(0,0,0,0.28)',
      }}>
        <div style={{
          display: 'inline-block', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.35)',
          borderRadius: 100, padding: '5px 16px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.9)',
          letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 20, fontFamily: C.sans,
        }}>Smart School Management Platform</div>

        <h1 style={{
          fontFamily: C.serif, fontSize: 'clamp(40px,6vw,72px)',
          fontWeight: 400, color: '#ffffff', lineHeight: 1.05,
          letterSpacing: '-2px', marginBottom: 20,
          textShadow: '0 2px 24px rgba(0,0,0,0.4)',
        }}>
          Empowering Schools.<br/>
          <span style={{color:'#60b4ff'}}>Inspiring Futures.</span>
        </h1>

        <p style={{
          fontSize: 'clamp(15px,1.8vw,18px)', color: 'rgba(255,255,255,0.82)',
          lineHeight: 1.7, maxWidth: 480, margin: '0 auto 32px', fontFamily: C.sans,
          textShadow: '0 1px 8px rgba(0,0,0,0.3)',
        }}>
          A complete digital school management platform replacing paper registers, manual fee books, and WhatsApp chaos.
        </p>

        <div style={{display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap'}}>
          <BtnPrimary onClick={() => window.open('https://edusync-frontend-beta.vercel.app')}>See Live Demo</BtnPrimary>
          <BtnGhost onClick={() => navigate('/login')}>Login to Portal</BtnGhost>
          <BtnGhost onClick={() => navigate('/download')}>Download App</BtnGhost>
        </div>

        <div style={{display:'flex', gap:16, marginTop:36, justifyContent:'center', flexWrap:'wrap'}}>
          {[['3','User Portals'],['25+','Features Built'],['100%','Live & Deployed']].map(([n,l]) => (
            <div key={n} style={{textAlign:'center', padding:'0 16px', flex: '1 1 120px'}}>
              <div style={{fontSize:28, fontWeight:800, color:'#60b4ff', fontFamily:C.sans}}>{n}</div>
              <div style={{fontSize:11, color:'rgba(255,255,255,0.65)', fontWeight:500, letterSpacing:'0.5px', fontFamily:C.sans}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bounce arrow */}
      <div className="animate-bounce-y" style={{position:'absolute', bottom:28, left:'50%', transform:'translateX(-50%)', zIndex:2, color:'rgba(255,255,255,0.7)'}}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 4v16M6 14l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </section>
  );
}

/* ── PROBLEM / SOLUTION ──────────────────────── */
const problems = ['Paper attendance registers — slow, error-prone','Fee records in hand-written ledgers','Parents call teachers for basic updates','No central homework or results system','Report cards take days to prepare','No way to track consistently absent students','Teachers spend hours on admin work','Lost or damaged physical documents'];
const solutions = ['Digital attendance, one click, instant records','Automated fee tracking with auto-receipts','Parents see everything on phone in real time','Homework and results posted, seen instantly','Printable report cards in seconds','Smart alerts for attendance below 75%','Teachers focus on teaching, admin automated','All data secure on encrypted cloud servers'];

function ProblemSection() {
  return (
    <section id="sec-features" style={{background:C.bg, padding:'100px 48px'}}>
      <div style={{textAlign:'center', marginBottom:12}}><Pill>The Problem</Pill></div>
      <h2 style={{fontFamily:C.serif, fontSize:'clamp(32px,5vw,56px)', color:C.text, textAlign:'center', maxWidth:640, margin:'0 auto 14px'}}>
        Schools run on paperwork. We change that.
      </h2>
      <p style={{textAlign:'center', color:C.muted, maxWidth:520, margin:'0 auto 56px', fontFamily:C.sans, lineHeight:1.7}}>
        Every day, hundreds of hours are lost to manual registers, phone calls, and scattered Excel sheets.
      </p>
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:20, maxWidth:960, margin:'0 auto'}}>
        <div style={{background:C.white, border:'1px solid rgba(255,59,48,0.15)', borderRadius:20, padding:32, boxShadow:'0 2px 16px rgba(255,59,48,0.06)'}}>
          <div style={{fontSize:13, fontWeight:700, color:'#ff3b30', marginBottom:20, fontFamily:C.sans}}>Before EduSync</div>
          <div style={{display:'flex', flexDirection:'column', gap:12}}>
            {problems.map(t => <div key={t} style={{display:'flex',gap:10,alignItems:'flex-start'}}><Cross/><span style={{fontSize:14,color:C.muted,fontFamily:C.sans,lineHeight:1.6}}>{t}</span></div>)}
          </div>
        </div>
        <div style={{background:C.white, border:`1px solid ${C.blue}20`, borderRadius:20, padding:32, boxShadow:`0 2px 16px ${C.blue}08`}}>
          <div style={{fontSize:13, fontWeight:700, color:C.blue, marginBottom:20, fontFamily:C.sans}}>After EduSync</div>
          <div style={{display:'flex', flexDirection:'column', gap:12}}>
            {solutions.map(t => <div key={t} style={{display:'flex',gap:10,alignItems:'flex-start'}}><Check color={C.blue}/><span style={{fontSize:14,color:C.muted,fontFamily:C.sans,lineHeight:1.6}}>{t}</span></div>)}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── FEATURES ─────────────────────────────────── */
const portals = [
  { id:'principal', label:'PRINCIPAL', color:'#0071e3', title:'Complete Command Centre',
    features:['Live dashboard with real stats','Full student management (CRUD)','Teacher assignment system','Fee tracking + auto receipts','4-type report generation','Announcement broadcasts','Leave request oversight','Attendance alerts'],
    note:'Professional white interface — works on any browser', featured:false },
  { id:'teacher', label:'TEACHER', color:'#34c759', title:'Digital Classroom',
    features:['One-click P/A/L attendance marking','Class locked — no cross-access','Bulk marks entry for entire class','Homework with due dates','Leave approval + auto-attendance','Performance analytics charts','Student status grid view','Achievement badge awarding'],
    note:'Glassmorphism UI on nature background', featured:true },
  { id:'parent', label:'PARENT', color:'#5e5ce6', title:'Stay Connected',
    features:['Auto-fetch child by parent email','30-day attendance tracking','Fee status — paid/pending/overdue','Recent homework assignments','Latest exam results + grades','PDF report card download','Leave application submission','Mobile app for Android'],
    note:'Website + dedicated Android app', featured:false },
];

function FeaturesSection() {
  return (
    <section style={{background:C.white, padding:'100px 48px'}}>
      <div style={{textAlign:'center', marginBottom:12}}><Pill>Features</Pill></div>
      <h2 style={{fontFamily:C.serif, fontSize:'clamp(32px,5vw,56px)', color:C.text, textAlign:'center', marginBottom:56}}>
        One platform. Every stakeholder.
      </h2>
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20, maxWidth:1080, margin:'0 auto'}}>
        {portals.map(p => (
          <div key={p.id} style={{
            background:C.white, border:`1px solid ${p.color}20`,
            borderRadius:22, padding:36, position:'relative',
            boxShadow:`0 4px 24px ${p.color}10`,
            display:'flex', flexDirection:'column',
          }}>
            {p.featured && <div style={{position:'absolute',top:-13,left:'50%',transform:'translateX(-50%)',background:p.color,color:'#fff',borderRadius:100,padding:'3px 14px',fontSize:10,fontWeight:700,fontFamily:C.sans,letterSpacing:'1px'}}>MOST POPULAR</div>}
            <div style={{display:'inline-block',background:`${p.color}12`,border:`1px solid ${p.color}25`,borderRadius:100,padding:'3px 12px',fontSize:10,fontWeight:700,color:p.color,letterSpacing:'2px',textTransform:'uppercase',fontFamily:C.sans,marginBottom:14,alignSelf:'flex-start'}}>{p.label}</div>
            <div style={{fontSize:20,fontWeight:700,color:C.text,marginBottom:14,fontFamily:C.sans}}>{p.title}</div>
            <div style={{display:'flex',flexDirection:'column',gap:10,flex:1}}>
              {p.features.map(f => <div key={f} style={{display:'flex',gap:9,alignItems:'flex-start'}}><Check color={p.color}/><span style={{fontSize:13,color:C.muted,fontFamily:C.sans,lineHeight:1.5}}>{f}</span></div>)}
            </div>
            <div style={{marginTop:20,fontSize:11,color:'#aaa',fontFamily:C.sans,fontStyle:'italic'}}>{p.note}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── MAGIC TEXT ───────────────────────────────── */
const magicWords = "EduSync replaces 3 hours of daily paperwork with 15 minutes of smart digital management — giving teachers time to teach and parents peace of mind.".split(' ');

function MagicWord({ scrollYProgress, index, total, word }) {
  const opacity = useTransform(scrollYProgress, [index/total, Math.min((index+1)/total,1)], [0.15, 1]);
  const col = useTransform(scrollYProgress, [index/total, Math.min((index+1)/total,1)], [C.muted, C.text]);
  return <motion.span style={{opacity, color:col}}>{word}{' '}</motion.span>;
}

function MagicText() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target:ref, offset:['start 0.85','end 0.25'] });
  return (
    <section ref={ref} style={{background:C.bg, padding:'100px 48px', textAlign:'center'}}>
      <div style={{maxWidth:820, margin:'0 auto'}}>
        <p style={{fontSize:'clamp(22px,3.5vw,36px)', fontFamily:C.serif, lineHeight:1.5, display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'0 8px'}}>
          {magicWords.map((w,i) => <MagicWord key={i} scrollYProgress={scrollYProgress} index={i} total={magicWords.length} word={w}/>)}
        </p>
      </div>
    </section>
  );
}

/* ── MOBILE APP ───────────────────────────────── */
const screens = [{num:1,name:'Splash',desc:'Animated welcome'},{num:2,name:'Login',desc:'Secure access'},{num:3,name:'Dashboard',desc:'Child overview'},{num:4,name:'Attendance',desc:'Monthly tracking'},{num:5,name:'Fees',desc:'Paid/Pending/Overdue'},{num:6,name:'Homework',desc:'Due date badges'},{num:7,name:'Marks',desc:'Grades + PDF'}];

function MobileApp() {
  return (
    <section id="sec-mobile-app" style={{background:C.white, padding:'100px 48px'}}>
      <div style={{textAlign:'center', marginBottom:12}}><Pill color="#34c759">Mobile App</Pill></div>
      <h2 style={{fontFamily:C.serif, fontSize:'clamp(32px,5vw,56px)', color:C.text, textAlign:'center', marginBottom:14}}>
        Your child's school. In your pocket.
      </h2>
      <p style={{textAlign:'center', color:C.muted, maxWidth:520, margin:'0 auto 56px', fontFamily:C.sans, lineHeight:1.7}}>
        The EduSync parent app gives instant access to attendance, fees, homework and results — anytime.
      </p>
      <div style={{display:'flex', gap:48, maxWidth:1060, margin:'0 auto', flexWrap:'wrap', alignItems:'flex-start'}}>
        <div style={{flex:'1 1 380px'}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
            {screens.map(s => (
              <div key={s.num} style={{background:C.bg, border:`1px solid ${C.border}`, borderRadius:14, padding:16}}>
                <div style={{fontSize:18,fontWeight:800,color:C.blue,fontFamily:C.sans}}>{s.num}</div>
                <div style={{fontSize:13,fontWeight:700,color:C.text,fontFamily:C.sans,marginTop:4}}>{s.name}</div>
                <div style={{fontSize:11,color:C.muted,fontFamily:C.sans,marginTop:2}}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{flex:'1 1 260px', paddingTop:8}}>
          <div style={{fontSize:64,fontWeight:800,color:C.blue,fontFamily:C.sans,lineHeight:1}}>7</div>
          <div style={{fontSize:18,fontWeight:600,color:C.text,fontFamily:C.sans,marginBottom:24}}>Complete parent experience</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:28}}>
            {['Lottie splash animation','PDF report card download','Grade badges A+ to F','Share via WhatsApp','Glassmorphism UI','Works on any Android'].map(p => (
              <div key={p} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:100,padding:'5px 14px',fontSize:12,color:C.muted,fontFamily:C.sans}}>{p}</div>
            ))}
          </div>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(52,199,89,0.1)',border:'1px solid rgba(52,199,89,0.3)',borderRadius:100,padding:'8px 20px',color:'#34c759',fontSize:13,fontWeight:600,fontFamily:C.sans}}>
            Android APK Available
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── HOW IT WORKS ─────────────────────────────── */
const steps = [
  {num:'01',title:'School Setup',desc:'We configure your school account, add teachers and students, and provide login credentials. Zero technical knowledge required.'},
  {num:'02',title:'Team Onboarded',desc:'Principal gets full dashboard. Teachers mark their first attendance. Parents download the app and see their child\'s data instantly.'},
  {num:'03',title:'School Goes Digital',desc:'Attendance, fees, homework, marks and reports — all digital from day one. Your school operates at a new level of efficiency.'},
];

function HowItWorks() {
  return (
    <section style={{background:C.bg, padding:'100px 48px'}}>
      <div style={{textAlign:'center', marginBottom:12}}><Pill>How It Works</Pill></div>
      <h2 style={{fontFamily:C.serif, fontSize:'clamp(32px,5vw,56px)', color:C.text, textAlign:'center', marginBottom:60}}>Up and running in 24 hours.</h2>
      <div style={{maxWidth:860, margin:'0 auto', display:'flex', gap:0, flexWrap:'wrap', justifyContent:'center', position:'relative'}}>
        {steps.map((s,i) => (
          <div key={s.num} style={{textAlign:'center',flex:'1 1 220px',padding:'0 20px',position:'relative'}}>
            <div style={{width:52,height:52,borderRadius:'50%',background:C.blue,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:800,color:'#fff',fontFamily:C.sans,margin:'0 auto 20px',boxShadow:`0 4px 16px ${C.blue}40`}}>{s.num}</div>
            {i < steps.length-1 && <div className="hs-nav" style={{position:'absolute',top:25,left:'calc(50% + 26px)',width:'calc(100% - 52px)',height:2,background:`${C.blue}25`}}/>}
            <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:10,fontFamily:C.sans}}>{s.title}</div>
            <p style={{fontSize:13,color:C.muted,fontFamily:C.sans,lineHeight:1.7,maxWidth:240,margin:'0 auto'}}>{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── TESTIMONIALS ──────────────────────────────── */
const reviews = [
  {q:'Finally, attendance takes 2 minutes instead of 20. My teachers are happier and parents stop calling to ask for updates.',name:'School Principal',role:'DAV Centenary Public School'},
  {q:"I can see my daughter's attendance, homework and marks from my phone. EduSync keeps me connected to her school life.",name:'Parent',role:"Class 11 Student's Mother"},
  {q:'Marking attendance for 40 students used to take 15 minutes with a register. Now it takes 90 seconds. Remarkable.',name:'Class Teacher',role:'Senior Educator'},
];

function Testimonials() {
  return (
    <section style={{background:C.white, padding:'100px 48px'}}>
      <h2 style={{fontFamily:C.serif, fontSize:'clamp(32px,5vw,56px)', color:C.text, textAlign:'center', marginBottom:56}}>What school staff say</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:20,maxWidth:1060,margin:'0 auto'}}>
        {reviews.map((r,i) => (
          <div key={i} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:20,padding:30}}>
            <div style={{display:'flex',gap:3,marginBottom:16}}>{[1,2,3,4,5].map(n=><Star key={n}/>)}</div>
            <p style={{fontSize:15,color:C.text,fontFamily:C.sans,lineHeight:1.7,marginBottom:20}}>"{r.q}"</p>
            <div style={{fontSize:14,fontWeight:700,color:C.text,fontFamily:C.sans}}>{r.name}</div>
            <div style={{fontSize:12,color:C.muted,fontFamily:C.sans,marginTop:2}}>{r.role}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── SECURITY ──────────────────────────────────── */
const secCards = [
  {t:'Encrypted Database',d:'Supabase PostgreSQL with Row Level Security. Each user sees only their own data.'},
  {t:'Rate Limiting',d:'100 requests per 15 minutes per IP. Brute force attacks blocked automatically.'},
  {t:'Role-Based Access',d:'Principal, Teacher and Parent each have separate permissions at DB level.'},
  {t:'API Key Security',d:'All secrets in environment variables. Never in code. Never on GitHub.'},
  {t:'24/7 Cloud Uptime',d:'Frontend on Vercel, backend on Railway. Works even if school internet is down.'},
  {t:'Input Validation',d:'All inputs validated front and backend. SQL injection protection built in.'},
];

function Security() {
  return (
    <section id="sec-security" style={{background:C.bg, padding:'100px 48px'}}>
      <h2 style={{fontFamily:C.serif, fontSize:'clamp(32px,5vw,56px)', color:C.text, textAlign:'center', marginBottom:56}}>Enterprise-grade security. Always.</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:16,maxWidth:1060,margin:'0 auto'}}>
        {secCards.map(c => (
          <div key={c.t} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:16,padding:26,boxShadow:C.card}}>
            <div style={{marginBottom:12}}>
              <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="14" fill={`${C.blue}12`}/>
                <path d="M8.5 14l4 4 7-7" stroke={C.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{fontSize:15,fontWeight:700,color:C.text,fontFamily:C.sans,marginBottom:7}}>{c.t}</div>
            <p style={{fontSize:13,color:C.muted,fontFamily:C.sans,lineHeight:1.65}}>{c.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── FAQ ───────────────────────────────────────── */
const faqs = [
  {q:'Do teachers need to install any software?',a:'No. EduSync works in any web browser — Chrome, Firefox, Edge, Safari. No downloads, no installations.'},
  {q:'What happens to existing student data?',a:'We help migrate your existing student list during setup. Bring your Excel file and we handle the rest within 24 hours.'},
  {q:'Is the parent app free for parents?',a:'Yes. Parents download the app and use it for free. The school pays the subscription, parents get free access.'},
  {q:"Can a teacher see another class's data?",a:"No. Teachers are locked to their assigned class at the database level. It is technically impossible to access another class."},
  {q:'What if the internet goes down at school?',a:'EduSync is cloud-hosted. It works from any internet connection — mobile data, home WiFi, or school network.'},
  {q:'Is student data safe and private?',a:"Yes. All data is encrypted on Supabase with Row Level Security. No parent can ever see another child's records."},
  {q:'Can we get a free demo before deciding?',a:'Absolutely. Visit edusync-frontend-beta.vercel.app right now — full demo live with sample data, no account needed.'},
  {q:'How long does setup take?',a:'Under 24 hours from first contact. We configure everything, create accounts, and train your staff in one session.'},
];

function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <section id="sec-faq" style={{background:C.white, padding:'100px 48px'}}>
      <div style={{maxWidth:740, margin:'0 auto'}}>
        <h2 style={{fontFamily:C.serif, fontSize:'clamp(32px,5vw,56px)', color:C.text, textAlign:'center', marginBottom:48}}>Questions? We have answers.</h2>
        {faqs.map((f,i) => (
          <div key={i} style={{borderBottom:`1px solid ${C.border}`}}>
            <button onClick={() => setOpen(open===i?null:i)}
              style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'18px 0',background:'none',border:'none',cursor:'pointer',textAlign:'left'}}>
              <span style={{fontSize:15,fontWeight:600,color:C.text,fontFamily:C.sans}}>{f.q}</span>
              <span style={{color:C.blue,flexShrink:0,marginLeft:16,fontSize:20,transition:'transform .3s',display:'inline-block',transform:open===i?'rotate(45deg)':'rotate(0deg)'}}>+</span>
            </button>
            {open===i && (
              <div style={{paddingBottom:18}}>
                <p style={{fontSize:14,color:C.muted,fontFamily:C.sans,lineHeight:1.7}}>{f.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── FINAL CTA ─────────────────────────────────── */
function FinalCTA({ navigate }) {
  return (
    <section style={{background:`linear-gradient(160deg, #003d82 0%, #0055c4 50%, ${C.blue} 100%)`, padding:'108px 48px', textAlign:'center'}}>
      <div style={{display:'inline-block',background:'rgba(255,255,255,0.15)',borderRadius:100,padding:'5px 16px',fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.9)',letterSpacing:'1.5px',textTransform:'uppercase',marginBottom:20,fontFamily:C.sans}}>Get Started Today</div>
      <h2 style={{fontFamily:C.serif, fontSize:'clamp(36px,5.5vw,64px)', color:'#fff', marginBottom:20}}>Ready to transform your school?</h2>
      <p style={{fontSize:17,color:'rgba(255,255,255,0.75)',lineHeight:1.7,marginBottom:40,fontFamily:C.sans}}>
        Start your free 2-month trial today.<br/>No credit card. No contract. No risk.
      </p>
      <button onClick={() => navigate('/login')}
        style={{background:'#fff',color:C.blue,borderRadius:980,padding:'16px 40px',fontSize:16,fontWeight:700,border:'none',cursor:'pointer',fontFamily:C.sans,boxShadow:'0 8px 32px rgba(0,0,0,0.2)',transition:'transform .2s'}}
        onMouseEnter={e => e.currentTarget.style.transform='scale(1.03)'}
        onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
      >Get Started Free</button>
      <div style={{marginTop:16,fontSize:13,color:'rgba(255,255,255,0.5)',fontFamily:C.sans}}>or call +91 99965 84341 for a personal demo</div>
    </section>
  );
}

/* ── FOOTER ──────────────────────────────────── */
const footCols = [
  {h:'Platform',links:['Principal Portal','Teacher Portal','Parent Portal','Mobile App','Reports']},
  {h:'Company',links:['About','Security','FAQ','Contact']},
  {h:'Resources',links:['Support','Privacy Policy','Terms of Service']},
];
const socials = [
  {label:'GitHub',href:'#',icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>},
  {label:'LinkedIn',href:'#',icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>},
  {label:'Email',href:'mailto:kkunaall10@gmail.com',icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/></svg>},
];

function Footer() {
  return (
    <footer style={{background:C.bg, borderTop:`1px solid ${C.border}`, overflow:'hidden', position:'relative'}}>
      <div style={{maxWidth:1140, margin:'0 auto', padding:'60px 48px 0'}}>
        <div style={{display:'flex', flexWrap:'wrap', gap:40, justifyContent:'space-between', marginBottom:40}}>
          <motion.div
            initial={{opacity:0,y:-6,filter:'blur(4px)'}} whileInView={{opacity:1,y:0,filter:'blur(0px)'}}
            viewport={{once:true}} transition={{delay:.05,duration:.7}}
            style={{flex:'1 1 220px', maxWidth:280}}
          >
            <div style={{fontFamily:C.serif,fontSize:28,color:C.text,marginBottom:6}}>EduSync</div>
            <div style={{fontSize:13,color:C.muted,fontFamily:C.sans,marginBottom:18,lineHeight:1.7}}>Empowering Schools. Inspiring Futures.</div>
            <div style={{display:'flex',gap:10,marginBottom:18}}>
              {socials.map(s => (
                <a key={s.label} href={s.href} aria-label={s.label}
                  style={{display:'flex',alignItems:'center',justifyContent:'center',width:34,height:34,borderRadius:8,background:C.white,border:`1px solid ${C.border}`,color:C.muted,textDecoration:'none',transition:'color .2s,transform .2s'}}
                  onMouseEnter={e=>{e.currentTarget.style.color=C.blue;e.currentTarget.style.transform='scale(1.1)';}}
                  onMouseLeave={e=>{e.currentTarget.style.color=C.muted;e.currentTarget.style.transform='scale(1)';}}
                >{s.icon}</a>
              ))}
            </div>
            {['+91 99965 84341','kkunaall10@gmail.com'].map(c => (
              <div key={c} style={{display:'inline-block',marginRight:6,marginBottom:6,background:C.white,border:`1px solid ${C.border}`,borderRadius:100,padding:'4px 12px',fontSize:11,color:C.muted,fontFamily:C.sans}}>{c}</div>
            ))}
          </motion.div>
          <div style={{display:'flex',flexWrap:'wrap',gap:'36px 52px',flex:'1 1 350px',justifyContent:'flex-start'}}>
            {footCols.map((col,i) => (
              <motion.div key={col.h}
                initial={{opacity:0,y:-6,filter:'blur(4px)'}} whileInView={{opacity:1,y:0,filter:'blur(0px)'}}
                viewport={{once:true}} transition={{delay:.1+i*.1,duration:.7}}
              >
                <div style={{fontSize:11,fontWeight:700,color:C.muted,fontFamily:C.sans,letterSpacing:'1px',textTransform:'uppercase',marginBottom:14}}>{col.h}</div>
                {col.links.map(l => (
                  <a key={l} href="#"
                    style={{display:'block',fontSize:13,color:C.muted,textDecoration:'none',fontFamily:C.sans,marginBottom:9,transition:'color .2s'}}
                    onMouseEnter={e=>e.currentTarget.style.color=C.blue}
                    onMouseLeave={e=>e.currentTarget.style.color=C.muted}
                  >{l}</a>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
        <div style={{borderTop:`1px solid ${C.border}`,paddingTop:18,paddingBottom:18,display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:6}}>
          <span style={{fontSize:12,color:C.muted,fontFamily:C.sans}}>© 2026 EduSync. Built in India.</span>
          <span style={{fontSize:12,color:C.muted,fontFamily:C.sans}}>Made with dedication by Kunal</span>
        </div>
      </div>
      {/* Backdrop wordmark */}
      <div style={{position:'relative',pointerEvents:'none',textAlign:'center',overflow:'hidden',height:'clamp(60px,14vw,160px)'}}>
        <div style={{position:'absolute',inset:0,zIndex:2,background:`linear-gradient(to bottom, transparent 0%, ${C.bg} 100%)`}}/>
        <div style={{fontFamily:C.serif,fontSize:'clamp(56px,16vw,200px)',fontWeight:700,lineHeight:1,letterSpacing:'-4px',color:'rgba(0,0,0,0.05)',position:'relative',zIndex:1,whiteSpace:'nowrap',userSelect:'none'}}>EDUSYNC</div>
      </div>
    </footer>
  );
}

/* ── ROOT ─────────────────────────────────────── */
export default function Home() {
  const navigate = useNavigate();
  useEffect(() => {
    document.body.style.background = C.white;
    return () => { document.body.style.background = ''; };
  }, []);

  return (
    <div style={{overflowX:'hidden', background:C.white}}>
      <LandingNav />
      <div style={{paddingTop:52}}>
        <Hero navigate={navigate}/>
        <ProblemSection/>
        <FeaturesSection/>
        <MagicText/>
        <MobileApp/>
        <HowItWorks/>
        <Testimonials/>
        <Security/>
        <FAQ/>
        <FinalCTA navigate={navigate}/>
      </div>
      <LandingFooter />
    </div>
  );
}
