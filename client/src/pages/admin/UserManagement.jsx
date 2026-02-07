import { useState, useEffect } from 'react';
import api from '../../services/api';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [editingExpertise, setEditingExpertise] = useState(null);
    const [selectedExpertise, setSelectedExpertise] = useState([]);

    const availableExpertise = ['payment', 'technical', 'account', 'general'];

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/auth/users');
            setUsers(data.data || []);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.put(`/auth/users/${userId}/role`, { role: newRole });
            fetchUsers();
        } catch (error) {
            console.error('Failed to update role:', error);
            alert(error.response?.data?.message || 'Failed to update role');
        }
    };

    const handleDeactivate = async (userId) => {
        if (!window.confirm('Are you sure you want to deactivate this user?')) return;

        try {
            await api.put(`/auth/users/${userId}/deactivate`);
            fetchUsers();
        } catch (error) {
            console.error('Failed to deactivate user:', error);
            alert(error.response?.data?.message || 'Failed to deactivate user');
        }
    };

    const handleUpdateExpertise = async (userId) => {
        try {
            await api.put(`/auth/users/${userId}/expertise`, { expertise: selectedExpertise });
            setEditingExpertise(null);
            fetchUsers();
        } catch (error) {
            console.error('Failed to update expertise:', error);
            alert(error.response?.data?.message || 'Failed to update expertise');
        }
    };

    const openExpertiseModal = (user) => {
        setEditingExpertise(user._id);
        setSelectedExpertise(user.expertise || ['general']);
    };

    const toggleExpertise = (skill) => {
        if (selectedExpertise.includes(skill)) {
            setSelectedExpertise(selectedExpertise.filter(s => s !== skill));
        } else {
            setSelectedExpertise([...selectedExpertise, skill]);
        }
    };

    const filteredUsers = users.filter(user => {
        if (filter === 'all') return true;
        return user.role === filter;
    });

    const getRoleBadge = (role) => {
        const badges = {
            'admin': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
            'agent': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
            'user': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        };
        return badges[role] || badges.user;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    User Management
                </h1>
                <div className="flex gap-2">
                    {['all', 'user', 'agent', 'admin'].map((role) => (
                        <button
                            key={role}
                            onClick={() => setFilter(role)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === role
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                                }`}
                        >
                            {role === 'all' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1) + 's'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Role / Expertise
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Joined
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredUsers.map((user) => (
                            <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {user.name}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadge(user.role)}`}>
                                            {user.role.toUpperCase()}
                                        </span>
                                        {user.role === 'agent' && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {(user.expertise || ['general']).map(skill => (
                                                    <span key={skill} className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 rounded">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.isActive !== false
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                        }`}>
                                        {user.isActive !== false ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {user.role !== 'admin' && (
                                        <div className="flex gap-2">
                                            {user.role === 'user' && (
                                                <button
                                                    onClick={() => handleRoleChange(user._id, 'agent')}
                                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    Make Agent
                                                </button>
                                            )}
                                            {user.role === 'agent' && (
                                                <>
                                                    <button
                                                        onClick={() => handleRoleChange(user._id, 'user')}
                                                        className="text-gray-600 hover:text-gray-800 font-medium"
                                                    >
                                                        Remove Agent
                                                    </button>
                                                    <button
                                                        onClick={() => openExpertiseModal(user)}
                                                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                                                    >
                                                        Edit Expertise
                                                    </button>
                                                </>
                                            )}
                                            {user.isActive !== false && (
                                                <button
                                                    onClick={() => handleDeactivate(user._id)}
                                                    className="text-red-600 hover:text-red-800 font-medium"
                                                >
                                                    Deactivate
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Expertise Editing Modal */}
            {editingExpertise && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Edit Agent Expertise
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Select one or more areas of expertise for this agent:
                        </p>
                        <div className="space-y-2 mb-6">
                            {availableExpertise.map(skill => (
                                <label key={skill} className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedExpertise.includes(skill)}
                                        onChange={() => toggleExpertise(skill)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                                        {skill}
                                    </span>
                                </label>
                            ))}
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setEditingExpertise(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleUpdateExpertise(editingExpertise)}
                                disabled={selectedExpertise.length === 0}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
