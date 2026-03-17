import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../api/axiosInstance';
import { io } from "socket.io-client";
import { Link } from 'react-router-dom';
import SalesChart from '../components/SalesChart';
import { generateInvoice } from '../utils/generateInvoice';
import { QRCodeCanvas } from 'qrcode.react';


export default function AdminDashboard() {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [stats, setStats] = useState({ totalSales: 0, totalOrders: 0, pendingOrders: 0 });
    const [liveVisitors, setLiveVisitors] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [promoMsg, setPromoMsg] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null); // For modal
    const [showOrderModal, setShowOrderModal] = useState(false); // Modal visibility
    const storeURL = `${window.location.origin}/${localStorage.getItem('storeName')}`;
    const prevOrdersLength = useRef(orders.length);

    const shareStore = () => {
        const storeLink = `${window.location.origin}/${localStorage.getItem('storeName')}`;
        const text = encodeURIComponent(`👋 Hello! Hamari online dukan ab live hai. Direct WhatsApp par order karne ke liye yahan click karein: ${storeLink}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };
    // SaaS logic: Local storage se seller ki ID nikalna
    const sellerId = localStorage.getItem('userId');
    const [analytics, setAnalytics] = useState({});
    const playNotification = () => {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(err => console.log("Audio play failed:", err));
    };

    // Effect jo orders monitor karega
    useEffect(() => {
        // Agar naya order aaya (current length > purani length)
        if (orders.length > prevOrdersLength.current) {
            playNotification();
        }
        // Purani length ko update kar do agali baar ke liye
        prevOrdersLength.current = orders.length;
    }, [orders]);

    // --- 🔔 NOTIFICATION LOGIC END ---

    // 3. Data Fetching Logic (Jo pehle se tha)
    useEffect(() => {
        const fetchOrders = async () => {
            if (!sellerId) return;
            try {
                const res = await axiosInstance.get(`/orders/seller/${sellerId}`);
                setOrders(res.data);
            } catch (err) {
                console.error("Orders fetch error:", err);
            }
        };
        fetchOrders();

        // Polling: Har 30 second mein check karo naye orders ke liye
        const interval = setInterval(fetchOrders, 30000);
        return () => clearInterval(interval);
    }, [sellerId]);

    const sendBulkPromo = () => {
        if (!promoMsg) return alert("Write a message first!");

        // 1. Saare Unique Customers ke Numbers nikalo Orders se
        const uniquePhones = [...new Set(orders.map(o => o.customerPhone))];

        if (uniquePhones.length === 0) return alert("There is no customer right now!");

        // 2. Loop chalao aur WhatsApp kholo (Simple version)
        // Note: Browser security ki wajah se ek saath 100 tab nahi khulenge, 
        // isliye hum seller ko ek-ek karke bhejney ka option denge.

        uniquePhones.forEach((phone, index) => {
            setTimeout(() => {
                const msg = encodeURIComponent(promoMsg);
                window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${msg}`, '_blank');
            }, index * 2000); // Har 2 second mein ek naya tab (Taki browser block na kare)
        });
    };

    useEffect(() => {
        if (sellerId) {
            // Purane stats ke saath analytics bhi fetch karo
            axiosInstance.get(`/orders/analytics/${sellerId}`)
                .then(res => setAnalytics(res.data));
        }
    }, [sellerId]);

    useEffect(() => {
        // Socket.IO Connection for live updates
        try {
            const socketURL = import.meta.env.VITE_SOCKET_URL || 
                            (import.meta.env.MODE === 'development' 
                            ? 'http://localhost:10000' 
                            : 'https://wa-order-backend.onrender.com');

            const socket = io(socketURL, {
                withCredentials: true,
                transports: ["websocket", "polling"],
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: 5
            });

            socket.on("connect", () => {
                console.log("✅ Socket connected!");
            });

            socket.on("visitorCount", (count) => setLiveVisitors(count));

            socket.on("adminNotification", (data) => {
                setNotifications(prev => {
                    const existingIndex = prev.findIndex(item =>
                        (data.customerPhone && item.phone === data.customerPhone)
                    );

                    if (existingIndex !== -1) {
                        const updated = [...prev];
                        updated[existingIndex] = {
                            ...updated[existingIndex],
                            customerName: data.customerName || updated[existingIndex].customerName,
                            phone: data.customerPhone || updated[existingIndex].phone,
                            items: data.items,
                            time: new Date().toLocaleTimeString()
                        };
                        return updated;
                    } else {
                        return [{
                            id: Date.now(),
                            customerName: data.customerName || "New Visitor",
                            phone: data.customerPhone || "Typing...",
                            items: data.items,
                            time: new Date().toLocaleTimeString()
                        }, ...prev].slice(0, 10);
                    }
                });
            });

            socket.on("connect_error", (error) => {
                console.warn("⚠️ Socket connection error:", error?.message);
            });

            socket.on("disconnect", (reason) => {
                console.log("❌ Socket disconnected:", reason);
            });

            return () => socket.disconnect();
        } catch (err) {
            console.error("Socket initialization error:", err);
        }
    }, []);

    useEffect(() => {
        if (sellerId) {
            fetchSellerData();
        }
    }, [sellerId]);

    const fetchSellerData = async () => {
        try {
            // 1. Fetch only THIS seller's orders
            const orderRes = await axiosInstance.get(`/orders/seller/${sellerId}`);
            setOrders(orderRes.data);

            // 2. Fetch only THIS seller's products
            const prodRes = await axiosInstance.get(`/products/seller/${sellerId}`);
            setProducts(prodRes.data);

            // 3. Analytics Calculation
            const sales = orderRes.data.reduce((acc, curr) => acc + curr.total, 0);
            const pending = orderRes.data.filter(o => o.status === 'Pending').length;

            setStats({
                totalSales: sales,
                totalOrders: orderRes.data.length,
                pendingOrders: pending
            });
        } catch (err) {
            console.error("Data is not loading!", err);
        }
    };

    const fetchOrders = async () => {
        const res = await axiosInstance.get(`/orders/seller/${sellerId}`);
        setOrders(res.data);
    };


    useEffect(() => { fetchOrders(); }, [sellerId]);

    // Ye line spaces ko '-' mein badal degi aur sab small letters kar degi
    const rawStoreName = localStorage.getItem('storeName') || "";
    const shopName = rawStoreName && rawStoreName.length > 0 
        ? rawStoreName.trim().toLowerCase()
        : null;
    console.log("Store Debug:", { rawStoreName, shopName });

    const recentOrders = [...orders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6);
    const quickProducts = products.slice(0, 6);
    const formatDate = (value) => {
        if (!value) return '—';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '—';
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100">
            {/* === HEADER / NAVIGATION === */}
            <div className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl">
                            ⌁
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-500 tracking-widest">SELLER</p>
                            <p className="text-2xl font-black italic text-indigo-600">WAR-ROOM</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Link to="/admin/inventory" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-black text-xs tracking-wide transition-all duration-300 shadow-sm">
                            Inventory
                        </Link>
                        {shopName ? (
                            <a
                                href={`/${shopName}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-black text-xs tracking-wide transition-all duration-300 shadow-sm"
                            >
                                Live Store
                            </a>
                        ) : (
                            <button disabled className="px-4 py-2 bg-slate-100 text-slate-400 rounded-full font-black text-xs cursor-not-allowed">
                                Loading...
                            </button>
                        )}
                        <Link to="/admin/settings" className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-full font-black text-xs tracking-wide hover:border-indigo-300 hover:text-indigo-600 transition-all duration-300 shadow-sm">
                            Settings
                        </Link>
                        <button
                            onClick={() => {
                                localStorage.clear();
                                window.location.href = '/login';
                            }}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full font-black text-xs tracking-wide transition-all duration-300 shadow-sm"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* === MAIN CONTENT === */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                {/* === TOP STATS CARDS === */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Total Revenue Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100/50 p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Total Revenue</p>
                                <h2 className="text-4xl font-black text-gray-900 mt-2">₹{stats.totalSales}</h2>
                            </div>
                            <div className="bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 p-3 rounded-xl text-2xl">💰</div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-green-600 font-bold">
                            <span>📈</span> All time earnings
                        </div>
                    </div>

                    {/* Total Orders Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100/50 p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Total Orders</p>
                                <h2 className="text-4xl font-black text-gray-900 mt-2">{stats.totalOrders}</h2>
                            </div>
                            <div className="bg-gradient-to-br from-green-100 to-emerald-50 text-green-600 p-3 rounded-xl text-2xl">📦</div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-blue-600 font-bold">
                            <span>✅</span> Total completed orders
                        </div>
                    </div>

                    {/* Pending Orders Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100/50 p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Pending</p>
                                <h2 className="text-4xl font-black text-yellow-600 mt-2">{stats.pendingOrders}</h2>
                            </div>
                            <div className="bg-gradient-to-br from-yellow-100 to-orange-50 text-yellow-600 p-3 rounded-xl text-2xl">⏳</div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-orange-600 font-bold">
                            <span>⚡</span> Awaiting your action
                        </div>
                    </div>
                </div>

                {/* === LIVE ACTIVITY BADGE === */}
                <div className="mb-8 flex items-center gap-3 bg-white rounded-full border border-emerald-200 shadow-md px-6 py-3 w-fit">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold text-emerald-700">{liveVisitors} people browsing your store right now</span>
                </div>

                {/* === SALES + MARKETING ROW === */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100/50 p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                    📈 Sales Performance
                                    <span className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-black not-italic">Last 7 Days</span>
                                </h3>
                            </div>
                            <button onClick={fetchSellerData} className="text-blue-600 font-bold hover:text-blue-700 text-sm underline-offset-4 hover:underline">
                                Refresh
                            </button>
                        </div>
                        <div className="h-[300px]">
                            {Object.keys(analytics).length > 0 ? (
                                <SalesChart data={analytics} />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400 italic">
                                    📊 Data is loading... Please wait for some seconds. 
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100/50 p-6 flex flex-col">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl text-2xl">📢</div>
                            <div>
                                <h3 className="text-lg font-black text-gray-900">Marketing Hub</h3>
                                <p className="text-xs text-gray-500">Send bulk promotions</p>
                            </div>
                        </div>

                        <textarea
                            value={promoMsg}
                            onChange={(e) => setPromoMsg(e.target.value)}
                            placeholder="Example: 🎉 TODAY'S SPECIAL! Fresh Pineapple Cake with 20% OFF! Limited stock available..."
                            className="w-full p-4 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-indigo-400 focus:bg-white transition-all outline-none font-semibold text-gray-700 mb-4 textarea-custom resize-none"
                            rows="5"
                        />

                        <button
                            onClick={sendBulkPromo}
                            className="mt-auto w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-3 rounded-xl font-black text-sm shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95"
                        >
                            🔥 Send to {[...new Set(orders.map(o => o.customerPhone))].length} Customers
                        </button>
                    </div>
                </div>

                {/* === QR CODE & PROMO SECTION === */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* QR Code Section */}
                    <div className="bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 rounded-2xl shadow-xl p-8 text-white">
                        <h3 className="text-2xl font-black mb-2 flex items-center gap-2">⚡ Store QR Code</h3>
                        <p className="text-sm opacity-90 mb-6">Print or share to get instant orders!</p>
                        
                        <div className="bg-white p-4 rounded-xl mb-6 flex items-center justify-center">
                            <QRCodeCanvas
                                id="store-qr"
                                value={`${window.location.origin}/${localStorage.getItem('storeName')}`}
                                size={140}
                                level={"H"}
                                includeMargin={true}
                            />
                        </div>

                        <button
                            onClick={() => {
                                const canvas = document.getElementById("store-qr");
                                const pngUrl = canvas.toDataURL("image/png");
                                let downloadLink = document.createElement("a");
                                downloadLink.href = pngUrl;
                                downloadLink.download = `${localStorage.getItem('storeName')}_QR.png`;
                                downloadLink.click();
                            }}
                            className="w-full bg-white text-emerald-600 px-6 py-3 rounded-xl font-black text-sm shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
                        >
                            📥 Download QR Code
                        </button>
                    </div>

                    {/* Social Sharing Section */}
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-8 text-white">
                        <h3 className="text-2xl font-black mb-2 flex items-center gap-2">📱 Share on Social</h3>
                        <p className="text-sm opacity-90 mb-6">Get your store viral on WhatsApp & Instagram!</p>
                        
                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-3 text-sm">
                                <span>✨</span> One click sharing
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <span>🎯</span> Reach your audience instantly
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <span>📈</span> Boost your sales
                            </div>
                        </div>

                        <button
                            onClick={shareStore}
                            className="w-full bg-white text-blue-600 px-6 py-3 rounded-xl font-black text-sm shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                        >
                            🚀 Share Store Now
                        </button>
                    </div>
                </div>

                {/* === HOT LEADS SECTION === */}
                <div className="mb-8">
                    <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                        🔥 Live Customer Interest
                        <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {notifications.length === 0 ? (
                            <div className="col-span-full py-12 text-center">
                                <p className="text-gray-400 text-lg">📡 No live activity yet. Customers will appear here!</p>
                            </div>
                        ) : (
                            notifications.map(lead => (
                                <div key={lead.id} className="bg-white rounded-2xl shadow-md border-l-4 border-orange-500 p-5 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="font-black text-gray-900">{lead.customerName || "Anonymous Visitor"}</p>
                                            <p className="text-xs text-blue-600 font-bold mt-1">📞 {lead.phone || "Browsing..."}</p>
                                        </div>
                                        <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-black animate-pulse">LIVE</span>
                                    </div>

                                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">Items in cart:</p>
                                        <p className="text-xs text-gray-700 font-semibold">{lead.items?.map(i => i.name).join(', ') || "Just browsing..."}</p>
                                    </div>

                                    {lead.phone && (
                                        <button 
                                            onClick={() => window.open(`https://wa.me/${lead.phone}?text=Hi ${lead.customerName}, main dekh raha hoon aap hamare store par kuch items check kar rahe hain...`)}
                                            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-black text-xs transition-all duration-300 active:scale-95"
                                        >
                                            💬 Message Now
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* === ORDER TRACKING (COMBINED) === */}
                <div className="bg-white rounded-[32px] shadow-xl border border-gray-100/60 p-6 mb-10">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-xl font-black text-gray-900">ORDER TRACKING</h2>
                        <span className="text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
                            Recent Activity
                        </span>
                    </div>

                    <div className="mt-6">
                        <div className="grid grid-cols-4 text-[11px] font-black uppercase tracking-widest text-gray-400 px-3">
                            <p>Customer Details</p>
                            <p className="text-center">Total</p>
                            <p className="text-center">Status</p>
                            <p className="text-right">Detail</p>
                        </div>

                        <div className="mt-4 space-y-4">
                            {recentOrders.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 font-bold">
                                    No orders yet. Your first customer is coming soon!
                                </div>
                            ) : (
                                recentOrders.map((order) => (
                                    <button
                                        key={order._id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedOrder(order);
                                            setShowOrderModal(true);
                                        }}
                                        className="w-full bg-gray-50 hover:bg-white border border-gray-100 rounded-2xl px-4 py-4 flex flex-col md:flex-row md:items-center gap-4 shadow-sm hover:shadow-lg transition-all"
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 font-black flex items-center justify-center text-lg">
                                                {(order.customerName || 'U')[0]}
                                            </div>
                                            <div className="text-left">
                                                <p className="font-black text-gray-900">{order.customerName || 'Anonymous Visitor'}</p>
                                                <p className="text-xs font-bold text-gray-500">{order.customerPhone || '—'}</p>
                                            </div>
                                        </div>
                                        <div className="text-center font-black text-gray-900 min-w-[90px]">₹{order.total || 0}</div>
                                        <div className="text-center min-w-[120px]">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                                order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                order.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' :
                                                order.status === 'Shipped' ? 'bg-purple-100 text-purple-700' :
                                                'bg-green-100 text-green-700'
                                            }`}>
                                                {order.status || 'Pending'}
                                            </span>
                                        </div>
                                        <div className="text-right text-indigo-600 font-black min-w-[60px]">›</div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* === QUICK INVENTORY === */}
                <div className="bg-white rounded-[32px] shadow-xl border border-gray-100/60 p-6 mb-8">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">QUICK INVENTORY</h3>
                        <Link to="/admin/inventory" className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline">
                            View All Stock
                        </Link>
                    </div>

                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                        {quickProducts.length === 0 ? (
                            <div className="col-span-full text-center py-10 text-gray-400 font-bold">
                                No products available.
                            </div>
                        ) : (
                            quickProducts.map((product) => (
                                <div
                                    key={product._id}
                                    className="bg-gray-50 rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all"
                                >
                                    <div className="h-32 bg-white">
                                        {product.image ? (
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300 font-black">
                                                No Image
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <p className="font-black text-gray-900 text-sm line-clamp-1">{product.name}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">In Stock</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <p className="font-black text-gray-900 text-xs">{product.stock ?? product.quantity} Units</p>
                                            <p className="font-black text-emerald-600 text-sm">₹{product.price}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* === ORDER DETAILS MODAL === */}
            {showOrderModal && selectedOrder && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setShowOrderModal(false)}
                >
                    <div
                        className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl p-6 md:p-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-indigo-600 font-black text-2xl">
                                    {(selectedOrder.customerName || 'U')[0]}
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-slate-900">{selectedOrder.customerName || 'Unknown Customer'}</p>
                                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                                        {selectedOrder._id ? `ORD-${selectedOrder._id.slice(-4)}` : 'ORD-0000'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowOrderModal(false)}
                                className="text-slate-400 hover:text-slate-600 text-2xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Purchase Date</p>
                                <p className="font-black text-slate-900 mt-2">{formatDate(selectedOrder.createdAt)}</p>
                                <p className="text-xs text-slate-400 font-bold">
                                    {new Date(selectedOrder.createdAt || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Shipping Info</p>
                                <p className="font-black text-indigo-600 mt-2">{selectedOrder.status || 'Pending'}</p>
                                <p className="text-xs text-slate-400 font-bold">Expected in 2 Days</p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Amount Paid</p>
                                <p className="font-black text-emerald-600 mt-2 text-lg">₹{selectedOrder.total || 0}</p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Refund Status</p>
                                <p className="font-black text-slate-900 mt-2">No Refund</p>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => generateInvoice(selectedOrder, localStorage.getItem('storeName') || 'WA-Order')}
                                className="w-full bg-slate-900 text-white py-3 rounded-2xl font-black hover:bg-slate-800 transition-all"
                            >
                                Download Bill
                            </button>
                            <a
                                href={`https://wa.me/${selectedOrder.customerPhone || ''}`}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full bg-emerald-500 text-white py-3 rounded-2xl font-black text-center hover:bg-emerald-600 transition-all"
                            >
                                Customer Chat
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
