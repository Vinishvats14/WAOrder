import { useNavigate } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem('adminToken');
    const userInitial = localStorage.getItem('adminId')?.[0]?.toUpperCase() || 'V';

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('storeName');
        localStorage.removeItem('adminId');
        navigate('/login');
        window.location.reload();
    };

    return (
        <nav className="sticky top-0 z-40 bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 shadow-2xl">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                {/* Left: Logo */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-black text-lg">📦</span>
                    </div>
                    <div>
                        <h1 className="text-white font-black text-xl">SELLER</h1>
                        <p className="text-emerald-400 font-black text-xs">WAR-ROOM</p>
                    </div>
                </div>

                {/* Right: Actions */}
                {token && (
                    <div className="flex items-center gap-3">
                        {/* QR Code Button */}
                        <button 
                            onClick={() => navigate('/admin')}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-2 rounded-lg font-black text-sm hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                        >
                            🛒 SHOP QR
                        </button>

                        {/* Settings Button */}
                        <button 
                            onClick={() => navigate('/admin/settings')}
                            className="text-gray-300 hover:text-white p-2 rounded-lg transition-all duration-300 hover:bg-white/10"
                        >
                            ⚙️
                        </button>

                        {/* User Avatar */}
                        <button 
                            onClick={handleLogout}
                            className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center font-black text-lg hover:shadow-lg transition-all duration-300 hover:scale-110"
                            title="Click to logout"
                        >
                            {userInitial}
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}