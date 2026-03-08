import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { UploadCloud, Edit2, Check, Building2, Mail, Briefcase } from 'lucide-react';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/company/profile');
            setProfile(res.data);
            setFormData(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put('/company/profile', formData);
            setIsEditing(false);
            fetchProfile();
        } catch (err) {
            console.error('Failed to update profile', err);
        }
    };

    const inputCls = "w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-[15px] font-medium focus:ring-2 focus:ring-gray-200 outline-none transition-all placeholder:text-gray-400";
    const labelCls = "block text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-2 pl-1";

    if (!profile) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-gray-900 rounded-full"></div></div>;

    return (
        <div className="max-w-4xl mx-auto font-sans space-y-6">
            
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Company Profile</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your company information and branding.</p>
                </div>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-6 py-2.5 bg-white border border-gray-200 shadow-sm rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                    {isEditing ? <><Check className="w-4 h-4"/> Cancel Edit</> : <><Edit2 className="w-4 h-4"/> Edit Profile</>}
                </button>
            </div>

            <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-gray-100">
                {isEditing ? (
                    <form onSubmit={handleUpdate} className="space-y-6 animate-in fade-in">
                        <div className="flex items-center gap-6 pb-8 border-b border-gray-100">
                            <div className="h-28 w-28 rounded-3xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm flex-shrink-0">
                                {formData.profile_picture ? (
                                    <img src={formData.profile_picture} alt="Company Logo" className="h-full w-full object-cover" />
                                ) : (
                                    <Building2 className="w-10 h-10 text-gray-300" />
                                )}
                            </div>
                            <div className="flex-1">
                                <label className={labelCls}>Company Logo</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setFormData({ ...formData, profile_picture: reader.result });
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                                        <UploadCloud className="w-5 h-5 text-gray-500" />
                                        Click to upload new logo
                                    </div>
                                </div>
                                <p className="mt-2 text-xs text-gray-400 pl-1">JPG, GIF or PNG. Recommended size 400x400px.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <label className={labelCls}>Company Name</label>
                                <input type="text" className={inputCls} value={formData.company_name || ''} onChange={e => setFormData({ ...formData, company_name: e.target.value })} />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className={labelCls}>About Company</label>
                                <textarea rows="4" className={`${inputCls} resize-none`} placeholder="Tell students about your company culture, mission, and work..." value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelCls}>Industry</label>
                                <input type="text" placeholder="e.g. Software Development" className={inputCls} value={formData.industry || ''} onChange={e => setFormData({ ...formData, industry: e.target.value })} />
                            </div>
                        </div>
                        <div className="pt-4 mt-6">
                            <button type="submit" className="w-full py-3.5 bg-gray-900 text-white rounded-full text-[15px] font-semibold hover:bg-black shadow-md transition-all">
                                Save Changes
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-8 animate-in fade-in">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 pb-8 border-b border-gray-100 text-center md:text-left">
                            <div className="h-32 w-32 rounded-3xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm flex-shrink-0">
                                {profile.profile_picture ? (
                                    <img src={profile.profile_picture} alt="Company Logo" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-4xl font-semibold text-gray-300">{profile.company_name.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            <div className="flex-1 mt-2">
                                <h2 className="text-3xl font-semibold text-gray-900">{profile.company_name}</h2>
                                <p className="text-[15px] font-medium text-gray-500 mt-1 flex items-center justify-center md:justify-start gap-2">
                                    <Briefcase className="w-4 h-4" /> {profile.industry || 'Industry not specified'}
                                </p>
                                <div className="mt-4">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${profile.approved_status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                        Status: {profile.approved_status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {profile.description && (
                            <div>
                                <h3 className={labelCls}>About Company</h3>
                                <p className="text-[15px] text-gray-700 leading-relaxed bg-gray-50 p-6 rounded-3xl border border-gray-100 whitespace-pre-wrap">
                                    {profile.description}
                                </p>
                            </div>
                        )}

                        <div>
                            <h3 className={labelCls}>Contact Information</h3>
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 w-max pr-8">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Work Email</p>
                                    <p className="text-[15px] text-gray-900 font-semibold">{profile.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;