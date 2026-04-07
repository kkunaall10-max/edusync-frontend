import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LandingLayout from '../components/landing/LandingLayout';
import { C } from '../components/landing/tokens';

const fade = (d=0) => ({initial:{opacity:0,y:20},whileInView:{opacity:1,y:0},viewport:{once:true},transition:{delay:d,duration:.6}});
const Section = ({title})=> <h2 style={{fontFamily:C.serif,fontSize:24,color:C.text,marginTop:40,marginBottom:12}}>{title}</h2>;
const Para = ({children})=> <p style={{fontSize:14,color:C.muted,fontFamily:C.sans,lineHeight:1.85,marginBottom:12}}>{children}</p>;

export default function Terms() {
  const navigate = useNavigate();
  return (
    <LandingLayout>
      <section style={{background:C.bg,padding:'80px 48px 60px',textAlign:'center'}}>
        <motion.div {...fade()}>
          <div style={{display:'inline-block',background:`${C.blue}12`,border:`1px solid ${C.blue}25`,borderRadius:100,padding:'5px 18px',fontSize:11,fontWeight:700,color:C.blue,letterSpacing:'1.5px',textTransform:'uppercase',fontFamily:C.sans,marginBottom:20}}>Legal</div>
          <h1 style={{fontFamily:C.serif,fontSize:'clamp(32px,4vw,56px)',color:C.text,lineHeight:1.1,marginBottom:16}}>Terms of Service</h1>
          <p style={{fontSize:15,color:C.muted,fontFamily:C.sans}}>Last updated: April 2026</p>
        </motion.div>
      </section>

      <section style={{background:C.white,padding:'64px 48px'}}>
        <div style={{maxWidth:740,margin:'0 auto'}}>
          <Section title="1. Acceptance of Terms"/>
          <Para>By accessing or using EduSync ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the Service. These terms apply to all users including school principals, teachers, parents, and students.</Para>

          <Section title="2. Use of the Service"/>
          <Para>EduSync is a school management platform. You agree to use it only for legitimate school administration purposes. You may not use the Service to distribute harmful content, attempt unauthorised access to other users' data, or engage in any activity that violates applicable Indian law.</Para>
          <Para>School administrators are responsible for ensuring that all staff members use the platform in accordance with these terms.</Para>

          <Section title="3. Accounts and Access"/>
          <Para>Access to EduSync is granted by school administrators. Each user is responsible for maintaining the confidentiality of their login credentials. You must notify us immediately at kkunaall10@gmail.com if you suspect unauthorised access to your account.</Para>
          <Para>EduSync reserves the right to suspend or terminate accounts that violate these terms without prior notice.</Para>

          <Section title="4. Subscription and Payment"/>
          <Para>EduSync is provided on a subscription basis to schools. The first two months are offered free of charge as a trial. Pricing thereafter is agreed upon individually with each school. All fees are due monthly as per the agreed schedule.</Para>
          <Para>We reserve the right to update pricing with 30 days' written notice to school administrators.</Para>

          <Section title="5. Data Ownership"/>
          <Para>All student, teacher, and school data entered into EduSync remains the property of the school. EduSync acts only as a data processor. Upon subscription termination, schools may request a full data export within 30 days.</Para>

          <Section title="6. Availability and Uptime"/>
          <Para>We strive to maintain 99.9% uptime for the EduSync platform. However, we do not guarantee uninterrupted service. Planned maintenance will be communicated in advance. We are not liable for losses resulting from service interruptions outside our reasonable control.</Para>

          <Section title="7. Limitation of Liability"/>
          <Para>EduSync shall not be liable for any indirect, incidental, or consequential damages arising from use of the Service. Our total liability to any school or user shall not exceed the total fees paid in the 3 months preceding the claim.</Para>

          <Section title="8. Governing Law"/>
          <Para>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Haryana, India.</Para>

          <Section title="9. Contact"/>
          <Para>For questions about these Terms, contact: kkunaall10@gmail.com or +91 99965 84341.</Para>

          <div style={{marginTop:40,display:'flex',gap:12,flexWrap:'wrap'}}>
            <button onClick={()=>navigate('/contact')}
              style={{background:C.blue,color:'#fff',border:'none',borderRadius:980,padding:'12px 28px',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:C.sans,transition:'background .2s'}}
              onMouseEnter={e=>e.currentTarget.style.background=C.blueHov}
              onMouseLeave={e=>e.currentTarget.style.background=C.blue}
            >Contact Us</button>
            <button onClick={()=>navigate('/privacy')}
              style={{background:'transparent',color:C.blue,border:`1.5px solid ${C.blue}`,borderRadius:980,padding:'12px 28px',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:C.sans,transition:'background .2s'}}
              onMouseEnter={e=>e.currentTarget.style.background=`${C.blue}0e`}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}
            >Privacy Policy</button>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
