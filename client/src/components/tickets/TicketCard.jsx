import { Link } from 'react-router-dom';
import TicketStatusBadge from './TicketStatusBadge';
import { formatDate } from '../../utils/formatDate';

const TicketCard = ({ ticket }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <TicketStatusBadge status={ticket.status} />
                    <span className="text-[10px] font-bold text-gray-300 dark:text-gray-600 tracking-widest uppercase">#{ticket._id.substring(ticket._id.length - 6).toUpperCase()}</span>
                </div>
                <span className="text-xs font-medium text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-1 rounded-full">{formatDate(ticket.createdAt)}</span>
            </div>

            <Link to={`/ticket/${ticket._id}`} className="block group">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 group-hover:translate-x-1 transition-all">
                    {ticket.title}
                </h3>
            </Link>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-2 leading-relaxed">
                {ticket.description}
            </p>

            <div className="flex justify-between items-center pt-5 border-t border-gray-50 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight">{ticket.aiCategory || ticket.category}</span>
                    </div>
                    {ticket.aiSentiment && (
                        <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded-lg border border-gray-100 dark:border-gray-800">
                            <span className="text-sm">
                                {ticket.aiSentiment === 'Angry' ? '😠' :
                                    ticket.aiSentiment === 'Frustrated' ? '😤' :
                                        ticket.aiSentiment === 'Calm' ? '😊' :
                                            ticket.aiSentiment === 'Happy' ? '😄' : '😐'}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">{ticket.aiSentiment}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1.5 ml-2">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Agent:</span>
                        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                            {ticket.assignedTo?.name || 'Unassigned'}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-1 rounded-md border ${(ticket.aiPriority || ticket.priority) === 'High'
                        ? 'text-red-600 bg-red-50 border-red-100'
                        : (ticket.aiPriority || ticket.priority) === 'Medium'
                            ? 'text-yellow-600 bg-yellow-50 border-yellow-100'
                            : 'text-green-600 bg-green-50 border-green-100'
                        }`}>
                        {ticket.aiPriority || ticket.priority}
                    </span>
                    <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketCard;
