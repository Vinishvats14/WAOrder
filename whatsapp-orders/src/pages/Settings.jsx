import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

export default function Settings() {
    const [config, setConfig] = useState({
        whatsappNumber: '',
        storeName: '',
        themeColor: '#22c55e'
    });
    const [loading, setLoading] = useState(true);
    const userId = localStorage.getItem('userId');

    const shareStore = () => {
        const storeName = localStorage.getItem('storeName');
        const storeLink = `${window.location.origin}/${storeName}`;
        const text = encodeURIComponent(`👋 Hello! Our online store is now live. Click here to place orders directly via WhatsApp: ${storeLink}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    useEffect(() => {
        // Load existing settings so inputs are not empty
        const fetchSettings = async () => {
            try {
                const res = await axiosInstance.get(`/auth/store-by-id/${userId}`);
                setConfig({
                    whatsappNumber: res.data.whatsappNumber || '',
                    storeName: res.data.storeName || '',
                    themeColor: res.data.themeColor || '#22c55e'
                });
                setLoading(false);
            } catch (err) {
                console.error("Settings load fail!", err);
                setLoading(false);
            }
        };
        fetchSettings();
    }, [userId]);

    const handleSave = async () => {
        // Validation: Agar naam khali hai toh save mat hone do
        if (!config.storeName.trim()) {
            return alert("Bhai, Store Name khali nahi chhod sakte!");
        }

        try {
            await axiosInstance.patch(`/auth/settings/${userId}`, config);

            // Save in slug format (replace spaces with hyphens)
            const cleanSlug = config.storeName.trim().replace(/\s+/g, '-').toLowerCase();
            localStorage.setItem('storeName', cleanSlug);

            alert("Settings saved! ✨");
        } catch (err) {
            alert("Update fail!");
        }
    };

    if (loading) return <div className="p-10 text-center font-bold">Settings khul rahi hain... ⚙️</div>;

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto min-h-screen">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-100">
                <h1 className="text-3xl font-black mb-8 italic uppercase text-gray-800 flex items-center gap-3">
                    Store Settings <span className="text-blue-500">⚙️</span>
                </h1>
                <button
                    onClick={shareStore}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                    Share Store
                </button>
                <div className="space-y-8">
                    {/* 1. Dukan ki Halat (Status) */}
                    <div className="bg-white p-8 rounded-[2rem] border-2 border-gray-50 shadow-sm flex items-center justify-between">
                        <div>
                            <h4 className="text-xl font-black uppercase italic text-gray-800">Shop Status 🕒</h4>
                            <p className="text-sm text-gray-500 font-medium italic">Abhi orders lena hai ya nahi?</p>
                        </div>
                        <div className="relative inline-block w-20 h-10">
                            <input type="checkbox" className="peer hidden" id="shopStatus" defaultChecked />
                            <label htmlFor="shopStatus" className="absolute top-0 left-0 right-0 bottom-0 bg-gray-200 rounded-full cursor-pointer transition-all peer-checked:bg-green-500 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:w-8 after:h-8 after:rounded-full after:transition-all peer-checked:after:translate-x-10"></label>
                        </div>
                    </div>

                    {/* 2. Custom Welcome Message */}
                    <div className="bg-white p-8 rounded-[2rem] border-2 border-gray-50 shadow-sm">
                        <h4 className="text-xl font-black uppercase italic text-gray-800 mb-4">Custom Order Message 💬</h4>
                        <textarea
                            placeholder="Example: Thanks for your order! We'll have it packed in 30 mins. Enjoy your tea meanwhile! ☕"
                            className="w-full p-6 rounded-3xl bg-gray-50 border-2 border-gray-100 focus:border-blue-400 focus:bg-white outline-none font-bold italic transition-all"
                            rows="3"
                        />
                        <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest ml-2">Ye message customer ko WhatsApp par dikhega.</p>
                    </div>
                </div>
                <div className="space-y-8">
                    {/* WhatsApp Update */}
                    <div className="group">
                        <label className="block font-black text-sm uppercase text-gray-400 mb-2 ml-1">WhatsApp Business Number</label>
                        <input
                            type="text"
                            value={config.whatsappNumber}
                            onChange={e => setConfig({ ...config, whatsappNumber: e.target.value })}
                            className="w-full p-4 border-2 border-gray-50 rounded-2xl bg-gray-50 font-bold focus:border-blue-400 focus:bg-white transition-all outline-none"
                            placeholder="e.g. 918700xxxxxx"
                        />
                        <p className="text-[10px] text-gray-400 mt-2 ml-1">* Bina '+' aur spaces ke dalo (Country code zaroori hai)</p>
                    </div>

                    {/* Store Name Update */}
                    <div>
                        <label className="block font-black text-sm uppercase text-gray-400 mb-2 ml-1">Store Name (Slug)</label>
                        <input
                            type="text"
                            value={config.storeName}
                            onChange={e => setConfig({ ...config, storeName: e.target.value })}
                            className="w-full p-4 border-2 border-gray-50 rounded-2xl bg-gray-50 font-bold focus:border-blue-400 focus:bg-white transition-all outline-none"
                        />
                    </div>

                    {/* Theme Color Update */}
                    <div>
                        <label className="block font-black text-sm uppercase text-gray-400 mb-2 ml-1">Dukan ka Theme Color</label>
                        <div className="flex flex-wrap items-center gap-6 bg-gray-50 p-6 rounded-3xl border-2 border-dashed border-gray-200">
                            <input
                                type="color"
                                value={config.themeColor}
                                onChange={e => setConfig({ ...config, themeColor: e.target.value })}
                                className="w-24 h-24 rounded-2xl cursor-pointer border-4 border-white shadow-lg"
                            />
                            <div className="flex-1">
                                <p className="font-bold text-gray-700">Brand Identity 🎨</p>
                                <p className="text-xs text-gray-500 italic mt-1">
                                    Ye color aapke **Storefront** ke Buttons aur Headings par dikhega.
                                    Aapki dukan ki theme abhi <span style={{ color: config.themeColor }} className="font-bold uppercase">{config.themeColor}</span> hai.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-10 bg-blue-600 p-8 rounded-[3rem] text-white shadow-2xl flex flex-wrap items-center justify-between gap-6 border-4 border-blue-400">
                        <div className="flex-1">
                            <h3 className="text-3xl font-black uppercase italic leading-none mb-2">Social Sharing 📱</h3>
                            <p className="font-medium opacity-90 text-sm">Apni dukan ka link ek click mein WhatsApp Status par lagayein aur orders payein!</p>
                        </div>
                        <button
                            onClick={shareStore}
                            className="bg-white text-blue-600 px-10 py-5 rounded-2xl font-black text-lg uppercase shadow-xl hover:scale-105 transition-all active:scale-95"
                        >
                            Share on WhatsApp 🚀
                        </button>
                    </div>
                    {/* Action Button */}
                    <button
                        onClick={handleSave}
                        className="w-full bg-gray-900 text-white py-5 rounded-[1.5rem] font-black text-xl hover:bg-black hover:scale-[1.01] transition-all shadow-xl active:scale-95"
                    >
                        SAVE & UPDATE STORE 🚀
                    </button>
                </div>
            </div>

            {/* Preview Card (Optional) */}
            <div className="mt-8 p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-center justify-between">
                <div>
                    <p className="font-bold text-blue-800">Pro Tip! 💡</p>
                    <p className="text-xs text-blue-600">After saving settings, click "View Live Store" to preview your storefront.</p>
                </div>
                <div className="text-3xl rotate-12">✨</div>
            </div>
        </div>
    );
}