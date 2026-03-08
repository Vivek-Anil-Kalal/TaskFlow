import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';

const Teams = () => {
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ email: '', role: 'developer', fullName: '' });
    const [loading, setLoading] = useState(false);

    const { user: currentUser } = useSelector(state => state.auth);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAddUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/users', formData);
            toast.success('User invited successfully', {
                style: {
                    borderRadius: '10px',
                },
            });
            setIsModalOpen(false);
            setFormData({ email: '', role: 'developer', fullName: '' });
            fetchUsers(); // Refresh list
        } catch (err) {
            toast.error('Failed to invite user', {
                style: {
                    borderRadius: '10px',
                },
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Team Members</h2>
                {currentUser?.role === 'admin' && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn btn-primary"
                    >
                        + Add Member
                    </button>
                )}
            </div>
            {
                loading ? (
                    <div className="flex items-center justify-center py-20 text-gray-400">
                        <svg className="animate-spin w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Loading Members...
                    </div>
                ) : users.length === 0 ? (
                    <div className="py-20 text-center text-gray-400 dark:text-gray-500">
                        <div className="text-5xl mb-4">📋</div>
                        <p className="text-lg font-medium">No Members found</p>
                    </div>
                ) :
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {users.filter(u => u._id !== currentUser?._id).map((user) => (
                            <div key={user._id} className="card flex items-center gap-4 cursor-pointer">
                                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-500 overflow-hidden">
                                    {user.avatarUrl ? <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" /> : user.username[0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{user.fullName || user.username}</h3>
                                    <p className="text-sm text-mint-600 capitalize">{user.role}</p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                            </div>
                        ))}
                    </div>
            }

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Invite New User"
            >
                <form onSubmit={handleAddUser} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                        <input
                            type="text"
                            required
                            className="input"
                            placeholder="John Doe"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            className="input"
                            placeholder="colleague@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                        <select
                            className="input"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="developer">Developer</option>
                            <option value="manager">Manager</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                        >
                            {loading ? 'Inviting...' : 'Send Invitation'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Teams;
