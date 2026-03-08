import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const TaskDetails = () => {
    const { id } = useParams();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTask = async () => {
            try {
                const res = await api.get(`/tasks/${id}`);
                setTask(res.data);
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        }
        fetchTask();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (!task) return <div>Task not found</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="card">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{task.title}</h1>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${task.status === 'Open' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                }`}>
                                {task.status}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 text-sm">Due {new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                    {task.description}
                </p>

                <div className="mb-8">
                    <div className="flex justify-between mb-2">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Progress</span>
                        <span className="text-mint-600 font-bold">{task.progress}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-mint rounded-full transition-all duration-500" style={{ width: `${task.progress}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Activity & Comments would go here */}
            <div className="card">
                <h3 className="text-lg font-bold mb-4">Activity Log</h3>
                <div className="space-y-4">
                    {task.activityLog?.map((log, i) => (
                        <div key={i} className="flex gap-3 text-sm">
                            <span className="font-semibold">{log.user?.username || 'User'}</span>
                            <span className="text-gray-500">{log.action}</span>
                            <span className="text-gray-400 text-xs ml-auto">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TaskDetails;
