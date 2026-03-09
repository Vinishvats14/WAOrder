import { Link } from 'react-router-dom';
// import { ShoppingBag } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-50">
            <Link to="/" className="text-xl font-bold text-green-600">WhatsApp Store</Link>
            <Link to="/admin" className="text-sm text-gray-500 hover:text-green-600">Admin Login</Link>
        </nav>
    );
}