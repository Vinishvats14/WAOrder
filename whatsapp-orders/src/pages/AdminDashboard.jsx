import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../api/axiosInstance';
import { io } from "socket.io-client";
import { Link, useNavigate } from 'react-router-dom';
import SalesChart from '../components/SalesChart';
import OrderTable from '../components/OrderTable';
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
        if (!promoMsg) return alert("Bhai, message toh likho!");

        // 1. Saare Unique Customers ke Numbers nikalo Orders se
        const uniquePhones = [...new Set(orders.map(o => o.customerPhone))];

        if (uniquePhones.length === 0) return alert("Abhi koi customer nahi hai!");

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
                            customerName: data.customerName || "Naya Visitor",
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
            console.error("Data load nahi hua!", err);
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        const formData = new FormData();

        const stockValue = parseInt(e.target.stock.value, 10);
        const minStockValue = parseInt(e.target.minStock.value, 10);

        console.log("Form Stock (raw):", e.target.stock.value);
        console.log("Form MinStock (raw):", e.target.minStock.value);
        console.log("Stock as parseInt:", stockValue);
        console.log("MinStock as parseInt:", minStockValue);

        // Validate before sending
        if (isNaN(stockValue) || stockValue <= 0) {
            alert("Stock must be a positive number!");
            return;
        }
        if (isNaN(minStockValue) || minStockValue <= 0) {
            alert("Alert level must be a positive number!");
            return;
        }

        formData.append('name', e.target.p_name.value);
        formData.append('price', e.target.p_price.value);
        formData.append('description', e.target.p_desc.value);
        formData.append('stock', String(stockValue));
        formData.append('minStock', String(minStockValue));
        formData.append('image', e.target.p_image.files[0]);
        formData.append('sellerId', sellerId);

        try {
            await axiosInstance.post('/products', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Maal add ho gaya! 🔥");
            e.target.reset();
            fetchSellerData();
        } catch (err) {
            alert("Upload failed!");
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await axiosInstance.patch(`/orders/${id}/status`, { status: newStatus });
            fetchSellerData();
        } catch (err) {
            alert("Status update fail!");
        }
    };

    const deleteProduct = async (id) => {
        if (window.confirm("Bhai, pakka delete karna hai?")) {
            try {
                await axiosInstance.delete(`/products/${id}`);
                alert("Product hata diya gaya!");
                fetchSellerData(); // List refresh karo
            } catch (err) {
                alert("Delete nahi ho paya!");
            }
        }
    };

    const editPrice = async (id, currentPrice) => {
        const newPrice = prompt("Naya Price dalo:", currentPrice);
        if (newPrice && newPrice !== currentPrice) {
            try {
                await axiosInstance.patch(`/products/${id}`, { price: newPrice });
                fetchSellerData();
            } catch (err) {
                alert("Price update fail!");
            }
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

    const lowStockProducts = products.filter(p => p.stock <= (p.minStock || 3));

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
            {/* === HEADER / NAVIGATION === */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-2 rounded-xl font-black text-lg">🚀</div>
                        <h1 className="text-2xl font-black italic text-gray-900">Seller War-Room</h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Link to="/admin" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm transition-all duration-300">
                            Orders 📦
                        </Link>
                        <Link to="/admin/customers" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-sm transition-all duration-300">
                            All Customers 👥
                        </Link>
                        {shopName ? (
                            <a
                                href={`/${shopName}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-sm transition-all duration-300"
                            >
                                Live Store 🌐
                            </a>
                        ) : (
                            <button disabled className="px-4 py-2 bg-gray-200 text-gray-400 rounded-lg font-bold text-sm cursor-not-allowed">
                                Loading... ⏳
                            </button>
                        )}
                        <Link to="/admin/settings" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold text-sm transition-all duration-300">
                            Settings ⚙️
                        </Link>
                        <button
                            onClick={() => {
                                localStorage.clear();
                                window.location.href = '/login';
                            }}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-sm transition-all duration-300"
                        >
                            Logout 🚪
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

                {/* === SALES CHART SECTION === */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100/50 p-8 mb-8">
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
                                📊 Data ikatha ho raha hai... Thoda intezar karein!
                            </div>
                        )}
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

                {/* === MARKETING HUB === */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100/50 p-8 mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-orange-100 text-orange-600 p-3 rounded-xl text-2xl">📢</div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900">Marketing Hub</h3>
                            <p className="text-sm text-gray-500">Send bulk promotions to your customers</p>
                        </div>
                    </div>

                    <textarea
                        value={promoMsg}
                        onChange={(e) => setPromoMsg(e.target.value)}
                        placeholder="Example: 🎉 TODAY'S SPECIAL! Fresh Pineapple Cake with 20% OFF! Limited stock available..."
                        className="w-full p-4 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-orange-400 focus:bg-white transition-all outline-none font-semibold text-gray-700 mb-4 textarea-custom resize-none"
                        rows="3"
                    />

                    <button
                        onClick={sendBulkPromo}
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-xl font-black text-sm shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95"
                    >
                        🔥 Send to {[...new Set(orders.map(o => o.customerPhone))].length} Customers
                    </button>
                </div>

                {/* === ADD NEW PRODUCT FORM === */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100/50 p-8 mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-blue-100 text-blue-600 p-3 rounded-xl text-2xl">📦</div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900">Add New Product</h3>
                            <p className="text-sm text-gray-500">Expand your inventory instantly</p>
                        </div>
                    </div>

                    <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <input 
                            name="p_name" 
                            placeholder="Product Name" 
                            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-blue-50 transition-all outline-none font-semibold" 
                            required 
                        />
                        <input 
                            name="p_price" 
                            type="number" 
                            placeholder="Price (₹)" 
                            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-blue-50 transition-all outline-none font-semibold" 
                            required 
                        />
                        <div className="flex flex-col">
                            <label className="text-[10px] font-black text-gray-500 uppercase mb-1 ml-1">Total Stock</label>
                            <input
                                name="stock"
                                type="number"
                                placeholder="e.g. 50"
                                min="1"
                                step="1"
                                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-blue-50 transition-all outline-none font-semibold"
                                required
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[10px] font-black text-red-500 uppercase mb-1 ml-1">Alert Level (Min)</label>
                            <input
                                name="minStock"
                                type="number"
                                placeholder="e.g. 5"
                                min="1"
                                step="1"
                                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-400 focus:bg-red-50 transition-all outline-none font-semibold"
                                required
                            />
                        </div>

                        <input 
                            name="p_desc" 
                            placeholder="Short Description" 
                            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-blue-50 transition-all outline-none font-semibold" 
                        />
                        <label className="px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-blue-400 transition-all cursor-pointer font-semibold text-gray-600 flex items-center justify-center gap-2 bg-gray-50">
                            <span>🖼️</span> Upload Image
                            <input name="p_image" type="file" className="hidden" required />
                        </label>
                        <button type="submit" className="lg:col-span-2 bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-900 text-white py-3 rounded-xl font-black text-sm shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95">
                            ✅ Upload to Store
                        </button>
                    </form>
                </div>

                {/* === LOW STOCK WARNING === */}
                {lowStockProducts.length > 0 && (
                    <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border-l-4 border-red-500 shadow-md animate-pulse">
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="bg-red-500 text-white p-3 rounded-xl text-2xl shadow-lg">⚠️</div>
                            <div className="flex-1">
                                <h3 className="font-black text-red-700 uppercase text-sm">Low Stock Alert!</h3>
                                <p className="text-red-600 text-xs font-semibold">These items are running low. Restock ASAP:</p>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {lowStockProducts.map(p => (
                                    <span key={p._id} className="bg-white px-3 py-1 rounded-lg text-xs font-black text-red-600 border border-red-200 shadow-sm">
                                        {p.name} ({p.stock} left)
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* === INVENTORY GRID === */}
                <div className="mb-8">
                    <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">📊 Your Inventory</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.length === 0 ? (
                            <div className="col-span-full py-12 text-center">
                                <p className="text-gray-400 text-lg font-semibold">No products yet. Add your first item above! 🚀</p>
                            </div>
                        ) : (
                            products.map(p => (
                                <div key={p._id} className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100/50 hover:shadow-xl hover:border-gray-200 transition-all duration-300 group">
                                    <div className="relative overflow-hidden bg-gray-100 h-40">
                                        <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" alt={p.name} />
                                        <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-[10px] font-black text-white uppercase ${p.stock <= (p.minStock || 3) ? 'bg-red-500' : 'bg-green-500'}`}>
                                            {p.stock} Units
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <h4 className="font-bold text-gray-900 text-sm line-clamp-2 mb-1">{p.name}</h4>
                                        <p className="text-green-600 font-black text-lg mb-4">₹{p.price}</p>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => editPrice(p._id, p.price)}
                                                className="flex-1 py-2 bg-blue-50 hover:bg-blue-500 text-blue-600 hover:text-white rounded-lg font-bold text-xs transition-all duration-300 flex items-center justify-center gap-1"
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                onClick={() => deleteProduct(p._id)}
                                                className="flex-1 py-2 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white rounded-lg font-bold text-xs transition-all duration-300 flex items-center justify-center gap-1"
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
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

                {/* === ORDERS MANAGEMENT === */}
                <div className="mb-8">
                    <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">📦 Order Management</h2>
                    <OrderTable orders={orders} refreshOrders={fetchOrders} />
                </div>

                {/* === RECENT TRANSACTIONS TABLE === */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100/50 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-transparent flex justify-between items-center">
                        <h3 className="text-lg font-black text-gray-900">📊 Recent Transactions</h3>
                        <button onClick={fetchSellerData} className="text-blue-600 font-bold hover:text-blue-700 text-sm underline-offset-4 hover:underline">
                            ♻️ Refresh
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 text-gray-700 font-black uppercase text-xs tracking-wider">
                                <tr>
                                    <th className="p-4 text-left">Customer</th>
                                    <th className="p-4 text-left">Items</th>
                                    <th className="p-4 text-right">Amount</th>
                                    <th className="p-4 text-center">Status</th>
                                    <th className="p-4 text-center">Update</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-gray-400">
                                            No orders yet. Your first customer is coming soon! 🚀
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map(order => (
                                        <tr 
                                            key={order._id} 
                                            onClick={() => {
                                                setSelectedOrder(order);
                                                setShowOrderModal(true);
                                            }}
                                            className="hover:bg-blue-50/50 transition-all duration-300 cursor-pointer"
                                        >
                                            <td className="p-4 font-bold text-gray-900">{order.customerName}</td>
                                            <td className="p-4 text-gray-600 text-xs">{order.items.map(i => i.name).join(', ')}</td>
                                            <td className="p-4 font-black text-gray-900 text-right">₹{order.total}</td>
                                            <td className="p-4 text-center">
                                                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                                    order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                                                    order.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' :
                                                    order.status === 'Shipped' ? 'bg-purple-100 text-purple-700' :
                                                    'bg-green-100 text-green-700'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                <select 
                                                    onChange={(e) => updateStatus(order._id, e.target.value)} 
                                                    className="border-2 border-gray-200 rounded-lg p-1 bg-white font-semibold text-xs outline-none hover:border-blue-400 transition-all" 
                                                    value={order.status}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Confirmed">Confirm</option>
                                                    <option value="Shipped">Ship</option>
                                                    <option value="Delivered">Deliver</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* === ORDER DETAILS MODAL === */}
            {showOrderModal && selectedOrder && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setShowOrderModal(false)}
                >
                    <div 
                        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 flex justify-between items-center">
                            <h2 className="text-2xl font-black">Order Details</h2>
                            <button 
                                onClick={() => setShowOrderModal(false)}
                                className="text-white hover:bg-white/20 p-2 rounded-full transition-all"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 md:p-8 space-y-6">
                            {/* Customer Info */}
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-5">
                                <h3 className="font-black text-blue-900 mb-4 flex items-center gap-2">
                                    👤 Customer Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-blue-600 font-bold uppercase">Name</p>
                                        <p className="text-lg font-black text-blue-900">{selectedOrder.customerName}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-blue-600 font-bold uppercase">Phone</p>
                                        <a 
                                            href={`https://wa.me/${selectedOrder.customerPhone}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-lg font-black text-green-600 hover:underline"
                                        >
                                            {selectedOrder.customerPhone}
                                        </a>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-xs text-blue-600 font-bold uppercase">Address</p>
                                        <p className="text-sm font-semibold text-blue-900">{selectedOrder.address}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-2xl p-5">
                                <h3 className="font-black text-purple-900 mb-4 flex items-center gap-2">
                                    📦 Items Ordered
                                </h3>
                                <div className="space-y-3">
                                    {selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-white rounded-lg p-3">
                                            <div>
                                                <p className="font-black text-purple-900">{item.name}</p>
                                                <p className="text-xs text-gray-500">Qty: {item.quantity || 1}</p>
                                            </div>
                                            <p className="font-black text-purple-600">₹{item.price}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 rounded-2xl p-5">
                                <div className="flex justify-between items-center mb-4">
                                    <p className="font-bold text-gray-700">Subtotal:</p>
                                    <p className="font-black text-gray-900">₹{selectedOrder.total * 0.9}</p>
                                </div>
                                <div className="flex justify-between items-center mb-4">
                                    <p className="font-bold text-gray-700">Tax (10%):</p>
                                    <p className="font-black text-gray-900">₹{Math.round(selectedOrder.total * 0.1)}</p>
                                </div>
                                <div className="border-t-2 border-gray-300 pt-4 flex justify-between items-center">
                                    <p className="font-black text-gray-900">Total Amount:</p>
                                    <p className="text-3xl font-black text-green-600">₹{selectedOrder.total}</p>
                                </div>
                            </div>

                            {/* Order Status */}
                            <div>
                                <p className="text-xs text-gray-600 font-bold uppercase mb-3">Current Status</p>
                                <div className="flex gap-2">
                                    {['Pending', 'Confirmed', 'Shipped', 'Delivered'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => updateStatus(selectedOrder._id, status)}
                                            className={`flex-1 py-3 px-4 rounded-lg font-black text-sm transition-all duration-300 ${
                                                selectedOrder.status === status
                                                    ? 'bg-green-600 text-white scale-105'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <a 
                                    href={`https://wa.me/${selectedOrder.customerPhone}?text=Hi ${selectedOrder.customerName}, Your order status has been updated to ${selectedOrder.status}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-black transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    💬 Message Customer
                                </a>
                                <button 
                                    onClick={() => setShowOrderModal(false)}
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 py-3 rounded-lg font-black transition-all duration-300"
                                >
                                    Close
                                </button>
                            </div>

                            {/* Order Metadata */}
                            <div className="border-t pt-4 text-xs text-gray-500">
                                <p>Order ID: {selectedOrder._id}</p>
                                <p>Placed on: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}