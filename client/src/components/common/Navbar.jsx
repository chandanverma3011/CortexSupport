import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Notifications State
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const profileRef = useRef(null);
    const notificationRef = useRef(null);

    const onLogout = () => {
        logout();
        navigate('/login');
        setIsProfileOpen(false);
    };

    // Fetch Notifications
    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const { data } = await api.get('/notifications');
            if (data.success) {
                setNotifications(data.data);
                setUnreadCount(data.data.filter(n => !n.isRead).length);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 60 seconds
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [user]);

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            await markAsRead(notification._id);
        }
        setIsNotificationsOpen(false);
        if (notification.ticket) {
            const ticketId = typeof notification.ticket === 'object' ? notification.ticket._id : notification.ticket;
            const path = user.role === 'agent' ? `/agent/ticket/${ticketId}` : user.role === 'admin' ? `/admin/tickets` : `/tickets`;
            // Better to route based on ID if we have detail pages for all
            navigate(path);
        }
    };

    const markAllRead = async () => {
        try {
            await api.put('/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all read', error);
        }
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <nav className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-md shadow-lg border-b border-white/20 dark:border-gray-800/20 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo Section */}
                    <div className="flex">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md transform group-hover:scale-105 transition-transform duration-200">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12.375m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                                </svg>
                            </div>
                            <span className="font-bold text-2xl tracking-tight text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                Cortex<span className="text-blue-600">Support</span>
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:ml-6 md:flex md:items-center md:space-x-8">
                        {user && (
                            user.role === 'admin' ? (
                                <>
                                    <Link to="/admin" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Dashboard</Link>
                                    <Link to="/admin/tickets" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">All Tickets</Link>
                                    <Link to="/admin/users" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Users</Link>
                                    <Link to="/admin/analytics" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Analytics</Link>
                                </>
                            ) : user.role === 'agent' ? (
                                <>
                                    <Link to="/tickets" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">My Tickets</Link>
                                    <Link to="/agent/tickets" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Assigned</Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">My Tickets</Link>
                                    <Link to="/create-ticket" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">New Ticket</Link>
                                </>
                            )
                        )}



                        {/* Notification Bell */}
                        <div className="ml-4 relative" ref={notificationRef}>
                            <button
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className="bg-white dark:bg-gray-800 p-1 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors relative"
                            >
                                <span className="sr-only">View notifications</span>
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 block h-4 w-4 transform -translate-y-1/2 translate-x-1/4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-gray-900 animate-pulse">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            {isNotificationsOpen && (
                                <div className="absolute right-0 mt-3 w-80 transform origin-top-right rounded-xl bg-white dark:bg-gray-800 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden border border-gray-100 dark:border-gray-700 animate-fade-in-up">
                                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={markAllRead}
                                                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                                            >
                                                Mark all read
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                                        {notifications.length === 0 ? (
                                            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                                <p className="text-sm">No notifications yet</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {notifications.map((notification) => (
                                                    <div
                                                        key={notification._id}
                                                        onClick={() => handleNotificationClick(notification)}
                                                        className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer flex gap-3 ${!notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                                    >
                                                        <div className={`flex-shrink-0 mt-1 h-2 w-2 rounded-full ${!notification.isRead ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                                                {notification.message}
                                                            </p>
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notification.createdAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-2 text-center border-t border-gray-100 dark:border-gray-700">
                                        <Link to="/notifications" onClick={() => setIsNotificationsOpen(false)} className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
                                            View all history
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile Dropdown or Auth Buttons */}
                        <div className="ml-4 flex items-center md:ml-6">
                            {user ? (
                                <div className="relative" ref={profileRef}>
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="group relative flex items-center rounded-full p-[2px] bg-gradient-to-r from-orange-400 via-pink-500 to-rose-500 hover:from-orange-300 hover:via-pink-400 hover:to-rose-400 transition-all duration-300 shadow-md hover:shadow-lg shadow-pink-500/20 focus:outline-none"
                                    >
                                        <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-full p-1 pr-3 transition-all duration-200 group-hover:bg-opacity-95 dark:group-hover:bg-opacity-95">
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-orange-500 to-rose-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white dark:ring-gray-900">
                                                {user.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 hidden lg:block group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-rose-600 transition-colors duration-200">
                                                {user.name?.split(' ')[0]}
                                            </span>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className={`h-4 w-4 text-gray-400 group-hover:text-rose-500 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </button>

                                    {/* Dropdown Menu - Split Panel Layout */}
                                    {isProfileOpen && (
                                        <div className="absolute right-0 mt-3 w-[26rem] transform origin-top-right rounded-2xl bg-white dark:bg-gray-800 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden border border-gray-100 dark:border-gray-700 animate-fade-in-up flex">

                                            {/* Left Panel: User Info (The "ID Card" Page) */}
                                            <div className="w-5/12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-r border-gray-100 dark:border-gray-700 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                                                {/* Decorative background circle */}
                                                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 rounded-full bg-gradient-to-br from-orange-200 to-pink-200 dark:from-gray-700 dark:to-gray-600 opacity-20 blur-xl"></div>

                                                <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-orange-400 to-rose-500 p-[3px] shadow-lg mb-3 relative z-10">
                                                    <div className="h-full w-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-2xl font-bold text-gray-800 dark:text-white">
                                                        {user.name?.charAt(0).toUpperCase() || 'U'}
                                                    </div>
                                                </div>

                                                <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight">
                                                    {user.name}
                                                </h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 break-all px-2 font-medium">
                                                    {user.email}
                                                </p>

                                                <div className="mt-4 px-3 py-1 rounded-full bg-gradient-to-r from-orange-100 to-rose-100 dark:from-gray-700 dark:to-gray-700 border border-rose-100 dark:border-gray-600">
                                                    <span className="text-xs font-bold text-rose-700 dark:text-gray-200 uppercase tracking-widest">
                                                        {user.role}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Right Panel: Actions (The "Menu" Page) */}
                                            <div className="w-7/12 bg-white dark:bg-gray-800 p-2 flex flex-col justify-center">
                                                <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                                    Account
                                                </p>

                                                <Link to={user.role === 'admin' ? "/admin/profile" : user.role === 'agent' ? "/agent/profile" : "/profile"} className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700/50 hover:text-orange-600 dark:hover:text-orange-400 transition-all group mb-1">
                                                    <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700 group-hover:bg-orange-100 dark:group-hover:bg-gray-600 text-gray-400 group-hover:text-orange-500 transition-colors mr-3">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    </div>
                                                    Profile
                                                </Link>

                                                <Link to={user.role === 'admin' ? "/admin/settings" : user.role === 'agent' ? "/agent/settings" : "/settings"} className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700/50 hover:text-orange-600 dark:hover:text-orange-400 transition-all group mb-1">
                                                    <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700 group-hover:bg-orange-100 dark:group-hover:bg-gray-600 text-gray-400 group-hover:text-orange-500 transition-colors mr-3">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                    </div>
                                                    Settings
                                                </Link>

                                                <div className="h-px bg-gray-100 dark:bg-gray-700 my-1 mx-4"></div>

                                                <button
                                                    onClick={onLogout}
                                                    className="w-full text-left flex items-center px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all group"
                                                >
                                                    <div className="p-2 rounded-lg bg-red-50 dark:bg-gray-700 group-hover:bg-red-100 dark:group-hover:bg-red-900/30 text-red-400 group-hover:text-red-500 transition-colors mr-3">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 11-6 0v-1m6 0H9" />
                                                        </svg>
                                                    </div>
                                                    Sign out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex gap-4">
                                    <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 pt-2 font-medium transition-colors">Login</Link>
                                    <Link to="/register" className="btn-primary shadow-lg shadow-blue-500/30 transform hover:-translate-y-0.5 transition-all">Get Started</Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="bg-gray-100 dark:bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white transition-colors"
                        >
                            <span className="sr-only">Open main menu</span>
                            <svg className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            <svg className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800`}>
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    {user && (
                        user.role === 'admin' ? (
                            <>
                                <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 transition-colors">Admin Dashboard</Link>
                                <Link to="/admin/tickets" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 transition-colors">All Tickets</Link>
                                <Link to="/admin/analytics" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 transition-colors">Analytics</Link>
                                <Link to="/admin/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 transition-colors border-t border-gray-100 dark:border-gray-800 mt-1 pt-3">My Profile</Link>
                                <Link to="/admin/settings" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 transition-colors">Settings</Link>
                            </>
                        ) : user.role === 'agent' ? (
                            <>
                                <Link to="/agent" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 transition-colors">Agent Dashboard</Link>
                                <Link to="/agent/tickets" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 transition-colors">Assigned Tickets</Link>
                                <Link to="/agent/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 transition-colors border-t border-gray-100 dark:border-gray-800 mt-1 pt-3">My Profile</Link>
                                <Link to="/agent/settings" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 transition-colors">Settings</Link>
                            </>
                        ) : (
                            <>
                                <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 transition-colors">Dashboard</Link>
                                <Link to="/tickets" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 transition-colors">My Tickets</Link>
                                <Link to="/create-ticket" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 transition-colors">New Ticket</Link>
                                <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 transition-colors border-t border-gray-100 dark:border-gray-800 mt-1 pt-3">My Profile</Link>
                                <Link to="/settings" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 transition-colors">Settings</Link>
                            </>
                        )
                    )}
                </div>
                {user ? (
                    <div className="pt-4 pb-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center px-5">
                            <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                                    {user.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            </div>
                            <div className="ml-3">
                                <div className="text-base font-medium leading-none text-gray-800 dark:text-white">{user.name}</div>
                                <div className="text-sm font-medium leading-none text-gray-500 mt-1">{user.email}</div>
                            </div>
                        </div>
                        <div className="mt-3 px-2 space-y-1">
                            <button onClick={onLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                Sign out
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="pt-4 pb-4 border-t border-gray-200 dark:border-gray-700 px-5 space-y-3">
                        <Link to="/login" className="block text-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100">
                            Login
                        </Link>
                        <Link to="/register" className="block text-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                            Get Started
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
