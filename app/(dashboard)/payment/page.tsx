"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { Copy, CheckCircle, Upload, Wallet } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/axios';
import QRCode from "react-qr-code";

function PaymentContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const planId = searchParams.get('planId');
    const [selectedPlan, setSelectedPlan] = useState<any>(null);

    // Company Wallet Address (Backend/Env in real app, hardcoded for now)
    const companyWalletAddress = "0x5f6A8Bb0A83Bc88DC8dfb521f140C445E5bFB4d2";

    const [txHash, setTxHash] = useState('');
    const [userWalletAddress, setUserWalletAddress] = useState('');
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchPlan = async () => {
            if (!planId) {
                router.push('/plans');
                return;
            }

            try {
                // Fetch plan details 
                const response = await api.get('/plans');
                if (response.data.success) {
                    const plan = response.data.data.find((p: any) => p._id === planId);
                    if (plan) {
                        setSelectedPlan(plan);
                    } else {
                        router.push('/plans');
                    }
                }
            } catch (err) {
                console.error("Error fetching plan", err);
            }
        };

        fetchPlan();

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            if (user && user.walletAddress) {
                setUserWalletAddress(user.walletAddress);
            }
        }
    }, [planId, router]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(companyWalletAddress);
        alert("Wallet address copied!");
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setScreenshot(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!screenshot) {
            setError("Please upload a screenshot of your payment.");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('planId', selectedPlan._id);
        formData.append('walletAddress', userWalletAddress);
        if (txHash) formData.append('transactionHash', txHash);
        formData.append('screenshot', screenshot);

        try {
            const response = await api.post('/payments/initiate', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setSubmitted(true);
                setTimeout(() => {
                    router.push('/dashboard');
                }, 3000);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Payment submission failed');
        } finally {
            setLoading(false);
        }
    };

    if (!selectedPlan) return <div className="text-white text-center mt-20">Loading plan details...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Deposit Funds</h1>
                <p className="text-slate-400">Scan the QR code or copy the address to send USDT.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Payment Details & QR */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border border-blue-500/30 p-6 rounded-2xl">
                        <p className="text-sm text-blue-300 mb-1">Selected Plan</p>
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">{selectedPlan.name}</h3>
                            <span className="text-2xl font-bold text-cyan-400">{selectedPlan.price} USDT</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl flex flex-col items-center justify-center shadow-lg">
                        <img                                                                                
                            src="/qr.png"
                            alt="Payment QR Code"
                            className="w-[180px] h-[180px] object-contain"
                        />
                        <p className="mt-4 text-slate-900 font-bold text-sm">Scan to Pay</p>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Company Wallet Address (USDT - BEP20)</label>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 px-4 py-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 font-mono text-sm break-all">
                                {companyWalletAddress}
                            </div>
                            <button
                                onClick={copyToClipboard}
                                className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors shrink-0"
                            >
                                <Copy className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Submission Form */}
                <div className="space-y-6">
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl md:h-full flex flex-col justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-6">Submit Payment Proof</h3>

                            {error && (
                                <div className="bg-red-500/20 text-red-400 p-3 rounded-xl mb-4 text-sm text-center">
                                    {error}
                                </div>
                            )}

                            {submitted ? (
                                <div className="bg-emerald-500/20 text-emerald-400 p-6 rounded-xl mb-4 text-center">
                                    <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                                    <h3 className="text-xl font-bold mb-1">Payment Submitted!</h3>
                                    <p className="text-sm opacity-80">Our admin team will verify your payment shortly.</p>
                                    <p className="text-xs mt-4">Redirecting to dashboard...</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">


                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Transaction Hash</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all font-mono text-sm"
                                            placeholder="0x..."
                                            value={txHash}
                                            onChange={(e) => setTxHash(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Payment Screenshot</label>
                                        <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${previewUrl ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-700 hover:border-slate-500'}`}>
                                            <input
                                                type="file"
                                                required
                                                id="screenshot"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                            <label htmlFor="screenshot" className="cursor-pointer block">
                                                {previewUrl ? (
                                                    <div className="relative">
                                                        <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                                                        <p className="text-xs text-cyan-400 mt-2">Click to change</p>
                                                    </div>
                                                ) : (
                                                    <div className="py-8">
                                                        <Upload className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                                                        <p className="text-slate-400 text-sm">Click to upload screenshot</p>
                                                        <p className="text-slate-600 text-xs mt-1">PNG, JPG up to 5MB</p>
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`
                                            w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2
                                            bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                        `}
                                    >
                                        {loading ? 'Submitting...' : 'Confirm Payment'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Payment() {
    return (
        <Suspense fallback={<div className="text-white text-center mt-20">Loading payment details...</div>}>
            <PaymentContent />
        </Suspense>
    );
}
