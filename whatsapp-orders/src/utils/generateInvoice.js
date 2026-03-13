import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Direct import karo

export const generateInvoice = (order, storeName) => {
    const doc = jsPDF();

    // Store Header
    doc.setFontSize(20);
    doc.text(storeName.toUpperCase(), 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text("INVOICE / BILL", 105, 30, { align: 'center' });

    // Customer Info
    doc.text(`Bill To: ${order.customerName}`, 14, 45);
    doc.text(`Phone: ${order.customerPhone}`, 14, 52);
    doc.text(`Address: ${order.address}`, 14, 59);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 150, 45);

    // Items Table Logic
    const tableRows = order.items.map(item => [
        item.name,
        `Rs. ${item.price}`,
        "1",
        `Rs. ${item.price}`
    ]);

    // 🔥 CHANGE HERE: doc.autoTable ki jagah seedha autoTable function use karo
    autoTable(doc, {
        startY: 70,
        head: [['Product', 'Price', 'Qty', 'Subtotal']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [34, 197, 94] }
    });

    // Total Calculation
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text(`Grand Total: Rs. ${order.total}`, 140, finalY);

    // Save PDF
    doc.save(`Invoice_${order.customerName}.pdf`);
};