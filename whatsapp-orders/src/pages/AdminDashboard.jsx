import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

export default function AdminDashboard() {
    const [orders, setOrders] = useState([]);
    const [newProd, setNewProd] = useState({ name: '', price: '', description: '' });
    const [imageFile, setImageFile] = useState(null); // File state

    useEffect(() => {
        axiosInstance.get('/orders').then(res => setOrders(res.data));
    }, []);

    const addProduct = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', newProd.name);
        formData.append('price', newProd.price);
        formData.append('description', newProd.description);
        formData.append('image', imageFile); // 'image' wahi name hona chahiye jo backend mein upload.single('image') hai

        try {
            await axiosInstance.post('/products', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Product Uploaded to Cloudinary! ✅");
            window.location.reload();
        } catch (err) {
            alert("Upload failed! Check console.");
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Seller Dashboard</h1>
            
            <form onSubmit={addProduct} className="bg-white p-6 rounded-xl shadow-md mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input type="text" placeholder="Name" required className="border p-2 rounded" 
                        onChange={e => setNewProd({...newProd, name: e.target.value})} />
                    <input type="number" placeholder="Price" required className="border p-2 rounded" 
                        onChange={e => setNewProd({...newProd, price: e.target.value})} />
                    
                    {/* File Input */}
                    <input type="file" accept="image/*" required className="text-sm"
                        onChange={e => setImageFile(e.target.files[0])} />
                    
                    <button type="submit" className="bg-green-600 text-white font-bold py-2 rounded">
                        Add with Photo
                    </button>
                </div>
            </form>
            {/* Orders list code remains same... */}
        </div>
    );
}