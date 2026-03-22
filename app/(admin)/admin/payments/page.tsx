"use client";
import React, { useState, useEffect } from 'react';
import DataTable from '@/components/DataTable';
import { ExternalLink, Check, X, Loader2 } from 'lucide-react';
import api from '@/lib/axios';

const AdminPayments = () => {
    const [activeTab, setActiveTab] = useState('Pending');
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [paymentToReject, setPaymentToReject] = useState<string | null>(null);

    useEffect(() => {
        const fetchPayments = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/admin/payments?status=${activeTab}`);
                if (response.data.success) {
                    setPayments(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch payments", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, [activeTab]);

    const handleVerify = async (id: string) => {
        setActionLoading(id);
        try {
            const response = await api.post(`/admin/payments/verify/${id}`, { verificationNotes: 'Approved by Admin' });
            if (response.data.success) {
                // Remove from list or update status
                setPayments(prev => prev.filter(p => p._id !== id));
            }
        } catch (error) {
            console.error("Verification failed", error);
        } finally {
            setActionLoading(null);
        }
    };

    const openRejectModal = (id: string) => {
        setPaymentToReject(id);
        setRejectReason('');
        setRejectModalOpen(true);
    };

    const handleRejectSubmit = async () => {
        if (!paymentToReject) return;

        setActionLoading(paymentToReject);
        setRejectModalOpen(false); // Optimistically close modal
        try {
            const response = await api.post(`/admin/payments/reject/${paymentToReject}`, { verificationNotes: rejectReason || 'Rejected by Admin' });
            if (response.data.success) {
                setPayments(prev => prev.filter(p => p._id !== paymentToReject));
            }
        } catch (error) {
            console.error("Rejection failed", error);
        } finally {
            setActionLoading(null);
            setPaymentToReject(null);
            setRejectReason('');
        }
    };

    const columns = [
        {
            header: 'User',
            accessor: 'userId.username',
            render: (row: any) => (
                <div className="flex flex-col">
                    <span className="font-medium text-white text-sm">{row.userId?.name || 'Unknown'}</span>
                    <span className="text-xs text-slate-400">@{row.userId?.username || 'unknown'}</span>
                </div>
            )
        },
        {
            header: 'Amount',
            accessor: 'amount',
            render: (row: any) => <span className="font-bold text-emerald-400">{row.amount} USDT</span>
        },
        {
            header: 'Plan',
            accessor: 'planId.name',
            render: (row: any) => (
                <span className="px-2 py-1 rounded text-xs font-medium bg-slate-800 border border-slate-700 text-slate-300">
                    {row.planId?.name || 'N/A'}
                </span>
            )
        },
        {
            header: 'Proof',
            accessor: 'screenshotUrl',
            render: (row: any) => row.screenshotUrl ? (
                <a
                    href={row.screenshotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block w-10 h-10 rounded-lg overflow-hidden border border-slate-700 hover:border-emerald-500 transition-colors"
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={row.screenshotUrl} alt="Payment Proof" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink size={14} className="text-white" />
                    </div>
                </a>
            ) : <span className="text-slate-500 text-xs italic">No proof</span>
        },
        {
            header: 'TX Hash',
            accessor: 'transactionHash',
            render: (row: any) => (
                <div className="flex items-center gap-2 max-w-[200px] lg:max-w-xs">
                    <span className="font-mono text-xs text-slate-400 break-all select-all">{row.transactionHash || 'N/A'}</span>
                </div>
            )
        },
        { header: 'Date', accessor: 'createdAt', render: (row: any) => new Date(row.createdAt).toLocaleDateString() },
        {
            header: 'Actions',
            accessor: '_id',
            render: (row: any) => (
                <div className="flex items-center gap-2">
                    {row.status === 'pending' && (
                        <>
                            <button
                                onClick={() => handleVerify(row._id)}
                                disabled={actionLoading === row._id}
                                className="p-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors disabled:opacity-50"
                                title="Approve"
                            >
                                {actionLoading === row._id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                            </button>
                            <button
                                onClick={() => openRejectModal(row._id)}
                                disabled={actionLoading === row._id}
                                className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors disabled:opacity-50"
                                title="Reject"
                            >
                                <X size={16} />
                            </button>
                        </>
                    )}
                    {row.status !== 'pending' && (
                        <div className="flex flex-col gap-1">
                            <span className={`text-xs font-medium ${row.status === 'verified' ? 'text-emerald-500' : 'text-red-500'}`}>
                                {row.status.toUpperCase()}
                            </span>
                            {row.verificationNotes && (
                                <span className="text-[10px] text-slate-400 max-w-[150px] truncate" title={row.verificationNotes}>
                                    Note: {row.verificationNotes}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Payment Verification</h1>

            <div className="flex gap-4 border-b border-slate-800">
                {['Pending', 'Approved', 'Rejected', 'All'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === tab ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-300'
                            }`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-t-full"></div>
                        )}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center text-slate-500 py-10">Loading payments...</div>
            ) : (
                <DataTable
                    title={`${activeTab} Payments`}
                    columns={columns}
                    data={payments}
                    searchPlaceholder="Search hash or user..."
                />
            )}
            {/* Reject Modal */}
            {rejectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-4">Reject Payment</h2>
                        <p className="text-slate-400 text-sm mb-4">Please provide a reason for rejecting this payment. This will be shown to the user.</p>

                        <textarea
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white mb-6 focus:outline-none focus:border-red-500"
                            rows={3}
                            placeholder="e.g. Transaction hash not found, amount incorrect, screenshot blurry..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        ></textarea>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setRejectModalOpen(false)}
                                className="px-4 py-2 rounded-xl font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRejectSubmit}
                                className="px-4 py-2 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white transition-colors flex items-center gap-2"
                            >
                                Reject Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPayments;
