import { useState, useEffect } from 'react';
import api from '../../services/api';

const CSATRecentFeedback = () => {
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                // For admin, we might want a global reviews endpoint, but let's use a dummy one or aggregate.
                // For now, let's assume we want to see ALL recent feedback.
                // We'll add a global endpoint in the backend for this.
                const { data: res } = await api.get('/csat/recent');
                setFeedback(res.data || []);
            } catch (error) {
                console.error('Failed to fetch recent feedback:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeedback();
    }, []);

    if (loading) return null;

    if (feedback.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center text-gray-500 border border-dashed border-gray-200 dark:border-gray-700">
                No textual feedback received yet.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {feedback.map((item) => (
                <div key={item._id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                {item.userId?.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white leading-tight">
                                    {item.userId?.name || 'Anonymous User'}
                                </h4>
                                <p className="text-xs text-gray-500">
                                    on {new Date(item.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star} className={star <= item.rating ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-700'}>
                                    ★
                                </span>
                            ))}
                        </div>
                    </div>
                    {item.feedback && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 italic mb-3">
                            "{item.feedback}"
                        </p>
                    )}
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-[10px] text-gray-600 dark:text-gray-400 font-bold uppercase tracking-wider">
                            {item.category}
                        </span>
                        <span className="text-[10px] text-gray-400">
                            Agent: <span className="text-blue-500 font-medium">{item.agentId?.name || 'Unassigned'}</span>
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CSATRecentFeedback;
