"use client";
import React, { useEffect, useState } from 'react';
import DataTable from '@/components/DataTable';
import api from '@/lib/axios';
import { User, Check, X, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';

const WithdrawalsManager = () => {
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    const fetchWithdrawals = async () => {
        try {
            const res = await api.get('/admin/withdrawals?status=all');
            if (res.data.success) {
                setWithdrawals(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch admin withdrawals", error);
            toast.error("Failed to load withdrawals data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWithdrawals();
    }, []);

    const handleAction = async (withdrawalId: string, action: 'approve' | 'reject') => {
        if (!confirm(`Are you sure you want to ${action} this withdrawal?`)) return;

        setProcessing(withdrawalId);
        try {
            const res = await api.post(`/admin/withdrawals/${withdrawalId}`, { action });
            if (res.data.success) {
                toast.success(`Withdrawal ${action}d successfully`);
                fetchWithdrawals();
            }
        } catch (error: any) {
            console.error(`Failed to ${action} withdrawal`, error);
            toast.error(error.response?.data?.message || `Failed to ${action} withdrawal`);
        } finally {
            setProcessing(null);
        }
    };

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
        { header: 'Phone', accessor: 'userId.phone', render: (row: any) => <span className="text-slate-300 text-sm">{row.userId?.phone || 'N/A'}</span> },
        { header: 'Amount', accessor: 'amount', render: (row: any) => <span className="font-bold text-emerald-400">{row.amount} USDT</span> },
        { header: 'Fee', accessor: 'fee', render: (row: any) => <span className="text-slate-400">{row.fee} USDT</span> },
        { header: 'Net Amount', accessor: 'netAmount', render: (row: any) => <span className="font-bold text-cyan-400">{row.netAmount || (row.amount - (row.fee || 0))} USDT</span> },
        {
            header: 'Wallet Address',
            accessor: 'walletAddress',
            render: (row: any) => (
                row.walletAddress ? (
                    <div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-lg border border-slate-700/50 w-fit">
                        <span className="font-mono text-xs text-slate-300 max-w-[150px] truncate">{row.walletAddress}</span>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(row.walletAddress);
                                toast.success("Address copied to clipboard!");
                            }}
                            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                            title="Copy Wallet Address"
                        >
                            <Copy size={12} />
                        </button>
                    </div>
                ) : <span className="text-slate-500 text-xs">No Address</span>
            )
        },
        {
            header: 'Status', accessor: 'status', render: (row: any) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    row.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    }`}>
                    {row.status}
                </span>
            )
        },
        { header: 'Date', accessor: 'createdAt', render: (row: any) => new Date(row.createdAt).toLocaleDateString() },
        {
            header: 'Actions',
            accessor: '_id',
            render: (row: any) => {
                if (row.status !== 'pending') return <span className="text-slate-500 text-xs text-center block">Processed</span>;

                return (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleAction(row._id, 'approve')}
                            disabled={processing === row._id}
                            className="p-1 px-2 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded flex items-center gap-1 text-xs transition-colors disabled:opacity-50"
                        >
                            <Check size={12} /> Confirm Pay
                        </button>
                        <button
                            onClick={() => handleAction(row._id, 'reject')}
                            disabled={processing === row._id}
                            className="p-1 px-2 border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded flex items-center gap-1 text-xs transition-colors disabled:opacity-50"
                        >
                            <X size={12} /> Reject
                        </button>
                    </div>
                );
            }
        }
    ];

    if (loading) return <div className="text-white p-6">Loading withdrawals...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Withdrawals Manager</h1>
            </div>

            <DataTable
                title="Manage Withdrawals"
                columns={columns}
                data={withdrawals}
                searchPlaceholder="Search withdrawals..."
                emptyMessage="No withdrawals to manage."
            />
        </div>
    );
};

export default WithdrawalsManager;
