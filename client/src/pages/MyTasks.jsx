import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { HiPencilAlt, HiTrash } from 'react-icons/hi';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';

const priorityColors = {
    High: 'bg-red-100 text-red-600',
    Medium: 'bg-yellow-100 text-yellow-600',
    Low: 'bg-blue-100 text-blue-600',
};

const statusColors = {
    'Open': 'bg-gray-100 text-gray-600',
    'In Progress': 'bg-purple-100 text-purple-600',
    'Resolved': 'bg-green-100 text-green-600',
    'Deferred': 'bg-orange-100 text-orange-600',
};

const MyTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTaskId, setCurrentTaskId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [taskData, setTaskData] = useState({
        title: '', description: '', priority: 'Medium',
        dueDate: '', assignee: '', status: 'Open', project: ''
    });

    const { user } = useSelector((state) => state.auth);

    const fetchMyTasks = async () => {
        try {
            const res = await api.get('/tasks', { params: { assignee: user?._id } });
            setTasks(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchMyTasks();
        fetchUsers();
    }, [user]);

    const openEditModal = (task) => {
        setIsEditing(true);
        setCurrentTaskId(task._id);
        setTaskData({
            title: task.title,
            description: task.description,
            priority: task.priority,
            dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
            assignee: task.assignee?._id || task.assignee || '',
            status: task.status,
            project: task.project?._id || task.project || ''
        });
        setIsModalOpen(true);
    };

    const handleDeleteTask = async (id) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await api.delete(`/tasks/${id}`);
                setTasks(tasks.filter(t => t._id !== id));
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to delete task', {
                    style: {
                        borderRadius: '10px',
                    },
                });
            }
        }
    };

    const handleSubmitTask = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = { ...taskData };
            if (!payload.project) delete payload.project;
            if (!payload.assignee) delete payload.assignee;
            await api.put(`/tasks/${currentTaskId}`, payload);
            setIsModalOpen(false);
            fetchMyTasks();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update task', {
                style: {
                    borderRadius: '10px',
                },
            });
        } finally {
            setSubmitting(false);
        }
    };

    const statuses = ['All', 'Open', 'In Progress', 'Resolved', 'Deferred'];
    const filtered = filter === 'All' ? tasks : tasks.filter(t => t.status === filter);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Tasks</h2>
                <p className="text-gray-500 dark:text-gray-400">Tasks assigned to you</p>
            </div>

            {/* Status Filter Chips */}
            <div className="flex gap-2 flex-wrap">
                {statuses.map(s => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filter === s
                            ? 'bg-mint text-white shadow-sm shadow-mint/30'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* Task Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20 text-gray-400">
                    <svg className="animate-spin w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Loading your tasks...
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-20 text-center text-gray-400 dark:text-gray-500">
                    <div className="text-5xl mb-4">✅</div>
                    <p className="text-lg font-medium">No tasks found</p>
                    <p className="text-sm mt-1">{filter !== 'All' ? `No "${filter}" tasks` : 'You have no assigned tasks yet'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(task => (
                        <div key={task._id} className="card hover:shadow-md transition-all group relative">
                            {/* Hover Action Buttons */}
                            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); openEditModal(task); }}
                                    className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                    title="Edit"
                                >
                                    <HiPencilAlt className="w-4 h-4" />
                                </button>
                                {(user?.role === 'admin' || user?.role === 'manager') && (
                                    <button
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteTask(task._id); }}
                                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <HiTrash className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <Link to={`/tasks/${task._id}`} className="block">
                                {/* Priority & Date */}
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${priorityColors[task.priority] || 'bg-gray-100 text-gray-600'}`}>
                                        {task.priority}
                                    </span>
                                </div>

                                {/* Title */}
                                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 group-hover:text-mint transition-colors line-clamp-1 pr-14">
                                    {task.title}
                                </h3>

                                {/* Description */}
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                                    {task.description || 'No description'}
                                </p>

                                {/* Footer */}
                                <div className="flex items-center justify-between">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status] || 'bg-gray-100 text-gray-600'}`}>
                                        {task.status}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">{task.progress ?? 0}%</span>
                                        <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-mint rounded-full transition-all duration-500"
                                                style={{ width: `${task.progress ?? 0}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Edit Task"
            >
                <form onSubmit={handleSubmitTask} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                        <input
                            type="text" required className="input"
                            value={taskData.title}
                            onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                            disabled={user?.role === 'developer'}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea
                            className="input min-h-[100px]"
                            value={taskData.description}
                            onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                            disabled={user?.role === 'developer'}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                            <select className="input" value={taskData.priority}
                                onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
                                disabled={user?.role === 'developer'}
                            >
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                            <select className="input" value={taskData.status}
                                onChange={(e) => setTaskData({ ...taskData, status: e.target.value })}
                            >
                                <option value="Open">Open</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Deferred">Deferred</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                            <input type="date" className="input" value={taskData.dueDate}
                                onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
                                disabled={user?.role === 'developer'}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assignee</label>
                            <select className="input" value={taskData.assignee}
                                onChange={(e) => setTaskData({ ...taskData, assignee: e.target.value })}
                                disabled={user?.role === 'developer'}
                            >
                                <option value="">Select User</option>
                                {users.map(u => (
                                    <option key={u._id} value={u._id}>{u.fullName || u.username}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting} className="btn btn-primary">
                            {submitting ? 'Saving...' : 'Update Task'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default MyTasks;
