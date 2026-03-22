"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, LogOut, ShieldAlert, Banknote } from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
}

const AdminSidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
    const router = useRouter();
    const pathname = usePathname();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/admin/dashboard' },
        { icon: Users, label: 'Users & Investments', path: '/admin/users' },
        { icon: CreditCard, label: 'Verify Payments', path: '/admin/payments' },
        { icon: Banknote, label: 'Withdrawals', path: '/admin/withdrawals' },
        { icon: Users, label: 'My Team', path: '/admin/referrals' },
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

    const handleLinkClick = () => {
        if (isOpen) toggleSidebar();
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={toggleSidebar}
                />
            )}

            <aside
                className={`
            fixed top-0 left-0 h-full w-64 bg-slate-950 border-r border-slate-900 z-50 transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
            >
                <div className="flex flex-col h-full p-4">
                    {/* Admin Logo */}
                    <div className="flex items-center gap-3 px-4 py-6 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-red-600/20 text-red-500 flex items-center justify-center border border-red-600/30">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-tight">Admin</h1>
                            <p className="text-xs text-red-400">Panel Access</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    onClick={handleLinkClick}
                                    className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive
                                            ? 'bg-red-600/10 text-red-500 border border-red-600/20'
                                            : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                                        }
                  `}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Logout */}
                    <div className="pt-6 border-t border-slate-900">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-500 hover:bg-slate-900 hover:text-white transition-all"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
