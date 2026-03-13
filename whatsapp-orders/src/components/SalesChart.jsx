import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function SalesChart({ data }) {
    const chartData = {
        labels: Object.keys(data), // Days: Mon, Tue, etc.
        datasets: [
            {
                label: 'Daily Sales (₹)',
                data: Object.values(data),
                borderColor: '#3b82f6', // Blue color
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4, // Smooth curve
                pointRadius: 6,
                pointBackgroundColor: '#fff',
                borderWidth: 4,
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, grid: { display: false } },
            x: { grid: { display: false } }
        }
    };

    return <Line data={chartData} options={options} />;
}