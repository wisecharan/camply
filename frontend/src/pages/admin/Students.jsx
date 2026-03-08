import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Users, AlertCircle } from 'lucide-react';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await api.get('/admin/students');
            setStudents(res.data);
            setError('');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to load students. You may need to re-login.');
        }
    };

    const handleStatusChange = async (userId, status) => {
        try {
            await api.post('/admin/approve-user', { user_type: 'student', user_id: userId, status });
            fetchStudents();
        } catch (err) {
            console.error('Failed to update student status', err);
            alert('Action failed');
        }
    };

    const getStatusStyles = (status) => {
        if (status === 'approved') return 'bg-green-50 text-green-600 border-green-200';
        if (status === 'rejected') return 'bg-red-50 text-red-600 border-red-200';
        return 'bg-amber-50 text-amber-600 border-amber-200';
    };

    return (
        <div className="w-full font-sans space-y-4">
            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-[1.5rem] text-sm font-medium flex items-center gap-3 shadow-sm">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <div>
                        {error} — please <button onClick={fetchStudents} className="underline font-bold hover:text-red-800 ml-1">retry</button> or re-login.
                    </div>
                </div>
            )}

            <div className="bg-white shadow-sm border border-gray-100 rounded-[2rem] overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Users className="w-5 h-5 text-gray-400" />
                        Student Roster
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Info</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">CGPA</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {students.map(student => (
                                <tr key={student.id} className="hover:bg-[#f9fafb] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
                                                {student.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-[15px] font-semibold text-gray-900">{student.name}</div>
                                                <div className="text-xs text-gray-500">{student.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[14px] font-medium text-gray-600">{student.department || 'Not specified'}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[14px] font-bold text-gray-900">{student.cgpa || '-'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm capitalize">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusStyles(student.approved_status)}`}>
                                            {student.approved_status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {student.approved_status === 'pending' && (
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleStatusChange(student.id, 'rejected')} className="text-xs font-medium text-gray-500 hover:text-red-600 bg-white border border-gray-200 hover:border-red-200 rounded-full px-4 py-1.5 transition-all">
                                                    Reject
                                                </button>
                                                <button onClick={() => handleStatusChange(student.id, 'approved')} className="text-xs font-medium text-white bg-gray-900 hover:bg-black rounded-full px-4 py-1.5 shadow-sm transition-all">
                                                    Approve
                                                </button>
                                            </div>
                                        )}
                                        {student.approved_status === 'approved' && (
                                            <button onClick={() => handleStatusChange(student.id, 'rejected')} className="text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                                                Revoke
                                            </button>
                                        )}
                                        {student.approved_status === 'rejected' && (
                                            <button onClick={() => handleStatusChange(student.id, 'approved')} className="text-xs font-medium text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-full transition-colors">
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

export default Students;