import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { HiOutlineCheckCircle, HiOutlineClock, HiOutlineExclamationCircle, HiOutlineClipboardList } from 'react-icons/hi';
import api from '../services/api';

const PRIORITY_COLORS = { High: '#EF4444', Medium: '#F59E0B', Low: '#3B82F6' };

const STATUS_COLORS = {
    'Open': 'bg-gray-100 text-gray-600',
    'In Progress': 'bg-purple-100 text-purple-600',
    'Resolved': 'bg-green-100 text-green-600',
    'Deferred': 'bg-orange-100 text-orange-600',
};

const PRIORITY_DOT = { High: 'bg-red-500', Medium: 'bg-yellow-500', Low: 'bg-blue-500' };

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useSelector(state => state.auth);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await api.get('/tasks');
                setTasks(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    // --- Derived stats ---
    const total = tasks.length;
    const resolved = tasks.filter(t => t.status === 'Resolved').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const highPriority = tasks.filter(t => t.priority === 'High').length;

    const stats = [
        {
            label: 'Tasks Completed',
            value: total > 0 ? `${resolved}/${total}` : '0/0',
            icon: <HiOutlineCheckCircle className="w-6 h-6 text-mint" />,
            color: 'bg-mint/10',
        },
        {
            label: 'In Progress',
            value: inProgress,
            icon: <HiOutlineClock className="w-6 h-6 text-yellow-500" />,
            color: 'bg-yellow-50 dark:bg-yellow-900/10',
        },
        {
            label: 'High Priority',
            value: highPriority,
            icon: <HiOutlineExclamationCircle className="w-6 h-6 text-red-500" />,
            color: 'bg-red-50 dark:bg-red-900/10',
        },
        {
            label: 'Total Tasks',
            value: total,
            icon: <HiOutlineClipboardList className="w-6 h-6 text-blue-500" />,
            color: 'bg-blue-50 dark:bg-blue-900/10',
        },
    ];

    // --- Bar chart: tasks created per day of week (last 7 days) ---
    const barData = (() => {
        const today = new Date();
        const result = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(today);
            d.setDate(today.getDate() - (6 - i));
            return {
                name: DAYS[d.getDay()],
                date: d.toDateString(),
                assigned: 0,
                resolved: 0,
            };
        });

        tasks.forEach(task => {
            const created = new Date(task.createdAt).toDateString();
            const bucket = result.find(r => r.date === created);
            if (bucket) {
                bucket.assigned += 1;
                if (task.status === 'Resolved') bucket.resolved += 1;
            }
        });

        return result.map(({ name, assigned, resolved }) => ({ name, assigned, resolved }));
    })();

    // --- Pie chart: priority breakdown ---
    const priorityCounts = ['High', 'Medium', 'Low'].map(p => ({
        name: p,
        value: tasks.filter(t => t.priority === p).length,
    })).filter(d => d.value > 0);

    // --- Recent tasks: last 5 by createdAt ---
    const recentTasks = [...tasks]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400">
                <svg className="animate-spin w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Loading dashboard...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
                <p className="text-gray-500 dark:text-gray-400">
                    Welcome back, <span className="font-medium text-gray-700 dark:text-gray-200">{user?.fullName || user?.username}</span>
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="card flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart – Tasks last 7 days */}
                <div className="card h-80">
                    <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Tasks This Week</h3>
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={barData} barGap={4}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: '#606060ff' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                            <Legend wrapperStyle={{ paddingTop: '12px' }} />
                            <Bar dataKey="assigned" fill="#0554f1ff" radius={[4, 4, 0, 0]} name="Assigned" />
                            <Bar dataKey="resolved" fill="#34D399" radius={[4, 4, 0, 0]} name="Resolved" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart – Priority breakdown */}
                <div className="card h-80">
                    <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Priority Breakdown</h3>
                    {priorityCounts.length === 0 ? (
                        <div className="flex items-center justify-center h-[85%] text-gray-400 text-sm">No tasks yet</div>
                    ) : (
                        <ResponsiveContainer width="100%" height="85%">
                            <PieChart>
                                <Pie
                                    data={priorityCounts}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {priorityCounts.map((entry) => (
                                        <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="vertical" verticalAlign="middle" align="right" />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Recent Tasks */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Tasks</h3>
                    <Link to="/tasks" className="text-sm text-mint hover:text-mint-600 transition-colors">View all →</Link>
                </div>
                {recentTasks.length === 0 ? (
                    <p className="text-center py-8 text-gray-400 text-sm">No tasks yet. Create one to get started.</p>
                ) : (
                    <div className="space-y-3">
                        {recentTasks.map(task => (
                            <Link
                                key={task._id}
                                to={`/tasks/${task._id}`}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${PRIORITY_DOT[task.priority] || 'bg-gray-400'}`} />
                                    <div className="min-w-0">
                                        <p className="font-medium text-gray-900 dark:text-white truncate">{task.title}</p>
                                        <p className="text-xs text-gray-500">
                                            {task.dueDate ? `Due ${new Date(task.dueDate).toLocaleDateString()}` : `Created ${new Date(task.createdAt).toLocaleDateString()}`}
                                        </p>
                                    </div>
                                </div>
                                <span className={`ml-3 shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[task.status] || 'bg-gray-100 text-gray-600'}`}>
                                    {task.status}
                                </span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
