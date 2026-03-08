import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import { Plus, Users, Calendar, Pencil, Archive, ChevronRight } from 'lucide-react';

const Drives = () => {
    const [drives, setDrives] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDrives();
    }, []);

    const fetchDrives = async () => {
        try {
            const res = await api.get('/company/drives');
            setDrives(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-gray-900 rounded-full"></div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto font-sans space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900">My Postings</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage and track your placement drives for students.</p>
                </div>
                <Link to="/company/create-drive">
                    <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-black shadow-md transition-all active:scale-95">
                        <Plus className="w-4 h-4" />
                        Create New Drive
                    </button>
                </Link>
            </div>

            <div className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm">
                {drives.length === 0 ? (
                    <div className="p-24 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Plus className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">No Drives Posted</h3>
                        <p className="text-sm text-gray-500 mt-1 mb-6">You haven't created any placement drives yet.</p>
                        <Link to="/company/create-drive" className="px-6 py-2.5 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-black transition-colors shadow-sm">
                            Post your first drive
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {drives.map(drive => (
                            <div key={drive.id} className="group p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-[#f9fafb] transition-colors">
                                
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">{drive.role}</h3>
                                        <span className="px-2.5 py-1 bg-green-50 text-green-700 text-[10px] font-semibold uppercase tracking-wide rounded-md border border-green-100">Active</span>
                                    </div>

                                    <p className="text-sm text-gray-500 line-clamp-1 max-w-2xl mb-4">{drive.description}</p>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-full text-xs font-semibold">
                                            <Users className="w-3.5 h-3.5 text-gray-400" />
                                            {drive.applicant_count} Applicants
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-full text-xs font-semibold">
                                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                            Due {new Date(drive.deadline).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* Action Buttons: Edit and Archive */}
                                    <div className="flex items-center bg-white border border-gray-200 rounded-full shadow-sm p-1">
                                        <button 
                                            className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors" 
                                            title="Edit Posting"
                                            onClick={() => {/* Navigate to edit page */}}
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <div className="w-px h-4 bg-gray-200 mx-1"></div>
                                        <button 
                                            className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" 
                                            title="Archive Drive"
                                            onClick={() => {/* Handle Archive logic */}}
                                        >
                                            <Archive className="w-4 h-4" />
                                        </button>
                                    </div>
                                    
                                    <Link to={`/company/applicants?drive_id=${drive.id}`}>
                                        <button className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-full text-sm font-semibold shadow-sm hover:bg-black transition-all group/btn">
                                            View Applicants
                                            <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                                        </button>
                                    </Link>
                                </div>
                                
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Drives;