import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Briefcase, Calendar, CheckCircle, XCircle } from 'lucide-react';

const Drives = () => {
    const [drives, setDrives] = useState([]);

    useEffect(() => {
        fetchDrives();
    }, []);

    const fetchDrives = async () => {
        try {
            const res = await api.get('/admin/all-drives');
            setDrives(res.data);
        } catch (err) {
            console.error('Failed to fetch drives:', err);
        }
    };

    const handleStatusChange = async (driveId, status) => {
        try {
            await api.put(`/admin/drives/${driveId}/status`, { status });
            fetchDrives();
        } catch (err) {
            console.error('Failed to update drive status:', err);
            alert('Action failed');
        }
    };

    const getStatusStyles = (status) => {
        if (status === 'approved') return 'bg-green-50 text-green-600 border-green-200';
        if (status === 'rejected') return 'bg-red-50 text-red-600 border-red-200';
        return 'bg-amber-50 text-amber-600 border-amber-200';
    };

    return (
        <div className="w-full font-sans">
            <div className="bg-white shadow-sm border border-gray-100 rounded-[2rem] overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-gray-400" />
                        Manage Placement Drives
                    </h2>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Drive Details</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Deadline</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {drives.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                                        No placement drives found.
                                    </td>
                                </tr>
                            ) : drives.map(drive => (
                                <tr key={drive.id} className="hover:bg-[#f9fafb] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="text-[15px] font-semibold text-gray-900">{drive.role}</div>
                                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            Posted: {new Date(drive.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[14px] font-medium text-gray-700">{drive.company_name}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[14px] text-gray-600">
                                            {drive.deadline ? new Date(drive.deadline).toLocaleDateString() : 'None'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm capitalize">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusStyles(drive.approved_status)}`}>
                                            {drive.approved_status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {drive.approved_status === 'pending' && (
                                            <div className="flex items-center justify-end gap-2 text-sm">
                                                <button onClick={() => handleStatusChange(drive.id, 'rejected')} className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 bg-white border border-red-100 rounded-full px-3 py-1.5 transition-all">
                                                    <XCircle className="w-3.5 h-3.5" /> Reject
                                                </button>
                                                <button onClick={() => handleStatusChange(drive.id, 'approved')} className="flex items-center gap-1 text-green-700 hover:text-green-800 hover:bg-green-100 bg-green-50 border border-green-200 rounded-full px-3 py-1.5 shadow-sm transition-all">
                                                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                                                </button>
                                            </div>
                                        )}
                                        {drive.approved_status === 'approved' && (
                                            <button onClick={() => handleStatusChange(drive.id, 'rejected')} className="text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                                                Revoke Approval
                                            </button>
                                        )}
                                        {drive.approved_status === 'rejected' && (
                                            <button onClick={() => handleStatusChange(drive.id, 'approved')} className="text-xs font-medium text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                                                Re-evaluate
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Drives;
