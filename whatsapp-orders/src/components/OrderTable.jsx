import React from 'react';
import axiosInstance from '../api/axiosInstance';
import { generateInvoice } from '../utils/generateInvoice';

export default function OrderTable({ orders, refreshOrders }) {
    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await axiosInstance.patch(`/orders/${orderId}/status`, { status: newStatus });
            refreshOrders(); // Data refresh karo
        } catch (err) {
            alert("Status update fail!");
        }
    };
    const sendWhatsAppReminder = (phone, name) => {
        // Phone number se '+' ya spaces hatane ke liye (safety ke liye)
        const cleanPhone = phone.replace(/\D/g, '');
        const msg = encodeURIComponent(`Hi ${name}, aapka bill generate ho gaya hai. Main aapko PDF bhej raha hoon.`);
        window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
    };

    return (
        <div className="overflow-x-auto bg-white rounded-[2rem] shadow-xl border border-gray-100 p-6">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="text-gray-400 text-[10px] uppercase tracking-widest border-b">
                        <th className="p-4 font-black">Customer</th>
                        <th className="p-4 font-black">Items</th>
                        <th className="p-4 font-black">Total</th>
                        <th className="p-4 font-black">Status</th>
                        <th className="p-4 font-black">Action</th>
                    </tr>
                </thead>
                <tbody className="text-sm font-bold text-gray-700">
                    {orders.map((order) => (
                        <tr key={order._id} className="border-b hover:bg-gray-50 transition-all">
                            <td className="p-4 flex items-center gap-2">
                                {/* 1. Download Bill Button */}
                                <button
                                    onClick={() => generateInvoice(order, localStorage.getItem('storeName'))}
                                    className="bg-blue-500 text-white px-3 py-2 rounded-xl text-[10px] font-bold hover:bg-blue-600 transition"
                                >
                                    Download Bill 📄
                                </button>

                                {/* 2. WhatsApp Message Button (YE ABHI WALA) */}
                                <button
                                    onClick={() => sendWhatsAppReminder(order.customerPhone, order.customerName)}
                                    title="Send Bill on WhatsApp"
                                    className="p-2 bg-green-50 text-green-500 rounded-xl hover:bg-green-100 transition text-lg border border-green-100"
                                >
                                    💬
                                </button>
                            </td>
                            <td className="p-4">
                                <p>{order.customerName}</p>
                                <p className="text-[10px] text-gray-400 italic">{order.customerPhone}</p>
                            </td>
                            <td className="p-4">
                                {order.items.map(i => i.name).join(', ')}
                            </td>
                            <td className="p-4 text-green-600">₹{order.total}</td>
                            <td className="p-4">
                                <span className={`px-3 py-1 rounded-full text-[10px] ${order.status === 'Delivered' ? 'bg-green-100 text-green-600' :
                                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                                    }`}>
                                    {order.status}
                                </span>
                            </td>
                            <td className="p-4">
                                <select
                                    value={order.status}
                                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                    className="bg-gray-100 p-2 rounded-xl text-[10px] outline-none border-none"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}