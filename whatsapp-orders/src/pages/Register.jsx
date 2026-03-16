import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

export default function Register() {
    const [formData, setFormData] = useState({ 
        email: '', password: '', storeName: '', whatsappNumber: '' 
    });
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/auth/register', formData);
            alert("Registration successful! Please log in now.");
            navigate('/login');
        } catch (err) {
            alert(err.response?.data?.msg || "Error registering");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh] p-4">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100">
                <h2 className="text-3xl font-black mb-6 text-gray-800 italic">Start Your Store 🚀</h2>
                <form onSubmit={handleRegister} className="space-y-4">
                    <input type="email" placeholder="Email Address" className="w-full p-3 border rounded-xl"
                        onChange={e => setFormData({...formData, email: e.target.value})} required />
                    
                    <input type="password" placeholder="Password" className="w-full p-3 border rounded-xl"
                        onChange={e => setFormData({...formData, password: e.target.value})} required />
                    
                    <input type="text" placeholder="Dukan ka Naam (e.g. My Bakery)" className="w-full p-3 border rounded-xl"
                        onChange={e => setFormData({...formData, storeName: e.target.value})} required />
                    
                    <input type="text" placeholder="WhatsApp Number (With Country Code)" className="w-full p-3 border rounded-xl"
                        onChange={e => setFormData({...formData, whatsappNumber: e.target.value})} required />
                    
                    <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition">
                        Create My Online Store 🔥
                    </button>
                </form>
            </div>
        </div>
    );
}