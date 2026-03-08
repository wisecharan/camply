import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Briefcase, ArrowLeft } from 'lucide-react';

const CreateDrive = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        role: '', description: '', eligibility_cgpa: '', eligibility_branches: '', eligibility_skills: '', eligibility_year: '', eligibility_backlogs: '', deadline: '', interview_date: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/company/create-drive', {
                ...formData,
                eligibility_cgpa: formData.eligibility_cgpa ? parseFloat(formData.eligibility_cgpa) : null,
                eligibility_branches: formData.eligibility_branches ? formData.eligibility_branches : null,
                eligibility_skills: formData.eligibility_skills ? formData.eligibility_skills : null,
                eligibility_year: formData.eligibility_year ? parseInt(formData.eligibility_year) : null,
                eligibility_backlogs: formData.eligibility_backlogs !== '' ? parseInt(formData.eligibility_backlogs) : null,
            });
            navigate('/company/drives');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create drive');
            setLoading(false);
        }
    };

    const inputCls = "w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-[15px] font-medium focus:ring-2 focus:ring-gray-200 outline-none transition-all placeholder:text-gray-400";
    const labelCls = "block text-[13px] font-bold text-gray-500 uppercase tracking-wide mb-2 pl-1";

    return (
        <div className="max-w-4xl mx-auto font-sans space-y-6">
            
            <div className="flex items-center gap-4 mb-2">
                <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors shadow-sm">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900">Post a New Drive</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Fill out the details below to attract top talent.</p>
                </div>
            </div>

            <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-gray-100">
                {error && <div className="bg-red-50 text-red-700 px-5 py-4 rounded-2xl mb-8 text-sm font-medium border border-red-100">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Basic Info Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                            <Briefcase className="w-5 h-5 text-gray-400" />
                            <h2 className="text-lg font-semibold text-gray-900">Role Details</h2>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className={labelCls}>Job Role / Title</label>
                                <input type="text" required placeholder="e.g. Frontend Developer" className={inputCls} value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelCls}>Description</label>
                                <textarea required rows="4" placeholder="Detail the responsibilities and what you are looking for..." className={`${inputCls} resize-none`} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    {/* Eligibility Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4 pt-4">
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <h2 className="text-lg font-semibold text-gray-900">Eligibility Criteria</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelCls}>Min CGPA</label>
                                <input type="number" step="0.01" placeholder="e.g. 7.5" className={inputCls} value={formData.eligibility_cgpa} onChange={e => setFormData({ ...formData, eligibility_cgpa: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelCls}>Max Backlogs</label>
                                <input type="number" placeholder="e.g. 0" className={inputCls} value={formData.eligibility_backlogs} onChange={e => setFormData({ ...formData, eligibility_backlogs: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelCls}>Eligible Branches</label>
                                <input type="text" placeholder="CSE, IT (comma separated)" className={inputCls} value={formData.eligibility_branches} onChange={e => setFormData({ ...formData, eligibility_branches: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelCls}>Graduation Year</label>
                                <input type="number" placeholder="e.g. 2026" className={inputCls} value={formData.eligibility_year} onChange={e => setFormData({ ...formData, eligibility_year: e.target.value })} />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelCls}>Required Skills</label>
                                <input type="text" placeholder="React, Node.js, Python (comma separated)" className={inputCls} value={formData.eligibility_skills} onChange={e => setFormData({ ...formData, eligibility_skills: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    {/* Timeline Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4 pt-4">
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <h2 className="text-lg font-semibold text-gray-900">Timeline</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelCls}>Application Deadline</label>
                                <input type="date" required className={inputCls} value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelCls}>Interview Date</label>
                                <input type="date" required className={inputCls} value={formData.interview_date} onChange={e => setFormData({ ...formData, interview_date: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 flex justify-end gap-3 border-t border-gray-100">
                        <button type="button" onClick={() => navigate('/company/drives')} className="px-6 py-3.5 bg-gray-100 text-gray-700 rounded-full text-[15px] font-semibold hover:bg-gray-200 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="px-8 py-3.5 bg-gray-900 text-white rounded-full text-[15px] font-semibold hover:bg-black shadow-md transition-all disabled:opacity-50">
                            {loading ? 'Posting...' : 'Post Drive'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateDrive;