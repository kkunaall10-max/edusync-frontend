import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import { HelpCircle, Mail, Phone, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

const Support = () => {
    const [user, setUser] = useState(null);
    const [activeFaq, setActiveFaq] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();
    }, []);

    const role = user?.user_metadata?.role || 'User';

    const faqs = [
        {
            q: "How do I reset my password?",
            a: "Go to the Settings page in the sidebar footer and use the 'Security Protocol' section to update your authentication secret."
        },
        {
            q: "Can I manage students across different classes?",
            a: "If you have the Principal role, you can access all classes via the Students list. Teachers are restricted to their assigned sections."
        },
        {
            q: "Where can I download academic reports?",
            a: "The Reports module in the sidebar allows you to generate PDF and Excel exports of attendance, grading, and financial data."
        },
        {
            q: "Is EduSync compatible with mobile devices?",
            a: "Yes, EduSync is fully mobile-responsive. All tables convert to cards on small viewports for optimal readability."
        },
        {
            q: "How do I contact technical support?",
            a: "You can reach our dedicated support team at support@edusync.in for any institutional technical assistance."
        }
    ];

    return (
        <Layout role={role.toLowerCase()}>
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Support & FAQ</h1>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Institutional Help Center</p>
                    </div>
                    <div className="hidden md:flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Support Priority</p>
                            <p className="text-xs font-bold text-blue-600">Institutional Premium</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
                            <HelpCircle size={20} />
                        </div>
                    </div>
                </div>

                {/* Contact Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-6 group hover:border-blue-200 transition-all">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <Mail size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Email Channel</p>
                            <h3 className="text-sm font-black text-slate-900">support@edusync.in</h3>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-6 group hover:border-blue-200 transition-all">
                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <Phone size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Inquiry Hotline</p>
                            <h3 className="text-sm font-black text-slate-900">+91 (800) EDUSYNC</h3>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-3 px-1">
                        <HelpCircle size={20} className="text-blue-600" />
                        Common Institutional Questions
                    </h2>
                    
                    <div className="space-y-3">
                        {faqs.map((faq, idx) => (
                            <div 
                                key={idx}
                                className={`bg-white rounded-3xl border border-slate-200 overflow-hidden transition-all ${activeFaq === idx ? 'ring-2 ring-blue-600/10 border-blue-200' : ''}`}
                            >
                                <button 
                                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                                >
                                    <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{faq.q}</span>
                                    {activeFaq === idx ? <ChevronUp size={20} className="text-blue-600" /> : <ChevronDown size={20} className="text-slate-400" />}
                                </button>
                                {activeFaq === idx && (
                                    <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
                                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-sm font-bold text-slate-600 leading-relaxed tracking-tight italic">
                                                {faq.a}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Action */}
                <div className="bg-slate-900 rounded-[32px] p-10 text-center space-y-4 overflow-hidden relative shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 opacity-20 blur-3xl rounded-full translate-x-10 -translate-y-10" />
                    <div className="relative z-10">
                        <h2 className="text-xl font-black text-white">Still Need Assistance?</h2>
                        <p className="text-slate-400 text-sm font-bold max-w-md mx-auto">Our support engineers are available 24/7 for critical institutional infrastructure issues.</p>
                        <button className="mt-6 h-12 px-8 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2 mx-auto">
                            Submit Support Ticket
                            <ExternalLink size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Support;
