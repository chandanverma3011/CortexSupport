import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import api from '../../services/api';

const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#6B7280'];

const TicketsByStatus = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: res } = await api.get('/analytics/dashboard');
                const statusData = res.data?.byStatus || {};
                setData([
                    { name: 'Open', value: statusData['Open'] || 0 },
                    { name: 'In Progress', value: statusData['In Progress'] || 0 },
                    { name: 'Resolved', value: statusData['Resolved'] || 0 },
                    { name: 'Closed', value: statusData['Closed'] || 0 },
                ].filter(item => item.value > 0));
            } catch (error) {
                console.error('Failed to fetch status data:', error);
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
                No ticket data available
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={280}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default TicketsByStatus;
