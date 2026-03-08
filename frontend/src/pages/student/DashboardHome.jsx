import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { FileText, UserCheck, ArrowUpRight, AlertCircle, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardHome = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ 
        applications: 0, 
        profileComplete: false,
        recentApplications: [],
        skillMatch: { userSkills: [], missingTopSkills: [] }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch all necessary data simultaneously
                const [appRes, profileRes, driveRes] = await Promise.all([
                    api.get('/student/applications'),
                    api.get('/student/profile'),
                    api.get('/student/drives')
                ]);

                // 1. Profile Completion Logic
                const userSkills = profileRes.data.skills ? profileRes.data.skills.split(',').map(s => s.trim().toLowerCase()) : [];
                const isComplete = !!profileRes.data.skills && !!profileRes.data.resume_url;

                // 2. Skill Gap Analysis Logic
                // Extract all skills from all drives to find what's "in-demand"
                const allDriveSkills = driveRes.data
                    .map(d => d.eligibility_skills)
                    .filter(Boolean)
                    .join(',')
                    .split(',')
                    .map(s => s.trim().toLowerCase());
                
                // Count frequencies of in-demand skills
                const skillFreq = allDriveSkills.reduce((acc, s) => {
                    acc[s] = (acc[s] || 0) + 1;
                    return acc;
                }, {});

                // Find the top 5 most demanded skills that the user DOES NOT have
                const missingSkills = Object.entries(skillFreq)
                    .sort((a, b) => b[1] - a[1]) // Sort by frequency
                    .map(s => s[0])
                    .filter(s => !userSkills.includes(s)) // Filter out skills user already has
                    .slice(0, 5); // Take top 5

                // 3. Set State
                setStats({
                    applications: appRes.data.length,
                    profileComplete: isComplete,
                    recentApplications: appRes.data.slice(0, 3), // Get top 3 recent applications
                    skillMatch: {
                        userSkills: profileRes.data.skills ? profileRes.data.skills.split(',').slice(0,3) : [],
                        missingTopSkills: missingSkills
                    }
                });

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-gray-900 rounded-full"></div></div>;

    return (
        <div className="font-sans space-y-6 max-w-6xl">
            
            <div className="mb-8">
                <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Welcome back, {user?.name?.split(' ')[0] || 'Student'}</h1>
                <p className="text-gray-500 mt-1">Here is what's happening with your placements today.</p>
            </div>

            {/* Top Row: Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Applications Card */}
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[180px] hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 text-gray-500 font-medium">
                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-gray-600" />
                            </div>
                            My Applications
                        </div>
                        <Link to="/student/applications" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                            View All
                        </Link>
                    </div>
                    <div className="flex items-end justify-between">
                        <div className="text-[48px] leading-none font-semibold text-gray-900">
                            {stats.applications}
                        </div>
                        <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-full text-xs font-semibold">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            Active Track
                        </div>
                    </div>
                </div>

                {/* Profile Status Card */}
                <div className={`rounded-[2rem] p-8 shadow-sm border flex flex-col justify-between min-h-[180px] transition-colors ${
                    stats.profileComplete 
                        ? 'bg-gradient-to-br from-gray-900 to-black border-gray-800 text-white' 
                        : 'bg-white border-yellow-200 hover:border-yellow-300'
                }`}>
                    <div className={`flex items-center justify-between mb-6 ${stats.profileComplete ? 'text-gray-300' : 'text-gray-600'}`}>
                        <div className="flex items-center gap-2 font-medium">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stats.profileComplete ? 'bg-white/10' : 'bg-yellow-50 text-yellow-600'}`}>
                                {stats.profileComplete ? <UserCheck className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            </div>
                            Profile Status
                        </div>
                        {!stats.profileComplete && (
                            <Link to="/student/profile" className="text-sm font-semibold text-yellow-600 hover:text-yellow-700 transition-colors">
                                Fix Now
                            </Link>
                        )}
                    </div>
                    
                    <div>
                        <div className={`text-[32px] leading-tight font-semibold mb-2 ${stats.profileComplete ? 'text-white' : 'text-gray-900'}`}>
                            {stats.profileComplete ? '100% Complete' : 'Action Required'}
                        </div>
                        {!stats.profileComplete ? (
                            <p className="text-sm font-medium text-yellow-600 flex items-center gap-1.5">
                                Please update your skills and resume.
                            </p>
                        ) : (
                            <p className="text-sm font-medium text-gray-400">
                                You are ready to apply for drives.
                            </p>
                        )}
                    </div>
                </div>

            </div>

            {/* Bottom Row: Dynamic Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Skill Gap Analysis Widget */}
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 flex flex-col">
                    <div className="flex items-center gap-2 text-gray-900 font-semibold mb-6">
                        <TrendingUp className="w-5 h-5 text-indigo-500" />
                        Market Skill Analysis
                    </div>
                    
                    <div className="flex-1">
                        <div className="mb-6">
                            <p className="text-sm text-gray-500 font-medium mb-3">Your Top Skills</p>
                            <div className="flex flex-wrap gap-2">
                                {stats.skillMatch.userSkills.length > 0 ? (
                                    stats.skillMatch.userSkills.map((skill, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg capitalize">
                                            {skill}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-sm text-gray-400 italic">No skills listed in profile.</span>
                                )}
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500 font-medium mb-3">Highly Demanded Skills You're Missing</p>
                            <div className="flex flex-wrap gap-2">
                                {stats.skillMatch.missingTopSkills.length > 0 ? (
                                    stats.skillMatch.missingTopSkills.map((skill, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-gray-50 text-gray-600 border border-gray-200 text-xs font-semibold rounded-lg capitalize">
                                            + {skill}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-sm text-green-600 font-medium bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                                        You have all the top demanded skills!
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity / Applications */}
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 text-gray-900 font-semibold">
                            <Clock className="w-5 h-5 text-indigo-500" />
                            Recent Activity
                        </div>
                    </div>

                    <div className="space-y-4">
                        {stats.recentApplications.length > 0 ? (
                            stats.recentApplications.map((app) => (
                                <Link to="/student/applications" key={app.id} className="block group">
                                    <div className="flex items-center justify-between p-4 rounded-2xl border border-transparent hover:border-gray-100 hover:bg-gray-50 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-xl border border-gray-100 flex items-center justify-center font-bold text-gray-900 shadow-sm">
                                                {app.company_name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 text-sm">{app.company_name}</h4>
                                                <p className="text-xs text-gray-500 mt-0.5">{app.role}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5">
                                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${
                                                app.status === 'selected' ? 'bg-green-50 text-green-700 border-green-200' :
                                                app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                                app.status === 'shortlisted' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                                'bg-gray-50 text-gray-600 border-gray-200'
                                            }`}>
                                                {app.status}
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-colors" />
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="py-12 text-center flex flex-col items-center">
                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                    <FileText className="w-5 h-5 text-gray-400" />
                                </div>
                                <p className="text-sm text-gray-500">No recent applications.</p>
                                <Link to="/student/drives" className="text-xs font-semibold text-indigo-600 hover:underline mt-2">
                                    Browse Drives
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DashboardHome;