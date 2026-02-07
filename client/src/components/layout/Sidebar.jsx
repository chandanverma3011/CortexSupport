import { Link, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const Sidebar = ({ links, roleTitle, themeColor = 'blue' }) => {
    const location = useLocation();
    const { logout } = useAuth();

    const isCommandCenter = themeColor === 'command-center';

    const themeStyles = {
        blue: {
            wrapper: 'bg-white/60 dark:bg-gray-900/60 border-white/20 dark:border-white/5',
            active: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
            icon: 'bg-blue-600 text-white',
            text: 'text-blue-600',
            badge: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800'
        },
        purple: {
            wrapper: 'bg-white/60 dark:bg-gray-900/60 border-white/20 dark:border-white/5',
            active: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300',
            icon: 'bg-purple-600 text-white',
            text: 'text-purple-600',
            badge: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800'
        },
        green: {
            wrapper: 'bg-white/60 dark:bg-gray-900/60 border-white/20 dark:border-white/5',
            active: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
            icon: 'bg-emerald-600 text-white',
            text: 'text-emerald-600',
            badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
        },
        'command-center': {
            wrapper: 'bg-[#0F1023] border-white/5 text-white', // Deep dark theme
            active: 'bg-white/10 text-white shadow-lg shadow-purple-500/20 border border-white/10',
            icon: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white',
            text: 'text-white',
            badge: 'bg-white/10 text-white border-white/20'
        }
    };

    const currentTheme = themeStyles[themeColor] || themeStyles.blue;
    const wrapperClasses = currentTheme.wrapper;

    return (
        <aside className={`w-72 h-screen sticky top-0 flex flex-col pt-10 pb-6 transition-all duration-300 backdrop-blur-2xl border-r ${wrapperClasses}`}>
            {/* Brand Header */}
            <div className="px-8 mb-12">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className={`w-10 h-10 ${currentTheme.icon} rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12.375m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M2.25 12c0 4.5 9 10.5 9 10.5s9-6 9-10.5a9 9 0 10-18 0z" />
                        </svg>
                    </div>
                    <div>
                        <span className={`block font-bold text-xl tracking-tight leading-none ${isCommandCenter ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
                            Cortex<span className={isCommandCenter ? 'text-purple-400' : currentTheme.text}>Support</span>
                        </span>
                        <span className={`text-[10px] font-medium tracking-wide uppercase mt-1 block ${isCommandCenter ? 'text-white/40' : 'text-slate-400 dark:text-slate-500'}`}>
                            Platform v2.8
                        </span>
                    </div>
                </Link>

                {/* Role Badge */}
                <div className="mt-6 flex">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${currentTheme.badge}`}>
                        {roleTitle} Workspace
                    </span>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                <div className={`px-4 mb-2 text-xs font-bold uppercase tracking-wider ${isCommandCenter ? 'text-white/30' : 'text-slate-400'}`}>Menu</div>
                {links.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 group ${isActive
                                ? `${currentTheme.active}`
                                : isCommandCenter
                                    ? 'text-white/60 hover:bg-white/10 hover:text-white'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            <span className={`transition-colors duration-200 ${isActive ? 'text-current' : 'group-hover:text-current'}`}>
                                {link.icon}
                            </span>
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Logout */}
            <div className={`px-6 pt-6 mx-4 border-t ${isCommandCenter ? 'border-white/10' : 'border-slate-200/50 dark:border-white/5'}`}>
                <button
                    onClick={logout}
                    className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 group ${isCommandCenter
                            ? 'text-white/60 hover:bg-white/10 hover:text-white'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400'
                        }`}
                >
                    <div className={`p-1.5 rounded-lg transition-colors ${isCommandCenter
                            ? 'bg-white/10 group-hover:bg-white/20'
                            : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-red-100 dark:group-hover:bg-red-900/30'
                        }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </div>
                    Sign Out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
