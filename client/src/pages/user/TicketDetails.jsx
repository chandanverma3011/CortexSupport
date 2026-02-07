import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import TicketStatusBadge from '../../components/tickets/TicketStatusBadge';
import CSATForm from '../../components/tickets/CSATForm';
import { formatDate } from '../../utils/formatDate';

const TicketDetails = () => {
    const { ticketId } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [showOriginal, setShowOriginal] = useState(false); // [MULTILINGUAL]
    const [hasCSAT, setHasCSAT] = useState(false);
    const { user: currentUser } = useAuth();

    // Use user._id if it exists, fallback to id for legacy/mock compatibility
    const currentUserId = currentUser?._id || currentUser?.id;
    const isOwner = ticket?.user?._id === currentUserId || ticket?.user === currentUserId;
    const isUser = currentUser?.role === 'user';

    useEffect(() => {
        fetchTicket();
        // Polling for real-time updates (every 10 seconds)
        const interval = setInterval(fetchTicket, 10000);
        return () => clearInterval(interval);
    }, [ticketId]);

    const fetchTicket = async () => {
        try {
            const { data } = await api.get(`/tickets/${ticketId}`);
            setTicket(data.data);

            // [MULTILINGUAL] Default View Logic
            // If User is viewing their own non-English ticket -> Default to Original
            // If Agent is viewing -> Default to English (showOriginal = false)
            if (currentUser?.role === 'user' && data.data.originalLanguage && data.data.originalLanguage !== 'en') {
                setShowOriginal(true);
            }

            // If ticket is resolved/closed, check for CSAT
            if (['Resolved', 'Closed'].includes(data.data.status)) {
                const { data: csatData } = await api.get(`/csat/ticket/${ticketId}`);
                setHasCSAT(csatData.exists);
            }
        } catch (error) {
            console.error('Failed to fetch ticket or CSAT:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setAttachments([...e.target.files]);
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!comment.trim() && attachments.length === 0) return;

        setSubmitting(true);
        const formData = new FormData();
        formData.append('text', comment);
        attachments.forEach(file => {
            formData.append('attachments', file);
        });

        try {
            await api.post(`/tickets/${ticketId}/comments`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setComment('');
            setAttachments([]);
            fetchTicket();
        } catch (error) {
            console.error('Failed to add comment:', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Loader />;
    if (!ticket) return <div className="text-center mt-10">Ticket not found</div>;

    return (
        <div className="max-w-6xl mx-auto pb-12 px-4">
            {/* Header / Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <button
                    onClick={() => navigate('/tickets')}
                    className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-all group font-bold text-sm"
                >
                    <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 group-hover:border-blue-200 dark:group-hover:border-blue-800 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </div>
                    <span>Back to Ticket List</span>
                </button>

                <div className="flex items-center gap-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/50 dark:border-gray-700/50 shadow-sm">
                    <span className="text-xs font-bold text-slate-400">#{ticket._id.substring(ticket._id.length - 6).toUpperCase()}</span>
                    <div className="h-4 w-px bg-gray-200 dark:bg-gray-700"></div>
                    <TicketStatusBadge status={ticket.status} />

                    {/* [MULTILINGUAL] Toggle Button */}
                    {ticket.originalLanguage && ticket.originalLanguage !== 'en' && (
                        <>
                            <div className="h-4 w-px bg-gray-200 dark:bg-gray-700"></div>
                            <button
                                onClick={() => setShowOriginal(!showOriginal)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider hover:bg-indigo-100 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                </svg>
                                {showOriginal ? `Show English` : `Show ${ticket.originalLanguage}`}
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* 🤖 Right Sidebar - AI Smart Analysis (Takes 4 cols) */}
                <div className="lg:col-span-4 space-y-6 lg:order-last">
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-500/10 border border-white/60 dark:border-gray-700 overflow-hidden sticky top-24">
                        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-white font-black text-lg flex items-center gap-2 relative z-10">
                                <span className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                </span>
                                Smart Analysis
                            </h3>
                            <p className="text-indigo-100 text-xs mt-2 relative z-10 font-medium opacity-90">AI-powered insights for faster resolution.</p>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* AI Summary Block */}
                            {ticket.aiSummary ? (
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                        Executive Summary
                                    </label>
                                    <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 shadow-sm relative">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-200 absolute -top-3 -left-2 transform -rotate-12" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M14.017 21L14.017 18C14.017 16.8954 13.1216 16 12.017 16H9.017C7.91243 16 7.017 16.8954 7.017 18V21H14.017ZM21.017 21L21.017 18C21.017 16.8954 20.1216 16 19.017 16H16.017C14.9124 16 14.017 16.8954 14.017 18V21H21.017ZM16.017 5C16.017 6.10457 15.1216 7 14.017 7C12.9124 7 12.017 6.10457 12.017 5V2H16.017V5ZM9.017 5C9.017 6.10457 8.12157 7 7.017 7C5.91243 7 5.017 6.10457 5.017 5V2H9.017V5ZM7.017 9H9.017V14H7.017V9ZM14.017 9H16.017V14H14.017V9Z" />
                                        </svg>
                                        <span className="relative z-10">{ticket.aiSummary}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="animate-pulse space-y-3">
                                    <div className="h-2 bg-slate-200 rounded w-1/3"></div>
                                    <div className="h-20 bg-slate-100 rounded-xl"></div>
                                </div>
                            )}

                            {/* AI Metric Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20 text-center">
                                    <span className="block text-[10px] font-bold text-blue-400 dark:text-blue-500 uppercase tracking-wider mb-1">Category</span>
                                    <span className="text-sm font-bold text-blue-700 dark:text-blue-300 block truncate">{ticket.aiCategory || ticket.category}</span>
                                </div>
                                <div className="p-4 bg-rose-50/50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/20 text-center">
                                    <span className="block text-[10px] font-bold text-rose-400 dark:text-rose-500 uppercase tracking-wider mb-1">Priority</span>
                                    <span className={`text-sm font-bold ${(ticket.aiPriority || ticket.priority) === 'High' ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {ticket.aiPriority || ticket.priority}
                                    </span>
                                </div>
                                <div className="col-span-2 p-4 bg-purple-50/50 dark:bg-purple-900/10 rounded-2xl border border-purple-100 dark:border-purple-900/20 flex items-center justify-between">
                                    <div>
                                        <span className="block text-[10px] font-bold text-purple-400 dark:text-purple-500 uppercase tracking-wider mb-1">Customer Sentiment</span>
                                        <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
                                            {ticket.aiSentiment || 'Analyzing...'}
                                        </span>
                                    </div>
                                    <div className="text-3xl filter drop-shadow-sm transform hover:scale-110 transition-transform">
                                        {ticket.aiSentiment === 'Angry' ? '😡' :
                                            ticket.aiSentiment === 'Frustrated' ? '😤' :
                                                ticket.aiSentiment === 'Neutral' ? '😐' :
                                                    ticket.aiSentiment === 'Calm' ? '😌' :
                                                        ticket.aiSentiment === 'Happy' ? '😃' : '🔮'}
                                    </div>
                                </div>
                            </div>

                            {/* Meta Info */}
                            <div className="pt-6 border-t border-slate-100 dark:border-gray-700 space-y-3">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400 font-bold uppercase tracking-wider">Created</span>
                                    <span className="text-slate-600 dark:text-slate-300 font-medium">{formatDate(ticket.createdAt)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400 font-bold uppercase tracking-wider">Assigned To</span>
                                    <span className="text-slate-600 dark:text-slate-300 font-bold bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">{ticket.assignedTo?.name || 'Unassigned'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 💬 Left Content - Chat Stream (Takes 8 cols) */}
                <div className="lg:col-span-8 flex flex-col gap-6">

                    {/* Ticket "Opening Message" Card */}
                    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-3xl p-8 shadow-sm border border-white/40 dark:border-gray-700 relative overflow-hidden group hover:shadow-md transition-shadow">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-40 w-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>

                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">
                                {ticket.user?.name?.charAt(0) || '?'}
                            </div>
                            <div>
                                <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white leading-tight">
                                    {showOriginal && ticket.originalTitle ? ticket.originalTitle : ticket.title}
                                </h1>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">
                                    Opened by {ticket.user?.name} &bull; {formatDate(ticket.createdAt)}
                                </p>
                            </div>
                        </div>

                        <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed text-base pl-16">
                            {showOriginal && ticket.originalDescription ? ticket.originalDescription : ticket.description}
                        </div>

                        {/* Attachments */}
                        {ticket.attachments && ticket.attachments.length > 0 && (
                            <div className="pl-16 mt-6 flex flex-wrap gap-3">
                                {ticket.attachments.map((file, idx) => (
                                    <a startIcon
                                        key={idx}
                                        href={`http://localhost:5000${file.url}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-gray-900/50 rounded-2xl border border-slate-100 dark:border-gray-700 hover:bg-blue-50 hover:border-blue-100 transition-all group"
                                    >
                                        <div className="bg-white dark:bg-gray-800 p-2 rounded-xl text-blue-500 shadow-sm group-hover:scale-110 transition-transform">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                            </svg>
                                        </div>
                                        <div className="pr-2">
                                            <p className="text-xs font-bold text-slate-700 dark:text-white truncate max-w-[150px]">{file.filename}</p>
                                            <p className="text-[10px] text-slate-400 font-semibold uppercase">{(file.size / 1024).toFixed(0)} KB</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-6 relative">
                        {/* Connecting Line */}
                        <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-100 dark:bg-gray-800 -z-10"></div>

                        {/* CSAT Form if applicable */}
                        {isOwner && ['Resolved', 'Closed'].includes(ticket.status) && !hasCSAT && (
                            <div className="pl-16 animate-fade-in-up">
                                <CSATForm key="csat-form" ticket={ticket} onSubmitted={() => setHasCSAT(true)} />
                            </div>
                        )}

                        {ticket.comments?.length === 0 ? (
                            <div className="text-center py-10 bg-white/40 dark:bg-gray-800/40 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-700 mx-10">
                                <p className="text-slate-400 font-medium">No replies yet. Start the conversation below!</p>
                            </div>
                        ) : (
                            ticket.comments?.map((c, index) => (
                                <div
                                    key={index}
                                    className={`flex flex-col ${c.user?.role === 'user' ? 'items-end' : 'items-start pl-14 relative'}`}
                                >
                                    {c.user?.role !== 'user' && (
                                        <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-xs font-bold text-indigo-600 shadow-sm z-10">
                                            {c.user?.name?.charAt(0)}
                                        </div>
                                    )}

                                    <div className={`max-w-[85%] rounded-2xl p-5 shadow-sm relative group transition-all hover:shadow-md ${c.user?.role === 'user'
                                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-sm'
                                        : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-tl-sm'
                                        }`}>

                                        <div className="flex items-center gap-2 mb-2 opacity-80">
                                            <span className={`text-[10px] font-bold uppercase tracking-widest ${c.user?.role === 'user' ? 'text-blue-100' : 'text-indigo-500'}`}>
                                                {c.user?.role === 'user' ? 'You' : c.user?.name}
                                            </span>
                                            <span className="text-[10px] opacity-60">&bull;</span>
                                            <span className={`text-[10px] ${c.user?.role === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                                                {formatDate(c.createdAt)}
                                            </span>
                                        </div>

                                        <p className={`text-sm leading-relaxed whitespace-pre-wrap ${c.user?.role === 'user' ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                                            {showOriginal && c.originalLanguage !== 'en' ? c.text : (c.translatedText || c.text)}
                                        </p>

                                        {/* Translation Indicator */}
                                        {(c.translatedText && c.originalLanguage !== 'en' && !showOriginal) && (
                                            <div className={`mt-2 pt-2 border-t flex items-center gap-1.5 ${c.user?.role === 'user' ? 'border-white/20' : 'border-gray-100 dark:border-gray-700'}`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${c.user?.role === 'user' ? 'text-blue-200' : 'text-slate-400'}`} viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.279.16.59.381.758.555h.001c.741.002 1.954-.067 2.871-.97a1 1 0 10-1.414-1.415c-.456.455-.936.65-1.378.718A19.06 19.06 0 009.94 6H13a1 1 0 010 2H5.857a16.892 16.892 0 01-1.258 3.868l-.001.002c-.225.61-.468 1.139-.714 1.547a1 1 0 01-1.748-.962c.3-.505.589-1.087.838-1.748A14.93 14.93 0 005.15 8H3a1 1 0 010-2h4V3a1 1 0 011-1z" clipRule="evenodd" />
                                                </svg>
                                                <span className={`text-[10px] font-medium ${c.user?.role === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                                                    Translated from {c.originalLanguage}
                                                </span>
                                            </div>
                                        )}

                                        {/* Comment Attachments */}
                                        {c.attachments && c.attachments.length > 0 && (
                                            <div className={`mt-3 flex flex-wrap gap-2 ${c.user?.role === 'user' ? '' : 'pt-2'}`}>
                                                {c.attachments.map((file, idx) => (
                                                    <a
                                                        key={idx}
                                                        href={`http://localhost:5000${file.url}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-colors ${c.user?.role === 'user'
                                                                ? 'bg-black/20 hover:bg-black/30 text-white'
                                                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                                                            }`}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                        </svg>
                                                        <span className="truncate max-w-[120px]">{file.filename}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Reply Input */}
                    {ticket.status !== 'Closed' && (
                        <div className="sticky bottom-6 z-10">
                            <form onSubmit={handleAddComment} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-500/10 border border-indigo-100 dark:border-gray-700 p-2 pl-4 flex gap-4 items-end transition-shadow hover:shadow-indigo-500/20">
                                <div className="flex-1 py-3">
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Type your reply here..."
                                        className="w-full bg-transparent border-none focus:ring-0 text-slate-700 dark:text-white placeholder-slate-400 text-sm resize-none max-h-32 min-h-[24px]"
                                        rows={1}
                                        style={{ height: 'auto', minHeight: '24px' }}
                                        onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                                    />
                                    {/* Attachment Preview */}
                                    {attachments.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {Array.from(attachments).map((file, idx) => (
                                                <span key={idx} className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                                                    {file.name}
                                                    <button type="button" onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))} className="hover:text-red-500">&times;</button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 pb-2 pr-2">
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            multiple
                                            onChange={handleFileChange}
                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                        />
                                        <button type="button" className="p-2.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                            </svg>
                                        </button>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting || (!comment.trim() && attachments.length === 0)}
                                        className="btn-primary py-2.5 px-6 rounded-xl shadow-lg shadow-indigo-500/30 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        <span>{submitting ? 'Sending' : 'Send'}</span>
                                        {!submitting && (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TicketDetails;
