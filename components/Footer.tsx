import React from 'react';
import Image from 'next/image';

const Footer = () => {
    return (
        <footer className="bg-slate-950 border-t border-slate-900 py-12 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
                <Image src="/logo1.png" alt="Earn4You" width={180} height={50} className="object-contain mb-4 opacity-80" />
                <p className="text-slate-500 text-sm">
                    © {new Date().getFullYear()} Earn4You. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
