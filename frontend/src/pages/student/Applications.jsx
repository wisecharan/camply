import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Building2, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';

const STATUSES = ['Applied', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'];

const Applications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/student/applications').then(res => {
            setApplications(res.data);
        }).finally(() => setLoading(false));
    }, []);

    const getStatusColor = (status) => {
        const map = { 
            applied: 'bg-gray-100 text-gray-700 border-gray-200', 
            shortlisted: 'bg-blue-50 text-blue-700 border-blue-200', 
            selected: 'bg-green-50 text-green-700 border-green-200', 
            rejected: 'bg-red-50 text-red-700 border-red-200' 
        };
        return map[status?.toLowerCase()] || 'bg-gray-50 text-gray-600 border-gray-100';
    };

    const TimelineDot = ({ completed, label, date, isRejected }) => (
        <div className="flex flex-col items-center flex-1 relative group">
            <div className={`relative z-10 h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                completed 
                    ? isRejected 
                        ? 'bg-red-50 text-red-600 border border-red-200' 
                        : 'bg-gray-900 text-white shadow-md' 
                    : 'bg-white border-2 border-gray-100 text-gray-300'
            }`}>
                {completed ? (isRejected ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />) : <Clock className="w-4 h-4" />}
            </div>
            <div className="text-center mt-3 absolute top-10 w-32 left-1/2 -translate-x-1/2">
                <p className={`text-[13px] font-semibold leading-tight ${completed ? isRejected ? 'text-red-600' : 'text-gray-900' : 'text-gray-400'}`}>
                    {label}
                </p>
                {date && <p className="text-[11px] font-medium text-gray-400 mt-1">{new Date(date).toLocaleDateString()}</p>}
            </div>
        </div>
    );

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-gray-900 rounded-full"></div></div>;

    return (
        <div className="font-sans space-y-6 max-w-5xl animate-in fade-in duration-500">
            
            {/* Page Title Section */}
            <div className="mb-10">
                <h1 className="text-[32px] font-semibold text-gray-900 tracking-tight leading-tight">
                    My Applications
                </h1>
                <p className="text-gray-500 text-sm mt-1">Track the real-time status of your career opportunities.</p>
            </div>
            
            {applications.length === 0 ? (
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm py-24 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Building2 className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">No Applications Yet</h3>
                    <p className="text-gray-500 mt-1">You haven't applied to any placement drives.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {applications.map(app => (
                        <div key={app.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                            
                            {/* Header Section */}
                            <div className="p-6 md:p-8 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                                <div className="flex items-start gap-4">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900">{app.company_name}</h3>
                                        <p className="text-[15px] font-medium text-gray-500 mt-0.5">{app.role}</p>
                                        <p className="text-xs font-medium text-gray-400 mt-2 flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            Applied on {new Date(app.applied_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-start md:items-end gap-3 mt-2 md:mt-0">
                                    <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold border capitalize tracking-wide ${getStatusColor(app.status)}`}>
                                        {app.status}
                                    </span>
                                    {app.booked_slot && (
                                        <div className="text-xs font-medium bg-gray-50 text-gray-700 rounded-full px-3 py-1.5 border border-gray-200 flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            Interview: {new Date(app.booked_slot.start_time).toLocaleString()}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Timeline Section */}
                            <div className="px-6 md:px-8 pb-10 pt-4 bg-gray-50/50 border-t border-gray-100 mt-2">
                                <div className="flex items-center justify-between relative max-w-3xl mx-auto pt-6 pb-16">
                                    
                                    {/* Connecting Line */}
                                    <div className="absolute top-11 left-[10%] right-[10%] h-0.5 bg-gray-200 z-0"></div>
                                    
                                    {app.timeline.filter(t => t.status !== 'Rejected' || app.status === 'rejected').map((step, i, arr) => (
                                        <TimelineDot 
                                            key={step.status} 
                                            completed={step.completed} 
                                            label={step.status} 
                                            date={step.date} 
                                            isRejected={step.status === 'Rejected'} 
                                        />
                                    ))}
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Applications;