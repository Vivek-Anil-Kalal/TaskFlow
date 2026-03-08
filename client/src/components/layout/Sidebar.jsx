import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    HiOutlineHome,
    HiOutlineClipboardList,
    HiOutlineCheckCircle,
    HiOutlineUserGroup,
    HiOutlineUser,
    HiOutlineLogout
} from 'react-icons/hi';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';

const Sidebar = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';

    const handleLogout = () => {
        dispatch(logout());
    };

    const navItems = [
        ...(isAdminOrManager ? [{ name: 'Dashboard', path: '/', icon: <HiOutlineHome className="w-6 h-6" /> }] : []),
        { name: 'My Tasks', path: '/my-tasks', icon: <HiOutlineCheckCircle className="w-6 h-6" /> },
        { name: 'Tasks', path: '/tasks', icon: <HiOutlineClipboardList className="w-6 h-6" /> },
        { name: 'Teams', path: '/teams', icon: <HiOutlineUserGroup className="w-6 h-6" /> },
        { name: 'Profile', path: '/profile', icon: <HiOutlineUser className="w-6 h-6" /> },
    ];

    return (
        <div className="hidden md:flex flex-col w-64 bg-white dark:bg-dark-card border-r border-gray-100 dark:border-gray-700 h-screen fixed left-0 top-0 z-20 transition-colors duration-200">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-mint-600 flex items-center gap-2">
                    <span className="w-8 h-8 bg-mint rounded-lg flex items-center justify-center text-white text-lg">TF</span>
                    TaskFlow
                </h1>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? 'bg-mint/10 text-mint-600 font-medium'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                            }`
                        }
                    >
                        {item.icon}
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors duration-200"
                >
                    <HiOutlineLogout className="w-6 h-6" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
