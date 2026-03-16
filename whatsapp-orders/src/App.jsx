import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Storefront from './pages/Storefront';
import AdminDashboard from './pages/AdminDashboard';
import Settings from './pages/Settings'; // Isko import karna mat bhulna
import Customers from './pages/Customers'; // <--- Customers page import
import Login from './pages/Login';
import Register from './pages/Register';
import { CartProvider } from './context/CartContext';
import LandingPage from './pages/LandingPage'; // <--- Pehle ye import kar
import MobileNav from './components/MobileNav';
// Protected Route Logic
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('adminToken');
    return token ? children : <Navigate to="/login" />;
};

// Ek chota component Navbar ko handle karne ke liye
const NavigationWrapper = () => {
    const location = useLocation();
    // Agar URL me '/admin' ya '/:' (shop) hai to main navbar mat dikhao
    const isAdminPath = location.pathname.startsWith('/admin');
    const isLoginOrRegister = location.pathname === '/login' || location.pathname === '/register';
    
    // Sirf Landing page par ya public areas me Navbar dikhao
    if (isAdminPath || isLoginOrRegister) return null;
    return <Navbar />;
};

function App() {
    return (
        <CartProvider>
            <Router>
                <div className="min-h-screen bg-white"> {/* Landing page ke liye bg-white zyada sahi hai */}
                    <NavigationWrapper /> 
                    <MobileNav />
                    <Routes>
                        {/* 1. Naya Landing Page Yahan Set Karo */}
                        <Route path="/" element={<LandingPage />} />

                        {/* 2. Dynamic Shop Route */}
                        <Route path="/:shopName" element={<Storefront />} />

                        {/* 3. Auth Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* 4. Admin Routes */}
                        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                        <Route path="/admin/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
                        <Route path="/admin/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    </Routes>
                </div>
            </Router>
        </CartProvider>
    );
}

export default App;