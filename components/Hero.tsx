import React from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, Zap, TrendingUp } from 'lucide-react';

const Hero = () => {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-cyan-500/10 to-transparent -z-10 blur-3xl opacity-50" />
            <div className="absolute top-20 right-0 w-64 h-64 bg-blue-600/10 -z-10 blur-3xl rounded-full" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 mb-6 backdrop-blur-sm">
                        <Zap size={16} className="text-cyan-400" />
                        <span className="text-sm font-medium text-slate-300">Join over 10,000+ active investors</span>
                    </div>
                    
                    <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white mb-8 leading-tight">
                        Grow Your Wealth with <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Smart Crypto Investments</span>
                    </h1>
                    
                    <p className="text-lg lg:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                        Secure your financial future with Earn4You. Our transparent investment platform offers consistent daily returns and instant withdrawals.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link 
                            href="/register"
                            className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-lg text-white shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-1 transition-all"
                        >
                            Start Investing Now
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link 
                            href="#how-it-works"
                            className="px-8 py-4 bg-slate-800/50 border border-slate-700 rounded-xl font-bold text-lg text-white hover:bg-slate-700/50 transition-all"
                        >
                            See How it Works
                        </Link>
                    </div>

                    <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        {[
                            { icon: <Shield className="text-cyan-400" />, title: 'Secure & Regulated', desc: 'Your funds are protected with industry-leading security protocols.' },
                            { icon: <TrendingUp className="text-blue-400" />, title: 'Daily ROI', desc: 'Earn consistent profits that are credited to your account every 24 hours.' },
                            { icon: <Zap className="text-emerald-400" />, title: 'Instant Cashout', desc: 'Withdraw your earnings anytime with our automated withdrawal system.' },
                         ].map((feature, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-sm">
                                <div className="mb-4">{feature.icon}</div>
                                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                                <p className="text-slate-400 text-sm">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
