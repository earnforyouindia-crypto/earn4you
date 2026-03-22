import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl text-center flex flex-col items-center space-y-8">
        <Image src="/logo1.png" alt="Earn4You Logo" width={300} height={100} className="object-contain" priority />
        <p className="text-xl md:text-2xl text-slate-400">
          The Future of Crypto Investments. Secure, Transparent, and Profitable.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link 
            href="/register"
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
          >
            Get Started
          </Link>
          <Link 
            href="/login"
            className="px-8 py-4 bg-slate-800 rounded-xl font-bold text-lg hover:bg-slate-700 transition-all"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
