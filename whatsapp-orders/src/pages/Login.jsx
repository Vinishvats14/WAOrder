import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axiosInstance.post('/auth/login', form);
            
            // --- SAAS LOGIC START ---
            // Token ke saath-saath humein seller ki details bhi save karni hain
            localStorage.setItem('adminToken', res.data.token);
            localStorage.setItem('userId', res.data.userId); // Dashboard isi se filtered data layega
            localStorage.setItem('storeName', res.data.storeName); // Custom branding ke liye
            localStorage.setItem('waNumber', res.data.whatsappNumber); 
            // --- SAAS LOGIC END ---

            navigate('/admin'); // Seedha "War-Room" mein entry
        } catch (err) {
            alert(err.response?.data?.msg || "Login Failed! Details check karo.");
        }
    };

    return (
        <div className="flex justify-center items-center h-[80vh] bg-gray-50">
            <div className="w-full max-w-md p-4">
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-2xl border-t-8 border-blue-600">
                    <h2 className="text-3xl font-black mb-2 text-center text-gray-800 italic uppercase">Seller Login</h2>
                    <p className="text-center text-gray-500 mb-8 text-sm font-medium tracking-tight">Apna dhanda manage karne ke liye sign in karein</p>
                    
                    <div className="space-y-4">
                        <input 
                            type="email" 
                            placeholder="Email Address" 
                            className="w-full border p-4 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none transition" 
                            onChange={e => setForm({...form, email: e.target.value})} 
                            required 
                        />
                        <input 
                            type="password" 
                            placeholder="Password" 
                            className="w-full border p-4 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none transition" 
                            onChange={e => setForm({...form, password: e.target.value})} 
                            required 
                        />
                    </div>

                    <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black mt-8 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95">
                        SIGN IN TO DASHBOARD 🚀
                    </button>

                    <p className="mt-6 text-center text-gray-600 text-sm">
                        Dukan nahi hai? <Link to="/register" className="text-blue-600 font-bold hover:underline">Register Karein 🔥</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}