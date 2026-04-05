import React, { useState, useEffect } from 'react';

const messages = [
  "Preparing your dashboard...",
  "Loading your class data...",
  "Fetching attendance records...",
  "Almost there...",
  "Setting everything up...",
  "Preparing your precious dashboard...",
  "Getting your students ready...",
  "Loading performance data...",
];

export default function LoadingScreen() {
  const [msgIndex, setMsgIndex] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const msgTimer = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % messages.length);
    }, 1800);
    const dotTimer = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);
    return () => {
      clearInterval(msgTimer);
      clearInterval(dotTimer);
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      <div style={{
        fontSize: 32,
        fontWeight: 800,
        color: 'white',
        letterSpacing: 4,
        marginBottom: 48,
        fontFamily: 'Inter, sans-serif',
      }}>
        EduSync
      </div>

      <div style={{
        width: 48, height: 48,
        border: '3px solid rgba(255,255,255,0.2)',
        borderTop: '3px solid white',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        marginBottom: 32,
      }} />

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{
        fontSize: 15,
        color: 'rgba(255,255,255,0.7)',
        fontFamily: 'Inter, sans-serif',
        animation: 'fadeIn 0.4s ease',
        key: msgIndex,
        minHeight: 24,
      }}>
        {messages[msgIndex]}{dots}
      </div>

      <div style={{
        marginTop: 48,
        width: 200,
        height: 3,
        background: 'rgba(255,255,255,0.1)',
        borderRadius: 99,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          background: 'white',
          borderRadius: 99,
          animation: 'progress 2s ease-in-out infinite',
        }} />
        <style>{`
          @keyframes progress {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
          }
        `}</style>
      </div>
    </div>
  );
}
