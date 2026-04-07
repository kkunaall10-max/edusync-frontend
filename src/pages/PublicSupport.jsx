import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LandingLayout from '../components/landing/LandingLayout';
import { C } from '../components/landing/tokens';

const fade = (d=0) => ({initial:{opacity:0,y:20},whileInView:{opacity:1,y:0},viewport:{once:true},transition:{delay:d,duration:.6}});

const topics = [
  {icon:'',title:'Login & Access',desc:'Having trouble logging in? Try resetting your password from the Login screen, or contact your school administrator to reset your account.'},
  {icon:'',title:'Dashboard & Data',desc:'If data looks outdated, try refreshing the page. Make sure you are logged in with the same email used during account setup.'},
  {icon:'',title:'Parent App Issues',desc:'If the Android app shows connection errors, check that your phone has internet access. The app connects to the same server as the web portal.'},
  {icon:'',title:'Reports & PDF',desc:'PDF generation requires a stable internet connection. If a report fails, wait 10 seconds and try again. Clear browser cache if issues persist.'},
  {icon:'',title:'Announcements',desc:'Announcements appear in real time. If you cannot see recent ones, refresh the page or log out and back in to force a session refresh.'},
  {icon:'',title:'Fee Records',desc:'Fee records are managed by the school Principal. If you notice an incorrect entry, contact your school administrator to make corrections.'},
];

const faqs = [
  {q:'How do I reset my password?',a:'Go to the Login page and click "Forgot Password". Enter your registered email and you will receive a reset link within 5 minutes.'},
  {q:'The app is not showing my child\'s data.',a:'Ensure you logged in with the exact email address registered with the school. Contact your school to verify the email on file.'},
  {q:'Can I access EduSync on multiple devices?',a:'Yes. EduSync works on any browser on any device. Log in with your credentials and your data will sync automatically.'},
  {q:'Who do I contact if there\'s a technical error?',a:'Reach us at kkunaall10@gmail.com or +91 99965 84341. For school-specific issues, also contact your school administrator.'},
];

export default function PublicSupport() {
  const [open, setOpen] = useState(null);
  const navigate = useNavigate();

  return (
    <LandingLayout>
      <section style={{background:C.bg,padding:'80px 48px 60px',textAlign:'center'}}>
        <motion.div {...fade()}>
          <div style={{display:'inline-block',background:`${C.blue}12`,border:`1px solid ${C.blue}25`,borderRadius:100,padding:'5px 18px',fontSize:11,fontWeight:700,color:C.blue,letterSpacing:'1.5px',textTransform:'uppercase',fontFamily:C.sans,marginBottom:20}}>Support</div>
          <h1 style={{fontFamily:C.serif,fontSize:'clamp(36px,5vw,64px)',color:C.text,lineHeight:1.1,marginBottom:16}}>How can we help?</h1>
          <p style={{fontSize:17,color:C.muted,maxWidth:520,margin:'0 auto',fontFamily:C.sans,lineHeight:1.7}}>
            Find answers to common questions, or reach us directly for personalised assistance.
          </p>
        </motion.div>
      </section>

      {/* Contact quick-links */}
      <section style={{background:C.white,padding:'40px 48px'}}>
        <div style={{maxWidth:800,margin:'0 auto',display:'flex',gap:16,flexWrap:'wrap',justifyContent:'center'}}>
          {[
            {icon:'',label:'Call Us',val:'+91 99965 84341',href:'tel:+919996584341',bg:'rgba(52,199,89,0.08)',border:'rgba(52,199,89,0.2)',color:'#34c759'},
            {icon:'',label:'Email',val:'kkunaall10@gmail.com',href:'mailto:kkunaall10@gmail.com',bg:`${C.blue}08`,border:`${C.blue}20`,color:C.blue},
          ].map(c => (
            <a key={c.label} href={c.href}
              style={{display:'flex',gap:14,alignItems:'center',padding:'18px 24px',borderRadius:16,background:c.bg,border:`1px solid ${c.border}`,textDecoration:'none',flex:'1 1 260px',transition:'transform .18s'}}
              onMouseEnter={e=>e.currentTarget.style.transform='scale(1.02)'}
              onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
            >
              <span style={{fontSize:28}}>{c.icon}</span>
              <div>
                <div style={{fontSize:11,fontWeight:700,color:c.color,fontFamily:C.sans,letterSpacing:'1px',marginBottom:3}}>{c.label.toUpperCase()}</div>
                <div style={{fontSize:14,fontWeight:600,color:C.text,fontFamily:C.sans}}>{c.val}</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Topic cards */}
      <section style={{background:C.bg,padding:'64px 48px'}}>
        <motion.h2 {...fade()} style={{fontFamily:C.serif,fontSize:'clamp(24px,3.5vw,40px)',color:C.text,textAlign:'center',marginBottom:44}}>Common topics</motion.h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:16,maxWidth:960,margin:'0 auto'}}>
          {topics.map((t,i) => (
            <motion.div key={t.title} {...fade(.06*i)}
              style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:16,padding:24}}>
              <div style={{fontSize:28,marginBottom:10}}>{t.icon}</div>
              <div style={{fontSize:15,fontWeight:700,color:C.text,fontFamily:C.sans,marginBottom:7}}>{t.title}</div>
              <p style={{fontSize:13,color:C.muted,fontFamily:C.sans,lineHeight:1.65}}>{t.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mini FAQ */}
      <section style={{background:C.white,padding:'64px 48px'}}>
        <div style={{maxWidth:700,margin:'0 auto'}}>
          <motion.h2 {...fade()} style={{fontFamily:C.serif,fontSize:'clamp(24px,3.5vw,40px)',color:C.text,marginBottom:36,textAlign:'center'}}>Frequently asked</motion.h2>
          {faqs.map((f,i)=>(
            <div key={f.q} style={{borderBottom:`1px solid ${C.border}`}}>
              <button onClick={()=>setOpen(open===i?null:i)}
                style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'18px 0',background:'none',border:'none',cursor:'pointer',textAlign:'left'}}>
                <span style={{fontSize:15,fontWeight:600,color:C.text,fontFamily:C.sans}}>{f.q}</span>
                <span style={{color:C.blue,fontSize:22,lineHeight:1,transition:'transform .25s',transform:open===i?'rotate(45deg)':'rotate(0)',display:'inline-block'}}>+</span>
              </button>
              {open===i && <p style={{paddingBottom:18,fontSize:14,color:C.muted,fontFamily:C.sans,lineHeight:1.75}}>{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      <section style={{background:C.bg,padding:'64px 48px',textAlign:'center'}}>
        <h2 style={{fontFamily:C.serif,fontSize:'clamp(22px,3vw,36px)',color:C.text,marginBottom:12}}>Still stuck? We're here to help.</h2>
        <p style={{fontSize:15,color:C.muted,fontFamily:C.sans,marginBottom:28}}>Reach out and we'll get back to you within a few hours.</p>
        <button onClick={()=>navigate('/contact')}
          style={{background:C.blue,color:'#fff',border:'none',borderRadius:980,padding:'13px 32px',fontSize:15,fontWeight:600,cursor:'pointer',fontFamily:C.sans,transition:'background .2s, transform .15s'}}
          onMouseEnter={e=>{e.currentTarget.style.background=C.blueHov;e.currentTarget.style.transform='scale(1.03)';}}
          onMouseLeave={e=>{e.currentTarget.style.background=C.blue;e.currentTarget.style.transform='scale(1)';}}
        >Contact Us</button>
      </section>
    </LandingLayout>
  );
}
