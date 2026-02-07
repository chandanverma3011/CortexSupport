import { Link } from 'react-router-dom';

const Sidebar = () => {
    // Basic sidebar structure to fulfill requirements.
    // In a real app, this would be more complex and used in a specific layout.
    return (
        <aside className="w-64 bg-white dark:bg-gray-800 h-screen shadow-md hidden lg:block">
            <div className="p-6">
                <h2 className="text-xs uppercase text-gray-400 font-semibold mb-4">Menu</h2>
                <nav className="space-y-2">
                    <Link to="/" className="block py-2 px-4 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">Dashboard</Link>
                    <Link to="/tickets" className="block py-2 px-4 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">My Tickets</Link>
                    <Link to="/create-ticket" className="block py-2 px-4 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">New Ticket</Link>
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;
