import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axiosInstance.post('/auth/login', form);
            localStorage.setItem('adminToken', res.data.token);
            navigate('/admin');
        } catch (err) {
            alert("Login Failed!");
        }
    };

    return (
        <div className="flex justify-center items-center h-[80vh]">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-2xl w-96 border-t-8 border-green-500">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">Admin Portal</h2>
                <input type="email" placeholder="Email" className="w-full border p-3 mb-4 rounded-lg" 
                    onChange={e => setForm({...form, email: e.target.value})} required />
                <input type="password" placeholder="Password" className="w-full border p-3 mb-6 rounded-lg" 
                    onChange={e => setForm({...form, password: e.target.value})} required />
                <button className="w-full bg-gray-800 text-white py-3 rounded-lg font-bold hover:bg-black transition">
                    Sign In
                </button>
            </form>
        </div>
    );
}