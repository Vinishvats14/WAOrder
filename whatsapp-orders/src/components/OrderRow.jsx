export default function OrderRow({ order }) {
    return (
        <tr className="border-b hover:bg-gray-50 transition">
            <td className="p-4">{new Date(order.createdAt).toLocaleDateString()}</td>
            <td className="p-4 font-medium">{order.customerName}</td>
            <td className="p-4">{order.items.length} Items</td>
            <td className="p-4 font-bold text-green-700">₹{order.total}</td>
            <td className="p-4">
                <span className={`px-2 py-1 rounded-full text-xs ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                    {order.status}
                </span>
            </td>
        </tr>
    );
}