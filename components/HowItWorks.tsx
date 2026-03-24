import React from 'react';
import { UserPlus, CreditCard, PieChart } from 'lucide-react';

const HowItWorks = () => {
    const steps = [
        {
            icon: <UserPlus size={32} className="text-cyan-400" />,
            title: 'Create Account',
            description: 'Sign up in seconds with just your basic details. It\'s free and open to everyone.'
        },
        {
            icon: <CreditCard size={32} className="text-blue-400" />,
            title: 'Choose a Plan',
            description: 'Select an investment plan that fits your budget, ranging from $10 to $10,000.'
        },
        {
            icon: <PieChart size={32} className="text-emerald-400" />,
            title: 'Earn & Withdraw',
            description: 'Sit back and watch your profits grow. Withdraw your daily ROI or commissions instantly.'
        }
    ];

    return (
        <section id="how-it-works" className="py-24 bg-slate-950 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4 tracking-tight">How it Works</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                        Join Earn4You in three simple steps and start generating passive income today.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                    {/* Connection lines (desktop) */}
                    <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-full -z-10" />
                    
                    {steps.map((step, i) => (
                        <div key={i} className="flex flex-col items-center text-center group">
                            <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-8 group-hover:border-cyan-500/50 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] transition-all duration-300">
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-4">{step.title}</h3>
                            <p className="text-slate-400 leading-relaxed">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
