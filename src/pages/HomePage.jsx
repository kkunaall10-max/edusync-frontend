import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import FeatureCarousel from '../components/FeatureCarousel';
// Hero and Feature assets now served from /public

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

const HomePage = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mediaFullyExpanded, setMediaFullyExpanded] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  const images = {
    alt: "EduSync feature",
    step1img1: '/feat1a.jpg',
    step1img2: '/feat1b.jpg',
    step2img1: '/feat2a.jpg',
    step2img2: '/feat2b.jpg',
    step3img: '/feat3.jpg',
    step4img: '/feat4.jpg'
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);

    const handleWheel = (e) => {
      if (!mediaFullyExpanded || (mediaFullyExpanded && window.scrollY === 0 && e.deltaY < 0)) {
        if (!mediaFullyExpanded) e.preventDefault();
        
        const scrollDelta = e.deltaY * 0.0009;
        setScrollProgress((prev) => {
          const next = clamp(prev + scrollDelta, 0, 1);
          
          if (next >= 1) {
            setMediaFullyExpanded(true);
            setShowContent(true);
          } else {
            setMediaFullyExpanded(false);
            if (next < 0.75) setShowContent(false);
          }
          return next;
        });
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [mediaFullyExpanded]);

  // Animation values
  const videoWidth = 300 + scrollProgress * (isMobile ? 350 : 1250);
  const videoHeight = 400 + scrollProgress * (isMobile ? 200 : 400);
  const textTranslateX = scrollProgress * (isMobile ? 180 : 150);

  const styles = {
    navbar: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '64px',
      zIndex: 100,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 40px'
    },
    hero: {
      position: 'relative',
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      zIndex: 10
    },
    heroBackground: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundImage: "url('/hero-bg.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      zIndex: -1
    },
    titleContainer: {
      position: 'absolute',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      zIndex: 20,
      pointerEvents: 'none',
      textAlign: 'center'
    },
    heroBrand: {
      color: 'rgba(255,255,255,0.6)',
      fontSize: '14px',
      fontWeight: '600',
      letterSpacing: '4px',
      textTransform: 'uppercase',
      marginBottom: '16px'
    },
    heroTitle: {
      display: 'flex',
      fontSize: isMobile ? '48px' : '72px',
      fontWeight: '800',
      color: 'white',
      lineHeight: 1
    },
    heroSubtitle: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: '20px',
      fontWeight: '400',
      marginTop: '16px'
    },
    videoWrapper: {
      position: 'relative',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      zIndex: 15
    },
    scrollIndicator: {
      position: 'absolute',
      bottom: '40px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.2em',
      color: 'white',
      opacity: 1 - scrollProgress,
      zIndex: 20
    },
    section: {
      padding: isMobile ? '64px 24px' : '120px 48px',
      backgroundColor: 'white',
      position: 'relative',
      zIndex: 30
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
      gap: '32px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '32px',
      border: '1px solid #E5E7EB',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px'
    },
    statsSection: {
      padding: '80px 48px',
      backgroundColor: '#111827',
      color: 'white',
      textAlign: 'center',
      position: 'relative',
      zIndex: 30
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
      gap: '40px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    ctaSection: {
      padding: '120px 24px',
      backgroundColor: 'white',
      textAlign: 'center',
      position: 'relative',
      zIndex: 30
    },
    footer: {
      padding: '40px',
      backgroundColor: '#111827',
      textAlign: 'center',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      zIndex: 30,
      position: 'relative'
    }
  };

  return (
    <div style={{ backgroundColor: '#111827', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={{ fontSize: '24px', fontWeight: '800', color: 'white' }}>EduSync</div>
        <button 
          onClick={() => navigate('/login')}
          style={{
            padding: '10px 24px',
            borderRadius: '8px',
            border: '2px solid white',
            backgroundColor: 'transparent',
            color: 'white',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          Login
        </button>
      </nav>

      {/* Hero Animation Container */}
      {!mediaFullyExpanded && (
        <div style={styles.hero}>
          <motion.div 
            style={{
              ...styles.heroBackground,
              opacity: 1 - scrollProgress
            }} 
          />

          <div style={styles.titleContainer}>
            <div style={styles.heroBrand}>EduSync</div>
            <div style={styles.heroTitle}>
              <div style={{ transform: `translateX(-${textTranslateX}vw)` }}>Educate</div>
              <div style={{ transform: `translateX(${textTranslateX}vw)`, marginLeft: isMobile ? '12px' : '24px' }}>Empower</div>
            </div>
            <div style={styles.heroSubtitle}>The future of school management</div>
          </div>

          <motion.div 
            style={{
              ...styles.videoWrapper,
              width: videoWidth,
              height: videoHeight
            }}
          >
            <video 
              src="https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4"
              autoPlay 
              muted 
              loop 
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'black',
              opacity: clamp(0.6 - scrollProgress, 0, 1)
            }} />
          </motion.div>

          <div style={{
            ...styles.scrollIndicator,
            transform: `translateX(${scrollProgress * 150}vw)`
          }}>
            Scroll to explore
          </div>
        </div>
      )}

      {/* Main Content (Revealed after transition) */}
      <motion.div
        animate={{ opacity: showContent ? 1 : 0 }}
        transition={{ duration: 0.8 }}
        style={{ pointerEvents: showContent ? 'auto' : 'none' }}
      >
        {/* Full Screen Video Section (The result of expansion) */}
        {mediaFullyExpanded && (
          <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
            <video 
              src="https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4"
              autoPlay 
              muted 
              loop 
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              textAlign: 'center', color: 'white', padding: '0 24px'
            }}>
              <h2 style={{ fontSize: isMobile ? '32px' : '64px', fontWeight: '800', marginBottom: '16px' }}>Future of Education</h2>
              <p style={{ fontSize: '20px', maxWidth: '600px', opacity: 0.8 }}>Transforming school administration with state-of-the-art management tools.</p>
            </div>
          </div>
        )}

        {/* Features Carousel Section */}
        <section style={{
          backgroundColor: '#F9FAFB',
          padding: '80px 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          zIndex: 30
        }}>
          <h3 style={{
            fontSize: '40px',
            fontWeight: '700',
            color: '#111827',
            textAlign: 'center',
            marginBottom: '16px'
          }}>
            Everything your school needs
          </h3>
          <p style={{
            fontSize: '18px',
            color: '#6B7280',
            textAlign: 'center',
            marginBottom: '60px'
          }}>
            Powerful features designed for modern schools
          </p>

          <FeatureCarousel image={images} />
        </section>

        {/* Stats */}
        <section style={styles.statsSection}>
          <div style={styles.statsGrid}>
            <div>
              <div style={{ fontSize: '40px', fontWeight: '800', color: '#2563EB' }}>500+</div>
              <p style={{ fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Students</p>
            </div>
            <div>
              <div style={{ fontSize: '40px', fontWeight: '800', color: '#2563EB' }}>50+</div>
              <p style={{ fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Teachers</p>
            </div>
            <div>
              <div style={{ fontSize: '40px', fontWeight: '800', color: '#2563EB' }}>99%</div>
              <p style={{ fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Attendance Rate</p>
            </div>
            <div>
              <div style={{ fontSize: '40px', fontWeight: '800', color: '#2563EB' }}>100%</div>
              <p style={{ fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Secure</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={styles.ctaSection}>
          <h2 style={{ fontSize: isMobile ? '32px' : '40px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>Ready to transform your school?</h2>
          <p style={{ fontSize: '18px', color: '#6B7280', marginBottom: '48px' }}>Join thousands of schools using EduSync to manage academics and administration.</p>
          <button 
            onClick={() => navigate('/login')}
            style={{
              backgroundColor: '#2563EB',
              color: 'white',
              padding: '16px 48px',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)'
            }}
          >
            Login to EduSync
          </button>
        </section>

        {/* Footer */}
        <footer style={styles.footer}>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
            © 2026 EduSync. All rights reserved. Built for institutional excellence.
          </div>
        </footer>
      </motion.div>
    </div>
  );
};

export default HomePage;
