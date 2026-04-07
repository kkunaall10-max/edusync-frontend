import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LandingLayout from '../components/landing/LandingLayout';
import { C } from '../components/landing/tokens';

const fade = (d=0) => ({initial:{opacity:0,y:24},whileInView:{opacity:1,y:0},viewport:{once:true},transition:{delay:d,duration:.6}});

export default function Contact() {
  const [form, setForm] = useState({ name:'', school:'', email:'', phone:'', role:'Principal', message:'' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const roles = ['Principal','Teacher','Parent','Other'];

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1200);
  };

  const inp = (field) => ({
    value: form[field],
    onChange: e => setForm({...form, [field]: e.target.value}),
  });

  const inputStyle = {
    width: '100%', borderRadius: 12, border: `1.5px solid ${C.border}`,
    padding: '12px 16px', fontSize: 14, fontFamily: C.sans, color: C.text,
    background: C.white, outline: 'none', boxSizing: 'border-box',
    transition: 'border-color .18s, box-shadow .18s',
  };

  return (
    <LandingLayout>
      <section style={{ background: C.bg, padding: '80px 48px 60px', textAlign: 'center' }}>
        <motion.div {...fade()}>
          <div style={{ display: 'inline-block', background: `${C.blue}12`, border: `1px solid ${C.blue}25`, borderRadius: 100, padding: '5px 18px', fontSize: 11, fontWeight: 700, color: C.blue, letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: C.sans, marginBottom: 20 }}>Contact</div>
          <h1 style={{ fontFamily: C.serif, fontSize: 'clamp(36px,5vw,64px)', color: C.text, lineHeight: 1.1, marginBottom: 16 }}>Let's talk.</h1>
          <p style={{ fontSize: 17, color: C.muted, maxWidth: 500, margin: '0 auto', fontFamily: C.sans, lineHeight: 1.7 }}>
            Whether you want a demo, a custom quote, or just want to ask a question — we're here.
          </p>
        </motion.div>
      </section>

      <section style={{ background: C.white, padding: '64px 48px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: 64, flexWrap: 'wrap' }}>

          {/* Contact info */}
          <motion.div {...fade(.1)} style={{ flex: '1 1 260px' }}>
            <h2 style={{ fontFamily: C.serif, fontSize: 28, color: C.text, marginBottom: 24 }}>Get in touch</h2>
            {[
              { icon: '', label: 'Phone', val: '+91 99965 84341', href: 'tel:+919996584341' },
              { icon: '', label: 'Email', val: 'kkunaall10@gmail.com', href: 'mailto:kkunaall10@gmail.com' },
              { icon: '', label: 'Demo', val: 'edusync-frontend-beta.vercel.app', href: 'https://edusync-frontend-beta.vercel.app' },
            ].map(c => (
              <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', gap: 14, marginBottom: 20, textDecoration: 'none', padding: 16, borderRadius: 14, border: `1px solid ${C.border}`, background: C.white, transition: 'border-color .18s, box-shadow .18s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=C.blue; e.currentTarget.style.boxShadow=`0 2px 16px ${C.blue}12`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.boxShadow='none'; }}
              >
                <div style={{ fontSize: 22 }}>{c.icon}</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, fontFamily: C.sans, letterSpacing: '1px', marginBottom: 3 }}>{c.label.toUpperCase()}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.blue, fontFamily: C.sans }}>{c.val}</div>
                </div>
              </a>
            ))}

            <div style={{ background: `${C.blue}08`, border: `1px solid ${C.blue}18`, borderRadius: 14, padding: 20, marginTop: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.blue, fontFamily: C.sans, marginBottom: 6 }}>Response time</div>
              <p style={{ fontSize: 13, color: C.muted, fontFamily: C.sans, lineHeight: 1.6 }}>We typically respond within 2–4 hours during business hours. For urgent queries, call directly.</p>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div {...fade(.18)} style={{ flex: '1 1 360px' }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: 56, marginBottom: 20 }}></div>
                <h3 style={{ fontFamily: C.serif, fontSize: 28, color: C.text, marginBottom: 12 }}>Message sent!</h3>
                <p style={{ fontSize: 15, color: C.muted, fontFamily: C.sans, lineHeight: 1.7 }}>We'll get back to you within a few hours. Check your email for a confirmation.</p>
              </div>
            ) : (
              <form onSubmit={submit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, fontFamily: C.sans, display: 'block', marginBottom: 6 }}>Your name *</label>
                    <input {...inp('name')} required placeholder="Kunal Sharma"
                      style={inputStyle}
                      onFocus={e => { e.target.style.borderColor=C.blue; e.target.style.boxShadow=`0 0 0 3px ${C.blue}18`; }}
                      onBlur={e => { e.target.style.borderColor=C.border; e.target.style.boxShadow='none'; }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, fontFamily: C.sans, display: 'block', marginBottom: 6 }}>School name *</label>
                    <input {...inp('school')} required placeholder="DAV Public School"
                      style={inputStyle}
                      onFocus={e => { e.target.style.borderColor=C.blue; e.target.style.boxShadow=`0 0 0 3px ${C.blue}18`; }}
                      onBlur={e => { e.target.style.borderColor=C.border; e.target.style.boxShadow='none'; }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, fontFamily: C.sans, display: 'block', marginBottom: 6 }}>Email address *</label>
                  <input {...inp('email')} required type="email" placeholder="principal@school.com"
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor=C.blue; e.target.style.boxShadow=`0 0 0 3px ${C.blue}18`; }}
                    onBlur={e => { e.target.style.borderColor=C.border; e.target.style.boxShadow='none'; }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, fontFamily: C.sans, display: 'block', marginBottom: 6 }}>Phone number</label>
                    <input {...inp('phone')} placeholder="+91 98765 43210"
                      style={inputStyle}
                      onFocus={e => { e.target.style.borderColor=C.blue; e.target.style.boxShadow=`0 0 0 3px ${C.blue}18`; }}
                      onBlur={e => { e.target.style.borderColor=C.border; e.target.style.boxShadow='none'; }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, fontFamily: C.sans, display: 'block', marginBottom: 6 }}>Your role</label>
                    <select {...inp('role')} style={{...inputStyle, cursor:'pointer'}}
                      onFocus={e => { e.target.style.borderColor=C.blue; e.target.style.boxShadow=`0 0 0 3px ${C.blue}18`; }}
                      onBlur={e => { e.target.style.borderColor=C.border; e.target.style.boxShadow='none'; }}
                    >
                      {roles.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, fontFamily: C.sans, display: 'block', marginBottom: 6 }}>Message *</label>
                  <textarea {...inp('message')} required rows={4} placeholder="Tell us about your school and what you're looking for..."
                    style={{...inputStyle, resize:'vertical', minHeight:100}}
                    onFocus={e => { e.target.style.borderColor=C.blue; e.target.style.boxShadow=`0 0 0 3px ${C.blue}18`; }}
                    onBlur={e => { e.target.style.borderColor=C.border; e.target.style.boxShadow='none'; }}
                  />
                </div>
                <button type="submit"
                  style={{ width: '100%', background: loading ? `${C.blue}99` : C.blue, color: '#fff', border: 'none', borderRadius: 12, padding: '14px 0', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: C.sans, transition: 'background .2s, transform .15s' }}
                  onMouseEnter={e => { if(!loading) e.currentTarget.style.background=C.blueHov; }}
                  onMouseLeave={e => { if(!loading) e.currentTarget.style.background=C.blue; }}
                >{loading ? 'Sending...' : 'Send Message →'}</button>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </LandingLayout>
  );
}
