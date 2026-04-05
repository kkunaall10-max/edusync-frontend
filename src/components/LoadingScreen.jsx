import React, { useState, useEffect } from 'react';

const messages = [
  "Preparing your dashboard...",
  "Loading your class data...",
  "Fetching attendance records...",
  "Preparing your precious dashboard...",
  "Getting your students ready...",
  "Loading performance data...",
  "Almost there...",
  "Setting everything up for you...",
];

export default function LoadingScreen() {
  const [msgIndex, setMsgIndex] = useState(0);
  const [dots, setDots] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const msgTimer = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % messages.length);
    }, 1400);

    const dotTimer = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);

    // Progress bar fills over exactly 10 seconds (100 intervals of 100ms)
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 1;
      });
    }, 100);

    return () => {
      clearInterval(msgTimer);
      clearInterval(dotTimer);
      clearInterval(progressTimer);
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{
        fontSize: 28,
        fontWeight: 800,
        color: '#111827',
        letterSpacing: 3,
        marginBottom: 48,
      }}>
        EduSync
      </div>

      <div style={{
        width: 44, height: 44,
        border: '3px solid #E5E7EB',
        borderTop: '3px solid #2563EB',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        marginBottom: 36,
      }} />

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 32,
        minHeight: 22,
        textAlign: 'center',
      }}>
        {messages[msgIndex]}{dots}
      </div>

      <div style={{
        width: 220,
        height: 4,
        background: '#F3F4F6',
        borderRadius: 99,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: progress + '%',
          background: 'linear-gradient(90deg, #2563EB, #7C3AED)',
          borderRadius: 99,
          transition: 'width 0.1s linear',
        }} />
      </div>

      <div style={{
        marginTop: 12,
        fontSize: 12,
        color: '#9CA3AF',
      }}>
        {progress}%
      </div>
    </div>
  );
}
