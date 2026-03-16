import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

export default function Customers() {
    const navigate = useNavigate();
    const adminId = localStorage.getItem('adminId');
    
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddOrderForm, setShowAddOrderForm] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Add Order Form States
    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        address: '',
        items: [{ name: '', price: 0, quantity: 1 }]
    });

    // Fetch data
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

    // Add new order
    const handleAddOrder = async (e) => {
        e.preventDefault();
        
        if (!formData.customerName || !formData.customerPhone || formData.items.length === 0) {
            alert('Please fill all required fields');
            return;
        }

        try {
            const total = formData.items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
            
            const orderData = {
                ...formData,
                total,
                status: 'Pending'
            };

            const response = await axiosInstance.post('/orders', orderData);
            
            if (response.data) {
                setOrders([response.data, ...orders]);
                setFormData({
                    customerName: '',
                    customerPhone: '',
                    address: '',
                    items: [{ name: '', price: 0, quantity: 1 }]
                });
                setShowAddOrderForm(false);
                alert('Order created successfully!');
            }
        } catch (error) {
            console.error('Error adding order:', error);
            alert('Failed to create order: ' + error.response?.data?.message || error.message);
        }
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle item changes
    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    // Add new item line
    const addItemLine = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { name: '', price: 0, quantity: 1 }]
        }));
    };

    // Remove item line
    const removeItemLine = (index) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    // Filter and get unique customers
    const filteredOrders = orders.filter(order =>
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerPhone.includes(searchTerm)
    );

    const uniqueCustomers = Array.from(new Map(filteredOrders.map(order => [order.customerPhone, order])).values());
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-emerald-600 mb-4"></div>
                    <p className="text-gray-600 font-black text-lg">Loading customers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button 
                        onClick={() => navigate('/admin')}
                        className="mb-4 text-emerald-600 hover:text-emerald-700 font-black text-sm flex items-center gap-2 transition-all"
                    >
                        ← Back to Dashboard
                    </button>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">LIVE INVENTORY</h1>
                            <p className="text-gray-600 font-bold">Track stocks and customer interest</p>
                        </div>
                        
                        <button 
                            onClick={() => setShowAddOrderForm(true)}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-lg font-black hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                        >
                            ✨ Add New Order
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-emerald-500 hover:shadow-xl transition-all">
                        <p className="text-gray-600 font-bold text-sm uppercase tracking-wide">Total Customers</p>
                        <p className="text-4xl font-black text-emerald-600 mt-2">{uniqueCustomers.length}</p>
                        <p className="text-xs text-green-500 font-bold mt-2">+15% from last week</p>
                    </div>
                    
                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-all">
                        <p className="text-gray-600 font-bold text-sm uppercase tracking-wide">Total Orders</p>
                        <p className="text-4xl font-black text-blue-600 mt-2">{orders.length}</p>
                        <p className="text-xs text-blue-500 font-bold mt-2">+8% this month</p>
                    </div>
                    
                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-all">
                        <p className="text-gray-600 font-bold text-sm uppercase tracking-wide">Total Revenue</p>
                        <p className="text-4xl font-black text-purple-600 mt-2">₹{totalRevenue.toLocaleString()}</p>
                        <p className="text-xs text-purple-500 font-bold mt-2">+12.5% growth</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-8 relative">
                    <input 
                        type="text"
                        placeholder="🔍 Search by customer name or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-6 py-4 border-2 border-gray-300 rounded-2xl focus:border-emerald-500 focus:outline-none font-semibold text-gray-900 placeholder-gray-500 shadow-md transition-all"
                    />
                </div>

                {/* Customer Cards Grid */}
                {uniqueCustomers.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
                        <p className="text-gray-500 font-bold text-lg">😢 No customers yet</p>
                        <p className="text-gray-400 text-sm mt-2">Start by creating your first order!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {uniqueCustomers.map((order) => {
                            const customerOrders = filteredOrders.filter(o => o.customerPhone === order.customerPhone);
                            const totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0);
                            
                            return (
                                <div 
                                    key={order.customerPhone}
                                    onClick={() => { setSelectedOrder(order); setShowOrderModal(true); }}
                                    className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-emerald-500"
                                >
                                    {/* Customer Header */}
                                    <div className="flex items-center gap-4 mb-5">
                                        <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-black text-2xl">
                                            {order.customerName[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-gray-900 text-lg">{order.customerName}</h3>
                                            <p className="text-xs text-gray-500 font-bold">{order.customerPhone}</p>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="mb-4">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-black ${
                                            order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                            order.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' :
                                            order.status === 'Shipped' ? 'bg-purple-100 text-purple-700' :
                                            'bg-green-100 text-green-700'
                                        }`}>
                                            {order.status === 'Delivered' ? '✓ DELIVERED' : order.status}
                                        </span>
                                    </div>

                                    {/* Order Info */}
                                    <div className="border-t border-b border-gray-200 py-3 mb-4">
                                        <div className="flex justify-between mb-2">
                                            <p className="text-xs text-gray-600 font-bold">Orders</p>
                                            <p className="font-black text-gray-900">{customerOrders.length}</p>
                                        </div>
                                        <div className="flex justify-between">
                                            <p className="text-xs text-gray-600 font-bold">Total Spent</p>
                                            <p className="font-black text-emerald-600 text-lg">₹{totalSpent}</p>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <a 
                                        href={`https://wa.me/${order.customerPhone}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-black text-sm transition-all duration-300 flex items-center justify-center gap-2"
                                    >
                                        💬 Send Message
                                    </a>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Products Section */}
                {products.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-3xl font-black text-gray-900 mb-6">📦 STOCK SNAPSHOT</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {products.slice(0, 8).map((product) => (
                                <div 
                                    key={product._id}
                                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
                                >
                                    {/* Product Image */}
                                    {product.image && (
                                        <img 
                                            src={product.image} 
                                            alt={product.name}
                                            className="w-full h-40 object-cover"
                                        />
                                    )}
                                    
                                    {/* Product Info */}
                                    <div className="p-4">
                                        <h4 className="font-black text-gray-900 mb-2">{product.name}</h4>
                                        <div className="flex justify-between items-center">
                                            <p className="font-black text-emerald-600 text-lg">₹{product.price}</p>
                                            <span className="text-xs font-black px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                                                {product.quantity} Units
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Add Order Form Modal */}
            {showAddOrderForm && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setShowAddOrderForm(false)}
                >
                    <div 
                        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Form Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 flex justify-between items-center">
                            <h2 className="text-2xl font-black">✨ Create New Order</h2>
                            <button 
                                onClick={() => setShowAddOrderForm(false)}
                                className="text-white hover:bg-white/20 p-2 rounded-full transition-all"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Form Content */}
                        <form onSubmit={handleAddOrder} className="p-6 space-y-5">
                            {/* Customer Info */}
                            <div>
                                <label className="block text-sm font-black text-gray-700 mb-2">Customer Name *</label>
                                <input 
                                    type="text"
                                    name="customerName"
                                    value={formData.customerName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none font-semibold"
                                    placeholder="Enter customer name"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-black text-gray-700 mb-2">Phone Number *</label>
                                    <input 
                                        type="text"
                                        name="customerPhone"
                                        value={formData.customerPhone}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none font-semibold"
                                        placeholder="91XXXXXXXXXX"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-black text-gray-700 mb-2">Address</label>
                                    <input 
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none font-semibold"
                                        placeholder="Delivery address"
                                    />
                                </div>
                            </div>

                            {/* Items Section */}
                            <div className="border-t-2 pt-5">
                                <h3 className="font-black text-gray-900 mb-4">📦 Items</h3>
                                <div className="space-y-3">
                                    {formData.items.map((item, index) => (
                                        <div key={index} className="flex gap-3 items-end">
                                            <input 
                                                type="text"
                                                placeholder="Item name"
                                                value={item.name}
                                                onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                                className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none text-sm"
                                            />
                                            <input 
                                                type="number"
                                                placeholder="Price"
                                                value={item.price}
                                                onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                                                className="w-24 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none text-sm"
                                            />
                                            <input 
                                                type="number"
                                                placeholder="Qty"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                                className="w-16 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none text-sm"
                                                min="1"
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => removeItemLine(index)}
                                                className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                
                                <button 
                                    type="button"
                                    onClick={addItemLine}
                                    className="mt-4 text-emerald-600 hover:text-emerald-700 font-black text-sm flex items-center gap-2"
                                >
                                    + Add Another Item
                                </button>
                            </div>

                            {/* Total */}
                            <div className="bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg p-4 border-2 border-emerald-300">
                                <div className="flex justify-between items-center">
                                    <p className="font-black text-gray-900">Total Amount:</p>
                                    <p className="text-3xl font-black text-emerald-600">
                                        ₹{formData.items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0).toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button 
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg font-black hover:shadow-lg transition-all duration-300"
                                >
                                    ✓ Create Order
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setShowAddOrderForm(false)}
                                    className="flex-1 bg-gray-300 text-gray-900 py-3 rounded-lg font-black hover:bg-gray-400 transition-all duration-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Order Details Modal */}
            {showOrderModal && selectedOrder && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setShowOrderModal(false)}
                >
                    <div 
                        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
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
                        <div className="p-6 space-y-5">
                            {/* Customer Card */}
                            <div className="flex items-center gap-4 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-5">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-black text-3xl">
                                    {selectedOrder.customerName[0]}
                                </div>
                                <div>
                                    <p className="text-xs text-blue-600 font-bold uppercase">Customer</p>
                                    <h3 className="font-black text-gray-900 text-xl">{selectedOrder.customerName}</h3>
                                    <p className="text-sm text-gray-600 font-bold">{selectedOrder.customerPhone}</p>
                                    <p className="text-xs text-gray-500 mt-1">{selectedOrder.address}</p>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="bg-gray-50 rounded-2xl p-5">
                                <h3 className="font-black text-gray-900 mb-4">📦 Items</h3>
                                <div className="space-y-2">
                                    {selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-2 bg-white rounded-lg">
                                            <div>
                                                <p className="font-bold text-gray-900">{item.name}</p>
                                                <p className="text-xs text-gray-500">Qty: {item.quantity || 1}</p>
                                            </div>
                                            <p className="font-black text-emerald-600">₹{item.price}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total */}
                            <div className="bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl p-5 border-2 border-emerald-300">
                                <div className="flex justify-between items-center">
                                    <p className="font-black text-gray-900">Amount Paid:</p>
                                    <p className="text-4xl font-black text-emerald-600">₹{selectedOrder.total}</p>
                                </div>
                            </div>

                            {/* Action */}
                            <a 
                                href={`https://wa.me/${selectedOrder.customerPhone}`}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-black transition-all text-center"
                            >
                                💬 Support Chat
                            </a>

                            <button 
                                onClick={() => setShowOrderModal(false)}
                                className="w-full bg-gray-300 text-gray-900 py-3 rounded-lg font-black hover:bg-gray-400 transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
