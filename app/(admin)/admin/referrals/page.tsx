"use client";
import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Users, UserPlus, Copy, CheckCircle } from 'lucide-react';

const AdminReferrals = () => {
    const [referralData, setReferralData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'l1' | 'l2' | 'l3'>('l1');

    useEffect(() => {
        const fetchReferrals = async () => {
            try {
                // Admin uses the same user referral endpoint because they are also a user
                const response = await api.get('/user/referrals');
                if (response.data.success) {
                    setReferralData(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch referral data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReferrals();
    }, []);

    const copyReferralLink = () => {
        if (referralData?.referralLink) {
            navigator.clipboard.writeText(referralData.referralLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) return <div className="text-white text-center mt-20">Loading...</div>;

    if (!referralData) return <div className="text-white text-center mt-20">No referral data found.</div>;

    const currentList = referralData.referrals[activeTab] || [];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">My Personal Team</h1>
                    <p className="text-slate-400">Manage your direct referrals and commissions.</p>
                </div>
            </div>

            {/* Referral Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl">
                    <p className="text-slate-400 text-sm mb-1">Total Team</p>
                    <h3 className="text-2xl font-bold text-white">{referralData.stats.totalCount}</h3>
                </div>
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl">
                    <p className="text-purple-400 text-sm mb-1">Level 1</p>
                    <h3 className="text-2xl font-bold text-white">{referralData.stats.l1Count}</h3>
                </div>
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl">
                    <p className="text-blue-400 text-sm mb-1">Level 2</p>
                    <h3 className="text-2xl font-bold text-white">{referralData.stats.l2Count}</h3>
                </div>
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl">
                    <p className="text-cyan-400 text-sm mb-1">Level 3</p>
                    <h3 className="text-2xl font-bold text-white">{referralData.stats.l3Count}</h3>
                </div>
            </div>

            {/* Referral Link */}
            <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-2">Your Referral Link</h3>
                <p className="text-slate-300 mb-4">Share this link to earn 5% on Level 1, 3% on Level 2, and 2% on Level 3.</p>
                <div className="flex items-center gap-4 max-w-2xl bg-slate-950/50 p-2 rounded-xl border border-slate-700">
                    <div className="flex-1 text-slate-300 font-mono px-4 truncate">
                        {referralData.referralLink}
                    </div>
                    <button
                        onClick={copyReferralLink}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
                    >
                        {copied ? 'Copied' : 'Copy'}
                        {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={copyReferralLink}
                        className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg transition-colors md:hidden"
                    >
                        <Copy className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-800">
                {(['l1', 'l2', 'l3'] as const).map((level) => (
                    <button
                        key={level}
                        onClick={() => setActiveTab(level)}
                        className={`pb-4 px-4 font-medium transition-all relative ${activeTab === level ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        {level === 'l1' ? 'Level 1 (Direct)' : level === 'l2' ? 'Level 2' : 'Level 3'}
                        {activeTab === level && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                        )}
                    </button>
                ))}
            </div>

            {/* Referral Table */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-950/50 text-slate-400 text-left text-sm uppercase font-semibold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Phone</th>
                                <th className="px-6 py-4">Joined Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Plan Name</th>
                                <th className="px-6 py-4">Earnings Generated</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300">
                            {currentList.length > 0 ? (
                                currentList.map((user: any) => (
                                    <tr key={user._id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">{user.name || user.username}</td>
                                        <td className="px-6 py-4 text-slate-400">
                                            {user.phone ? `+${user.phone}` : '-'}
                                        </td>
                                        <td className="px-6 py-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.plan ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700/50 text-slate-400'}`}>
                                                {user.plan ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-300">
                                            {user.plan?.name || 'None'}
                                        </td>
                                        <td className="px-6 py-4 text-emerald-400 font-bold">
                                            + {user.earningsGenerated ? user.earningsGenerated.toFixed(2) : '0.00'} USDT
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        No referrals found in {activeTab === 'l1' ? 'Level 1' : activeTab === 'l2' ? 'Level 2' : 'Level 3'}.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminReferrals;
