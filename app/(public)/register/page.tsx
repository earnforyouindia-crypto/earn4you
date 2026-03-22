"use client";
import React, { useState, Suspense, useEffect } from 'react';
import api from "@/lib/axios";
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, ArrowRight, User, UserPlus, Phone } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

function RegisterContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const referralCodeParam = searchParams.get('ref');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
        confirmPassword: '',
        referralCode: ''
    });

    useEffect(() => {
        if (referralCodeParam) {
            setFormData(prev => ({ ...prev, referralCode: referralCodeParam }));
        }
    }, [referralCodeParam]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords don't match!");
            return;
        }

        try {
            const response = await api.post('/auth/register', {
                name: formData.name,
                phone: formData.phone,
                password: formData.password,
                referralCode: formData.referralCode || undefined
            });

            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                router.push('/dashboard');
            }
        } catch (err: any) {
            console.error("Registration failed", err);
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl relative z-10">
            <div className="text-center mb-8">
                <div className="flex justify-center mb-6">
                    <Image
                        src="/logo1.png"
                        alt="Earn4You Logo"
                        width={180}
                        height={60}
                        className="object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        priority
                    />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                <p className="text-slate-400">Join Earn4You today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                        <input
                            type="text"
                            required
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
                    <div className="relative phone-input-container">
                        <PhoneInput
                            country={'in'}
                            value={formData.phone}
                            onChange={phone => setFormData({ ...formData, phone })}
                            inputStyle={{
                                width: '100%',
                                backgroundColor: '#020617', // slate-950
                                border: '1px solid #1e293b', // slate-800
                                borderRadius: '0.75rem', // rounded-xl
                                paddingLeft: '48px',
                                paddingTop: '12px',
                                paddingBottom: '12px',
                                height: 'auto',
                                color: 'white',
                            }}
                            buttonStyle={{
                                backgroundColor: '#020617',
                                border: '1px solid #1e293b',
                                borderRight: 'none',
                                borderRadius: '0.75rem 0 0 0.75rem',
                            }}
                            dropdownStyle={{
                                backgroundColor: '#0f172a', // slate-900
                                color: 'white',
                            }}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                        <input
                            type="password"
                            required
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                        <input
                            type="password"
                            required
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Referral Code (Optional)</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                        <input
                            type="text"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                            placeholder="Enter Referral Code"
                            value={formData.referralCode}
                            onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-3 rounded-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-6"
                >
                    Create Account
                    <ArrowRight className="w-5 h-5" />
                </button>
            </form>

            <div className="mt-8 text-center text-slate-400">
                <p>Already have an account?{' '}
                    <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline transition-colors">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default function Register() {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]" />
            </div>

            <Suspense fallback={<div className="text-white">Loading...</div>}>
                <RegisterContent />
            </Suspense>
        </div>
    );
}
