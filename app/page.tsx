"use client";
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import PricingCard from '@/components/PricingCard';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await api.get('/plans');
                if (response.data.success) {
                    setPlans(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch plans", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    const handleSelectPlan = (plan: any) => {
        router.push(`/register?planId=${plan._id}`);
    };

    return (
        <main className="min-h-screen bg-slate-950 font-sans selection:bg-cyan-500/30">
            <Navbar />
            
            <Hero />
            
            <HowItWorks />
            
            {/* Investment Plans Section */}
            <section id="plans" className="py-24 relative overflow-hidden bg-slate-900/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4 tracking-tight">Investment Plans</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                            Start small or go big. Our transparent plans are designed to help you grow your portfolio securely.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {plans.map((plan) => (
                                <PricingCard 
                                    key={plan._id} 
                                    plan={plan} 
                                    onSelect={handleSelectPlan} 
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <FAQ />
            
            <Footer />
        </main>
    );
}
