import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    HiOutlineHome,
    HiOutlineClipboardList,
    HiOutlineUserGroup,
    HiOutlineUser,
    HiPlus
} from 'react-icons/hi';

const MobileBottomNav = () => {
    const navItems = [
        { name: 'Home', path: '/', icon: <HiOutlineHome className="w-6 h-6" /> },
        { name: 'Tasks', path: '/tasks', icon: <HiOutlineClipboardList className="w-6 h-6" /> },
        { name: 'Team', path: '/teams', icon: <HiOutlineUserGroup className="w-6 h-6" /> },
        { name: 'Profile', path: '/profile', icon: <HiOutlineUser className="w-6 h-6" /> },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-card border-t border-gray-100 dark:border-gray-700 h-16 px-6 flex items-center justify-between z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            {navItems.map((item, index) => (
                <React.Fragment key={item.path}>
                    {index === 2 && (
                        // Centered Add Button (Floating) - Optional, mimicking typical mobile apps or just consistent items
                        // If we strictly follow Image 1, it has a center + button.
                        <button className="w-12 h-12 bg-mint text-white rounded-full flex items-center justify-center -mt-6 shadow-lg shadow-mint/40 active:scale-95 transition-transform">
                            <HiPlus className="w-6 h-6" />
                        </button>
                    )}
                    <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                            `flex flex-col items-center gap-1 transition-colors duration-200 ${isActive
                                ? 'text-mint-600'
                                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            }`
                        }
                    >
                        {item.icon}
                    </NavLink>
                </React.Fragment>
            ))}
        </div>
    );
};

export default MobileBottomNav;
