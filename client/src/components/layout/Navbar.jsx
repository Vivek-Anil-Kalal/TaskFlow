import React from 'react';
import { HiOutlineSearch, HiOutlineBell, HiOutlineMoon, HiOutlineSun } from 'react-icons/hi';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../../store/themeSlice';

const Navbar = () => {
    const { user } = useSelector((state) => state.auth);
    const { theme } = useSelector((state) => state.theme);
    const dispatch = useDispatch();

    return (
        <header className="h-16 bg-white dark:bg-dark-card border-b border-gray-100 dark:border-gray-700 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 transition-colors duration-200">
            <div className="md:hidden">
                {/* Mobile Logo or Menu Toggle */}
                <span className="text-xl font-bold text-mint-600">TaskFlow</span>
            </div>

            <div className="hidden md:flex items-center w-96">
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={() => dispatch(toggleTheme())}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                >
                    {theme === 'dark' ? <HiOutlineSun className="w-6 h-6" /> : <HiOutlineMoon className="w-6 h-6" />}
                </button>

                <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
                    <HiOutlineBell className="w-6 h-6" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-dark-card"></span>
                </button>

                <div className="flex items-center gap-3 pl-2 border-l border-gray-100 dark:border-gray-700">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.fullName}</p>
                        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-mint-500 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                        {user?.avatarUrl ? <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" /> : user?.username?.[0]?.toUpperCase()}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
