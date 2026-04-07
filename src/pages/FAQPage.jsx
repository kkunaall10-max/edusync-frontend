import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LandingLayout from '../components/landing/LandingLayout';
import { C } from '../components/landing/tokens';

const fade = (delay=0) => ({initial:{opacity:0,y:20},whileInView:{opacity:1,y:0},viewport:{once:true},transition:{delay,duration:.6,ease:'easeOut'}});

const faqs = [
  { cat: 'Setup', q: 'Do teachers need to install any software?', a: 'No. EduSync works entirely in any web browser — Chrome, Firefox, Edge, Safari. No downloads, no installations required.' },
  { cat: 'Setup', q: 'How long does the initial setup take?', a: 'Under 24 hours from first contact. We configure your account, create teacher logins, and train your team in one guided session.' },
  { cat: 'Data', q: 'What happens to existing student data?', a: 'Bring your Excel or CSV file and we migrate it for you within 24 hours — names, classes, roll numbers, parent details.' },
  { cat: 'Cost', q: 'Is the parent app free for parents?', a: 'Yes. Parents download the Android app and use it completely free. The school pays the subscription; parents get unlimited free access.' },
  { cat: 'Security', q: "Can a teacher see another class's data?", a: "Impossible. Teachers are locked to their assigned class at the database level using Supabase Row Level Security. There is no workaround." },
  { cat: 'Infra', q: 'What if the school internet goes down?', a: 'EduSync is cloud-hosted. Teachers can use it from mobile data, home WiFi, or anywhere. The platform is not dependent on the school network.' },
  { cat: 'Security', q: 'Is student data safe and private?', a: "Yes. All data is encrypted and stored on Supabase with Row Level Security. No parent can ever see another child's records." },
  { cat: 'Setup', q: 'Can we get a free demo before deciding?', a: 'Absolutely. Visit edusync-frontend-beta.vercel.app right now — the full live demo with sample data is available, no account needed.' },
  { cat: 'Cost', q: 'Is pricing fixed or negotiable?', a: 'Pricing is flexible and based on your school size and needs. Contact us and we will personalise a quote within 24 hours.' },
  { cat: 'Infra', q: 'Does EduSync work on phones?', a: 'Yes. The web portal is fully mobile-responsive. Additionally, a dedicated Android app exists for parents with a premium native experience.' },
  { cat: 'Data', q: 'Can we export our data if we leave?', a: 'Yes. All your student, attendance, fee and marks data can be exported as Excel or PDF at any time. Your data is always yours.' },
  { cat: 'Support', q: 'What kind of support is available?', a: 'We provide WhatsApp and email support. For school setup, we offer a dedicated onboarding call to get everyone trained and live.' },
];

const cats = ['All', ...new Set(faqs.map(f => f.cat))];

export default function FAQPage() {
  const navigate  = useNavigate();
  const [open, setOpen]  = useState(null);
  const [cat, setCat]    = useState('All');
  const filtered = cat === 'All' ? faqs : faqs.filter(f => f.cat === cat);

  return (
    <LandingLayout>
      <section style={{ background: C.bg, padding: '80px 48px 60px', textAlign: 'center' }}>
        <motion.div {...fade()}>
          <div style={{ display: 'inline-block', background: `${C.blue}12`, border: `1px solid ${C.blue}25`, borderRadius: 100, padding: '5px 18px', fontSize: 11, fontWeight: 700, color: C.blue, letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: C.sans, marginBottom: 20 }}>FAQ</div>
          <h1 style={{ fontFamily: C.serif, fontSize: 'clamp(36px,5vw,64px)', color: C.text, lineHeight: 1.1, marginBottom: 16 }}>Questions?<br/>We have answers.</h1>
          <p style={{ fontSize: 17, color: C.muted, maxWidth: 520, margin: '0 auto', fontFamily: C.sans, lineHeight: 1.7 }}>
            Everything you need to know before bringing EduSync to your school.
          </p>
        </motion.div>
      </section>

      <section style={{ background: C.white, padding: '64px 48px' }}>
        {/* Category pills */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 44 }}>
          {cats.map(c => (
            <button key={c} onClick={() => { setCat(c); setOpen(null); }}
              style={{
                border: `1.5px solid ${cat===c ? C.blue : C.border}`,
                background: cat===c ? C.blue : 'transparent',
                color: cat===c ? '#fff' : C.muted,
                borderRadius: 100, padding: '7px 18px', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: C.sans, transition: 'all .18s',
              }}
              onMouseEnter={e => { if(cat!==c){ e.currentTarget.style.borderColor=C.blue; e.currentTarget.style.color=C.blue; }}}
              onMouseLeave={e => { if(cat!==c){ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.muted; }}}
            >{c}</button>
          ))}
        </div>

        <div style={{ maxWidth: 740, margin: '0 auto' }}>
          {filtered.map((f, i) => (
            <motion.div key={f.q} {...fade(.04*i)}
              style={{ borderBottom: `1px solid ${C.border}` }}>
              <button onClick={() => setOpen(open===i?null:i)}
                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: C.blue, fontFamily: C.sans, letterSpacing: '1px', background: `${C.blue}10`, borderRadius: 6, padding: '2px 8px', whiteSpace: 'nowrap' }}>{f.cat}</span>
                  <span style={{ fontSize: 15, fontWeight: 600, color: C.text, fontFamily: C.sans }}>{f.q}</span>
                </div>
                <span style={{ color: C.blue, flexShrink: 0, fontSize: 22, lineHeight: 1, transition: 'transform .25s', transform: open===i?'rotate(45deg)':'rotate(0deg)', display: 'inline-block' }}>+</span>
              </button>
              {open===i && (
                <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} transition={{duration:.25}}>
                  <p style={{ paddingBottom: 18, fontSize: 14, color: C.muted, fontFamily: C.sans, lineHeight: 1.75 }}>{f.a}</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Still unsure? */}
      <section style={{ background: C.bg, padding: '64px 48px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: C.serif, fontSize: 'clamp(24px,3.5vw,40px)', color: C.text, marginBottom: 12 }}>Still have questions?</h2>
        <p style={{ fontSize: 15, color: C.muted, fontFamily: C.sans, marginBottom: 30 }}>Talk to us directly — we respond within a few hours.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/contact')}
            style={{ background: C.blue, color: '#fff', border: 'none', borderRadius: 980, padding: '13px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: C.sans, transition: 'background .2s, transform .15s' }}
            onMouseEnter={e => { e.currentTarget.style.background=C.blueHov; e.currentTarget.style.transform='scale(1.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.background=C.blue; e.currentTarget.style.transform='scale(1)'; }}
          >Contact Us</button>
          <button onClick={() => window.open('https://edusync-frontend-beta.vercel.app')}
            style={{ background: 'transparent', color: C.blue, border: `1.5px solid ${C.blue}`, borderRadius: 980, padding: '13px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: C.sans, transition: 'background .2s, transform .15s' }}
            onMouseEnter={e => { e.currentTarget.style.background=`${C.blue}0e`; e.currentTarget.style.transform='scale(1.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='scale(1)'; }}
          >Try Live Demo</button>
        </div>
      </section>
    </LandingLayout>
  );
}
