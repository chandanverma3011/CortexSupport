import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, trendsRes] = await Promise.all([
                api.get('/analytics/dashboard'),
                api.get('/analytics/trends'),
            ]);
            setStats(statsRes.data.data);
            setTrends(trendsRes.data.data || []);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#6B7280'];
    const PRIORITY_COLORS = ['#10B981', '#F59E0B', '#EF4444'];

    // Custom Tooltip for Charts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-gray-800 p-3 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl">
                    <p className="font-bold text-gray-900 dark:text-white mb-1">{label}</p>
                    {payload.map((p, index) => (
                        <p key={index} className="text-sm" style={{ color: p.color }}>
                            {p.name}: <span className="font-bold">{p.value}</span>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const statusData = stats?.byStatus ? [
        { name: 'Open', value: stats.byStatus['Open'] || 0 },
        { name: 'In Progress', value: stats.byStatus['In Progress'] || 0 },
        { name: 'Resolved', value: stats.byStatus['Resolved'] || 0 },
        { name: 'Closed', value: stats.byStatus['Closed'] || 0 },
    ] : [];

    const priorityData = stats?.byPriority ? [
        { name: 'Low', value: stats.byPriority['Low'] || 0 },
        { name: 'Medium', value: stats.byPriority['Medium'] || 0 },
        { name: 'High', value: stats.byPriority['High'] || 0 },
    ] : [];

    const categoryData = stats?.byCategory ? Object.entries(stats.byCategory).map(([key, value]) => ({
        name: key,
        tickets: value,
    })) : [];

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-10 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden">
                <div className="relative z-10 flex flexDirection-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-700/50 border border-slate-600 mb-4 backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">System Online</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
                            Command Center
                        </h1>
                        <p className="text-slate-400 text-lg opacity-90 max-w-xl">
                            Overview of system performance, agent activity, and ticket resolution metrics.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Link to="/admin/analytics" className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-all flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                            </svg>
                            <span>Full Analytics</span>
                        </Link>
                    </div>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-64 w-64" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="relative z-10">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Tickets</p>
                        <p className="text-4xl font-black text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">{stats?.totalTickets || 0}</p>
                    </div>
                    <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-10 transition-opacity p-4">
                        <svg className="w-16 h-16 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" /><path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 012-2V9a2 2 0 01-2-2h-1z" /></svg>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="relative z-10">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Open Tickets</p>
                        <p className="text-4xl font-black text-slate-800 dark:text-white group-hover:text-amber-500 transition-colors">{stats?.openTickets || 0}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="relative z-10">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Resolved</p>
                        <p className="text-4xl font-black text-slate-800 dark:text-white group-hover:text-emerald-500 transition-colors">{stats?.resolvedTickets || 0}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="relative z-10">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Avg Resolution</p>
                        <p className="text-4xl font-black text-slate-800 dark:text-white group-hover:text-purple-600 transition-colors">{stats?.avgResolutionTime || '0h'}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Column (Charts) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Trends Chart */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-8 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold text-xl text-gray-900 dark:text-white">Ticket Volume Trends</h3>
                            <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1 text-xs font-semibold text-slate-500"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Created</span>
                                <span className="flex items-center gap-1 text-xs font-semibold text-slate-500"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Resolved</span>
                            </div>
                        </div>
                        {trends.length > 0 ? (
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F1F5F9', opacity: 0.5 }} />
                                    <Bar dataKey="created" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={20} />
                                    <Bar dataKey="resolved" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-slate-400 bg-slate-50 rounded-2xl">No trend data available</div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Status Pie Chart */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-8 border border-gray-100 dark:border-gray-700">
                            <h3 className="font-bold text-lg mb-6 text-gray-900 dark:text-white text-center">Ticket Status</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Priority Bar Chart */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-8 border border-gray-100 dark:border-gray-700">
                            <h3 className="font-bold text-lg mb-6 text-gray-900 dark:text-white text-center">Priority Breakdown</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={priorityData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="value">
                                        {priorityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[index]} radius={[4, 4, 0, 0]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Category Chart Vertical */}
                    {categoryData.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-8 border border-gray-100 dark:border-gray-700">
                            <h3 className="font-bold text-lg mb-6 text-gray-900 dark:text-white">AI Classification Categories</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" opacity={0.5} />
                                    <XAxis type="number" axisLine={false} tickLine={false} />
                                    <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F1F5F9', opacity: 0.5 }} />
                                    <Bar dataKey="tickets" fill="#8B5CF6" radius={[0, 4, 4, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    {/* Critical Bottlenecks */}
                    <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-3xl shadow-sm p-6">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="p-3 bg-rose-100 dark:bg-rose-900/40 text-rose-600 rounded-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-rose-900 dark:text-rose-100">Action Required</h3>
                                <p className="text-sm text-rose-700 dark:text-rose-300 opacity-80">Unassigned high priority tickets</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-4xl font-black text-rose-600">{stats?.highPriorityUnassigned || 0}</span>
                            <Link to="/admin/tickets?priority=High&assignedTo=unassigned" className="px-4 py-2 bg-rose-600 text-white text-sm font-bold rounded-lg hover:bg-rose-700 transition">
                                Assign Now
                            </Link>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 border border-gray-100 dark:border-gray-700 text-center">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Users</h3>
                            <p className="text-2xl font-black text-slate-800 dark:text-white">{stats?.totalUsers || 0}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 border border-gray-100 dark:border-gray-700 text-center">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Agents</h3>
                            <p className="text-2xl font-black text-slate-800 dark:text-white">{stats?.totalAgents || 0}</p>
                        </div>
                    </div>

                    {/* Oldest Open Tickets */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Oldest Open Tickets</h3>
                        <div className="space-y-3">
                            {stats?.oldestOpenTickets?.length > 0 ? (
                                stats.oldestOpenTickets.map((t) => (
                                    <Link key={t._id} to={`/agent/ticket/${t._id}`} className="block p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all group">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-bold text-slate-400">#{t._id.substring(t._id.length - 4)}</span>
                                            <span className="text-[10px] font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100">{new Date(t.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                                            {t.title}
                                        </p>
                                        <div className="mt-2 flex items-center gap-1.5">
                                            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                {t.user?.name?.charAt(0)}
                                            </div>
                                            <span className="text-xs text-slate-500">{t.user?.name}</span>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center py-8 text-slate-400 italic text-sm">No open tickets</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
