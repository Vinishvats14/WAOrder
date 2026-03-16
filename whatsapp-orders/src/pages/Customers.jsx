import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

export default function Customers() {
    const navigate = useNavigate();
    const adminId = localStorage.getItem('adminId');
    
    const [orders, setOrders] = useState([]);
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

    // Fetch all orders
    const fetchOrders = useCallback(async () => {
        if (!adminId) {
            navigate('/admin');
            return;
        }
        
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/orders/seller/${adminId}`);
            setOrders(response.data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    }, [adminId, navigate]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

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

    // Filter orders by search term
    const filteredOrders = orders.filter(order =>
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerPhone.includes(searchTerm)
    );

    // Get unique customers
    const uniqueCustomers = Array.from(new Map(orders.map(order => [order.customerPhone, order])).values());

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
                    <p className="text-gray-600 font-semibold">Loading customers...</p>
                </div>
            </div>
        );
    }

    const totalOrderAmount = orders.reduce((sum, order) => sum + order.total, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-4 md:p-8">
            {/* Header */}
            <div className="mb-8">
                <button 
                    onClick={() => navigate('/admin')}
                    className="mb-4 text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-2"
                >
                    ← Back to Dashboard
                </button>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">👥 All Customers</h1>
                        <p className="text-gray-600 font-semibold">{uniqueCustomers.length} unique customers • {orders.length} total orders</p>
                    </div>
                    
                    <button 
                        onClick={() => setShowAddOrderForm(true)}
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-lg font-black hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                    >
                        ✨ Add New Order
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-emerald-500">
                    <p className="text-gray-600 font-bold text-sm">Total Customers</p>
                    <p className="text-3xl font-black text-emerald-600">{uniqueCustomers.length}</p>
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-blue-500">
                    <p className="text-gray-600 font-bold text-sm">Total Orders</p>
                    <p className="text-3xl font-black text-blue-600">{orders.length}</p>
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-purple-500">
                    <p className="text-gray-600 font-bold text-sm">Total Revenue</p>
                    <p className="text-3xl font-black text-purple-600">₹{totalOrderAmount.toLocaleString()}</p>
                </div>
            </div>

            {/* Add Order Form Modal */}
            {showAddOrderForm && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setShowAddOrderForm(false)}
                >
                    <div 
                        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Form Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 flex justify-between items-center">
                            <h2 className="text-2xl font-black">Create New Order</h2>
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
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none font-semibold"
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
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none font-semibold"
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
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none font-semibold"
                                        placeholder="Delivery address"
                                    />
                                </div>
                            </div>

                            {/* Items Section */}
                            <div className="border-t-2 pt-5">
                                <h3 className="font-black text-gray-900 mb-4">Order Items</h3>
                                <div className="space-y-3">
                                    {formData.items.map((item, index) => (
                                        <div key={index} className="flex gap-3 items-end">
                                            <input 
                                                type="text"
                                                placeholder="Item name"
                                                value={item.name}
                                                onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                                className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none text-sm"
                                            />
                                            <input 
                                                type="number"
                                                placeholder="Price"
                                                value={item.price}
                                                onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                                                className="w-24 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none text-sm"
                                            />
                                            <input 
                                                type="number"
                                                placeholder="Qty"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                                className="w-16 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none text-sm"
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
                            <div className="bg-gray-100 rounded-lg p-4 border-2 border-gray-300">
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

            {/* Orders Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Search Bar */}
                <div className="p-6 border-b border-gray-100">
                    <input 
                        type="text"
                        placeholder="Search customers by name or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none font-semibold"
                    />
                </div>

                {/* Table */}
                {filteredOrders.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500 font-semibold text-lg">No orders found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-gray-200 bg-gray-50">
                                    <th className="text-left p-4 font-black text-gray-900">Customer</th>
                                    <th className="text-left p-4 font-black text-gray-900">Phone</th>
                                    <th className="text-left p-4 font-black text-gray-900">Items</th>
                                    <th className="text-right p-4 font-black text-gray-900">Amount</th>
                                    <th className="text-left p-4 font-black text-gray-900">Status</th>
                                    <th className="text-left p-4 font-black text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order) => (
                                    <tr 
                                        key={order._id}
                                        onClick={() => { setSelectedOrder(order); setShowOrderModal(true); }}
                                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-all"
                                    >
                                        <td className="p-4">
                                            <p className="font-black text-gray-900">{order.customerName}</p>
                                        </td>
                                        <td className="p-4">
                                            <a 
                                                href={`https://wa.me/${order.customerPhone}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-green-600 hover:underline font-bold"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {order.customerPhone}
                                            </a>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm text-gray-600 font-semibold">{order.items.length} item(s)</p>
                                        </td>
                                        <td className="p-4 text-right">
                                            <p className="font-black text-gray-900">₹{order.total}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-black ${
                                                order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                order.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' :
                                                order.status === 'Shipped' ? 'bg-purple-100 text-purple-700' :
                                                'bg-green-100 text-green-700'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                            <a 
                                                href={`https://wa.me/${order.customerPhone}?text=Hi ${order.customerName}, your order is ${order.status}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-green-600 hover:text-green-700 font-bold text-sm"
                                            >
                                                💬
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            {showOrderModal && selectedOrder && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
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
                                <div className="flex justify-between items-center">
                                    <p className="font-black text-gray-900">Total Amount:</p>
                                    <p className="text-3xl font-black text-green-600">₹{selectedOrder.total}</p>
                                </div>
                            </div>

                            {/* Action Button */}
                            <a 
                                href={`https://wa.me/${selectedOrder.customerPhone}?text=Hi ${selectedOrder.customerName}, Your order ID ${selectedOrder._id} - Amount: ₹${selectedOrder.total} - Status: ${selectedOrder.status}`}
                                target="_blank"
                                rel="noreferrer"
                                className="block w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-black transition-all duration-300 text-center"
                            >
                                💬 Message Customer on WhatsApp
                            </a>

                            <button 
                                onClick={() => setShowOrderModal(false)}
                                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-900 py-3 rounded-lg font-black transition-all duration-300"
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
