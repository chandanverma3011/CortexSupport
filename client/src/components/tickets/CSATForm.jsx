import { useState } from 'react';
import api from '../../services/api';

const CSATForm = ({ ticket, onSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating < 1) {
            setError('Please select a rating');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.post(`/csat/${ticket._id}`, {
                rating,
                feedback
            });
            setSubmitted(true);
            if (onSubmitted) onSubmitted();
        } catch (err) {
            console.error('Failed to submit CSAT:', err);
            setError(err.response?.data?.message || 'Failed to submit feedback');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800 text-center">
                <h3 className="text-lg font-bold text-green-800 dark:text-green-300 mb-2">
                    Thank you for your feedback! ✨
                </h3>
                <p className="text-green-700 dark:text-green-400">
                    Your response helps us improve our support quality.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                How was your experience?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Your ticket has been resolved. Please take a moment to rate our service.
            </p>

            <form onSubmit={handleSubmit}>
                <div className="flex justify-center gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className="text-3xl transition-transform transform hover:scale-110 focus:outline-none"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                        >
                            <span className={star <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}>
                                ★
                            </span>
                        </button>
                    ))}
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Additional feedback (optional)
                    </label>
                    <textarea
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                        rows="3"
                        placeholder="Tell us what we did well or how we can improve..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        maxLength="500"
                    ></textarea>
                </div>

                {error && (
                    <p className="text-red-500 text-sm mb-4">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading || rating === 0}
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Submitting...' : 'Submit Feedback'}
                </button>
            </form>
        </div>
    );
};

export default CSATForm;
