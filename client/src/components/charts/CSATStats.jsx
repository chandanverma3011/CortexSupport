import { useState, useEffect } from 'react';
import api from '../../services/api';

const CSATStats = ({ isCompact = false }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data: res } = await api.get('/csat/analytics');
                setStats(res.data.overview.overall);
            } catch (error) {
                console.error('Failed to fetch CSAT stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return null;

    if (isCompact) {
        return (
            <div className="flex gap-4">
                <div className="flex-1 bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-2xl border border-yellow-100 dark:border-yellow-900/30">
                    <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-tighter">Avg Rating</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{(stats?.averageRating || 0).toFixed(1)}⭐</p>
                </div>
                <div className="flex-1 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">Total Feedbacks</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{stats?.totalRatings || 0}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-start mb-4">
                    <p className="text-sm font-medium opacity-80 uppercase tracking-wider">Overall Satisfaction</p>
                    <span className="text-2xl">⭐</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <h2 className="text-4xl font-bold">{(stats?.averageRating || 0).toFixed(2)}</h2>
                    <span className="text-sm opacity-80">/ 5.0</span>
                </div>
                <p className="mt-2 text-xs opacity-75">Platform-wide average rating from all users</p>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-start mb-4">
                    <p className="text-sm font-medium opacity-80 uppercase tracking-wider">Total Feedbacks</p>
                    <span className="text-2xl">💬</span>
                </div>
                <h2 className="text-4xl font-bold">{stats?.totalRatings || 0}</h2>
                <p className="mt-2 text-xs opacity-75">Total customer satisfaction responses collected</p>
            </div>
        </div>
    );
};

export default CSATStats;
