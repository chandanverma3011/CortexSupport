import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../../services/api';

const AgentPerformance = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: res } = await api.get('/analytics/agents');
                setData(res.data || []);
            } catch (error) {
                console.error('Failed to fetch agent performance data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-md text-gray-400">
                No agent data available
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" unit="%" />
                <YAxis dataKey="agentName" type="category" width={100} />
                <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Resolution Rate']} />
                <Bar dataKey="resolutionRate" fill="#10B981">
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.resolutionRate > 80 ? '#10B981' : entry.resolutionRate > 50 ? '#F59E0B' : '#EF4444'} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default AgentPerformance;
