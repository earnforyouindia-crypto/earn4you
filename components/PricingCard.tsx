import React from 'react';
import { Check, Zap } from 'lucide-react';

interface Plan {
    _id: string;
    name: string;
    price: number;
    dailyProfit?: number;
    monthlyProfit?: number;
    features: string[];
    recommended?: boolean;
    color?: string;
}

interface PricingCardProps {
    plan: Plan;
    onSelect: (plan: Plan) => void;
}

const PricingCard: React.FC<PricingCardProps> = ({ plan, onSelect }) => {
    const { name, price, features, recommended } = plan;

    return (
        <div
            className={`
        relative p-8 rounded-2xl backdrop-blur-xl border transition-all duration-300 flex flex-col h-full
        ${recommended
                    ? 'bg-slate-900/80 border-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.15)] transform md:-translate-y-4'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }
      `}
        >
            {recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                    Most Popular
                </div>
            )}

            <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">{price}</span>
                    <span className="text-slate-400">USDT</span>
                </div>
                {/* Profit Metrics */}
                <div className="mt-4 space-y-2">
                    {plan.dailyProfit && (
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Daily Profit:</span>
                            <span className="text-emerald-400 font-bold">{plan.dailyProfit} USDT</span>
                        </div>
                    )}
                    {plan.monthlyProfit && (
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Monthly Profit:</span>
                            <span className="text-emerald-400 font-bold">{plan.monthlyProfit} USDT</span>
                        </div>
                    )}
                </div>
            </div>

            {/* <div className="flex-1 space-y-4 mb-8">
                {features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                        <div className={`mt-1 p-0.5 rounded-full ${recommended ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>
                            <Check className="w-3 h-3" />
                        </div>
                        <span className="text-sm text-slate-300">{feature}</span>
                    </div>
                ))}
            </div> */}

            <button
                onClick={() => onSelect(plan)}
                className={`
          w-full py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2
          ${recommended
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                        : 'bg-slate-800 text-white hover:bg-slate-700'
                    }
        `}
            >
                <Zap className={`w-4 h-4 ${recommended ? 'fill-current' : ''}`} />
                Choose Plan
            </button>
        </div>
    );
};

export default PricingCard;
