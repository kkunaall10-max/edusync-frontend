import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import LoadingScreen from '../components/LoadingScreen';
import MediaUploader from '../components/MediaUploader';
import { Plus, Trash2, Megaphone, Clock, Users, X, AlertCircle, Image as ImageIcon } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://edusync.up.railway.app';

const Announcements = () => {
    const [loading, setLoading] = useState(true);
    const [announcements, setAnnouncements] = useState([]);
    const [activeTab, setActiveTab] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [profile, setProfile] = useState(null);
    const [uploadedMedia, setUploadedMedia] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        target_audience: 'all',
        target_class: '',
        target_section: '',
        priority: 'normal',
        media_urls: [],
        media_types: []
    });

    const fetchData = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setProfile(user);
            }

            const res = await axios.get(`${API}/api/announcements`);
            setAnnouncements(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching announcements:", error);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handlePost = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API}/api/announcements`, {
                ...formData,
                media_urls: formData.media_urls,
                media_types: formData.media_types,
                created_by: profile?.email || 'admin'
            });
            setShowModal(false);
            setUploadedMedia([]);
            setFormData({
                title: '', 
                content: '', 
                target_audience: 'all', 
                target_class: '', 
                target_section: '', 
                priority: 'normal',
                media_urls: [],
                media_types: []
            });
            fetchData();
        } catch (error) {
            console.error("Error posting announcement:", error);
            alert("Failed to post announcement.");
        }
    };

    const handleMediaAdd = (media) => {
        if (media === null) {
            // Remove last media
            const newMedia = [...uploadedMedia];
            newMedia.pop();
            setUploadedMedia(newMedia);
            setFormData(prev => ({
                ...prev,
                media_urls: prev.media_urls.slice(0, -1),
                media_types: prev.media_types.slice(0, -1)
            }));
        } else {
            // Add new media
            setUploadedMedia(prev => [...prev, media]);
            setFormData(prev => ({
                ...prev,
                media_urls: [...prev.media_urls, media.url],
                media_types: [...prev.media_types, media.type]
            }));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this announcement?")) return;
        try {
            await axios.delete(`${API}/api/announcements/${id}`);
            fetchData();
        } catch (error) {
            console.error("Error deleting announcement:", error);
            alert("Failed to delete announcement.");
        }
    };

    const getPriorityBadge = (priority) => {
        const styles = {
            normal: { bg: '#F3F4F6', color: '#4B5563', label: 'Normal' },
            important: { bg: '#FEF3C7', color: '#D97706', label: 'Important' },
            urgent: { bg: '#FEE2E2', color: '#DC2626', label: 'Urgent' }
        };
        const s = styles[priority] || styles.normal;
        return (
            <span style={{ backgroundColor: s.bg, color: s.color, padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {s.label}
            </span>
        );
    };

    const getAudienceLabel = (ann) => {
        if (ann.target_audience === 'all') return <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md font-bold">All School</span>;
        if (ann.target_audience === 'teachers') return <span className="bg-purple-50 text-purple-600 px-2.5 py-1 rounded-md font-bold">Teachers Only</span>;
        if (ann.target_audience === 'parents') return <span className="bg-green-50 text-green-600 px-2.5 py-1 rounded-md font-bold">Parents Only</span>;
        if (ann.target_audience === 'class') return <span className="bg-orange-50 text-orange-600 px-2.5 py-1 rounded-md font-bold">Class {ann.target_class} {ann.target_section||''}</span>;
        return <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-bold">General</span>;
    };

    const filteredAnnouncements = announcements.filter(ann => {
        if (activeTab === 'All School') return ann.target_audience === 'all';
        if (activeTab === 'Teachers Only') return ann.target_audience === 'teachers';
        if (activeTab === 'Parents Only') return ann.target_audience === 'parents';
        if (activeTab === 'Specific Class') return ann.target_audience === 'class';
        if (activeTab === 'Urgent') return ann.priority === 'urgent';
        return true;
    });

    const counts = {
        All: announcements.length,
        'All School': announcements.filter(a => a.target_audience === 'all').length,
        'Teachers Only': announcements.filter(a => a.target_audience === 'teachers').length,
        'Parents Only': announcements.filter(a => a.target_audience === 'parents').length,
        'Specific Class': announcements.filter(a => a.target_audience === 'class').length,
        'Urgent': announcements.filter(a => a.priority === 'urgent').length,
    };

    if (loading) return <LoadingScreen />;

    return (
        <Layout role="principal">
            <div className="space-y-8 max-w-6xl mx-auto pb-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 m-0 tracking-tight">Announcements</h2>
                        <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">School Communications & Circulars</p>
                    </div>
                    <button 
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
                    >
                        <Plus size={20} /> Create Announcement
                    </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                    {['All', 'All School', 'Teachers Only', 'Parents Only', 'Specific Class', 'Urgent'].map(tab => (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === tab ? 'bg-slate-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                            {tab}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                {counts[tab]}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="mb-4">
                    <h3 className="text-lg font-black text-slate-800">{counts[activeTab]} Announcements</h3>
                </div>

                {/* Announcements List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredAnnouncements.length > 0 ? filteredAnnouncements.map(ann => (
                        <div key={ann.id} className={`bg-white border ${ann.priority === 'urgent' ? 'border-red-400 shadow-[0_0_15px_rgba(220,38,38,0.3)] animate-[pulse_3s_ease-in-out_infinite]' : 'border-slate-200 shadow-sm'} rounded-2xl p-6 hover:shadow-md transition-shadow flex flex-col relative group`}>
                            <div className="flex justify-between items-start mb-4">
                                {getPriorityBadge(ann.priority)}
                                <button 
                                    onClick={() => handleDelete(ann.id)}
                                    className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            
                            <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">{ann.title}</h3>
                            <p className="text-slate-600 mb-4 flex-1 leading-relaxed text-sm">
                                {ann.content}
                            </p>
                            
                            {/* Display Media */}
                            {ann.media_urls && ann.media_urls.length > 0 && (
                                <div className="mb-4 space-y-2">
                                    {ann.media_urls.map((url, idx) => (
                                        <div key={idx} className="rounded-lg overflow-hidden border border-slate-200">
                                            {ann.media_types?.[idx] === 'image' ? (
                                                <img src={url} alt="Announcement" className="w-full h-32 object-cover hover:scale-105 transition-transform cursor-pointer" />
                                            ) : (
                                                <iframe src={url} width="100%" height="200" frameBorder="0" allow="autoplay" className="rounded w-full" title="Video"></iframe>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-semibold text-slate-500 mt-auto">
                                <div className="flex items-center gap-1.5">
                                    <Users size={14} className="text-slate-400" />
                                    {getAudienceLabel(ann)}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock size={14} className="text-slate-400" />
                                    {new Date(ann.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                            <Megaphone size={48} className="mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-bold text-slate-700 mb-1">No announcements yet</h3>
                            <p className="text-slate-500 text-sm">Create your first announcement to notify the school.</p>
                        </div>
                    )}
                </div>

                {/* Create Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
                            <div className="flex justify-between items-center p-6 border-b border-slate-100">
                                <h3 className="text-xl font-black text-slate-900">New Announcement</h3>
                                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto">
                                <form id="announcement-form" onSubmit={handlePost} className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Title <span className="text-red-500">*</span></label>
                                        <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400" placeholder="e.g., Annual Sports Day 2026" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Content <span className="text-red-500">*</span></label>
                                        <textarea required rows="4" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400 resize-none" placeholder="Provide details here..."></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">📸 Add Images / Videos</label>
                                        <MediaUploader onMediaAdd={handleMediaAdd} uploadedMedia={uploadedMedia} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Audience</label>
                                            <select value={formData.target_audience} onChange={e => setFormData({...formData, target_audience: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer">
                                                <option value="all">All School</option>
                                                <option value="teachers">Teachers Only</option>
                                                <option value="parents">Parents Only</option>
                                                <option value="class">Specific Class</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Priority</label>
                                            <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer">
                                                <option value="normal">Normal</option>
                                                <option value="important">Important</option>
                                                <option value="urgent">Urgent</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    {formData.target_audience === 'class' && (
                                        <div className="grid grid-cols-2 gap-4 bg-orange-50 p-4 rounded-xl border border-orange-100">
                                            <div>
                                                <label className="block text-xs font-bold text-orange-700 uppercase tracking-wider mb-2">Class</label>
                                                <input type="text" placeholder="e.g. 10th" value={formData.target_class} onChange={e => setFormData({...formData, target_class: e.target.value})} className="w-full bg-white border border-orange-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-orange-700 uppercase tracking-wider mb-2">Section</label>
                                                <input type="text" placeholder="e.g. A" value={formData.target_section} onChange={e => setFormData({...formData, target_section: e.target.value})} className="w-full bg-white border border-orange-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500" />
                                            </div>
                                        </div>
                                    )}
                                </form>
                            </div>
                            <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-3xl">
                                <button type="submit" form="announcement-form" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-4 font-black transition-colors shadow-lg shadow-blue-200 flex justify-center items-center gap-2">
                                    <Megaphone size={18} /> Post Announcement
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Announcements;
