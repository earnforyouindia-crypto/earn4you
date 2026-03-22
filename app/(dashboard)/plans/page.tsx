"use client";
import React, { useEffect, useState } from 'react';
import PricingCard from '@/components/PricingCard';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

const Plans = () => {
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
        // Navigate to payment with plan details as query param
        router.push(`/payment?planId=${plan._id}`);
    };

    if (loading) {
        return <div className="text-white text-center mt-20">Loading plans...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">Choose Your Investment Plan</h1>
                <p className="text-slate-400 max-w-2xl mx-auto">
                    Select the best plan that suits your investment goals. All plans include secure USDT processing and transparency.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                {plans.map((plan) => (
                    <PricingCard key={plan._id} plan={plan} onSelect={handleSelectPlan} />
                ))}
            </div>
        </div>
    );
};

export default Plans;
