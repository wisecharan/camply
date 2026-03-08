import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
    BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Users, Building, Briefcase, GraduationCap, ArrowUpRight, TrendingUp } from 'lucide-react';

const COLORS = ['#1a1a1a', '#6b7280', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/admin/analytics').then(res => {
            setData(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-gray-900 rounded-full"></div>
        </div>
    );
    
    if (!data) return <div className="text-center text-gray-500 py-10 font-medium">Failed to load analytics.</div>;

    return (
        <div className="space-y-6 font-sans">
            
            {/* Page Title Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Placement Analytics</h1>
                <p className="text-gray-500 mt-1">Real-time placement data and system-wide hiring trends.</p>
            </div>
            
            {/* Top Overview Cards (Matching the reference design) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Students Card */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[160px]">
                    <div className="flex items-center gap-2 text-gray-500 font-medium mb-4">
                        <Users className="w-5 h-5 text-gray-400" />
                        Students
                    </div>
                    <div className="flex items-end justify-between">
                        <div className="text-[40px] leading-none font-semibold text-gray-900">
                            {data.overview.total_students}
                        </div>
                        <div className="flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-xs font-semibold">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            Active
                        </div>
                    </div>
                </div>

                {/* Companies Card */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[160px]">
                    <div className="flex items-center gap-2 text-gray-500 font-medium mb-4">
                        <Building className="w-5 h-5 text-gray-400" />
                        Companies
                    </div>
                    <div className="flex items-end justify-between">
                        <div className="text-[40px] leading-none font-semibold text-gray-900">
                            {data.overview.total_companies}
                        </div>
                        <div className="flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-xs font-semibold">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            Active
                        </div>
                    </div>
                </div>

                {/* Drives Posted Card */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[160px]">
                    <div className="flex items-center gap-2 text-gray-500 font-medium mb-4">
                        <Briefcase className="w-5 h-5 text-gray-400" />
                        Drives Posted
                    </div>
                    <div className="flex items-end justify-between">
                        <div className="text-[40px] leading-none font-semibold text-gray-900">
                            {data.overview.total_drives}
                        </div>
                        <div className="text-xs font-medium text-gray-400 mb-1">Total to date</div>
                    </div>
                </div>

                {/* Placement Rate Card (Special styling for emphasis) */}
                <div className="bg-gradient-to-br from-gray-900 to-black rounded-[2rem] p-6 shadow-md border border-gray-800 flex flex-col justify-between min-h-[160px] relative overflow-hidden text-white">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <GraduationCap className="w-24 h-24 text-white" />
                    </div>
                    <div className="flex items-center gap-2 text-gray-300 font-medium mb-4 relative z-10">
                        <TrendingUp className="w-5 h-5 text-gray-400" />
                        Placement Rate
                    </div>
                    <div className="relative z-10">
                        <div className="text-[40px] leading-none font-semibold text-white mb-3">
                            {data.overview.placement_percentage}%
                        </div>
                        <div className="bg-white/20 rounded-full h-2 w-full overflow-hidden">
                            <div className="bg-green-400 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${data.overview.placement_percentage}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Line Chart: Monthly Applications (Takes up 2 columns) */}
                {data.monthly_applications.length > 0 && (
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 lg:col-span-2">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">Applications Over Time</h2>
                            <select className="bg-gray-50 border-none text-sm font-medium text-gray-600 rounded-full px-4 py-2 focus:ring-0 cursor-pointer outline-none">
                                <option>Last 6 months</option>
                                <option>This Year</option>
                            </select>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={data.monthly_applications} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ stroke: '#f3f4f6', strokeWidth: 2 }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="applications" 
                                    stroke="#1a1a1a" 
                                    strokeWidth={3} 
                                    dot={{ fill: '#1a1a1a', strokeWidth: 2, r: 4 }} 
                                    activeDot={{ r: 6, fill: '#10b981', stroke: '#fff' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Pie Chart: Status Distribution */}
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Application Status</h2>
                    {data.status_distribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie 
                                    data={data.status_distribution} 
                                    dataKey="count" 
                                    nameKey="status" 
                                    cx="50%" 
                                    cy="45%" 
                                    innerRadius={70}
                                    outerRadius={95} 
                                    paddingAngle={2}
                                >
                                    {data.status_distribution.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend 
                                    verticalAlign="bottom" 
                                    height={36}
                                    iconType="circle"
                                    formatter={(value) => <span className="text-sm font-medium text-gray-700 ml-1">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <p className="text-center text-gray-400 py-12 text-sm">No application data yet.</p>}
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Bar Chart: By Department */}
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Placements by Department</h2>
                    {data.by_department.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={data.by_department} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                <Tooltip 
                                    cursor={{fill: '#f9fafb'}}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="placed" fill="#1a1a1a" radius={[6, 6, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <p className="text-center text-gray-400 py-12 text-sm">No placement data yet.</p>}
                </div>

                {/* Top Drives Table */}
                {data.by_drive.length > 0 && (
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">Most Applied Drives</h2>
                            <button className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                                View all
                            </button>
                        </div>
                        <div className="space-y-4">
                            {data.by_drive.map((d, i) => (
                                <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-lg">
                                            {d.label.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{d.label}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Placement Drive</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900">{d.applications}</p>
                                        <p className="text-[11px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-1 inline-block">Apps</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default Analytics;