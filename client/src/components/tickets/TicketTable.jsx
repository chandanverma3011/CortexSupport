import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const TicketTable = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [agents, setAgents] = useState([]);
    const [filters, setFilters] = useState({
        status: '',
        category: '',
        priority: '',
        assignedTo: '',
    });

    useEffect(() => {
        fetchData();
    }, [filters]);

    const fetchData = async () => {
        try {
            const queryParams = new URLSearchParams();
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.category) queryParams.append('category', filters.category);
            if (filters.priority) queryParams.append('priority', filters.priority);
            if (filters.assignedTo) queryParams.append('assignedTo', filters.assignedTo);

            const [ticketsRes, agentsRes] = await Promise.all([
                api.get(`/tickets/all?${queryParams.toString()}`),
                api.get('/auth/agents'),
            ]);
            setTickets(ticketsRes.data.data || []);
            setAgents(agentsRes.data.data || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleAssign = async (ticketId, agentId) => {
        try {
            await api.put(`/tickets/${ticketId}/assign`, { agentId: agentId || null });
            fetchData();
        } catch (error) {
            console.error('Failed to assign ticket:', error);
        }
    };

    return (
        <div className="space-y-8">
            {/* 🔍 Glassmorphism Filter Bar */}
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-2xl p-6 rounded-[2rem] shadow-xl border border-slate-200 dark:border-white/10 flex flex-wrap gap-6 items-end relative overflow-hidden group">
                {/* Decorative background glow */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {['status', 'category', 'priority', 'assignedTo'].map((filter) => (
                    <div key={filter} className="flex-1 min-w-[180px] relative z-10">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest pl-3">
                            {filter.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <div className="relative group/select">
                            <select
                                name={filter}
                                value={filters[filter]}
                                onChange={handleFilterChange}
                                className="w-full text-sm font-bold border-none rounded-2xl px-5 py-4 bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 shadow-inner ring-1 ring-slate-200 dark:ring-white/10 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer hover:bg-white dark:hover:bg-slate-900"
                            >
                                <option value="">All {filter.charAt(0).toUpperCase() + filter.slice(1).replace(/([A-Z])/g, ' $1')}</option>
                                {filter === 'status' && ['Open', 'In Progress', 'Resolved', 'Closed'].map(o => <option key={o} value={o}>{o}</option>)}
                                {filter === 'category' && ['Bug', 'Payment Issue', 'Account Issue', 'Feature Request', 'General Query'].map(o => <option key={o} value={o}>{o}</option>)}
                                {filter === 'priority' && ['High', 'Medium', 'Low'].map(o => <option key={o} value={o}>{o}</option>)}
                                {filter === 'assignedTo' && agents.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover/select:translate-x-1 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>
                ))}

                <button
                    onClick={() => setFilters({ status: '', category: '', priority: '', assignedTo: '' })}
                    className="relative z-10 px-6 py-4 flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 font-bold transition-all hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl group/btn"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover/btn:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Reset
                </button>
            </div>

            {/* 📋 Ticket List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-white/50 dark:bg-slate-800/30 rounded-3xl animate-pulse"></div>
                    ))}
                </div>
            ) : tickets.length === 0 ? (
                <div className="text-center py-24">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-3xl">📭</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No tickets found</h3>
                    <p className="text-slate-500">Adjust your filters to see more results.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Headers */}
                    <div className="grid grid-cols-12 gap-4 px-8 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <div className="col-span-3">Ticket</div>
                        <div className="col-span-2">User</div>
                        <div className="col-span-2 text-center">Priority</div>
                        <div className="col-span-1 text-center">Status</div>
                        <div className="col-span-2 text-center">AI Sentiment</div>
                        <div className="col-span-2 text-right pr-4">Assigned To</div>
                    </div>

                    {/* Rows */}
                    {tickets.map((ticket) => (
                        <div key={ticket._id} className="grid grid-cols-12 gap-4 items-center bg-white dark:bg-slate-800/40 p-5 rounded-[1.5rem] border border-transparent hover:border-slate-200 dark:hover:border-white/5 shadow-sm hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300 group">
                            {/* Ticket Info */}
                            <div className="col-span-3">
                                <Link to={`/agent/ticket/${ticket._id}`} className="block">
                                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                        {ticket.title}
                                    </h4>
                                    <p className="text-xs text-slate-400 font-medium">
                                        {new Date(ticket.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </Link>
                            </div>

                            {/* User */}
                            <div className="col-span-2 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 p-0.5">
                                    <div className="w-full h-full bg-white dark:bg-slate-900 rounded-full flex items-center justify-center text-[10px] font-black text-slate-700 dark:text-white">
                                        {ticket.user?.name?.charAt(0)}
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate max-w-[100px]">{ticket.user?.name}</span>
                            </div>

                            {/* Priority */}
                            <div className="col-span-2 flex justify-center">
                                <div className={`
                                    px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider min-w-[80px] text-center
                                    ${ticket.priority === 'High' ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' :
                                        ticket.priority === 'Medium' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                                            'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'}
                                `}>
                                    {ticket.priority}
                                </div>
                            </div>

                            {/* Status */}
                            <div className="col-span-1 flex justify-center">
                                <div className={`
                                    px-3 py-1.5 rounded-full text-[10px] font-bold border
                                    ${ticket.status === 'Open' ? 'bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400' :
                                        ticket.status === 'In Progress' ? 'bg-purple-50 border-purple-100 text-purple-600 dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-400' :
                                            'bg-slate-50 border-slate-100 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'}
                                `}>
                                    {ticket.status}
                                </div>
                            </div>

                            {/* AI Sentiment */}
                            <div className="col-span-2 flex justify-center">
                                {ticket.aiSentiment ? (
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold
                                        ${ticket.aiSentiment === 'Frustrated' ? 'bg-rose-50 text-rose-600' :
                                            ticket.aiSentiment === 'Neutral' ? 'bg-slate-50 text-slate-600' :
                                                'bg-emerald-50 text-emerald-600'}
                                    `}>
                                        <span>{ticket.aiSentiment === 'Frustrated' ? '😤' : ticket.aiSentiment === 'Neutral' ? '😐' : '😊'}</span>
                                        <span>{ticket.aiSentiment}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 text-xs font-medium text-blue-500">
                                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                        Analyzing...
                                    </div>
                                )}
                            </div>

                            {/* Assigned To & Actions */}
                            <div className="col-span-2 flex justify-end gap-2">
                                <div className="relative">
                                    <select
                                        value={ticket.assignedTo?._id || ''}
                                        onChange={(e) => handleAssign(ticket._id, e.target.value)}
                                        className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all w-[120px]"
                                    >
                                        <option value="">Assign Agent...</option>
                                        {agents.map((agent) => (
                                            <option key={agent._id} value={agent._id}>{agent.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                </div>
            )}
        </div>
    );
};

export default TicketTable;
