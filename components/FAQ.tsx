"use client";
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = () => {
    const faqs = [
        {
            question: "What is Earn4You?",
            answer: "Earn4You is a secure cryptocurrency investment platform that allows users to earn daily returns on their USDT investments through various smart investment plans."
        },
        {
            question: "How do I start investing?",
            answer: "Simply create an account, verify your details, and choose an investment plan starting from as low as $10 USDT."
        },
        {
            question: "Is there a minimum withdrawal amount?",
            answer: "Yes, the standard minimum withdrawal threshold is 10 USDT, ensuring efficient processing of payments."
        },
        {
            question: "How does the referral system work?",
            answer: "You can earn commission by inviting others to the platform. We offer a multi-level marketing (MLM) structure where you earn percentages based on your referrals' investments."
        },
        {
            question: "Are there any hidden fees?",
            answer: "No, Earn4You pride itself on transparency. All profits and potential withdrawal thresholds are clearly stated in your chosen plan."
        }
    ];

    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section id="faq" className="py-24 bg-slate-950 relative">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 tracking-tight">Frequently Asked Questions</h2>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        Everything you need to know about getting started with Earn4You.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div 
                            key={i} 
                            className="rounded-2xl bg-slate-900/50 border border-slate-800 overflow-hidden"
                        >
                            <button 
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-800/50 transition-colors"
                            >
                                <span className="text-lg font-bold text-white">{faq.question}</span>
                                {openIndex === i ? <ChevronUp className="text-cyan-400" /> : <ChevronDown className="text-slate-400" />}
                            </button>
                            {openIndex === i && (
                                <div className="px-6 pb-6 text-slate-400 leading-relaxed border-t border-slate-800 pt-4">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
