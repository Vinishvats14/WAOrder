import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Storefront from './pages/Storefront';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import { CartProvider } from './context/CartContext';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('adminToken');
    return token ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <CartProvider>
            <Router>
                <div className="min-h-screen bg-gray-50">
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<Storefront />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/admin" element={
                            <ProtectedRoute>
                                <AdminDashboard />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </div>
            </Router>
        </CartProvider>
    );
}

export default App;