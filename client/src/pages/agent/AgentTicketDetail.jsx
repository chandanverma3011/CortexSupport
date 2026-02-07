import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AgentTicketDetail = () => {
    const { ticketId } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const [isInternal, setIsInternal] = useState(false);
    const [attachments, setAttachments] = useState([]);
    const [suggestedReply, setSuggestedReply] = useState('');
    const [loadingSuggestion, setLoadingSuggestion] = useState(false);

    useEffect(() => {
        fetchTicket();
    }, [ticketId]);

    const fetchTicket = async () => {
        try {
            const { data } = await api.get(`/tickets/${ticketId}`);
            setTicket(data.data);
        } catch (error) {
            console.error('Failed to fetch ticket:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            await api.put(`/tickets/${ticketId}/status`, { status: newStatus });
            fetchTicket();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const handleFileChange = (e) => {
        setAttachments([...e.target.files]);
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!comment.trim() && attachments.length === 0) return;

        const formData = new FormData();
        formData.append('text', comment);
        formData.append('isInternal', isInternal);
        attachments.forEach(file => {
            formData.append('attachments', file);
        });

        try {
            await api.post(`/tickets/${ticketId}/comments`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setComment('');
            setIsInternal(false);
            setAttachments([]);
            fetchTicket();
        } catch (error) {
            console.error('Failed to add comment:', error);
        }
    };

    const [errorSuggestion, setErrorSuggestion] = useState('');

    const handleGetSuggestion = async () => {
        setLoadingSuggestion(true);
        setErrorSuggestion('');
        try {
            const { data } = await api.get(`/tickets/${ticketId}/suggest-reply`);
            setSuggestedReply(data.data.suggestedReply);
        } catch (error) {
            console.error('Failed to get suggestion:', error);
            setErrorSuggestion('Failed to generate suggestion. Please try again.');
        } finally {
            setLoadingSuggestion(false);
        }
    };

    const useSuggestion = () => {
        setComment(suggestedReply);
        setSuggestedReply('');
    };

    // ... inside return ...

    <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">AI Reply Suggestion</h3>
        <button
            onClick={handleGetSuggestion}
            disabled={loadingSuggestion}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm flex items-center gap-2"
        >
            {loadingSuggestion ? (
                <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                </>
            ) : (
                '✨ Get AI Suggestion'
            )}
        </button>
    </div>

    {
        errorSuggestion && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-sm">
                {errorSuggestion}
            </div>
        )
    }

    {
        suggestedReply && (
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg animate-fade-in-up">
                <p className="text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">{suggestedReply}</p>
                <button
                    onClick={useSuggestion}
                    className="text-purple-600 hover:text-purple-800 text-sm font-medium hover:underline"
                >
                    Use this reply →
                </button>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="p-6 text-center">
                <p className="text-gray-500">Ticket not found</p>
            </div>
        );
    }

    const getStatusColor = (status) => {
        const colors = {
            'Open': 'bg-blue-100 text-blue-800',
            'In Progress': 'bg-yellow-100 text-yellow-800',
            'Resolved': 'bg-green-100 text-green-800',
            'Closed': 'bg-gray-100 text-gray-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1"
                    >
                        ← Back to Tickets
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {ticket.title}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        From: {ticket.user?.name} ({ticket.user?.email})
                    </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Description</h2>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {ticket.description}
                        </p>

                        {/* Attachments */}
                        {ticket.attachments && ticket.attachments.length > 0 && (
                            <div className="mt-6 border-t border-gray-100 dark:border-gray-700 pt-6">
                                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                    User Attachments
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {ticket.attachments.map((file, idx) => (
                                        <a
                                            key={idx}
                                            href={`http://localhost:5000${file.url}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-100 dark:border-gray-600 group"
                                        >
                                            <div className="bg-white dark:bg-gray-800 p-2 rounded mr-3 shadow-sm group-hover:scale-105 transition-transform">
                                                {file.mimetype.includes('image') ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.filename}</p>
                                                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* AI Summary */}
                    {ticket.aiSummary && (
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                            <h3 className="font-semibold text-purple-900 dark:text-purple-200 mb-2 flex items-center gap-2">
                                🤖 AI Summary
                            </h3>
                            <p className="text-purple-800 dark:text-purple-300">{ticket.aiSummary}</p>
                        </div>
                    )}

                    {/* AI Suggested Reply */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white">AI Reply Suggestion</h3>
                            <button
                                onClick={handleGetSuggestion}
                                disabled={loadingSuggestion}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm"
                            >
                                {loadingSuggestion ? 'Generating...' : '✨ Get AI Suggestion'}
                            </button>
                        </div>
                        {suggestedReply && (
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                                <p className="text-gray-700 dark:text-gray-300 mb-3">{suggestedReply}</p>
                                <button
                                    onClick={useSuggestion}
                                    className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                                >
                                    Use this reply →
                                </button>
                            </div>
                        )}
                        {ticket.aiSuggestedReply && !suggestedReply && (
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Initial AI suggestion:</p>
                                <p className="text-gray-700 dark:text-gray-300">{ticket.aiSuggestedReply}</p>
                                <button
                                    onClick={() => setComment(ticket.aiSuggestedReply)}
                                    className="text-purple-600 hover:text-purple-800 text-sm font-medium mt-2"
                                >
                                    Use this reply →
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Comments */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Comments Timeline</h3>

                        {/* Comment List */}
                        <div className="space-y-4 mb-6">
                            {ticket.comments?.length === 0 ? (
                                <p className="text-gray-500 text-sm">No comments yet</p>
                            ) : (
                                ticket.comments?.map((c, index) => (
                                    <div
                                        key={index}
                                        className={`p-4 rounded-lg ${c.isInternal
                                            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400'
                                            : 'bg-gray-50 dark:bg-gray-700'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {c.user?.name || 'Unknown'}
                                                {c.isInternal && (
                                                    <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">
                                                        Internal Note
                                                    </span>
                                                )}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(c.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300">{c.text}</p>

                                        {/* Comment Attachments */}
                                        {c.attachments && c.attachments.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {c.attachments.map((file, idx) => (
                                                    <a
                                                        key={idx}
                                                        href={`http://localhost:5000${file.url}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1.5 p-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded text-xs text-blue-600 hover:text-blue-800 transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                        </svg>
                                                        <span className="truncate max-w-[150px]">{file.filename}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Add Comment Form */}
                        <form onSubmit={handleAddComment}>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Write a reply..."
                                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                rows={4}
                            />

                            {/* File Upload for Comments */}
                            <div className="mt-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Attach Resolution Files (Logs, Screenshots)
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-300"
                                />
                                {attachments.length > 0 && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        {attachments.length} file(s) selected
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-between items-center mt-4">
                                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <input
                                        type="checkbox"
                                        checked={isInternal}
                                        onChange={(e) => setIsInternal(e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    Internal note (hidden from customer)
                                </label>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                                >
                                    Send Reply
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* AI Insights */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">🤖 AI Insights</h3>
                        <div className="space-y-4">
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Category</span>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {ticket.aiCategory || ticket.category}
                                </p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Priority</span>
                                <p className={`font-medium ${(ticket.aiPriority || ticket.priority) === 'High' ? 'text-red-600' :
                                    (ticket.aiPriority || ticket.priority) === 'Medium' ? 'text-yellow-600' :
                                        'text-green-600'
                                    }`}>
                                    {ticket.aiPriority || ticket.priority}
                                </p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Customer Sentiment</span>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {ticket.aiSentiment || 'Unknown'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Status Update */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Update Status</h3>
                        <div className="space-y-2">
                            {['Open', 'In Progress', 'Resolved', 'Closed'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => handleStatusChange(status)}
                                    disabled={ticket.status === status}
                                    className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${ticket.status === status
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Ticket Info */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Ticket Info</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Created</span>
                                <span className="text-gray-900 dark:text-white">
                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            {ticket.resolvedAt && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Resolved</span>
                                    <span className="text-gray-900 dark:text-white">
                                        {new Date(ticket.resolvedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentTicketDetail;
