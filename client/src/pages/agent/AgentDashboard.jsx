import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import CSATStats from '../../components/charts/CSATStats';

const AgentDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAgentStats = async () => {
            try {
                const { data } = await api.get('/analytics/agent');
                setStats(data.data);
            } catch (error) {
                console.error('Failed to fetch agent stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAgentStats();
    }, []);

    if (loading) return <Loader />;

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-12">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-10 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
                            Agent Workspace 🚀
                        </h1>
                        <p className="text-blue-100 text-lg opacity-90 max-w-xl">
                            Ready to make customers happy? Focus on high-priority tickets and keep that CSAT score up!
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Link to="/agent/tickets" className="bg-white text-blue-600 px-8 py-3.5 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg active:scale-95 flex items-center gap-2 group">
                            <span>Go to Queue</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </div>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-64 w-64" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">My Workload</p>
                    <p className="text-4xl font-black text-slate-800 dark:text-white">{stats?.totalAssigned || 0}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Resolved</p>
                    <p className="text-4xl font-black text-emerald-500">{stats?.resolvedCount || 0}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Avg Resolution</p>
                    <p className="text-4xl font-black text-purple-600">{stats?.avgResolutionHours || 0}<span className="text-lg text-slate-400 font-bold ml-1">hrs</span></p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-2xl shadow-sm border border-orange-100 dark:border-orange-900/30">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-1">High Priority</p>
                            <p className="text-4xl font-black text-orange-600">{stats?.highPriorityActive || 0}</p>
                        </div>
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/40 text-orange-500 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Status Breakdown */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm h-full">
                    <h3 className="text-xl font-bold mb-8 text-gray-900 dark:text-white flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                        Active Status Mix
                    </h3>
                    <div className="space-y-6">
                        {Object.entries(stats?.byStatus || {}).map(([status, count]) => (
                            <div key={status} className="group">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{status}</span>
                                    <span className="text-sm font-black text-slate-800 dark:text-white">{count}</span>
                                </div>
                                <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ease-out ${status === 'Resolved' ? 'bg-emerald-500' :
                                            status === 'In Progress' ? 'bg-amber-500' : 'bg-blue-500'
                                            }`}
                                        style={{ width: `${(count / stats.totalAssigned) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CSAT Snapshot */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm h-full flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
                            Satisfaction Score
                        </h3>
                        <p className="text-sm text-slate-400 font-medium ml-3.5">How user's rated your support recently.</p>
                    </div>
                    <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-6">
                        <div className="scale-100 w-full transform origin-center">
                            <CSATStats isCompact={true} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Quick Action */}
            <div className="bg-slate-50 dark:bg-gray-900/50 rounded-3xl p-8 border border-slate-200 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Expertise & Skills</h3>
                    <p className="text-slate-500 text-sm mt-1">Keep your profile updated to get matched with the right tickets.</p>
                </div>
                <Link to="/profile" className="px-8 py-3 bg-white dark:bg-gray-800 text-slate-700 dark:text-white border border-slate-200 dark:border-gray-600 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-gray-700 transition-all shadow-sm">
                    Manage Profile
                </Link>
            </div>
        </div>
    );
};

export default AgentDashboard;
