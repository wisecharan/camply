import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import { Users, Building, Briefcase, Award, CheckCircle2, ShieldAlert, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const DashboardHome = () => {
    const [reports, setReports] = useState(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await api.get('/admin/reports');
                setReports(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchReports();
    }, []);

    if (!reports) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-gray-900 rounded-full"></div>
        </div>
    );

    // Calculate pending approvals
    const pendingStudents = reports.total_students - reports.approved_students;
    const pendingCompanies = reports.total_companies - reports.approved_companies;

    // Prepare data for the Bar Chart
    const chartData = [
        {
            name: 'Students',
            Total: reports.total_students,
            Approved: reports.approved_students,
        },
        {
            name: 'Companies',
            Total: reports.total_companies,
            Approved: reports.approved_companies,
        }
    ];

    return (
        <div className="space-y-6 font-sans max-w-7xl">
            
            {/* Page Title */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">Platform overview, metrics, and pending approvals.</p>
            </div>

            {/* Original 4 Top Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Total Students Card */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[160px]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-gray-500 font-medium">
                            <Users className="w-5 h-5 text-gray-400" />
                            Total Students
                        </div>
                    </div>
                    <div className="flex items-end justify-between">
                        <div className="text-[40px] leading-none font-semibold text-gray-900">
                            {reports.total_students}
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full mb-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {reports.approved_students}
                            </span>
                            <span className="text-[11px] text-gray-400 font-medium">Approved</span>
                        </div>
                    </div>
                </div>

                {/* Total Companies Card */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[160px]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-gray-500 font-medium">
                            <Building className="w-5 h-5 text-gray-400" />
                            Total Companies
                        </div>
                    </div>
                    <div className="flex items-end justify-between">
                        <div className="text-[40px] leading-none font-semibold text-gray-900">
                            {reports.total_companies}
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full mb-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {reports.approved_companies}
                            </span>
                            <span className="text-[11px] text-gray-400 font-medium">Approved</span>
                        </div>
                    </div>
                </div>

                {/* Placement Drives Card */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[160px]">
                    <div className="flex items-center gap-2 text-gray-500 font-medium mb-4">
                        <Briefcase className="w-5 h-5 text-gray-400" />
                        Placement Drives
                    </div>
                    <div className="flex items-end justify-between">
                        <div className="text-[40px] leading-none font-semibold text-gray-900">
                            {reports.total_drives}
                        </div>
                        <div className="text-xs font-medium text-gray-400 mb-1">Active overall</div>
                    </div>
                </div>

                {/* Total Hired Card */}
                <div className="bg-gradient-to-br from-gray-900 to-black rounded-[2rem] p-6 shadow-md border border-gray-800 flex flex-col justify-between min-h-[160px]">
                    <div className="flex items-center gap-2 text-gray-300 font-medium mb-4">
                        <Award className="w-5 h-5 text-gray-400" />
                        Total Hired
                    </div>
                    <div className="flex items-end justify-between">
                        <div className="text-[40px] leading-none font-semibold text-white">
                            {reports.total_placements}
                        </div>
                        <div className="text-xs font-medium text-gray-400 mb-1">Successful placements</div>
                    </div>
                </div>

            </div>

            {/* Dynamic Analysis Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Pending Approvals Widget */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 lg:col-span-1 flex flex-col">
                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-6">
                        <ShieldAlert className="w-5 h-5 text-red-500" />
                        Action Required
                    </div>
                    
                    {/* Changed to flex-col with gap-4 and flex-1 to distribute space evenly */}
                    <div className="flex flex-col gap-4 flex-1">
                        
                        {/* Pending Companies - Replaced h-full with flex-1 */}
                        <div className="flex flex-col justify-between p-5 bg-gray-50 rounded-[1.5rem] border border-gray-100 gap-3 flex-1">
                            <div>
                                <p className="text-[15px] font-semibold text-gray-900">Pending Companies</p>
                                <p className="text-sm text-gray-500 mt-0.5">{pendingCompanies} accounts awaiting verification</p>
                            </div>
                            <Link to="/admin/companies" className="w-full mt-2">
                                <button className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 rounded-full text-xs font-semibold hover:bg-gray-100 transition-colors shadow-sm">
                                    Review Companies
                                </button>
                            </Link>
                        </div>

                        {/* Pending Students - Replaced h-full with flex-1 */}
                        <div className="flex flex-col justify-between p-5 bg-gray-50 rounded-[1.5rem] border border-gray-100 gap-3 flex-1">
                            <div>
                                <p className="text-[15px] font-semibold text-gray-900">Pending Students</p>
                                <p className="text-sm text-gray-500 mt-0.5">{pendingStudents} accounts awaiting verification</p>
                            </div>
                            <Link to="/admin/students" className="w-full mt-2">
                                <button className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 rounded-full text-xs font-semibold hover:bg-gray-100 transition-colors shadow-sm">
                                    Review Students
                                </button>
                            </Link>
                        </div>

                    </div>
                </div>

                {/* Graph Widget */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 lg:col-span-2 flex flex-col">
                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-6">
                        <BarChart3 className="w-5 h-5 text-indigo-500" />
                        Platform Verification Status
                    </div>
                    
                    <div className="flex-1 w-full min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 13, fill: '#6b7280', fontWeight: 500 }} 
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 12, fill: '#9ca3af' }} 
                                />
                                <Tooltip 
                                    cursor={{fill: '#f9fafb'}}
                                    contentStyle={{ borderRadius: '1rem', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }} />
                                {/* Black for Total, Green for Approved to match your aesthetic */}
                                <Bar dataKey="Total" fill="#111827" radius={[6, 6, 6, 6]} barSize={40} />
                                <Bar dataKey="Approved" fill="#10b981" radius={[6, 6, 6, 6]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DashboardHome;