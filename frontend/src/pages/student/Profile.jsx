import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { UploadCloud, FileText, Github, Linkedin, Eye, Edit2, Check } from 'lucide-react';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [resumeFile, setResumeFile] = useState(null);
    const [uploadMsg, setUploadMsg] = useState('');
    const [parsedData, setParsedData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => { 
        fetchProfile(); 
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/student/profile');
            setProfile(res.data);
            setFormData(res.data);
        } catch (err) { 
            console.error(err); 
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put('/student/profile', formData);
            setIsEditing(false);
            fetchProfile();
        } catch (err) { 
            console.error(err); 
        }
    };

    const handleResumeUpload = async () => {
        if (!resumeFile) return;
        setLoading(true);
        const fd = new FormData();
        fd.append('resume', resumeFile);
        try {
            const res = await api.post('/student/upload-resume', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUploadMsg({ type: 'success', text: 'Resume uploaded & parsed!' });
            setParsedData(res.data.parsed_data);
            fetchProfile();
        } catch (err) {
            setUploadMsg({ type: 'error', text: err.response?.data?.message || 'Upload failed' });
        }
        setLoading(false);
        setTimeout(() => setUploadMsg(''), 5000);
    };

    const inputCls = "w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-[15px] font-medium focus:ring-2 focus:ring-gray-200 outline-none transition-all placeholder:text-gray-400";
    const labelCls = "block text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-2 pl-1";

    if (!profile) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-gray-900 rounded-full"></div></div>;

    return (
        <div className="font-sans max-w-5xl space-y-6">
            
            {/* Header Area */}
            <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">{profile.name}</h1>
                        <p className="text-[15px] text-gray-500 font-medium mt-1">
                            {profile.department || 'Student'} {profile.graduation_year && `· Class of ${profile.graduation_year}`}
                        </p>
                        <span className="mt-3 inline-flex text-xs font-semibold px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 uppercase tracking-wide">
                            {profile.approved_status}
                        </span>
                    </div>
                </div>
                <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-full text-sm font-semibold transition-colors flex items-center gap-2 w-max"
                >
                    {isEditing ? <><Check className="w-4 h-4"/> Done Editing</> : <><Edit2 className="w-4 h-4"/> Edit Profile</>}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Form or Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
                        {isEditing ? (
                            <form onSubmit={handleUpdate} className="space-y-6 animate-in fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className={labelCls}>Phone</label>
                                        <input type="text" className={inputCls} placeholder="+1 234 567 8900" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div>
                                    <div><label className={labelCls}>Department</label>
                                        <input type="text" className={inputCls} placeholder="e.g. Computer Science" value={formData.department || ''} onChange={e => setFormData({ ...formData, department: e.target.value })} /></div>
                                    <div><label className={labelCls}>CGPA</label>
                                        <input type="number" step="0.01" className={inputCls} placeholder="0.00" value={formData.cgpa || ''} onChange={e => setFormData({ ...formData, cgpa: e.target.value })} /></div>
                                    <div><label className={labelCls}>Grad Year</label>
                                        <input type="number" className={inputCls} placeholder="YYYY" value={formData.graduation_year || ''} onChange={e => setFormData({ ...formData, graduation_year: e.target.value })} /></div>
                                    <div><label className={labelCls}>Backlogs</label>
                                        <input type="number" className={inputCls} value={formData.backlogs || 0} onChange={e => setFormData({ ...formData, backlogs: e.target.value })} /></div>
                                    <div><label className={labelCls}>Resume Visibility</label>
                                        <select className={`${inputCls} cursor-pointer appearance-none`} value={formData.resume_visibility || 'all'} onChange={e => setFormData({ ...formData, resume_visibility: e.target.value })}>
                                            <option value="all">Public to Companies</option>
                                            <option value="applied">Only when Applied</option>
                                            <option value="private">Private</option>
                                        </select></div>
                                    <div className="col-span-2"><label className={labelCls}>Skills (comma separated)</label>
                                        <textarea rows="2" className={`${inputCls} resize-none`} placeholder="React, Python, AWS..." value={formData.skills || ''} onChange={e => setFormData({ ...formData, skills: e.target.value })} /></div>
                                    <div className="col-span-2"><label className={labelCls}>Bio</label>
                                        <textarea rows="3" className={`${inputCls} resize-none`} placeholder="Tell companies about yourself..." value={formData.bio || ''} onChange={e => setFormData({ ...formData, bio: e.target.value })} /></div>
                                </div>
                                <div className="pt-2">
                                    <button type="submit" className="w-full py-3.5 bg-gray-900 text-white rounded-full text-[15px] font-semibold hover:bg-black shadow-md transition-all">Save Changes</button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-8 animate-in fade-in">
                                {profile.bio && (
                                    <div>
                                        <h3 className={labelCls}>About Me</h3>
                                        <p className="text-[15px] text-gray-700 leading-relaxed">{profile.bio}</p>
                                    </div>
                                )}
                                
                                <div>
                                    <h3 className={labelCls}>Academic Details</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
                                        <div className="p-4 bg-gray-50 rounded-2xl"><p className="text-xs text-gray-500 mb-1 font-medium">CGPA</p><p className="text-lg font-semibold text-gray-900">{profile.cgpa || '-'}</p></div>
                                        <div className="p-4 bg-gray-50 rounded-2xl"><p className="text-xs text-gray-500 mb-1 font-medium">Batch</p><p className="text-lg font-semibold text-gray-900">{profile.graduation_year || '-'}</p></div>
                                        <div className="p-4 bg-gray-50 rounded-2xl"><p className="text-xs text-gray-500 mb-1 font-medium">Backlogs</p><p className="text-lg font-semibold text-gray-900">{profile.backlogs ?? '-'}</p></div>
                                        <div className="p-4 bg-gray-50 rounded-2xl"><p className="text-xs text-gray-500 mb-1 font-medium">Visibility</p><p className="text-sm font-semibold text-gray-900 mt-1 capitalize">{profile.resume_visibility || 'All'}</p></div>
                                    </div>
                                </div>

                                {profile.skills && (
                                    <div>
                                        <h3 className={labelCls}>Skills</h3>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {profile.skills.split(',').map((s, i) => (
                                                <span key={i} className="bg-white border border-gray-200 text-gray-700 text-sm font-medium px-4 py-1.5 rounded-full shadow-sm">
                                                    {s.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Resume & Links */}
                <div className="space-y-6">
                    
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
                        <h3 className={labelCls}>Resume</h3>
                        
                        {profile.resume_url && (
                            <a href={`http://localhost:5000${profile.resume_url}`} target="_blank" rel="noopener noreferrer" 
                                className="mt-4 flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors group mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                        <FileText className="w-5 h-5 text-gray-700" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">Current_Resume.pdf</p>
                                        <p className="text-xs text-gray-500 mt-0.5">Click to view</p>
                                    </div>
                                </div>
                                <Eye className="w-4 h-4 text-gray-400 group-hover:text-gray-900" />
                            </a>
                        )}

                        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-gray-400 transition-colors relative">
                            <input type="file" accept=".pdf,.doc,.docx" onChange={e => setResumeFile(e.target.files[0])}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm font-medium text-gray-900">{resumeFile ? resumeFile.name : 'Upload New Resume'}</p>
                            <p className="text-xs text-gray-500 mt-1">PDF or DOCX up to 5MB</p>
                        </div>
                        
                        {resumeFile && (
                            <button onClick={handleResumeUpload} disabled={loading}
                                className="w-full mt-4 py-2.5 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-black disabled:opacity-50 transition-colors">
                                {loading ? 'Processing...' : 'Save & Parse'}
                            </button>
                        )}
                        
                        {uploadMsg && (
                            <div className={`mt-4 text-xs font-medium px-4 py-2 rounded-lg text-center ${uploadMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {uploadMsg.text}
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
                        <h3 className={labelCls}>Social Links</h3>
                        <div className="space-y-3 mt-4">
                            {isEditing ? (
                                <>
                                    <div className="relative">
                                        <Linkedin className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
                                        <input type="text" className={`${inputCls} pl-11`} placeholder="LinkedIn URL" value={formData.linkedin_url || ''} onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })} />
                                    </div>
                                    <div className="relative">
                                        <Github className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
                                        <input type="text" className={`${inputCls} pl-11`} placeholder="GitHub URL" value={formData.github_url || ''} onChange={e => setFormData({ ...formData, github_url: e.target.value })} />
                                    </div>
                                </>
                            ) : (
                                <>
                                    {profile.linkedin_url ? (
                                        <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors text-[15px] font-medium text-gray-700">
                                            <Linkedin className="w-5 h-5 text-blue-600" /> LinkedIn Profile
                                        </a>
                                    ) : <p className="text-sm text-gray-400 p-2">No LinkedIn added</p>}
                                    {profile.github_url ? (
                                        <a href={profile.github_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors text-[15px] font-medium text-gray-700">
                                            <Github className="w-5 h-5 text-gray-900" /> GitHub Profile
                                        </a>
                                    ) : <p className="text-sm text-gray-400 p-2">No GitHub added</p>}
                                </>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Profile;