import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

const CSATTrend = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: res } = await api.get('/csat/analytics');
                const trends = res.data.overview.monthlyTrends.map(t => ({
                    name: `${monthNames[t._id.month - 1]} ${t._id.year}`,
                    rating: parseFloat(t.averageRating.toFixed(2))
                }));
                setData(trends || []);
            } catch (error) {
                console.error('Failed to fetch CSAT trend data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="#4F46E5"
                    strokeWidth={3}
                    dot={{ r: 6 }}
                    activeDot={{ r: 8 }}
                    name="Avg Rating"
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default CSATTrend;
