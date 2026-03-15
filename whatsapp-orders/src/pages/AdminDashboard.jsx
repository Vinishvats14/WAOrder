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
            const res = await axiosInstance.get('/orders/seller/ID');
            setOrders(res.data);
        };
        fetchOrders();

        // Polling: Har 30 second mein check karo naye orders ke liye
        const interval = setInterval(fetchOrders, 30000);
        return () => clearInterval(interval);
    }, []);

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
        // Live Socket Connection
        const socket = io("http://localhost:10000" || import.meta.env.VITE_API_URL, {
            withCredentials: true,
        });  ;

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

        return () => socket.disconnect();
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
    const shopName = rawStoreName.trim().replace(/\s+/g, '-').toLowerCase();
    console.log("Store Debug:", { rawStoreName, shopName });

    const lowStockProducts = products.filter(p => p.stock <= (p.minStock || 3));

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-10 bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100">
                <div className="flex gap-2 items-center">
                    {/* 1. Orders Link */}
                    <Link to="/admin" className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition">
                        Orders & Stock 📦
                    </Link>

                    {/* 2. LIVE STORE BUTTON (Tera naya rasta) */}
                    <a
                        href={`/${shopName}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-6 py-3 bg-green-100 text-green-700 rounded-2xl font-bold text-sm hover:bg-green-200 transition flex items-center gap-2 border border-green-200"
                    >
                        View Live Store 🌐
                    </a>

                    {/* 3. Settings Link */}
                    <Link to="/admin/settings" className="px-6 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-200 transition">
                        Settings ⚙️
                    </Link>
                </div>

                {/* 4. Logout Button */}
                <button
                    onClick={() => {
                        localStorage.clear();
                        window.location.href = '/login';
                    }}
                    className="px-6 py-3 text-red-500 font-bold italic hover:bg-red-50 rounded-2xl transition"
                >
                    Logout 🚪
                </button>
            </div>
            <h1 className="text-4xl font-black mb-8 text-gray-800 italic uppercase">Seller War-Room 🚀</h1>
            <div className="mt-10 bg-gradient-to-br from-green-500 to-emerald-700 p-8 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-green-100 border-4 border-white">
                <div className="text-center md:text-left">
                    <h2 className="text-3xl font-black italic uppercase leading-none mb-2">
                        Dukan ka QR Code ⚡
                    </h2>
                    <p className="font-medium opacity-90 text-sm max-w-xs">
                        Ise print karke shop pe lagao ya Instagram pe daalo. Scan karte hi dukan khulegi!
                    </p>
                    <button
                        onClick={() => {
                            const canvas = document.getElementById("store-qr");
                            const pngUrl = canvas.toDataURL("image/png");
                            let downloadLink = document.createElement("a");
                            downloadLink.href = pngUrl;
                            downloadLink.download = `${localStorage.getItem('storeName')}_QR.png`;
                            downloadLink.click();
                        }}
                        className="mt-6 bg-white text-green-600 px-8 py-4 rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 transition-transform active:scale-95"
                    >
                        Download QR Code 📥
                    </button>
                </div>

                <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl flex items-center justify-center">
                    {/* Store URL automatically pick ho jayega */}
                    <QRCodeCanvas
                        id="store-qr"
                        value={`${window.location.origin}/${localStorage.getItem('storeName')}`}
                        size={160}
                        level={"H"}
                        includeMargin={true}
                    />
                </div>
            </div>
            <div className="mt-10 bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                    <div className="bg-orange-100 text-orange-600 p-4 rounded-2xl text-2xl">📢</div>
                    <div>
                        <h3 className="text-2xl font-black uppercase italic">Marketing Hub</h3>
                        <p className="text-sm text-gray-500 font-medium">Apne purane customers ko naya offer bhejein!</p>
                    </div>
                </div>

                <textarea
                    value={promoMsg}
                    onChange={(e) => setPromoMsg(e.target.value)}
                    placeholder="Example: Hello! Aaj hamare paas Fresh Pineapple Cake pe 20% OFF hai. Order karein yahan: [Link]"
                    className="w-full p-6 rounded-[2rem] bg-gray-50 border-2 border-gray-100 focus:border-orange-400 focus:bg-white transition-all outline-none font-bold text-gray-700 mb-4"
                    rows="3"
                />

                <button
                    onClick={sendBulkPromo}
                    className="w-full bg-orange-500 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-orange-100 hover:bg-orange-600 transition-all active:scale-95"
                >
                    SEND PROMO TO ALL CUSTOMERS ({[...new Set(orders.map(o => o.customerPhone))].length}) 🔥
                </button>
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
            {/* Live Visitors Counter */}
            <div className="flex items-center gap-2 mb-6 bg-green-100 w-fit px-4 py-2 rounded-full border border-green-200 shadow-sm animate-pulse">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-bold text-green-700">{liveVisitors} People browsing right now</span>
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 rounded-3xl shadow-xl transform hover:scale-105 transition">
                    <p className="text-xs opacity-80 uppercase tracking-wider font-bold">Total Kamayi</p>
                    <h2 className="text-4xl font-black mt-2">₹{stats.totalSales}</h2>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-lg border-b-4 border-green-500">
                    <p className="text-xs text-gray-500 uppercase font-bold">Total Orders</p>
                    <h2 className="text-4xl font-black text-gray-800 mt-2">{stats.totalOrders}</h2>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-lg border-b-4 border-yellow-500">
                    <p className="text-xs text-gray-500 uppercase font-bold">Pending Orders</p>
                    <h2 className="text-4xl font-black text-gray-800 mt-2">{stats.pendingOrders}</h2>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl mb-10 border border-gray-100">
                <h3 className="text-xl font-black mb-6 italic text-gray-800 uppercase flex items-center gap-2">
                    Sales Performance 📈 <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full not-italic">Last 7 Days</span>
                </h3>
                <div className="h-[300px]">
                    {Object.keys(analytics).length > 0 ? (
                        <SalesChart data={analytics} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 italic">
                            Data ikatha ho raha hai... Thoda intezar karein! ⏳
                        </div>
                    )}
                </div>
            </div>

            {/* Add Product Form */}
            <div className="bg-white p-6 rounded-3xl shadow-xl mb-10 border border-blue-100">
                <h3 className="text-xl font-black mb-4 italic text-blue-600 uppercase">Naya Maal Add Karein 📦</h3>
                <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input name="p_name" placeholder="Product Name" className="p-3 border rounded-xl" required />
                    <input name="p_price" type="number" placeholder="Price (₹)" className="p-3 border rounded-xl" required />
                    {/* 1. CURRENT STOCK INPUT */}
                    <div className="flex flex-col">
                        <label className="text-[10px] font-black text-gray-400 uppercase mb-1 ml-2">Total Stock</label>
                        <input
                            name="stock"
                            type="number"
                            placeholder="e.g. 50"
                            min="1"
                            step="1"
                            className="p-4 border-2 border-gray-50 rounded-2xl bg-gray-50 font-bold focus:border-blue-400 focus:bg-white transition-all outline-none"
                            required
                        />
                    </div>

                    {/* 2. MINIMUM ALERT INPUT */}
                    <div className="flex flex-col">
                        <label className="text-[10px] font-black text-red-400 uppercase mb-1 ml-2">Alert at (Min)</label>
                        <input
                            name="minStock"
                            type="number"
                            placeholder="e.g. 5"
                            min="1"
                            step="1"
                            className="p-4 border-2 border-gray-50 rounded-2xl bg-gray-50 font-bold focus:border-red-200 focus:bg-white transition-all outline-none"
                            required
                        />
                    </div>

                    <input name="p_desc" placeholder="Short Description" className="p-3 border rounded-xl" />
                    <input name="p_image" type="file" className="p-2 text-xs" required />
                    <button type="submit" className="lg:col-span-4 bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition">
                        Upload to My Store 🔥
                    </button>
                </form>
            </div>
            {lowStockProducts.length > 0 && (
                <div className="mb-10 animate-pulse">
                    <div className="bg-red-50 border-2 border-red-200 p-6 rounded-[2rem] flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-red-500 text-white p-3 rounded-2xl text-2xl shadow-lg shadow-red-200">
                                ⚠️
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-red-800 uppercase italic">Maal Khatam Hone Wala Hai!</h3>
                                <p className="text-sm text-red-600 font-medium italic">Niche diye gaye items jaldi refill karein...</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {lowStockProducts.map(p => (
                                <span key={p._id} className="bg-white px-4 py-2 rounded-xl text-xs font-black text-red-600 border border-red-100 shadow-sm">
                                    {p.name} ({p.stock} left)
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            <h3 className="text-2xl font-black mb-6 italic text-gray-800 uppercase">Mera Stock (Manage) 🛒</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {products.map(p => (
                    <div key={p._id} className="bg-white p-4 rounded-3xl shadow-md border border-gray-100 group relative">
                        <img src={p.image} className="w-full h-40 object-cover rounded-2xl mb-3" alt="" />

                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-gray-800">{p.name}</h4>
                                <p className="text-green-600 font-black">₹{p.price}</p>
                            </div>
                            {/* --- AB YE STOCK COUNTER YAHAN PASTE KARO --- */}
                            <div className="flex justify-between items-center mt-3 bg-gray-50 p-2 rounded-xl border border-gray-100">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">In Stock</span>
                                <span className={`text-xs font-black ${p.stock <= (p.minStock || 3) ? 'text-red-500' : 'text-gray-800'}`}>
                                    {p.stock} Units
                                </span>
                            </div>
                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => editPrice(p._id, p.price)}
                                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition"
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => deleteProduct(p._id)}
                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Hot Leads Section */}
            <div className="mt-10 mb-10">
                <div className="flex items-center gap-2 mb-6">
                    <h3 className="text-2xl font-black text-gray-800 italic">Hot Leads (Live Interest) 🔥</h3>
                    <span className="bg-orange-500 w-3 h-3 rounded-full animate-ping"></span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {notifications.length === 0 ? <p className="text-gray-400 italic">No live activity...</p> :
                        notifications.map(lead => (
                            <div key={lead.id} className="bg-white p-5 rounded-3xl shadow-xl border-t-4 border-orange-500 transform hover:-translate-y-1 transition duration-300">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-black text-lg text-gray-800">{lead.customerName || "Anonymous Visitor"}</p>
                                        <p className="text-xs text-blue-600 font-bold tracking-tighter">{lead.phone || "No Number Yet"}</p>
                                    </div>
                                    <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-black animate-pulse uppercase tracking-widest">Live</span>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-2xl mb-4">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Items in Cart:</p>
                                    <p className="text-xs text-gray-600 italic">{lead.items?.map(i => i.name).join(', ') || "Browsing..."}</p>
                                </div>
                                {lead.phone && (
                                    <button onClick={() => window.open(`https://wa.me/${lead.phone}?text=Hi ${lead.customerName}, main dekh raha hoon aap hamare store par kuch items check kar rahe hain...`)}
                                        className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg transition">
                                        Chat to Convince 💬
                                    </button>
                                )}
                            </div>
                        ))}
                </div>
            </div>
            {/* // Orders Management Section */}
            <div className="mt-12">
                <h2 className="text-2xl font-black mb-6 italic uppercase text-gray-800">Order Management 📦</h2>
                <OrderTable orders={orders} refreshOrders={fetchOrders} />
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-xl font-bold text-gray-800">Recent Transactions</h3>
                    <button onClick={fetchSellerData} className="text-blue-600 font-bold hover:underline underline-offset-4 text-sm">Refresh Live Data</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100 text-gray-500 text-xs uppercase tracking-widest">
                            <tr>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Items</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map(order => (
                                <tr key={order._id} className="hover:bg-blue-50/30 transition">
                                    <td className="p-4 font-bold text-gray-800">{order.customerName}</td>
                                    <td className="p-4 text-xs text-gray-600 font-medium">{order.items.map(i => i.name).join(', ')}</td>
                                    <td className="p-4 font-black text-gray-800 text-lg">₹{order.total}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-xs">
                                        <select onChange={(e) => updateStatus(order._id, e.target.value)} className="border rounded-lg p-1 bg-white shadow-sm outline-none" value={order.status}>
                                            <option value="Pending">Pending</option>
                                            <option value="Confirmed">Confirm</option>
                                            <option value="Shipped">Ship</option>
                                            <option value="Delivered">Deliver</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}