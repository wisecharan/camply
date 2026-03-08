import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { BookmarkMinus, Building, Calendar, GraduationCap } from 'lucide-react';

const Bookmarks = () => {
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => { fetchBookmarks(); }, []);

    const fetchBookmarks = () => {
        api.get('/student/bookmarks').then(res => setBookmarks(res.data)).finally(() => setLoading(false));
    };

    const removeBookmark = async (bookmarkId) => {
        try {
            await api.delete(`/student/bookmarks/${bookmarkId}`);
            fetchBookmarks();
        } catch { 
            setMessage({ type: 'error', text: 'Failed to remove bookmark.' }); 
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleApply = async (driveId) => {
        try {
            await api.post('/student/apply', { drive_id: driveId });
            setMessage({ type: 'success', text: 'Applied successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to apply' });
        }
        setTimeout(() => setMessage(''), 4000);
    };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-gray-900 rounded-full"></div></div>;

    return (
        <div className="font-sans space-y-6 max-w-5xl animate-in fade-in duration-500">
            
            {/* Page Title Section - Bold Aesthetic */}
            <div className="mb-10">
                <h1 className="text-[32px] font-semibold text-gray-900 tracking-tight leading-tight">
                    Saved Drives.
                </h1>
                <p className="text-gray-500 text-sm mt-1">Review the opportunities you've bookmarked for later.</p>
            </div>
            
            {message && (
                <div className={`px-5 py-3 rounded-full text-sm font-medium shadow-sm animate-in fade-in slide-in-from-top-2 ${
                    message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                }`}>
                    {message.text}
                </div>
            )}

            {bookmarks.length === 0 ? (
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm py-24 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <BookmarkMinus className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">No Saved Drives</h3>
                    <p className="text-gray-500 mt-1">Drives you bookmark will appear here for easy access.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {bookmarks.map(bm => (
                        <div key={bm.bookmark_id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all flex flex-col h-full group">
                            
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center font-bold text-lg text-gray-400">
                                        {bm.company_name.charAt(0)}
                                    </div>
                                    <button 
                                        onClick={() => removeBookmark(bm.bookmark_id)}
                                        className="w-8 h-8 rounded-full bg-gray-50 hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Remove bookmark"
                                    >
                                        <BookmarkMinus className="w-4 h-4" />
                                    </button>
                                </div>
                                
                                <h3 className="text-lg font-bold text-gray-900">{bm.company_name}</h3>
                                <p className="text-[15px] font-medium text-gray-500 mt-0.5 mb-5">{bm.role}</p>
                                
                                <div className="space-y-2.5 mb-6">
                                    {bm.eligibility_cgpa && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <GraduationCap className="w-4 h-4 text-gray-400" />
                                            Min CGPA: <span className="font-semibold text-gray-900">{bm.eligibility_cgpa}</span>
                                        </div>
                                    )}
                                    {bm.deadline && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            Deadline: <span className="font-semibold text-gray-900">{new Date(bm.deadline).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-50 mt-auto">
                                <button 
                                    onClick={() => handleApply(bm.drive_id)}
                                    className="w-full py-2.5 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-black transition-colors shadow-sm"
                                >
                                    Apply Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Bookmarks;