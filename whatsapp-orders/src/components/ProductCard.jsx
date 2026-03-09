import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
    const { addToCart } = useCart();
    return (
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <img src={product.image || 'https://via.placeholder.com/150'} alt={product.name} className="w-full h-40 object-cover" />
            <div className="p-4">
                <h3 className="font-bold text-lg">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                <div className="flex justify-between items-center">
                    <span className="text-green-600 font-bold">₹{product.price}</span>
                    <button 
                        onClick={() => addToCart(product)}
                        className="bg-green-500 text-white px-4 py-1 rounded-full text-sm hover:bg-green-600"
                    >
                        Add +
                    </button>
                </div>
            </div>
        </div>
    );
}