import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
    const [hoveredFeature, setHoveredFeature] = useState(null);

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 overflow-hidden">
            {/* ===== NAVBAR ===== */}
            <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 z-50 shadow-sm">
                <div className="flex justify-between items-center p-4 md:p-6 max-w-7xl mx-auto px-4 w-full">
                    <div className="text-xl md:text-2xl font-black italic tracking-tighter bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        WA-ORDER
                    </div>
                    <div className="space-x-3 md:space-x-4">
                        <Link to="/login" className="font-bold text-gray-600 hover:text-black transition-colors hidden md:inline-block">Login</Link>
                        <Link to="/register" className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 md:px-8 py-2 md:py-3 rounded-full font-bold hover:shadow-lg hover:shadow-green-200 transition-all hover:scale-105 active:scale-95">
                            Start Free
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ===== HERO SECTION ===== */}
            <section className="pt-32 md:pt-40 pb-20 px-4 max-w-7xl mx-auto">
                <div className="text-center max-w-4xl mx-auto">
                    {/* Badge */}
                    <div className="inline-block mb-6 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
                        <span className="text-green-700 font-bold text-sm">✨ Already 500+ Sellers Using WA-ORDER</span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter mb-6">
                        Go Digital on WhatsApp
                        <span className="block text-transparent bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 bg-clip-text mt-2">
                            In Minutes
                        </span>
                    </h1>

                    {/* Subheading */}
                    <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-4 font-medium leading-relaxed">
                        Create your online store in 2 minutes. Receive orders via WhatsApp, manage inventory, and send bills instantly.
                    </p>

                    {/* Stats */}
                    <div className="flex justify-center gap-8 md:gap-16 my-10 flex-wrap">
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-black text-green-600">500+</div>
                            <div className="text-sm text-gray-600 font-medium">Active Sellers</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-black text-green-600">10K+</div>
                            <div className="text-sm text-gray-600 font-medium">Orders Processed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-black text-green-600">99.9%</div>
                            <div className="text-sm text-gray-600 font-medium">Uptime</div>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col md:flex-row gap-4 justify-center mt-10">
                        <Link 
                            to="/register" 
                            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 md:px-10 py-4 md:py-5 rounded-full text-lg font-bold shadow-lg shadow-green-200 hover:shadow-xl hover:scale-105 transition-all active:scale-95"
                        >
                            Get Started Now 🚀
                        </Link>
                        <button 
                            onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
                            className="border-2 border-gray-300 text-gray-700 px-8 md:px-10 py-4 md:py-5 rounded-full text-lg font-bold hover:border-gray-400 transition-all hover:bg-gray-50"
                        >
                            How It Works
                        </button>
                    </div>
                </div>

                {/* Hero Image/Mockup */}
                <div className="mt-16 md:mt-24 relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl blur-2xl opacity-20"></div>
                    <div className="relative bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-2xl">
                        <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-6xl mb-4">📱</div>
                                <p className="text-gray-500 font-bold">Your Store Will Appear Here</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FEATURES SECTION ===== */}
            <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                            Powerful Features
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            All the tools designed for small business owners
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Feature 1 */}
                        <div 
                            className="group p-8 bg-white border border-gray-100 rounded-2xl hover:border-green-500 hover:shadow-lg transition-all duration-300 cursor-pointer"
                            onMouseEnter={() => setHoveredFeature(1)}
                            onMouseLeave={() => setHoveredFeature(null)}
                        >
                            <div className="text-5xl mb-4">📦</div>
                            <h3 className="text-xl font-black uppercase mb-3">Smart Inventory</h3>
                            <p className="text-gray-600 font-medium leading-relaxed mb-4">
                                Real-time stock tracking. Get alerts when products are running low.
                            </p>
                            <div className={`h-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full w-0 group-hover:w-full transition-all duration-500`}></div>
                        </div>

                        {/* Feature 2 */}
                        <div 
                            className="group p-8 bg-white border border-gray-100 rounded-2xl hover:border-green-500 hover:shadow-lg transition-all duration-300 cursor-pointer"
                            onMouseEnter={() => setHoveredFeature(2)}
                            onMouseLeave={() => setHoveredFeature(null)}
                        >
                            <div className="text-5xl mb-4">📄</div>
                            <h3 className="text-xl font-black uppercase mb-3">Instant Invoices</h3>
                            <p className="text-gray-600 font-medium leading-relaxed mb-4">
                                Generate professional PDF invoices with one click and share via WhatsApp.
                            </p>
                            <div className={`h-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full w-0 group-hover:w-full transition-all duration-500`}></div>
                        </div>

                        {/* Feature 3 */}
                        <div 
                            className="group p-8 bg-white border border-gray-100 rounded-2xl hover:border-green-500 hover:shadow-lg transition-all duration-300 cursor-pointer"
                            onMouseEnter={() => setHoveredFeature(3)}
                            onMouseLeave={() => setHoveredFeature(null)}
                        >
                            <div className="text-5xl mb-4">📈</div>
                            <h3 className="text-xl font-black uppercase mb-3">Live Analytics</h3>
                            <p className="text-gray-600 font-medium leading-relaxed mb-4">
                                See which items sell best. Make data-driven decisions with confidence.
                            </p>
                            <div className={`h-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full w-0 group-hover:w-full transition-all duration-500`}></div>
                        </div>

                        {/* Feature 4 */}
                        <div 
                            className="group p-8 bg-white border border-gray-100 rounded-2xl hover:border-green-500 hover:shadow-lg transition-all duration-300 cursor-pointer"
                            onMouseEnter={() => setHoveredFeature(4)}
                            onMouseLeave={() => setHoveredFeature(null)}
                        >
                            <div className="text-5xl mb-4">🎨</div>
                            <h3 className="text-xl font-black uppercase mb-3">Custom Store</h3>
                            <p className="text-gray-600 font-medium leading-relaxed mb-4">
                                Create a unique store with your branding. Set colors and logo easily.
                            </p>
                            <div className={`h-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full w-0 group-hover:w-full transition-all duration-500`}></div>
                        </div>

                        {/* Feature 5 */}
                        <div 
                            className="group p-8 bg-white border border-gray-100 rounded-2xl hover:border-green-500 hover:shadow-lg transition-all duration-300 cursor-pointer"
                            onMouseEnter={() => setHoveredFeature(5)}
                            onMouseLeave={() => setHoveredFeature(null)}
                        >
                            <div className="text-5xl mb-4">🔐</div>
                            <h3 className="text-xl font-black uppercase mb-3">Fully Secure</h3>
                            <p className="text-gray-600 font-medium leading-relaxed mb-4">
                                Your data is completely safe. We never share or sell your information.
                            </p>
                            <div className={`h-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full w-0 group-hover:w-full transition-all duration-500`}></div>
                        </div>

                        {/* Feature 6 */}
                        <div 
                            className="group p-8 bg-white border border-gray-100 rounded-2xl hover:border-green-500 hover:shadow-lg transition-all duration-300 cursor-pointer"
                            onMouseEnter={() => setHoveredFeature(6)}
                            onMouseLeave={() => setHoveredFeature(null)}
                        >
                            <div className="text-5xl mb-4">⚡</div>
                            <h3 className="text-xl font-black uppercase mb-3">Super Fast</h3>
                            <p className="text-gray-600 font-medium leading-relaxed mb-4">
                                Lightning-fast performance. No delays, just pure speed and reliability.
                            </p>
                            <div className={`h-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full w-0 group-hover:w-full transition-all duration-500`}></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== HOW IT WORKS ===== */}
            <section id="how-it-works" className="py-20 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                            How It Works
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Get your store running in just 4 simple steps
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4">
                        {[
                            { step: 1, title: "Sign Up", desc: "Create your account in 30 seconds" },
                            { step: 2, title: "Add Products", desc: "Upload photos, prices, and stock" },
                            { step: 3, title: "Share Link", desc: "Send store link to your customers" },
                            { step: 4, title: "Receive Orders", desc: "Orders come straight to WhatsApp" }
                        ].map((item, idx) => (
                            <div key={idx} className="relative">
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 text-center h-full">
                                    <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-4">
                                        {item.step}
                                    </div>
                                    <h3 className="font-black text-lg mb-2">{item.title}</h3>
                                    <p className="text-gray-600 text-sm">{item.desc}</p>
                                </div>
                                {idx < 3 && <div className="hidden md:block absolute top-1/3 -right-3 text-2xl text-gray-300">→</div>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== PRICING ===== */}
            <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                        Simple Pricing
                    </h2>
                    <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
                        All features are always free. No hidden charges ever.
                    </p>

                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white border-2 border-green-600 rounded-3xl p-8 md:p-12 text-center">
                            <div className="text-6xl font-black text-green-600 mb-4">₹0</div>
                            <h3 className="text-3xl font-black mb-4">Pro Plan</h3>
                            <p className="text-gray-600 mb-8 font-medium">Always free, forever</p>
                            
                            <ul className="text-left space-y-3 mb-8 text-gray-700 font-medium border-t border-b border-gray-200 py-8">
                                <li>✅ Unlimited Products</li>
                                <li>✅ Unlimited Orders</li>
                                <li>✅ Smart Inventory</li>
                                <li>✅ Live Analytics</li>
                                <li>✅ Custom Branding</li>
                                <li>✅ 24/7 Support</li>
                            </ul>

                            <Link 
                                to="/register"
                                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-full font-bold text-lg hover:shadow-lg hover:scale-105 transition-all active:scale-95"
                            >
                                Get Started Now
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== CTA SECTION ===== */}
            <section className="py-20 px-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
                        Ready to Get Started?
                    </h2>
                    <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto opacity-90">
                        500+ business owners are already using WA-ORDER. You can too.
                    </p>
                    <Link 
                        to="/register"
                        className="inline-block bg-white text-green-600 px-10 py-5 rounded-full text-xl font-black hover:bg-gray-50 hover:scale-105 transition-all active:scale-95 shadow-xl"
                    >
                        Register Now 🚀
                    </Link>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="bg-gray-900 text-white py-12 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <h3 className="text-2xl font-black italic mb-4">WA-ORDER</h3>
                    <p className="text-gray-400 mb-8">Empower Your Store on WhatsApp.</p>
                    <div className="border-t border-gray-800 pt-8 text-gray-500 text-sm">
                        <p>© 2024 WA-ORDER. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}