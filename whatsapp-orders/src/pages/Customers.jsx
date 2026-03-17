import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { generateInvoice } from '../utils/generateInvoice';

const statusStyles = {
    Pending: 'bg-yellow-100 text-yellow-700',
    Confirmed: 'bg-blue-100 text-blue-700',
    Shipped: 'bg-purple-100 text-purple-700',
    Delivered: 'bg-green-100 text-green-700'
};

export default function Customers() {
    const navigate = useNavigate();
    const adminId = localStorage.getItem('adminId');
    const storeName = localStorage.getItem('storeName') || 'WA-Order';

    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [productSearch, setProductSearch] = useState('');

    const fetchData = useCallback(async () => {
        if (!adminId) {
            navigate('/admin');
            return;
        }

        try {
            setLoading(true);
            const [ordersRes, productsRes] = await Promise.all([
                axiosInstance.get(`/orders/seller/${adminId}`),
                axiosInstance.get(`/products/seller/${adminId}`)
            ]);

            setOrders(ordersRes.data || []);
            setProducts(productsRes.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, [adminId, navigate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const recentOrders = useMemo(() => {
        return [...orders]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 6);
    }, [orders]);

    const filteredProducts = useMemo(() => {
        const term = productSearch.trim().toLowerCase();
        if (!term) return products;
        return products.filter((product) => product.name?.toLowerCase().includes(term));
    }, [products, productSearch]);

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

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 mb-4"></div>
                    <p className="text-gray-600 font-black text-lg">Loading customers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-gray-100 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => navigate('/admin')}
                    className="mb-4 text-indigo-600 hover:text-indigo-700 font-black text-sm flex items-center gap-2 transition-all"
                >
                    ← Back to Dashboard
                </button>

                <div className="bg-white rounded-3xl shadow-xl px-5 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl">
                            ⌁
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-900">SELLER</p>
                            <p className="text-2xl font-black text-indigo-600">WAR-ROOM</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-4 py-2 rounded-full bg-indigo-600 text-white text-xs font-black shadow-lg hover:shadow-xl transition-all">
                            ⌁ SHOP QR
                        </button>
                        <button className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700">
                            ⚙
                        </button>
                        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black">
                            {storeName?.[0]?.toUpperCase() || 'S'}
                        </div>
                    </div>
                </div>

                <div className="mt-8 bg-white rounded-[32px] shadow-xl px-6 py-6">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-xl font-black text-slate-900">ORDER TRACKING</h2>
                        <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                            Recent Activity
                        </span>
                    </div>

                    <div className="mt-6">
                        <div className="grid grid-cols-4 text-[11px] font-black uppercase tracking-widest text-slate-400 px-3">
                            <p>Customer Details</p>
                            <p className="text-center">Total</p>
                            <p className="text-center">Status</p>
                            <p className="text-right">Detail</p>
                        </div>

                        <div className="mt-4 space-y-4">
                            {recentOrders.length === 0 ? (
                                <div className="text-center py-10 text-slate-400 font-bold">
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
                                        className="w-full bg-slate-50 hover:bg-white border border-slate-100 rounded-2xl px-4 py-4 flex flex-col md:flex-row md:items-center gap-4 shadow-sm hover:shadow-lg transition-all"
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 font-black flex items-center justify-center text-lg">
                                                {(order.customerName || 'U')[0]}
                                            </div>
                                            <div className="text-left">
                                                <p className="font-black text-slate-900">{order.customerName || 'Anonymous Visitor'}</p>
                                                <p className="text-xs font-bold text-slate-500">{order.customerPhone || '—'}</p>
                                            </div>
                                        </div>
                                        <div className="text-center font-black text-slate-900 min-w-[90px]">₹{order.total || 0}</div>
                                        <div className="text-center min-w-[120px]">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${statusStyles[order.status] || 'bg-slate-100 text-slate-500'}`}>
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

                <div className="mt-10 bg-white rounded-[32px] shadow-xl px-6 py-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin')}
                            className="w-10 h-10 rounded-full border border-slate-200 text-slate-600 font-black"
                        >
                            ←
                        </button>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">LIVE INVENTORY</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Manage stock levels and customer interest
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Search by product name..."
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                                className="w-full rounded-2xl px-5 py-4 bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 font-semibold"
                            />
                        </div>
                        <button className="px-6 py-4 rounded-2xl bg-indigo-600 text-white font-black shadow-lg hover:shadow-xl transition-all">
                            ＋ NAYA MAAL ADD KAREIN
                        </button>
                    </div>

                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.length === 0 ? (
                            <div className="col-span-full text-center py-10 text-slate-400 font-bold">
                                No products available.
                            </div>
                        ) : (
                            filteredProducts.slice(0, 6).map((product) => (
                                <div
                                    key={product._id}
                                    className="bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-lg transition-all"
                                >
                                    <div className="h-44 bg-white">
                                        {product.image ? (
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300 font-black">
                                                No Image
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <p className="font-black text-slate-900">{product.name}</p>
                                        <p className="text-xs font-bold text-slate-400 uppercase mt-1">In Stock</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <p className="font-black text-slate-900">{product.quantity} Units</p>
                                            <p className="font-black text-emerald-600 text-lg">₹{product.price}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

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
                                onClick={() => generateInvoice(selectedOrder, storeName)}
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
