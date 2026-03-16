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
                        <span className="text-green-700 font-bold text-sm">✨ Already 500+ sellers using WA-ORDER</span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter mb-6">
                        अपनी दुकान को WhatsApp पर
                        <span className="block text-transparent bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 bg-clip-text mt-2">
                            डिजिटल बनाओ
                        </span>
                    </h1>

                    {/* Subheading */}
                    <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-4 font-medium leading-relaxed">
                        2 मिनट में अपना ऑनलाइन स्टोर बनाएं। WhatsApp से ऑर्डर लें, स्टॉक मैनेज करें, और तुरंत बिल भेजें।
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
                            अभी शुरू करें 🚀
                        </Link>
                        <button 
                            onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
                            className="border-2 border-gray-300 text-gray-700 px-8 md:px-10 py-4 md:py-5 rounded-full text-lg font-bold hover:border-gray-400 transition-all hover:bg-gray-50"
                        >
                            कैसे काम करता है?
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
                                <p className="text-gray-500 font-bold">अपना स्टोर यहाँ दिखेगा</p>
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
                            शक्तिशाली फीचर्स
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            छोटे दुकानदारों के लिए डिज़ाइन किए गए सभी उपकरण
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
                            <h3 className="text-xl font-black uppercase mb-3">स्मार्ट इन्वेंटरी</h3>
                            <p className="text-gray-600 font-medium leading-relaxed mb-4">
                                रीयल-टाइम स्टॉक ट्रैकिंग। जब माल खत्म होने वाला हो तो अलर्ट पाएं।
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
                            <h3 className="text-xl font-black uppercase mb-3">इंस्टेंट बिल</h3>
                            <p className="text-gray-600 font-medium leading-relaxed mb-4">
                                एक क्लिक में प्रोफेशनल PDF इनवॉयस बनाएं और WhatsApp पर भेजें।
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
                            <h3 className="text-xl font-black uppercase mb-3">लाइव एनालिटिक्स</h3>
                            <p className="text-gray-600 font-medium leading-relaxed mb-4">
                                देखें कौन सा आइटम सबसे ज्यादा बिक रहा है। डेटा-ड्रिवन निर्णय लें।
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
                            <h3 className="text-xl font-black uppercase mb-3">कस्टम स्टोर</h3>
                            <p className="text-gray-600 font-medium leading-relaxed mb-4">
                                अपनी ब्रांडिंग के साथ एक यूनिक स्टोर रंग और लोगो सेट करें।
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
                            <h3 className="text-xl font-black uppercase mb-3">पूरी तरह सुरक्षित</h3>
                            <p className="text-gray-600 font-medium leading-relaxed mb-4">
                                आपके डेटा सुरक्षित रहता है। हम कभी शेयर नहीं करते।
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
                            <h3 className="text-xl font-black uppercase mb-3">सुपर फास्ट</h3>
                            <p className="text-gray-600 font-medium leading-relaxed mb-4">
                                तेजी से लोड होता है। कोई विलंब नहीं, सिर्फ स्पीड।
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
                            कैसे काम करता है?
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            सिर्फ 4 सरल स्टेप में अपना स्टोर चलाएं
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4">
                        {[
                            { step: 1, title: "साइन अप करें", desc: "30 सेकंड में अपना खाता बनाएं" },
                            { step: 2, title: "अपने मालों को जोड़ें", desc: "फ़ोटो, कीमत, स्टॉक डालें" },
                            { step: 3, title: "लिंक शेयर करें", desc: "अपने ग्राहकों को स्टोर लिंक भेजें" },
                            { step: 4, title: "ऑर्डर लें", desc: "WhatsApp पर सीधे ऑर्डर आएंगे" }
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
                        सरल मूल्य निर्धारण
                    </h2>
                    <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
                        सभी फीचर्स हमेशा फ्री हैं। कोई हिडन चार्ज नहीं।
                    </p>

                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white border-2 border-green-600 rounded-3xl p-8 md:p-12 text-center">
                            <div className="text-6xl font-black text-green-600 mb-4">₹0</div>
                            <h3 className="text-3xl font-black mb-4">प्रो प्लान</h3>
                            <p className="text-gray-600 mb-8 font-medium">हमेशा और हमेशा के लिए फ्री</p>
                            
                            <ul className="text-left space-y-3 mb-8 text-gray-700 font-medium border-t border-b border-gray-200 py-8">
                                <li>✅ असीमित प्रोडक्ट्स</li>
                                <li>✅ असीमित ऑर्डर्स</li>
                                <li>✅ स्मार्ट इन्वेंटरी</li>
                                <li>✅ लाइव एनालिटिक्स</li>
                                <li>✅ कस्टम ब्रांडिंग</li>
                                <li>✅ 24/7 सपोर्ट</li>
                            </ul>

                            <Link 
                                to="/register"
                                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-full font-bold text-lg hover:shadow-lg hover:scale-105 transition-all active:scale-95"
                            >
                                अभी शुरू करें
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== CTA SECTION ===== */}
            <section className="py-20 px-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
                        अभी शुरू करने के लिए तैयार?
                    </h2>
                    <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto opacity-90">
                        500+ दुकानदार पहले से ही WA-ORDER का उपयोग कर रहे हैं। आप भी कर सकते हैं।
                    </p>
                    <Link 
                        to="/register"
                        className="inline-block bg-white text-green-600 px-10 py-5 rounded-full text-xl font-black hover:bg-gray-50 hover:scale-105 transition-all active:scale-95 shadow-xl"
                    >
                        अभी रजिस्टर करें 🚀
                    </Link>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="bg-gray-900 text-white py-12 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <h3 className="text-2xl font-black italic mb-4">WA-ORDER</h3>
                    <p className="text-gray-400 mb-8">WhatsApp पर अपने स्टोर को शक्तिशाली बनाएं।</p>
                    <div className="border-t border-gray-800 pt-8 text-gray-500 text-sm">
                        <p>© 2024 WA-ORDER. सभी अधिकार सुरक्षित।</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}