import { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';

const Profile = () => {
    const { user } = useAuth();
    // Dummy stats
    const stats = [
        { label: 'Tickets Created', value: 12, color: 'from-orange-400 to-rose-500' },
        { label: 'Tickets Resolved', value: 8, color: 'from-blue-400 to-indigo-500' },
        { label: 'Pending', value: 4, color: 'from-yellow-400 to-orange-500' },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
            {/* Header Card */}
            <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700">
                {/* Background Banner */}
                <div className="h-32 bg-gradient-to-r from-orange-400 via-pink-500 to-rose-500"></div>

                <div className="px-8 pb-8 relative">
                    {/* Avatar */}
                    <div className="absolute -top-16 left-8">
                        <div className="h-32 w-32 rounded-full p-1 bg-white dark:bg-gray-800 shadow-2xl ring-4 ring-orange-50 dark:ring-gray-700/50">
                            <div className="h-full w-full rounded-full bg-gradient-to-tr from-orange-400 to-rose-600 flex items-center justify-center text-5xl font-bold text-white shadow-inner">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end pt-4 mb-4">
                        <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors">
                            Edit Cover
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="mt-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            {user?.name}
                            <span className="px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 capitalize font-medium">
                                {user?.role}
                            </span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">{user?.email}</p>

                        <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                San Francisco, CA (Dummy)
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats Column */}
                <div className="col-span-1 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Activity Stats</h3>
                        <div className="space-y-4">
                            {stats.map((stat, index) => (
                                <div key={index} className="flex flex-col">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-500 dark:text-gray-400">{stat.label}</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{stat.value}</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                                        <div className={`h-full rounded-full bg-gradient-to-r ${stat.color}`} style={{ width: '70%' }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content Column */}
                <div className="col-span-1 md:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-900 dark:text-white text-xl">Personal Information</h3>
                            <button className="text-rose-500 hover:text-rose-600 font-medium text-sm">Edit Information</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Full Name</label>
                                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-800">
                                    {user?.name}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email Address</label>
                                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-800">
                                    {user?.email}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Role</label>
                                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-800 capitalize">
                                    {user?.role}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Phone</label>
                                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-800">
                                    +1 (555) 000-0000
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-2">Bio</h4>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
