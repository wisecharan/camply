import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { 
    Briefcase, Users, ArrowUpRight, TrendingUp, 
    BarChart3, Zap 
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const DashboardHome = () => {
    const [stats, setStats] = useState({ 
        drives: 0, 
        applicants: 0, 
        avgApplicants: 0,
        chartData: [],
        topSkills: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/company/drives');
                const drives = res.data;
                
                // Basic metric calculations
                const totalApplicants = drives.reduce((acc, curr) => acc + curr.applicant_count, 0);
                const avg = drives.length > 0 ? (totalApplicants / drives.length).toFixed(1) : 0;

                // Chart Data: Roles attracting the most talent
                const chartData = drives
                    .map(d => ({ name: d.role, count: d.applicant_count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);

                // Dynamic Skill Aggregation
                const allSkills = drives
                    .map(d => d.eligibility_skills)
                    .filter(Boolean)
                    .join(',')
                    .split(',')
                    .map(s => s.trim());
                
                const skillFreq = allSkills.reduce((acc, s) => {
                    if (s) { // Prevent empty strings
                        acc[s] = (acc[s] || 0) + 1;
                    }
                    return acc;
                }, {});

                const topSkills = Object.entries(skillFreq)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 6)
                    .map(s => s[0]);

                setStats({ 
                    drives: drives.length, 
                    applicants: totalApplicants,
                    avgApplicants: avg,
                    chartData,
                    topSkills
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-gray-900 rounded-full"></div>
        </div>
    );

    return (
        <div className="space-y-6 font-sans max-w-7xl">
            
            {/* Standard Page Title */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900">Company Overview</h1>
                    <p className="text-sm text-gray-500 mt-1">Real-time analysis of your active drives and talent pipeline.</p>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Active Postings Card */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[160px]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-gray-500 font-medium">
                            <Briefcase className="w-5 h-5 text-gray-400" />
                            Active Drives
                        </div>
                    </div>
                    <div className="flex items-end justify-between">
                        <div className="text-[40px] leading-none font-semibold text-gray-900">
                            {stats.drives}
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full mb-1">
                                <ArrowUpRight className="w-3.5 h-3.5" />
                                Live
                            </span>
                        </div>
                    </div>
                </div>

                {/* Total Reach Card */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[160px]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-gray-500 font-medium">
                            <Users className="w-5 h-5 text-gray-400" />
                            Total Applicants
                        </div>
                    </div>
                    <div className="flex items-end justify-between">
                        <div className="text-[40px] leading-none font-semibold text-gray-900">
                            {stats.applicants}
                        </div>
                        <span className="text-[11px] text-gray-400 font-medium">Total pipeline</span>
                    </div>
                </div>

                {/* Engagement Efficiency Card */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[160px]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-gray-500 font-medium">
                            <Zap className="w-5 h-5 text-gray-400" />
                            Engagement Rate
                        </div>
                    </div>
                    <div className="flex items-end justify-between">
                        <div className="text-[40px] leading-none font-semibold text-gray-900">
                            {stats.avgApplicants}
                        </div>
                        <span className="text-[11px] text-gray-400 font-medium">Avg. Apps / Drive</span>
                    </div>
                </div>
            </div>

            {/* Analysis Bento Box */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Distribution Chart */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 lg:col-span-2 flex flex-col">
                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-6">
                        <BarChart3 className="w-5 h-5 text-indigo-500" />
                        Application Distribution
                        <span className="text-sm font-normal text-gray-500 ml-2">across top roles</span>
                    </div>
                    
                    <div className="flex-1 w-full min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                                <Bar dataKey="count" fill="#111827" radius={[6, 6, 6, 6]} barSize={40}>
                                    {stats.chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#111827' : '#9ca3af'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Skill Demand Tag Cloud */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-6">
                        <TrendingUp className="w-5 h-5 text-indigo-500" />
                        Skill Demand
                    </div>
                    <p className="text-[13px] text-gray-500 mb-4">Trending requirements in your drives:</p>
                    
                    <div className="flex flex-wrap gap-2 flex-1 content-start">
                        {stats.topSkills.length > 0 ? stats.topSkills.map((skill, i) => (
                            <span 
                                key={i} 
                                className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-gray-700 text-xs font-semibold"
                            >
                                {skill}
                            </span>
                        )) : (
                            <p className="text-gray-400 italic text-sm text-center w-full py-10">Waiting for drive data...</p>
                        )}
                    </div>
                </div>
                
            </div>
        </div>
    );
};

export default DashboardHome;