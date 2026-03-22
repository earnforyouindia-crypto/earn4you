"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Menu, Bell, UserCircle } from 'lucide-react';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // In a real app, use a Context or robust auth hook
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <Sidebar
                isOpen={isSidebarOpen}
                toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />

            {/* Main Content Area */}
            <div className="lg:ml-64 min-h-screen flex flex-col transition-all duration-300">

                {/* Top Navbar */}
                <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="lg:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <h2 className="text-xl font-semibold text-white hidden sm:block">Dashboard</h2>
                        </div>

                        <div className="flex items-center gap-4">

                            <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
                                <div className="text-right hidden md:block">
                                    <p className="text-sm font-medium text-white">{user?.name || user?.username || 'User'}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                                    <UserCircle className="w-6 h-6 text-slate-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 relative overflow-hidden">
                    {/* Background Decor for pages */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                        <div className="absolute top-10 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px]" />
                        <div className="absolute bottom-10 left-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px]" />
                    </div>

                    <div className="relative z-10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
