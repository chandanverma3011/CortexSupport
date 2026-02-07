import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import TicketCard from '../../components/tickets/TicketCard';
import Loader from '../../components/common/Loader';
// import { useContext } from 'react';
// import TicketContext from '../../context/TicketContext'; // Assume we have a hook or ctx

// Mock data integration or use TicketContext
import { useContext } from 'react';
import TicketContext from '../../context/TicketContext';

const MyTickets = () => {
    const { user } = useAuth();
    const { tickets, isLoading, isError, message, getTickets } = useContext(TicketContext);

    useEffect(() => {
        // In a real app we would check if we already have tickets or need to fetch
        getTickets();
        // eslint-disable-next-line
    }, []);

    if (isLoading) return <Loader />;

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">My Support Workspace</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Manage your active requests and AI-powered insights.</p>
                </div>
                <Link
                    to="/create-ticket"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    New Support Ticket
                </Link>
            </div>

            {isError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-2xl mb-8 flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {message}
                </div>
            )}

            {tickets.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="bg-blue-50 dark:bg-blue-900/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No support history yet</h3>
                    <p className="text-gray-500 mb-8 max-w-xs mx-auto">Create a ticket and let our AI-powered agents help you resolve your issues technical or billing.</p>
                    <Link to="/create-ticket" className="btn-primary px-8 py-3 rounded-xl font-bold">Start First Request</Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    {tickets.map((ticket) => (
                        <TicketCard key={ticket._id} ticket={ticket} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyTickets;
