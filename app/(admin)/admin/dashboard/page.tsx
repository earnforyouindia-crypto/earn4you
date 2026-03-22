"use client";
import React, { useEffect, useState } from 'react';
import DataTable from '@/components/DataTable';
import api from '@/lib/axios';
import { ExternalLink, User } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        pendingPayments: 0,
        verifiedPayments: 0,
        totalRevenue: 0,
        pendingWithdrawals: 0
    });
    const [recentPayments, setRecentPayments] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            const statsRes = await api.get('/admin/stats');
            if (statsRes.data.success) {
                setStats(statsRes.data.data);
            }

            const paymentsRes = await api.get('/admin/payments?status=pending');
            if (paymentsRes.data.success) {
                setRecentPayments(paymentsRes.data.data);
            }

            const txRes = await api.get('/admin/transactions');
            if (txRes.data.success) {
                setTransactions(txRes.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch admin dashboard", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const columns = [
        {
            header: 'User',
            accessor: 'userId.username',
            render: (row: any) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                        <User size={14} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium text-white text-sm">{row.userId?.name || 'Unknown'}</span>
                        <span className="text-xs text-slate-400">@{row.userId?.username || 'unknown'}</span>
                    </div>
                </div>
            )
        },
        { header: 'Amount', accessor: 'amount', render: (row: any) => <span className="font-bold text-emerald-400">{row.amount} USDT</span> },
        { header: 'Plan', accessor: 'planId.name', render: (row: any) => row.planId?.name || 'N/A' },
        {
            header: 'Proof',
            accessor: 'screenshotUrl',
            render: (row: any) => row.screenshotUrl ? (
                <a
                    href={row.screenshotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline text-xs flex items-center gap-1"
                >
                    View Image <ExternalLink size={10} />
                </a>
            ) : <span className="text-slate-500 text-xs">No img</span>
        },
        { header: 'Hash', accessor: 'transactionHash', render: (row: any) => <span className="font-mono text-xs text-slate-500">{row.transactionHash}</span> },
        {
            header: 'Status', accessor: 'status', render: (row: any) => (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                    {row.status}
                </span>
            )
        },
        { header: 'Date', accessor: 'createdAt', render: (row: any) => new Date(row.createdAt).toLocaleDateString() }
    ];

    if (loading) return <div className="text-white p-6">Loading dashboard data...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Admin Overview</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Users', value: stats.totalUsers },
                    { label: 'Total Revenue', value: `$${stats.totalRevenue}` },
                    { label: 'Pending Payments', value: stats.pendingPayments, highlight: stats.pendingPayments > 0 },
                    { label: 'Pending Withdrawals', value: stats.pendingWithdrawals || 0, highlight: (stats.pendingWithdrawals || 0) > 0 }
                ].map((stat, i) => (
                    <div key={i} className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                        <p className="text-slate-500 text-sm mb-1">{stat.label}</p>
                        <h3 className={`text-2xl font-bold ${stat.highlight ? 'text-yellow-400' : 'text-white'}`}>{stat.value}</h3>
                    </div>
                ))}
            </div>

            <DataTable
                title="Pending Investments"
                columns={columns}
                data={recentPayments}
                searchPlaceholder="Search..."
            />

            <div className="mt-8">
                <DataTable
                    title="Global Wallet & Commission Activity"
                    columns={[
                        {
                            header: 'User',
                            accessor: 'userId.username',
                            render: (row: any) => (
                                <div className="flex flex-col">
                                    <span className="font-medium text-white text-sm">{row.userId?.name || 'System Account'}</span>
                                    <span className="text-xs text-slate-400">@{row.userId?.username || 'system'}</span>
                                </div>
                            )
                        },
                        {
                            header: 'Type',
                            accessor: 'type',
                            render: (row: any) => (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${row.type === 'deposit' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                        row.type.includes('withdrawal') ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                            row.type.includes('bonus') || row.type === 'daily_return' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                    }`}>
                                    {row.type.replace(/_/g, ' ').toUpperCase()}
                                </span>
                            )
                        },
                        {
                            header: 'Description',
                            accessor: 'description',
                            render: (row: any) => <span className="text-slate-300">{row.description}</span>
                        },
                        {
                            header: 'Amount',
                            accessor: 'amount',
                            render: (row: any) => (
                                <span className={`font-bold ${row.type.includes('withdrawal') ? 'text-red-400' : 'text-emerald-400'}`}>
                                    {row.type.includes('withdrawal') ? '-' : '+'}{row.amount.toFixed(2)} USDT
                                </span>
                            )
                        },
                        {
                            header: 'Date',
                            accessor: 'createdAt',
                            render: (row: any) => new Date(row.createdAt).toLocaleDateString()
                        }
                    ]}
                    data={transactions}
                    searchPlaceholder="Search site-wide commissions..."
                />
            </div>
        </div>
    );
};

export default AdminDashboard;
