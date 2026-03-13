import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            {/* Navbar */}
            <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
                <div className="text-2xl font-black italic tracking-tighter text-green-600">WA-ORDER 🚀</div>
                <div className="space-x-4">
                    <Link name="login" to="/login" className="font-bold text-gray-600 hover:text-black">Login</Link>
                    <Link name="register" to="/register" className="bg-black text-white px-6 py-3 rounded-full font-bold hover:scale-105 transition">Start Free</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="max-w-7xl mx-auto px-6 py-20 text-center">
                <h1 className="text-6xl md:text-8xl font-black leading-none tracking-tighter mb-8">
                    WHATSAPP PAR <br />
                    <span className="text-green-500 italic">DUKAN CHALAO.</span>
                </h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 font-medium">
                    Create your online catalog in 2 minutes. Get orders on WhatsApp, manage stock, and generate PDF bills automatically.
                </p>
                <Link to="/register" className="bg-green-500 text-white px-10 py-5 rounded-[2rem] text-2xl font-black shadow-2xl shadow-green-200 hover:bg-green-600 transition-all active:scale-95">
                    Register My Store Now 🔥
                </Link>
            </header>

            {/* Features Grid */}
            <div className="bg-gray-50 py-20">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                        <div className="text-4xl mb-4">📦</div>
                        <h3 className="text-xl font-black mb-2 uppercase">Smart Inventory</h3>
                        <p className="text-gray-500 font-medium">Jab maal khatam hone wala hoga, hum aapko alert denge.</p>
                    </div>
                    <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                        <div className="text-4xl mb-4">📄</div>
                        <h3 className="text-xl font-black mb-2 uppercase">One-Click Bills</h3>
                        <p className="text-gray-500 font-medium">Professional PDF invoices generate karien aur WhatsApp par bhejein.</p>
                    </div>
                    <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                        <div className="text-4xl mb-4">📈</div>
                        <h3 className="text-xl font-black mb-2 uppercase">Live Analytics</h3>
                        <p className="text-gray-500 font-medium">Dekhiye kaunsa item sabse zyada bik raha hai real-time mein.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}