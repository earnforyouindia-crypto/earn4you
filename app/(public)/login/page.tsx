"use client";
import React, { useState } from "react";
import api from "@/lib/axios";
import Link from "next/link";
import Image from "next/image";
import { toast } from 'react-hot-toast';
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

export default function Login() {
    const router = useRouter();
    const [formData, setFormData] = useState({ phone: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/auth/login', {
                phone: formData.phone,
                password: formData.password
            });

            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));

                if (response.data.user.role === 'admin') {
                    router.push("/admin/dashboard");
                } else {
                    router.push("/dashboard");
                }
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
            {/* Ambient background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md"
            >
                {/* Gradient border */}
                <div className="p-[1px] rounded-2xl bg-gradient-to-br from-cyan-500/40 via-blue-500/30 to-indigo-500/40">
                    <div className="bg-slate-900 backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="flex justify-center mb-6">
                                <Image
                                    src="/logo1.png"
                                    alt="Earn4You Logo"
                                    width={180}
                                    height={60}
                                    className="object-contain drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                                    priority
                                />
                            </div>
                            <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
                            <p className="text-slate-400 mt-1">Sign in to continue</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Phone Number
                                </label>
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

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                                    <input type="checkbox" className="accent-cyan-500" />
                                    Remember me
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-cyan-400 hover:text-cyan-300"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Submit */}
                            <motion.button
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={loading}
                                type="submit"
                                className="w-full mt-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </motion.button>
                        </form>

                        {/* Footer */}
                        <div className="mt-8 text-center text-slate-400">
                            <p>
                                Don’t have an account?{" "}
                                <Link
                                    href="/register"
                                    className="text-cyan-400 hover:text-cyan-300 font-medium"
                                >
                                    Create account
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
