"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, CreditCard, Wallet, BookOpen, LogOut, Package, Users } from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
    const router = useRouter();
    const pathname = usePathname();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Users, label: 'Profile', path: '/profile' },
        { icon: Package, label: 'Subscription Plans', path: '/plans' },
        { icon: CreditCard, label: 'Make Payment', path: '/payment' },
        { icon: BookOpen, label: 'Cashout Guide', path: '/cashout' },
        { icon: Users, label: 'My Team', path: '/referrals' },
    ];

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/login');
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`
          fixed top-0 left-0 h-full w-64 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800 z-50 transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
            >
                <div className="flex flex-col h-full p-4">
                    {/* Logo Area */}
                    <div className="flex items-center justify-center px-4 py-6 mb-2">
                        <img
                            src="/logo1.png"
                            alt="Earn4You Logo"
                            className="w-full max-w-[220px] h-auto object-contain"
                        />
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex-1 space-y-2">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                                    className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${isActive
                                            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                                        }
                `}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout Button */}
                    <div className="pt-6 border-t border-slate-800">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all group"
                        >
                            <LogOut className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
