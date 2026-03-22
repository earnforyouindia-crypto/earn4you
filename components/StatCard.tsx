import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color: 'blue' | 'purple' | 'emerald' | 'orange' | 'yellow' | 'red' | 'pink';
    subValue?: React.ReactNode;
    status?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, subValue, status }) => {
    const colorMap: Record<string, string> = {
        blue: 'from-blue-500 to-indigo-500 shadow-blue-500/20 text-blue-400',
        purple: 'from-purple-500 to-pink-500 shadow-purple-500/20 text-purple-400',
        emerald: 'from-emerald-500 to-teal-500 shadow-emerald-500/20 text-emerald-400',
        orange: 'from-orange-500 to-red-500 shadow-orange-500/20 text-orange-400',
        yellow: 'from-yellow-400 to-orange-500 shadow-yellow-500/20 text-yellow-400',
        red: 'from-red-500 to-rose-600 shadow-red-500/20 text-red-400',
        pink: 'from-pink-500 to-rose-500 shadow-pink-500/20 text-pink-400',
    };

    return (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-all hover:-translate-y-1">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-white mb-2">{value}</h3>

                    {subValue && (
                        <div className="text-xs text-slate-500">{subValue}</div>
                    )}

                    {status && (
                        <span className={`
              inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
              ${status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                status === 'Pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                    'bg-slate-800 text-slate-400 border-slate-700'}
            `}>
                            {status}
                        </span>
                    )}
                </div>

                <div className={`p-3 rounded-xl bg-gradient-to-br ${colorMap[color] || colorMap.blue} shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );
};

export default StatCard;
