import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Storefront from './pages/Storefront';
import AdminDashboard from './pages/AdminDashboard';
import Settings from './pages/Settings';
import Customers from './pages/Customers';
import Login from './pages/Login';
import Register from './pages/Register';
import { CartProvider } from './context/CartContext';
import LandingPage from './pages/LandingPage';
import MobileNav from './components/MobileNav';
// Protected Route Logic
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('adminToken');
    return token ? children : <Navigate to="/login" />;
};

// Navigation wrapper component to manage navbar visibility
const NavigationWrapper = () => {
    const location = useLocation();
    // Hide navbar on admin and auth routes
    const isAdminPath = location.pathname.startsWith('/admin');
    const isLoginOrRegister = location.pathname === '/login' || location.pathname === '/register';
    
    // Show navbar only on landing page and public areas
    if (isAdminPath || isLoginOrRegister) return null;
    return <Navbar />;
};

function App() {
    return (
        <CartProvider>
            <Router>
                <div className="min-h-screen bg-white">
                    <NavigationWrapper /> 
                    <MobileNav />
                    <Routes>
                        {/* Landing Page */}
                        <Route path="/" element={<LandingPage />} />

                        {/* Dynamic Shop Route */}
                        <Route path="/:shopName" element={<Storefront />} />

                        {/* Auth Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Admin Routes */}
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