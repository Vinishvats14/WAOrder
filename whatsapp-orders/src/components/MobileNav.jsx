import { Link, useLocation } from 'react-router-dom';

export default function MobileNav() {
    const location = useLocation();
    
    // Sirf Admin paths par dikhao
    if (!location.pathname.startsWith('/admin')) return null;

    return (
        <div className="md:hidden fixed bottom-6 left-6 right-6 bg-black/90 backdrop-blur-lg text-white rounded-[2.5rem] p-4 flex justify-around items-center shadow-2xl z-50 border border-white/10">
            <Link to="/admin" className="flex flex-col items-center gap-1">
                <span className="text-xl">📊</span>
                <span className="text-[10px] font-bold uppercase">Stats</span>
            </Link>
            <Link to="/admin/settings" className="flex flex-col items-center gap-1">
                <span className="text-xl">⚙️</span>
                <span className="text-[10px] font-bold uppercase">Setup</span>
            </Link>
            <button onClick={() => window.location.reload()} className="bg-green-500 p-3 rounded-full -mt-12 shadow-xl border-4 border-white">
                <span className="text-xl text-white">🔄</span>
            </button>
        </div>
    );
}