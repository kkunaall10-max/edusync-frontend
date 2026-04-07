import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LandingLayout from '../components/landing/LandingLayout';
import { C } from '../components/landing/tokens';

const fade = (d=0) => ({initial:{opacity:0,y:20},whileInView:{opacity:1,y:0},viewport:{once:true},transition:{delay:d,duration:.6}});
const Section = ({title})=> <h2 style={{fontFamily:C.serif,fontSize:24,color:C.text,marginTop:40,marginBottom:12}}>{title}</h2>;
const Para = ({children})=> <p style={{fontSize:14,color:C.muted,fontFamily:C.sans,lineHeight:1.85,marginBottom:12}}>{children}</p>;

export default function Privacy() {
  const navigate = useNavigate();
  return (
    <LandingLayout>
      <section style={{background:C.bg,padding:'80px 48px 60px',textAlign:'center'}}>
        <motion.div {...fade()}>
          <div style={{display:'inline-block',background:`${C.blue}12`,border:`1px solid ${C.blue}25`,borderRadius:100,padding:'5px 18px',fontSize:11,fontWeight:700,color:C.blue,letterSpacing:'1.5px',textTransform:'uppercase',fontFamily:C.sans,marginBottom:20}}>Legal</div>
          <h1 style={{fontFamily:C.serif,fontSize:'clamp(32px,4vw,56px)',color:C.text,lineHeight:1.1,marginBottom:16}}>Privacy Policy</h1>
          <p style={{fontSize:15,color:C.muted,fontFamily:C.sans}}>Last updated: April 2026</p>
        </motion.div>
      </section>

      <section style={{background:C.white,padding:'64px 48px'}}>
        <div style={{maxWidth:740,margin:'0 auto'}}>
          <Section title="1. Information We Collect"/>
          <Para>EduSync collects only the information necessary to operate the school management platform. This includes the names, email addresses, and role designations of school staff (principals and teachers), and the academic records of students (attendance, marks, fees, homework) provided by school administrators.</Para>
          <Para>We collect parent email addresses for the purpose of granting access to the parent portal and mobile app. We do not collect any financial payment information.</Para>

          <Section title="2. How We Use Your Information"/>
          <Para>All data collected is used solely for the purpose of providing the EduSync school management service. Student data is used to display attendance, fee status, homework, and marks to authorised parents and school staff. We do not use your data for advertising, marketing to third parties, or any purpose unrelated to school management.</Para>

          <Section title="3. Data Storage and Security"/>
          <Para>All data is stored on Supabase (PostgreSQL) with Row Level Security (RLS) enabled. RLS policies ensure each user can only access records they are authorised to view. No teacher can view another class's data. No parent can view another child's records.</Para>
          <Para>All data is transmitted over HTTPS using TLS 1.3. API keys and connection strings are stored as environment variables and are never embedded in source code.</Para>

          <Section title="4. Data Sharing"/>
          <Para>We do not sell, rent, or share your personal data with any third party. The only external service used is Supabase for database and authentication hosting. Supabase stores data on servers compliant with GDPR and SOC 2.</Para>

          <Section title="5. Data Retention"/>
          <Para>School data is retained for the duration of the school's active subscription. Upon subscription termination, the school may request a full data export. Data is permanently deleted from our servers within 30 days of account closure upon request.</Para>

          <Section title="6. Parent and Student Rights"/>
          <Para>Parents may request to view, correct, or delete their child's data by contacting the school administrator or reaching us directly at kkunaall10@gmail.com. We will fulfil such requests within 7 business days.</Para>

          <Section title="7. Changes to This Policy"/>
          <Para>We may update this Privacy Policy from time to time. Any significant changes will be communicated to school administrators via email. Continued use of EduSync after changes constitutes acceptance of the updated policy.</Para>

          <Section title="8. Contact"/>
          <Para>For privacy-related questions, please contact: kkunaall10@gmail.com or call +91 99965 84341.</Para>

          <div style={{marginTop:40}}>
            <button onClick={()=>navigate('/contact')}
              style={{background:C.blue,color:'#fff',border:'none',borderRadius:980,padding:'12px 28px',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:C.sans,transition:'background .2s'}}
              onMouseEnter={e=>e.currentTarget.style.background=C.blueHov}
              onMouseLeave={e=>e.currentTarget.style.background=C.blue}
            >Contact Us with Questions</button>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
