import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { io } from "socket.io-client";

// Socket setup
const socketURL = import.meta.env.VITE_SOCKET_URL || 
                  (import.meta.env.MODE === 'development' 
                  ? 'http://localhost:10000' 
                  : 'https://wa-order-backend.onrender.com');

let socketInstance = null;

try {
    socketInstance = io(socketURL, {
        withCredentials: true,
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
    });

    socketInstance.on('connect', () => {
        console.log("✅ Socket connected to:", socketURL);
    });

    socketInstance.on('connect_error', (error) => {
        console.warn("⚠️ Socket connection error (Storefront):", error?.message);
    });

    socketInstance.on('disconnect', (reason) => {
        console.log("❌ Socket disconnected:", reason);
    });
} catch (err) {
    console.error("Socket initialization failed:", err);
}

let typingTimer;

export default function Storefront() {
    const { shopName } = useParams();
    const [products, setProducts] = useState([]);
    const [seller, setSeller] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { cart, totalAmount, clearCart } = useCart();
    const [customer, setCustomer] = useState({ name: '', address: '', phone: '' });

    useEffect(() => {
        const fetchStoreData = async () => {
            try {
                // Validate shopName exists and is not empty
                if (!shopName || shopName.length === 0) {
                    setError("Invalid shop name");
                    setLoading(false);
                    return;
                }

                console.log("Fetching store data for shopName:", shopName);
                // 1. Fetch Store/Seller Details by Slug
                const sellerRes = await axiosInstance.get(`/auth/store/${shopName}`);
                console.log("Full Seller Data from API:", sellerRes.data);
                setSeller(sellerRes.data);

                // 2. Fetch Products for this specific Seller
                const productsRes = await axiosInstance.get(`/products/seller/${sellerRes.data._id}`);
                setProducts(productsRes.data);

                setLoading(false);
            } catch (err) {
                console.error("Error fetching store data!", err);
                setError(`Error: ${err.response?.data?.msg || err.message}`);
                setLoading(false);
            }
        };
        fetchStoreData();
    }, [shopName]);

    const handleInputChange = (field, value) => {
        setCustomer(prev => {
            const newCustomerData = { ...prev, [field]: value };

            // Real-time notification logic (Debounced)
            if (socketInstance && socketInstance.connected) {
                clearTimeout(typingTimer);
                typingTimer = setTimeout(() => {
                    if (newCustomerData.name.length > 2 || newCustomerData.phone.length > 5) {
                        socketInstance.emit("cartActivity", {
                            customerName: newCustomerData.name,
                            customerPhone: newCustomerData.phone,
                            items: cart,
                            shop: shopName
                        });
                    }
                }, 1000);
            }

            return newCustomerData;
        });
    };

    const handleOrder = async () => {
        if (!customer.name || !customer.address || !customer.phone) {
            return alert("Filling all details is necessary!");
        }

        if (!seller || !seller.whatsappNumber) {
            return alert("Seller contact details missing!");
        }

        const orderData = {
            customerName: customer.name,
            customerPhone: customer.phone,
            address: customer.address,
            items: cart,
            total: totalAmount,
            sellerId: seller._id
        };

        try {
            // Save order in Database
            await axiosInstance.post('/orders', orderData);

            // Create WhatsApp Message
            const itemsList = cart.map(item => `- ${item.name} (x1)`).join('\n');
            const message = `*New Order Received!* 🛍️\n\n*Store:* ${seller.storeName}\n*Customer:* ${customer.name}\n*Phone:* ${customer.phone}\n*Address:* ${customer.address}\n\n*Items:*\n${itemsList}\n\n*Total Amount:* ₹${totalAmount}\n\n_Sent via WA-Order_`;

            // Redirect to Seller's WhatsApp
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/${seller.whatsappNumber}?text=${encodedMessage}`;

            clearCart();
            window.location.href = whatsappUrl;

        } catch (err) {
            console.error(err);
            alert("Order save nahi ho paya, par aap direct WhatsApp kar sakte hain.");
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-bounce text-2xl font-black italic text-green-600">Shop is loading... 🚀</div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-md">
                <h1 className="text-3xl mb-4">⚠️ Shop Load Error</h1>
                <p className="text-lg font-bold text-gray-800 mb-4">{error}</p>
                <p className="text-sm text-gray-600 mb-6">Debug Info: Shop Name = <strong>{shopName}</strong></p>
                <button onClick={() => window.location.href = '/'} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-xl font-bold">Wapas Home</button>
            </div>
        </div>
    );

    if (!seller) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center p-8 bg-white rounded-3xl shadow-xl">
                <h1 className="text-6xl mb-4">404</h1>
                <p className="text-xl font-bold text-gray-800">Unable to find shop ⛔</p>
                <p className="text-sm text-gray-600 mt-2">Shop Name: <strong>{shopName}</strong></p>
                <button onClick={() => window.location.href = '/'} className="mt-4 text-blue-600 font-bold underline">Wapas ghar chalein?</button>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
            <header className="mb-10 text-center md:text-left">
                <h1 className="text-4xl md:text-6xl font-black italic text-gray-900 uppercase tracking-tighter">
                    {seller.storeName}
                </h1>
                <p className="text-gray-500 font-medium tracking-tight mt-2">Welcome to our online store! 👋</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Product Catalog */}
                <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {products.length > 0 ? (
                            products.map(p => <ProductCard key={p._id} product={p} />)
                        ) : (
                            <div className="col-span-full p-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 text-center">
                                <p className="text-gray-400 italic font-bold">Currently no products available...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sticky Checkout Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-8 rounded-[2rem] shadow-2xl h-fit sticky top-10 border border-gray-100">
                        <h2 className="text-2xl font-black mb-6 italic flex justify-between items-center border-b pb-4">
                            My Cart 🛒
                            <span className="text-sm bg-gray-100 px-3 py-1 rounded-full not-italic font-bold">
                                {cart.length} Items
                            </span>
                        </h2>

                        {cart.length === 0 ? (
                            <div className="py-10 text-center">
                                <p className="text-gray-400 font-bold italic">Cart is empty, add some items!</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 mb-6">
                                    {cart.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl">
                                            <span className="font-bold text-gray-700">{item.name}</span>
                                            <span className="font-black text-green-600">₹{item.price}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t-2 border-dashed pt-4 mb-6 flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-500">Total:</span>
                                    <span className="text-3xl font-black text-gray-900">₹{totalAmount}</span>
                                </div>

                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        className="w-full p-4 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:border-green-400 focus:bg-white transition-all outline-none font-bold"
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        placeholder="WhatsApp Number"
                                        className="w-full p-4 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:border-green-400 focus:bg-white transition-all outline-none font-bold"
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                    />
                                    <textarea
                                        placeholder="Delivery Address"
                                        rows="3"
                                        className="w-full p-4 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:border-green-400 focus:bg-white transition-all outline-none font-bold"
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                    />
                                </div>

                                <button
                                    onClick={handleOrder}
                                    style={{ backgroundColor: seller.themeColor || '#22c55e' }} // Dynamic Color
                                    className="w-full text-white py-5 rounded-2xl mt-6 font-black text-lg shadow-xl hover:opacity-90 transition-all active:scale-95"
                                >
                                    CONFIRM ORDER 🔥
                                </button>
                                <p className="text-[10px] text-center text-gray-400 mt-4 font-bold uppercase tracking-widest">
                                    Safe & Secure WhatsApp Checkout
                                </p>
                            </>
                        )}
                    </div>
                </div>

            </div>
            <footer className="mt-20 pb-10 text-center">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                    Create your own online store for free
                </p>
                <a href="/" target="_blank" className="inline-block mt-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 font-black italic text-green-600 hover:scale-105 transition">
                    MADE WITH WA-ORDER 🚀
                </a>
            </footer>
        </div>
    );
}