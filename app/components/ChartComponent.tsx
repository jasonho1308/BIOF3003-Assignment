// components/ChartComponent.tsx
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ChartComponentProps {
  ppgData: number[];
  valleys: { index: number; value: number }[];
}

export default function ChartComponent({
  ppgData,
  valleys,
}: ChartComponentProps) {
  const chartData = {
    labels: Array.from({ length: ppgData.length }, (_, i) => i.toString()),
    datasets: [
      {
        label: 'PPG Signal',
        data: ppgData,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.4,
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        pointRadius: 0,
      },
      {
        label: 'Valleys',
        data: ppgData.map(
          (_, i) => valleys.find((v) => v.index === i)?.value || null
        ),
        pointBackgroundColor: 'red',
        pointRadius: 3,
        showLine: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: document.documentElement.classList.contains('dark')
            ? 'rgba(255, 255, 255, 0.1)' // Light grid lines for dark mode
            : 'rgba(0, 0, 0, 0.1)', // Dark grid lines for light mode
        },
        ticks: {
          color: document.documentElement.classList.contains('dark')
            ? 'rgba(255, 255, 255, 0.9)' // Light tick labels for dark mode
            : 'rgba(0, 0, 0, 0.9)', // Dark tick labels for light mode
        },
      },
      x: {
        grid: {
          color: document.documentElement.classList.contains('dark')
            ? 'rgba(255, 255, 255, 0.1)' // Light grid lines for dark mode
            : 'rgba(0, 0, 0, 0.1)', // Dark grid lines for light mode
        },
        ticks: {
          color: document.documentElement.classList.contains('dark')
            ? 'rgba(255, 255, 255, 0.9)' // Light tick labels for dark mode
            : 'rgba(0, 0, 0, 0.9)', // Dark tick labels for light mode
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: document.documentElement.classList.contains('dark')
            ? 'rgba(255, 255, 255, 0.9)' // Light legend labels for dark mode
            : 'rgba(0, 0, 0, 0.9)', // Dark legend labels for light mode
        },
      },
      title: {
        display: false, // Disable the title
      },
    },
    animation: {
      duration: 0, // Disable animation for better performance
    },
  };

  return (
    <div className="bg-white dark:bg-darkForeground p-4 rounded-lg shadow-card h-72"> {/* Match height with the camera feed */}
      <h2 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">PPG Signal</h2>
      <div className="h-full">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
