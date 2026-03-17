import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

export default function Inventory() {
    const navigate = useNavigate();
    const sellerId = localStorage.getItem('userId');
    const storeName = localStorage.getItem('storeName') || 'WA-Order';

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    const fetchProducts = async () => {
        if (!sellerId) return;
        try {
            setLoading(true);
            const res = await axiosInstance.get(`/products/seller/${sellerId}`);
            setProducts(res.data || []);
        } catch (err) {
            console.error('Product fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return products;
        return products.filter((product) => product.name?.toLowerCase().includes(term));
    }, [products, search]);

    const handleAddProduct = async (e) => {
        e.preventDefault();
        const formData = new FormData();

        const stockValue = parseInt(e.target.stock.value, 10);
        const minStockValue = parseInt(e.target.minStock.value, 10);

        if (Number.isNaN(stockValue) || stockValue <= 0) {
            alert('Stock must be a positive number!');
            return;
        }
        if (Number.isNaN(minStockValue) || minStockValue <= 0) {
            alert('Alert level must be a positive number!');
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
            alert('Product added!');
            e.target.reset();
            setShowAddModal(false);
            fetchProducts();
        } catch (err) {
            alert('Upload failed!');
        }
    };

    const editPrice = async (id, currentPrice) => {
        const newPrice = prompt('Enter new price:', currentPrice);
        if (newPrice && newPrice !== currentPrice) {
            try {
                await axiosInstance.patch(`/products/${id}`, { price: newPrice });
                fetchProducts();
            } catch (err) {
                alert('Price update failed!');
            }
        }
    };

    const deleteProduct = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axiosInstance.delete(`/products/${id}`);
                fetchProducts();
            } catch (err) {
                alert('Delete failed!');
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 mb-4"></div>
                    <p className="text-gray-600 font-black text-lg">Loading inventory...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl px-5 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl">
                            ⌁
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-500 tracking-widest">SELLER</p>
                            <p className="text-2xl font-black italic text-indigo-600">WAR-ROOM</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="px-4 py-2 rounded-full bg-indigo-600 text-white text-xs font-black tracking-wide shadow-sm hover:shadow-md transition-all">
                            SHOP QR
                        </button>
                        <button className="px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-black tracking-wide hover:border-indigo-300 hover:text-indigo-600 transition-all">
                            Settings
                        </button>
                        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black">
                            {storeName?.[0]?.toUpperCase() || 'S'}
                        </div>
                    </div>
                </div>

                <div className="mt-8 bg-white rounded-[32px] shadow-xl px-6 py-6">
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
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-2xl px-5 py-4 bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 font-semibold"
                            />
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-6 py-4 rounded-2xl bg-indigo-600 text-white font-black shadow-lg hover:shadow-xl transition-all"
                        >
                            ＋ NAYA MAAL ADD KAREIN
                        </button>
                    </div>

                    <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
                        {filteredProducts.length === 0 ? (
                            <div className="col-span-full text-center py-10 text-slate-400 font-bold">
                                No products available.
                            </div>
                        ) : (
                            filteredProducts.map((product) => (
                                <div
                                    key={product._id}
                                    className="bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-lg transition-all"
                                >
                                    <div className="relative h-36 bg-white">
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
                                        <button
                                            onClick={() => editPrice(product._id, product.price)}
                                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-slate-500 hover:text-slate-800"
                                            title="Edit Price"
                                        >
                                            ⚙
                                        </button>
                                    </div>
                                    <div className="p-3">
                                        <p className="font-black text-slate-900 text-sm line-clamp-1">{product.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">In Stock</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <p className="font-black text-slate-900 text-sm">{product.stock ?? product.quantity} Units</p>
                                            <p className="font-black text-emerald-600 text-sm">₹{product.price}</p>
                                        </div>
                                        <button
                                            onClick={() => deleteProduct(product._id)}
                                            className="mt-2 w-full py-1.5 text-[11px] font-black text-red-600 bg-red-50 rounded-xl hover:bg-red-100"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {showAddModal && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setShowAddModal(false)}
                >
                    <div
                        className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900">Add New Product</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-slate-400 hover:text-slate-600 text-2xl"
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleAddProduct} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                name="p_name"
                                placeholder="Product Name"
                                className="px-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:bg-indigo-50 transition-all outline-none font-semibold"
                                required
                            />
                            <input
                                name="p_price"
                                type="number"
                                placeholder="Price (₹)"
                                className="px-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:bg-indigo-50 transition-all outline-none font-semibold"
                                required
                            />
                            <input
                                name="stock"
                                type="number"
                                placeholder="Total Stock"
                                min="1"
                                step="1"
                                className="px-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:bg-indigo-50 transition-all outline-none font-semibold"
                                required
                            />
                            <input
                                name="minStock"
                                type="number"
                                placeholder="Alert Level (Min)"
                                min="1"
                                step="1"
                                className="px-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:bg-indigo-50 transition-all outline-none font-semibold"
                                required
                            />
                            <input
                                name="p_desc"
                                placeholder="Short Description"
                                className="px-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:bg-indigo-50 transition-all outline-none font-semibold md:col-span-2"
                            />
                            <label className="px-4 py-3 border-2 border-slate-200 rounded-2xl hover:border-indigo-400 transition-all cursor-pointer font-semibold text-slate-600 flex items-center justify-center gap-2 bg-slate-50 md:col-span-2">
                                <span>🖼️</span> Upload Image
                                <input name="p_image" type="file" className="hidden" required />
                            </label>
                            <button
                                type="submit"
                                className="md:col-span-2 bg-slate-900 hover:bg-black text-white py-3 rounded-2xl font-black text-sm shadow-lg hover:shadow-xl transition-all"
                            >
                                Upload to Store
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
