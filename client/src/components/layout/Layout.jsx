import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileBottomNav from './MobileBottomNav';
import Navbar from './Navbar';

const Layout = () => {
    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-200">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col md:pl-64 min-h-screen relative">
                <Navbar />

                <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8 overflow-y-auto">
                    <Outlet />
                </main>

                {/* Mobile Bottom Nav */}
                <MobileBottomNav />
            </div>
        </div>
    );
};

export default Layout;
