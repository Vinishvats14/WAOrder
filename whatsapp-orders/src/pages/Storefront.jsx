import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';

export default function Storefront() {
    const [products, setProducts] = useState([]);
    const { cart, totalAmount, clearCart } = useCart();
    const [customer, setCustomer] = useState({ name: '', address: '' });

    useEffect(() => {
        axiosInstance.get('/products').then(res => setProducts(res.data));
    }, []);

    const handleOrder = async () => {
    if (!customer.name || !customer.address) return alert("Please fill details!");

    // 1. APNA REAL NUMBER DALO (Bina + aur bina space ke)
    // Example: "919876543210"
    const myWhatsAppNumber = "+91 8700369451"; 

    const orderData = {
        customerName: customer.name,
        address: customer.address,
        items: cart,
        total: totalAmount
    };

    try {
        // Database mein save karein
        await axiosInstance.post('/orders', orderData);

        // 2. Message formatting
        const itemsList = cart.map(item => `- ${item.name} (₹${item.price})`).join('\n');
        const message = `*Naya Order!* 🛍️\n\n*Naam:* ${customer.name}\n*Address:* ${customer.address}\n\n*Items:*\n${itemsList}\n\n*Total:* ₹${totalAmount}`;
        
        // 3. Sabse Zaroori: Universal Link jo Business WA par bhi chale
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${myWhatsAppNumber}&text=${encodedMessage}`;
        
        clearCart();
        
        // 4. Mobile browsers ke liye location.href sabse best hai
        window.location.href = whatsappUrl;

    } catch (err) {
        console.error(err);
        alert("Order save nahi ho paya!");
    }
};

    return (
        <div className="max-w-6xl mx-auto p-4 grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <h2 className="text-2xl font-bold mb-6 italic text-gray-800">Hamara Catalog</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {products.map(p => <ProductCard key={p._id} product={p} />)}
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xl h-fit sticky top-24">
                <h2 className="text-xl font-bold mb-4 border-b pb-2">Aapka Cart 🛒</h2>
                {cart.length === 0 ? <p className="text-gray-400">Kuch add karein...</p> : (
                    <>
                        {cart.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm mb-2">
                                <span>{item.name}</span>
                                <span>₹{item.price}</span>
                            </div>
                        ))}
                        <div className="border-t mt-4 pt-2 font-bold flex justify-between">
                            <span>Total:</span>
                            <span className="text-green-600">₹{totalAmount}</span>
                        </div>
                        <input type="text" placeholder="Naam" className="w-full border p-2 mt-4 rounded" 
                            onChange={e => setCustomer({...customer, name: e.target.value})} />
                        <textarea placeholder="Pura Address" className="w-full border p-2 mt-2 rounded" 
                            onChange={e => setCustomer({...customer, address: e.target.value})} />
                        <button onClick={handleOrder} className="w-full bg-green-500 text-white py-3 rounded-xl mt-4 font-bold hover:bg-green-600">
                            Confirm Order
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
