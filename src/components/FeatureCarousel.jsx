import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

// Assets
import feat1a from '../assets/feat1a.jpg';
import feat1b from '../assets/feat1b.jpg';
import feat2a from '../assets/feat2a.jpg';
import feat2b from '../assets/feat2b.jpg';
import feat3 from '../assets/feat3.jpg';
import feat4 from '../assets/feat4.jpg';

const FeatureCarousel = ({ image }) => {
    const [activeStep, setActiveStep] = useState(0);

    const steps = [
        {
            id: "1",
            name: "Step 1",
            title: "Student Management",
            description: "Manage all student records, classes, sections and parent contacts in one place. Add, edit and track every student effortlessly.",
            images: [image.step1img1, image.step1img2]
        },
        {
            id: "2",
            name: "Step 2",
            title: "Smart Attendance",
            description: "Mark daily attendance with Present, Absent or Late status. Parents get instant updates about their child automatically.",
            images: [image.step2img1, image.step2img2]
        },
        {
            id: "3",
            name: "Step 3",
            title: "Fee Management",
            description: "Collect fees online or offline, generate receipts automatically and track pending payments with overdue alerts.",
            images: [image.step3img]
        },
        {
            id: "4",
            name: "Step 4",
            title: "Reports & Analytics",
            description: "Generate detailed attendance reports, academic performance cards and financial summaries with one click printing.",
            images: [image.step4img]
        }
    ];

    if (!image) return null;

    return (
        <div style={{
            width: '100%',
            maxWidth: '1200px',
            display: 'flex',
            flexDirection: window.innerWidth < 1024 ? 'column' : 'row',
            gap: '40px',
            marginTop: '40px'
        }}>
            {/* Steps Left Side */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
            }}>
                {steps.map((step, index) => (
                    <div 
                        key={step.id}
                        onClick={() => setActiveStep(index)}
                        style={{
                            padding: '24px',
                            cursor: 'pointer',
                            borderRadius: '16px',
                            transition: 'all 0.3s ease',
                            background: activeStep === index 
                                ? 'rgba(37, 99, 235, 0.05)' 
                                : 'transparent',
                            border: activeStep === index 
                                ? '1px solid rgba(37, 99, 235, 0.1)' 
                                : '1px solid transparent',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Progress Bar (Active only) */}
                        {activeStep === index && (
                            <motion.div 
                                layoutId="active-bar"
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    bottom: 0,
                                    width: '4px',
                                    backgroundColor: '#2563EB'
                                }}
                            />
                        )}

                        <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: activeStep === index ? '#2563EB' : '#6B7280',
                            marginBottom: '4px'
                        }}>
                            {step.name}
                        </div>
                        <div style={{
                            fontSize: '20px',
                            fontWeight: '700',
                            color: activeStep === index ? '#111827' : '#374151',
                            marginBottom: '8px'
                        }}>
                            {step.title}
                        </div>
                        
                        <AnimatePresence>
                            {activeStep === index && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    style={{
                                        fontSize: '15px',
                                        color: '#6B7280',
                                        lineHeight: '1.5'
                                    }}
                                >
                                    {step.description}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>

            {/* Images Right Side */}
            <div style={{
                flex: 1.5,
                background: 'rgba(255, 255, 255, 0.5)',
                borderRadius: '24px',
                padding: '24px',
                minHeight: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative'
            }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeStep}
                        initial={{ opacity: 0, x: 20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -20, scale: 0.95 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: steps[activeStep].images.filter(Boolean).length > 1 ? '1fr 1fr' : '1fr',
                            gap: '16px',
                            width: '100%'
                        }}
                    >
                        {steps[activeStep].images.filter(Boolean).map((img, i) => (
                            <motion.img 
                                key={i}
                                src={img} 
                                alt={image.alt || step.title}
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    borderRadius: '16px',
                                    boxShadow: '0 12px 24px rgba(0,0,0,0.08)',
                                    objectFit: 'cover'
                                }}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            />
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default FeatureCarousel;
