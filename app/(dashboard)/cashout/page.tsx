"use client";
import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { AlertTriangle, ArrowRight, Wallet } from 'lucide-react';
import DataTable from '@/components/DataTable';

const Cashout = () => {
    const [balance, setBalance] = useState(0);
    const [formData, setFormData] = useState({
        walletAddress: '',
        amount: ''
    });
    const [status, setStatus] = useState<{ loading: boolean; error: string | null; success: string | null }>({ loading: false, error: null, success: null });
    const [withdrawals, setWithdrawals] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dashboardRes, withdrawalsRes] = await Promise.all([
                    api.get('/user/dashboard'),
                    api.get('/withdrawals')
                ]);

                if (dashboardRes.data.success) {
                    setBalance(dashboardRes.data.data.user.commissionBalance || 0);
                    if (dashboardRes.data.data.user.walletAddress) {
                        setFormData(prev => ({ ...prev, walletAddress: dashboardRes.data.data.user.walletAddress }));
                    }
                }

                if (withdrawalsRes.data.success) {
                    setWithdrawals(withdrawalsRes.data.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            }
        };
        fetchData();
    }, []);

    const withdrawalColumns = [
        { header: 'Amount', accessor: 'amount', render: (row: any) => <span className="font-bold text-emerald-400">{row.amount} USDT</span> },
        { header: 'Fee', accessor: 'fee', render: (row: any) => <span className="text-slate-400">{row.fee} USDT</span> },
        { header: 'Net Amount', accessor: 'netAmount', render: (row: any) => <span className="font-bold text-cyan-400">{row.netAmount} USDT</span> },
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
        { header: 'Date', accessor: 'createdAt', render: (row: any) => new Date(row.createdAt).toLocaleDateString() }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ loading: true, error: null, success: null });

        try {
            const response = await api.post('/withdrawals/request', {
                amount: Number(formData.amount),
                walletAddress: formData.walletAddress
            });

            if (response.data.success) {
                setStatus({ loading: false, error: null, success: 'Withdrawal request submitted successfully!' });
                setFormData({ walletAddress: '', amount: '' });
                // Refresh balance (optimistic update)
                setBalance(prev => prev - Number(formData.amount));
            }
        } catch (error: any) {
            setStatus({
                loading: false,
                error: error.response?.data?.message || 'Withdrawal failed',
                success: null
            });
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Withdraw Funds</h1>
                <p className="text-slate-400">Follow the steps below to withdraw your earnings safely.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                        <span className="text-blue-500 font-bold text-xl">1</span>
                    </div>
                    <h3 className="text-white font-bold mb-2">Login to an Crypto Application</h3>
                    <p className="text-sm text-slate-400">Open your app or website and navigate to standard wallet.</p>
                </div>
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                        <span className="text-purple-500 font-bold text-xl">2</span>
                    </div>
                    <h3 className="text-white font-bold mb-2">Select Deposit</h3>
                    <p className="text-sm text-slate-400">Choose USDT coin and select BEP-20 (BSC) network.</p>
                </div>
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
                        <span className="text-emerald-500 font-bold text-xl">3</span>
                    </div>
                    <h3 className="text-white font-bold mb-2">Copy Address</h3>
                    <p className="text-sm text-slate-400">Copy your deposit address and verify it before pasting.</p>
                </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-8 flex items-start gap-4">
                <div className="p-2 bg-red-500/10 rounded-lg shrink-0">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                    <h3 className="text-red-400 font-bold mb-1">Important Warning</h3>
                    <p className="text-red-300/80 text-sm">
                        Direct withdrawals to Indian Bank Accounts (INR) are NOT supported. You must withdraw to a crypto wallet (Binance, Trust Wallet, MetaMask etc..) using the USDT BEP-20 network.
                    </p>
                </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl max-w-2xl mx-auto">
                <h3 className="text-xl font-bold text-white mb-6 text-center">Request Withdrawal</h3>

                {status.success && (
                    <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 p-4 rounded-xl mb-6 text-center">
                        {status.success}
                    </div>
                )}

                {status.error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 text-center">
                        {status.error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Your Wallet Address</label>
                        <div className="relative">
                            <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                            {formData.walletAddress ? (
                                <input
                                    type="text"
                                    readOnly
                                    value={formData.walletAddress}
                                    className="w-full bg-slate-900 border border-slate-700/50 rounded-xl py-3 pl-10 pr-4 text-slate-300 cursor-not-allowed font-mono text-sm"
                                />
                            ) : (
                                <div className="w-full bg-slate-950 border border-red-500/30 rounded-xl py-3 pl-10 pr-4 flex items-center justify-between">
                                    <span className="text-red-400/80 text-sm">Please update your wallet address in your Profile</span>
                                    <a href="/profile" className="text-cyan-400 hover:text-cyan-300 text-sm font-medium hover:underline transition-colors shrink-0">
                                        Go to Profile
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Amount (USDT)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                            <input
                                type="number"
                                placeholder="0.00"
                                required
                                min="10"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                                Available: {balance !== undefined ? balance.toFixed(2) : '...'}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Minimum withdrawal: 10 USDT (Commission Balance)</p>

                        {/* Fee Calculation Display */}
                        {formData.amount && Number(formData.amount) >= 10 && (
                            <div className="mt-4 bg-slate-900/50 p-4 rounded-xl border border-slate-700 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Requested Amount:</span>
                                    <span className="text-white font-mono">{formData.amount} USDT</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Service Fee (5%):</span>
                                    <span className="text-red-400 font-mono">-{(Number(formData.amount) * 0.05).toFixed(2)} USDT</span>
                                </div>
                                <div className="border-t border-slate-700 pt-2 flex justify-between font-bold">
                                    <span className="text-emerald-400">You Receive:</span>
                                    <span className="text-emerald-400 font-mono">{(Number(formData.amount) * 0.95).toFixed(2)} USDT</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={status.loading}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-4 rounded-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {status.loading ? 'Processing...' : 'Withdraw Funds'}
                        {!status.loading && <ArrowRight className="w-5 h-5" />}
                    </button>
                </form>
            </div>

            <div className="mt-8 bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl max-w-2xl mx-auto mb-12">
                <DataTable
                    title="Withdrawal History"
                    columns={withdrawalColumns}
                    data={withdrawals}
                    searchPlaceholder="Search withdrawals..."
                    emptyMessage="No withdrawals matching the criteria"
                />
            </div>
        </div>
    );
};

export default Cashout;
