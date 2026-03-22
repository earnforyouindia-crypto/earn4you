"use client";
import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import { ShieldCheck, Wallet, Activity, TrendingUp, Copy, CheckCircle, Users } from 'lucide-react';

const Dashboard = () => {
    const [user, setUser] = useState<any>(null);
    const [payments, setPayments] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await api.get('/user/dashboard');
                if (response.data.success) {
                    setUser(response.data.data.user);
                }

                // Fetch user's payment history
                const paymentsRes = await api.get('/payments/history');
                if (paymentsRes.data.success) {
                    setPayments(paymentsRes.data.data);
                }

                // Fetch user's wallet transactions
                const txRes = await api.get('/user/transactions');
                if (txRes.data.success) {
                    setTransactions(txRes.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    const handleCopy = async (text: string, type: 'code' | 'link') => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                const textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.position = "absolute";
                textArea.style.left = "-999999px";
                document.body.prepend(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                } catch (error) {
                    console.error(error);
                } finally {
                    textArea.remove();
                }
            }
            if (type === 'code') {
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 2000);
            } else {
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2000);
            }
        } catch (error) {
            console.error("Copy failed", error);
        }
    };

    if (loading) {
        return <div className="text-white text-center mt-20">Loading dashboard...</div>;
    }

    if (!user) {
        return <div className="text-white text-center mt-20">Failed to load user data.</div>;
    }

    // Helper to get rejection reason if any
    const latestPayment = payments.length > 0 ? payments[0] : null;
    const derivedPaymentStatus = latestPayment ? latestPayment.status : 'none';
    const rejectionReason = (derivedPaymentStatus === 'failed' && latestPayment.verificationNotes)
        ? latestPayment.verificationNotes
        : 'No reason provided';

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
                    <p className="text-slate-400">Welcome back, {user.name || user.username}.</p>
                </div>
                {/* Referral Link Card (Small) */}
                <div className="hidden md:block bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                    <p className="text-xs text-slate-400 mb-1">Your Referral Code</p>
                    <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-mono font-bold">{user.referralCode}</span>
                        <button onClick={() => handleCopy(user.referralCode, 'code')} className="text-slate-400 hover:text-white transition-colors">
                            {copiedCode ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                    title="Active Plan"
                    value={user.planActive && user.plan ? user.plan.name : "No Active Plan"}
                    status={user.isActive ? "Active" : "Inactive"}
                    icon={ShieldCheck}
                    color="purple"
                    subValue={
                        user.planActive && user.plan && user.planStartDate
                            ? (
                                <div className="space-y-1">
                                    <div>Earn {user.plan.dailyProfit} USDT Daily</div>
                                    <div className="text-xs space-y-0.5 opacity-80 mt-2 border-t border-purple-500/20 pt-2">
                                        <div><span className="font-semibold text-purple-200">Start:</span> {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(user.planStartDate))}</div>
                                        <div><span className="font-semibold text-purple-200">Expire:</span> {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(new Date(user.planStartDate).getTime() + (user.planDurationDays || user.plan.duration || 30) * 24 * 60 * 60 * 1000))}</div>
                                    </div>
                                </div>
                            )
                            : (user.paymentStatus === 'pending' ? "Payment Pending Verification" : "Purchase a plan to earn")
                    }
                />

                <StatCard
                    title="Commission Wallet"
                    value={`${(user.commissionBalance || 0).toFixed(2)} USDT`}
                    icon={Wallet}
                    color="emerald"
                    subValue="Withdrawable (Min 10 USDT)"
                />

                <StatCard
                    title="ROI Wallet"
                    value={`${(user.roiBalance || 0).toFixed(2)} USDT`}
                    icon={TrendingUp}
                    color="orange"
                    subValue="Daily Returns (Locked)"
                />

                <StatCard
                    title="Total Deposit"
                    value={`${(user.totalDeposit || 0).toFixed(2)} USDT`}
                    icon={TrendingUp}
                    color="blue"
                    subValue="Invested Amount"
                />

                <StatCard
                    title="Payment Status"
                    value={
                        derivedPaymentStatus === 'verified' ? "Verified" :
                            derivedPaymentStatus === 'pending' ? "Pending Approval" :
                                derivedPaymentStatus === 'failed' ? "Rejected" : "No Payment Yet"
                    }
                    status={derivedPaymentStatus}
                    icon={Activity}
                    color={derivedPaymentStatus === 'verified' ? "blue" : derivedPaymentStatus === 'pending' ? "yellow" : derivedPaymentStatus === 'failed' ? "red" : "purple"}
                    subValue={
                        derivedPaymentStatus === 'pending' ? "Admin is reviewing your proof" :
                            derivedPaymentStatus === 'verified' ? "Investment Active" :
                                derivedPaymentStatus === 'failed' ? `Reason: ${rejectionReason}` : "Please make a payment to start earning"
                    }
                />

                <StatCard
                    title="Total Commission"
                    value={`${(user.totalCommissionEarned || 0).toFixed(2)} USDT`}
                    status="Earned"
                    icon={Users}
                    color="pink"
                    subValue="From Referrals"
                />
            </div>

            {/* 3x Cap Progress */}
            {user.plan && user.planActive && (
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-bold text-white">Plan ROI Progress (3x Cap)</h3>
                        <span className="text-slate-400 text-sm">
                            {user.earnedFromPlan || 0} / {user.plan.price * 3} USDT
                        </span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-4 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-full transition-all duration-500"
                            style={{ width: `${Math.min(((user.earnedFromPlan || 0) / (user.plan.price * 3)) * 100, 100)}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                        Once you reach {user.plan.price * 3} USDT earnings from daily returns, your plan will expire and you must re-subscribe.
                    </p>
                </div>
            )}

            {/* Referral Section (Mobile/Prominent) */}
            <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <h3 className="text-xl font-bold text-white mb-2 relative z-10">Refer & Earn</h3>
                <div className="flex items-center gap-4 relative z-10 max-w-md">
                    <div className="flex-1 bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-300 font-mono text-sm truncate">
                        {`${window.location.origin}/register?ref=${user.referralCode}`}
                    </div>
                    <button
                        onClick={() => handleCopy(`${window.location.origin}/register?ref=${user.referralCode}`, 'link')}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2"
                    >
                        {copiedLink ? 'Copied!' : 'Copy Link'}
                        <Copy className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Payment History Table */}
            <div className="mt-8">
                <DataTable
                    title="Payment History"
                    data={payments}
                    searchPlaceholder="Search payments..."
                    columns={[
                        {
                            header: 'Plan',
                            accessor: 'planId.name',
                            render: (row: any) => row.planId?.name || 'Unknown Plan'
                        },
                        {
                            header: 'Amount',
                            accessor: 'amount',
                            render: (row: any) => <span className="font-bold text-emerald-400">{row.amount} USDT</span>
                        },
                        {
                            header: 'Status',
                            accessor: 'status',
                            render: (row: any) => (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${row.status === 'verified' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                    row.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                        'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                    }`}>
                                    {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                                </span>
                            )
                        },
                        {
                            header: 'Date',
                            accessor: 'createdAt',
                            render: (row: any) => new Date(row.createdAt).toLocaleDateString()
                        }
                    ]}
                />
            </div>

            {/* Wallet Transaction History Table */}
            <div className="mt-8">
                <DataTable
                    title="Wallet & Commission History"
                    data={transactions}
                    searchPlaceholder="Search transactions..."
                    columns={[
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
                />
            </div>
        </div>
    );
};

export default Dashboard;
