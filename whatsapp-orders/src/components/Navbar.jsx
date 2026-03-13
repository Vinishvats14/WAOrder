import { useNavigate } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem('adminToken');

    const handleLogout = () => {
        // 1. Sab kuch saaf kar do
        localStorage.removeItem('adminToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('storeName');
        
        // 2. Login page par fenk do
        navigate('/login');
        
        // 3. Page refresh (Optional, for clean state)
        window.location.reload();
    };

    return (
        <nav className="flex justify-between p-4 bg-white shadow-sm">
            <h1 className="font-bold text-green-600">WhatsApp Store</h1>
            <div>
                {token ? (
                    <button 
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-1 rounded-lg text-sm font-bold"
                    >
                        Logout 🚪
                    </button>
                ) : (
                    <button onClick={() => navigate('/login')} className="text-gray-600 font-bold">Admin Login</button>
                )}
            </div>
        </nav>
    );
}