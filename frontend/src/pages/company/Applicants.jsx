import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../services/api';
import { Filter, Users, Eye, Search } from 'lucide-react';

const Applicants = () => {
    const [applications, setApplications] = useState([]);
    const [drives, setDrives] = useState([]);
    const [selectedDrive, setSelectedDrive] = useState('');
    const [filters, setFilters] = useState({ name: '', skills: '', branch: '', cgpa_min: '', cgpa_max: '' });
    const [showFilters, setShowFilters] = useState(false);
    const [message, setMessage] = useState('');
    const location = useLocation();

    useEffect(() => {
        fetchDrives();
        const query = new URLSearchParams(location.search);
        const driveId = query.get('drive_id');
        if (driveId) { 
            setSelectedDrive(driveId); 
            fetchApplicants(driveId); 
        }
    }, [location]);

    const fetchDrives = async () => {
        try {
            const res = await api.get('/company/drives');
            setDrives(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchApplicants = async (driveId) => {
        try {
            const params = new URLSearchParams({ drive_id: driveId, ...filters });
            const res = await api.get(`/company/applicants?${params}`);
            setApplications(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDriveChange = (e) => {
        const driveId = e.target.value;
        setSelectedDrive(driveId);
        if (driveId) { 
            fetchApplicants(driveId); 
        } else { 
            setApplications([]); 
        }
    };

    const updateStatus = async (applicationId, status) => {
        try {
            await api.put('/company/update-status', { application_id: applicationId, status });
            setMessage({ type: 'success', text: `Status updated to ${status}` });
            fetchApplicants(selectedDrive);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update status' });
        }
        setTimeout(() => setMessage(''), 3000);
    };

    const logResumeView = async (studentId) => {
        await api.post(`/company/resume-download/${studentId}`);
    };

    const getStatusColor = (status) => {
        const map = { 
            applied: 'bg-gray-100 text-gray-700 border-gray-200', 
            shortlisted: 'bg-amber-50 text-amber-700 border-amber-200', 
            selected: 'bg-green-50 text-green-700 border-green-200', 
            rejected: 'bg-red-50 text-red-700 border-red-200' 
        };
        return map[status?.toLowerCase()] || 'bg-gray-50 text-gray-600 border-gray-100';
    };

    const getScoreColor = (score) => score >= 70 ? 'text-green-600' : score >= 40 ? 'text-amber-500' : 'text-red-400';

    return (
        <div className="space-y-6 font-sans max-w-[1400px]">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900">Applicant Review</h1>
                    <p className="text-sm text-gray-500 mt-1">Review, rank, and shortlist students based on AI skill matching.</p>
                </div>
            </div>

            {message && (
                <div className={`px-5 py-3 rounded-full text-sm font-medium shadow-sm w-max animate-in fade-in ${
                    message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                }`}>
                    {message.text}
                </div>
            )}

            {/* Top Control Bar */}
            <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1 w-full md:max-w-md relative">
                    <select 
                        value={selectedDrive} 
                        onChange={handleDriveChange}
                        className="w-full pl-4 pr-10 py-3 bg-gray-50 border-none rounded-2xl text-[15px] font-medium text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none appearance-none cursor-pointer"
                    >
                        <option value="">-- Select a Drive to View Applicants --</option>
                        {drives.map(d => <option key={d.id} value={d.id}>{d.role} ({d.applicant_count} apps)</option>)}
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>
                
                {selectedDrive && (
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold transition-colors ${showFilters ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                    >
                        <Filter className="w-4 h-4" /> Filters
                    </button>
                )}
            </div>

            {/* Expandable Filters */}
            {selectedDrive && showFilters && (
                <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm animate-in slide-in-from-top-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                            { key: 'name', placeholder: 'Search Name...' },
                            { key: 'skills', placeholder: 'Specific Skills...' },
                            { key: 'branch', placeholder: 'Branch...' },
                            { key: 'cgpa_min', placeholder: 'Min CGPA', type: 'number' },
                            { key: 'cgpa_max', placeholder: 'Max CGPA', type: 'number' },
                        ].map(f => (
                            <input 
                                key={f.key} 
                                type={f.type || 'text'} 
                                placeholder={f.placeholder}
                                value={filters[f.key]} 
                                onChange={e => setFilters({ ...filters, [f.key]: e.target.value })}
                                className="px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-gray-200 outline-none" 
                            />
                        ))}
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button 
                            onClick={() => fetchApplicants(selectedDrive)}
                            className="px-6 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-black transition-colors"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            )}

            {/* Main Applicants Table */}
            {selectedDrive && (
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider w-20 text-center">Rank</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Candidate Info</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">CGPA</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">AI Match Score</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Skills</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {applications.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-16 text-center">
                                            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500 font-medium">No candidates found for this drive.</p>
                                        </td>
                                    </tr>
                                ) : applications.map(app => (
                                    <tr key={app.application_id} className="hover:bg-[#f9fafb] transition-colors group">
                                        
                                        <td className="px-6 py-5 text-center">
                                            <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-white font-semibold text-sm shadow-sm">
                                                #{app.rank}
                                            </div>
                                        </td>

                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-semibold flex-shrink-0">
                                                    {app.student_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-[15px] font-semibold text-gray-900">{app.student_name}</div>
                                                    <div className="text-xs text-gray-500 font-medium">{app.student_department || 'Department N/A'}</div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-5 text-center">
                                            <span className="text-[15px] font-semibold text-gray-900 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">{app.student_cgpa ?? '-'}</span>
                                        </td>

                                        <td className="px-6 py-5 w-48">
                                            <div className={`text-sm font-semibold mb-1 ${getScoreColor(app.skill_match_score)}`}>{app.skill_match_score}%</div>
                                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${app.skill_match_score >= 70 ? 'bg-green-500' : app.skill_match_score >= 40 ? 'bg-amber-500' : 'bg-red-400'}`}
                                                    style={{ width: `${app.skill_match_score}%` }}></div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-5 max-w-[200px]">
                                            <div className="flex flex-wrap gap-1.5">
                                                {app.student_skills ? app.student_skills.split(',').slice(0, 3).map((s, i) => (
                                                    <span key={i} className="bg-white border border-gray-200 text-gray-600 text-[11px] font-semibold px-2 py-1 rounded-md">{s.trim()}</span>
                                                )) : <span className="text-gray-400 text-xs">No skills listed</span>}
                                                {app.student_skills?.split(',').length > 3 && <span className="text-xs text-gray-400 font-medium pl-1">+{app.student_skills.split(',').length - 3}</span>}
                                            </div>
                                        </td>

                                        <td className="px-6 py-5 text-center">
                                            <span className={`inline-flex px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full border ${getStatusColor(app.status)}`}>
                                                {app.status}
                                            </span>
                                        </td>

                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {app.student_resume && (
                                                    <a href={`http://localhost:5000${app.student_resume}`} target="_blank" rel="noopener noreferrer"
                                                        onClick={() => logResumeView(app.student_id)}
                                                        className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-full transition-colors" title="View Resume">
                                                        <Eye className="w-4 h-4" />
                                                    </a>
                                                )}
                                                
                                                {app.status === 'applied' && (
                                                    <>
                                                        <button onClick={() => updateStatus(app.application_id, 'shortlisted')} className="px-4 py-1.5 bg-gray-900 text-white rounded-full text-xs font-semibold hover:bg-black transition-colors shadow-sm">
                                                            Shortlist
                                                        </button>
                                                        <button onClick={() => updateStatus(app.application_id, 'rejected')} className="px-4 py-1.5 bg-white border border-gray-200 text-red-600 rounded-full text-xs font-semibold hover:bg-red-50 hover:border-red-200 transition-colors">
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                
                                                {app.status === 'shortlisted' && (
                                                    <button onClick={() => updateStatus(app.application_id, 'selected')} className="px-4 py-1.5 bg-green-600 text-white rounded-full text-xs font-semibold hover:bg-green-700 transition-colors shadow-sm">
                                                        Select Hire
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Applicants;