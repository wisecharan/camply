import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Sparkles, ArrowRight } from 'lucide-react';

const Recommendations = () => {
    const [drives, setDrives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(null);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const res = await api.get('/student/recommendations');
                setDrives(res.data);
            } catch (err) { 
                console.error('Failed to fetch recommendations', err); 
            } 
            finally { 
                setLoading(false); 
            }
        };
        fetchRecommendations();
    }, []);

    const handleApply = async (driveId) => {
        setApplying(driveId);
        try {
            await api.post('/student/apply', { drive_id: driveId });
            setMessage({ type: 'success', text: 'Applied successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to apply' });
        } finally {
            setApplying(null);
            setTimeout(() => setMessage(null), 4000);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-gray-900 rounded-full"></div></div>;

    return (
        <div className="font-sans space-y-6 max-w-6xl">
            
            <div className="mb-8">
                <h1 className="text-3xl font-semibold text-gray-900 flex items-center gap-2">
                    AI Recommendations
                </h1>
                <p className="text-sm text-gray-500 mt-1">Custom picked for you based on your skills, CGPA, and department profile.</p>
            </div>

            {message && (
                <div className={`px-5 py-3 rounded-full text-sm font-medium shadow-sm w-max animate-in fade-in ${
                    message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                }`}>
                    {message.text}
                </div>
            )}

            {drives.length === 0 ? (
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm py-24 text-center">
                    <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">Need more data</h3>
                    <p className="text-gray-500 mt-1">Please fully complete your profile (skills, CGPA) to get AI matches.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {drives.map((drive) => (
                        <div key={drive.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col p-6 group">
                            
                            {/* Top row: Match Score */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center font-semibold text-lg text-gray-400">
                                    {drive.company_name.charAt(0)}
                                </div>
                                <div className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
                                    drive.match_score >= 80 ? 'bg-green-50 text-green-700 border-green-100' : 
                                    drive.match_score >= 50 ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                                    'bg-gray-50 text-gray-600 border-gray-200'
                                }`}>
                                    <Sparkles className="w-3 h-3" />
                                    {drive.match_score}% Match
                                </div>
                            </div>

                            <div className="flex-1">
                                <h3 className="text-xl font-semibold text-gray-900 mb-1">{drive.company_name}</h3>
                                <p className="text-[15px] font-medium text-gray-500 mb-4">{drive.role}</p>
                                
                                {drive.reasons?.length > 0 && (
                                    <div className="mb-6 space-y-2">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Why it matches</p>
                                        <ul className="space-y-1">
                                            {drive.reasons.slice(0,2).map((r, i) => (
                                                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                                    <span className="text-indigo-400 mt-0.5">•</span>
                                                    <span className="leading-tight">{r}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className="pt-6 mt-auto border-t border-gray-50 flex items-center justify-between">
                                <button className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
                                    Details
                                </button>
                                <button
                                    onClick={() => handleApply(drive.id)}
                                    disabled={applying === drive.id}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-full text-sm font-semibold shadow-md hover:bg-black transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                                >
                                    {applying === drive.id ? 'Applying...' : 'Apply Fast'}
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Recommendations;