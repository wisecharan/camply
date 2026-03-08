import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Bookmark, BookmarkCheck, Briefcase, ChevronRight, X } from 'lucide-react';

const Drives = () => {
    const [drives, setDrives] = useState([]);
    const [applications, setApplications] = useState([]);
    const [bookmarks, setBookmarks] = useState([]);
    const [selectedDrive, setSelectedDrive] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchDrives();
        fetchApplications();
        fetchBookmarks();
    }, []);

    const fetchDrives = async () => {
        try {
            const res = await api.get('/student/drives');
            setDrives(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchApplications = async () => {
        try {
            const res = await api.get('/student/applications');
            setApplications(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleApply = async (drive_id) => {
        try {
            const res = await api.post('/student/apply', { drive_id });
            setMessage({ type: 'success', text: res.data.message });
            fetchApplications(); 
            setSelectedDrive(null); 
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to apply' });
        }
        setTimeout(() => setMessage(''), 5000);
    };

    const fetchBookmarks = async () => {
        try {
            const res = await api.get('/student/bookmarks');
            setBookmarks(res.data.map(b => b.drive_id));
        } catch (err) { console.error(err); }
    };

    const toggleBookmark = async (drive) => {
        const isBookmarked = bookmarks.includes(drive.id);
        if (isBookmarked) {
            const res = await api.get('/student/bookmarks');
            const bm = res.data.find(b => b.drive_id === drive.id);
            if (bm) {
                await api.delete(`/student/bookmarks/${bm.bookmark_id}`);
                setBookmarks(prev => prev.filter(id => id !== drive.id));
            }
        } else {
            await api.post('/student/bookmarks', { drive_id: drive.id });
            setBookmarks(prev => [...prev, drive.id]);
        }
    };

    const checkAppliedStatus = (drive) => {
        return applications.some(app =>
            (app.drive_id && app.drive_id === drive.id) ||
            (app.company_name === drive.company_name && app.role === drive.role)
        );
    };

    return (
        <div className="font-sans space-y-6 max-w-6xl animate-in fade-in duration-500">
            
            {/* Page Title Section - Bold Aesthetic */}
            <div className="mb-10">
                <h1 className="text-[32px] font-semibold text-gray-900 tracking-tight leading-tight">
                    Available Drives.
                </h1>
                <p className="text-gray-500 text-sm mt-1">Discover and apply to new placement opportunities.</p>
            </div>
            
            {message && (
                <div className={`px-5 py-3 rounded-full text-sm font-medium shadow-sm w-max animate-in fade-in ${
                    message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                }`}>
                    {message.text}
                </div>
            )}

            <div className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm">
                {drives.length === 0 ? (
                    <div className="py-24 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Briefcase className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">No Active Drives</h3>
                        <p className="text-gray-500 mt-1">There are no placement drives available at the moment.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {drives.map(drive => {
                            const isApplied = checkAppliedStatus(drive);
                            const isBookmarked = bookmarks.includes(drive.id);
                            
                            return (
                                <div key={drive.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-[#f9fafb] transition-colors group">
                                    
                                    {/* Info Side */}
                                    <div className="flex items-start gap-4 flex-1 cursor-pointer" onClick={() => setSelectedDrive(drive)}>
                                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center font-semibold text-gray-400 flex-shrink-0 mt-1">
                                            {drive.company_name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-black transition-colors">{drive.company_name}</h3>
                                                {isApplied && <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-semibold uppercase tracking-wide rounded border border-gray-200">Applied</span>}
                                            </div>
                                            <p className="text-[15px] font-medium text-gray-600 mb-3">{drive.role}</p>
                                            
                                            <div className="flex flex-wrap items-center gap-2">
                                                {drive.eligibility_cgpa && (
                                                    <span className="px-3 py-1 bg-white border border-gray-200 text-gray-600 rounded-full text-xs font-medium">
                                                        CGPA: {drive.eligibility_cgpa}+
                                                    </span>
                                                )}
                                                {drive.deadline && (
                                                    <span className="px-3 py-1 bg-white border border-gray-200 text-gray-600 rounded-full text-xs font-medium">
                                                        Due: {new Date(drive.deadline).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Side */}
                                    <div className="flex items-center gap-3 ml-[64px] md:ml-0">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); toggleBookmark(drive); }}
                                            className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all shadow-sm"
                                        >
                                            {isBookmarked ? <BookmarkCheck className="w-4 h-4 text-gray-900" /> : <Bookmark className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => setSelectedDrive(drive)}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-full text-sm font-semibold shadow-sm hover:bg-black transition-colors"
                                        >
                                            View Details
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                    
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Drive Details Modal */}
            {selectedDrive && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-900/40 backdrop-blur-sm p-0 sm:p-4 transition-all duration-300">
                    <div className="bg-white rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 duration-300">
                        
                        <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-start bg-white sticky top-0 z-10">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center font-semibold text-xl text-gray-400 flex-shrink-0">
                                    {selectedDrive.company_name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-semibold text-gray-900 leading-tight">{selectedDrive.company_name}</h2>
                                    <p className="text-[15px] font-semibold text-gray-500 mt-1">{selectedDrive.role}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedDrive(null)} 
                                className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-500 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 md:p-8 overflow-y-auto">
                            <div className="mb-8">
                                <h3 className="text-[13px] font-semibold text-gray-400 uppercase tracking-widest mb-3">About the Role</h3>
                                <p className="text-[15px] text-gray-700 leading-relaxed bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                                    {selectedDrive.description}
                                </p>
                            </div>

                            <h3 className="text-[13px] font-semibold text-gray-400 uppercase tracking-widest mb-4">Requirements & Details</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {selectedDrive.eligibility_cgpa && (
                                    <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                        <p className="text-xs font-medium text-gray-500 mb-1">Min CGPA</p>
                                        <p className="text-lg font-semibold text-gray-900">{selectedDrive.eligibility_cgpa}</p>
                                    </div>
                                )}
                                {selectedDrive.eligibility_backlogs !== null && (
                                    <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                        <p className="text-xs font-medium text-gray-500 mb-1">Max Backlogs</p>
                                        <p className="text-lg font-semibold text-gray-900">{selectedDrive.eligibility_backlogs}</p>
                                    </div>
                                )}
                                {selectedDrive.eligibility_year && (
                                    <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                        <p className="text-xs font-medium text-gray-500 mb-1">Batch</p>
                                        <p className="text-lg font-semibold text-gray-900">{selectedDrive.eligibility_year}</p>
                                    </div>
                                )}
                                <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                    <p className="text-xs font-medium text-gray-500 mb-1">Deadline</p>
                                    <p className="text-[15px] font-semibold text-gray-900">{new Date(selectedDrive.deadline).toLocaleDateString()}</p>
                                </div>
                            </div>
                            
                            {selectedDrive.eligibility_skills && (
                                <div className="mt-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                    <p className="text-xs font-medium text-gray-500 mb-3">Required Skills</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedDrive.eligibility_skills.split(',').map((skill, idx) => (
                                            <span key={idx} className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full">
                                                {skill.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 md:p-8 border-t border-gray-100 bg-white mt-auto">
                            {checkAppliedStatus(selectedDrive) ? (
                                <button disabled className="w-full py-3.5 bg-gray-100 text-gray-400 rounded-full text-[15px] font-semibold cursor-not-allowed">
                                    Application Submitted
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleApply(selectedDrive.id)}
                                    className="w-full py-3.5 bg-gray-900 text-white rounded-full text-[15px] font-semibold shadow-md hover:bg-black transition-all hover:scale-[1.01] active:scale-[0.99]"
                                >
                                    Apply for this Role
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Drives;