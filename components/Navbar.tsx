"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'How it Works', href: '#how-it-works' },
        { name: 'Investment Plans', href: '#plans' },
        { name: 'FAQ', href: '#faq' },
    ];

    return (
        <nav 
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                isScrolled ? 'bg-slate-950/80 backdrop-blur-md border-b border-slate-800 py-3' : 'bg-transparent py-5'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <Image src="/logo1.png" alt="Earn4You" width={150} height={40} className="object-contain" priority />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link 
                                key={link.name} 
                                href={link.href}
                                className="text-slate-300 hover:text-cyan-400 font-medium transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="flex items-center space-x-4 ml-4">
                            <Link 
                                href="/login"
                                className="text-slate-300 hover:text-white font-medium transition-colors"
                            >
                                Login
                            </Link>
                            <Link 
                                href="/register"
                                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-bold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all"
                            >
                                Sign Up
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-slate-300 hover:text-white p-2"
                        >
                            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-slate-900 border-b border-slate-800 p-4 space-y-4 shadow-xl">
                    {navLinks.map((link) => (
                        <Link 
                            key={link.name} 
                            href={link.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block text-slate-300 hover:text-cyan-400 font-medium py-2"
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="pt-4 flex flex-col space-y-3">
                        <Link 
                            href="/login"
                            className="block text-center text-slate-300 hover:text-white font-medium py-2 border border-slate-700 rounded-lg"
                        >
                            Login
                        </Link>
                        <Link 
                            href="/register"
                            className="block text-center px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-bold text-white"
                        >
                            Sign Up
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
