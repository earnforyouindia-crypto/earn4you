"use client";
import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Wallet, Save } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'react-hot-toast';
const Profile = () => {
    const [user, setUser] = useState({
        name: '',
        username: '',
        phone: '',
        walletAddress: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasWallet, setHasWallet] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/user/dashboard');
                if (response.data.success) {
                    const userData = response.data.data.user;
                    setUser({
                        name: userData.name || '',
                        username: userData.username || '',
                        phone: userData.phone || '',
                        walletAddress: userData.walletAddress || ''
                    });
                    setHasWallet(!!userData.walletAddress);
                }
            } catch (err) {
                console.error("Failed to fetch profile info", err);
                toast.error("Failed to load profile data");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Updated to use phone
            const response = await api.put('/user/profile', {
                name: user.name,
                phone: user.phone,
                walletAddress: user.walletAddress
            });

            if (response.data.success) {
                toast.success('Profile updated successfully!');
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const parsed = JSON.parse(storedUser);
                    parsed.name = user.name;
                    parsed.walletAddress = user.walletAddress; // Store wallet address
                    localStorage.setItem('user', JSON.stringify(parsed));
                }
            }
        } catch (err: any) {
            console.error("Update failed", err);
            toast.error(err.response?.data?.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-white">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-white">My Profile</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Personal Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Phone Number</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">📞</span>
                                <input
                                    type="text"
                                    name="phone"
                                    value={user.phone}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">Aa</span>
                            <input
                                type="text"
                                name="name"
                                value={user.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Payment & Security</h2>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Wallet Address (USDT - BEP20)</label>
                        <div className="relative">
                            <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                            <input
                                type="text"
                                name="walletAddress"
                                value={user.walletAddress}
                                onChange={handleChange}
                                placeholder="0x..."
                                readOnly={hasWallet}
                                className={`w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 transition-colors font-mono ${hasWallet ? 'opacity-50 cursor-not-allowed select-none pointer-events-none' : ''}`}
                            />
                        </div>
                    </div>


                </div>



                <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-4 rounded-xl hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {saving ? 'Saving...' : (
                        <>
                            <Save className="w-5 h-5" />
                            Save Changes
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default Profile;
