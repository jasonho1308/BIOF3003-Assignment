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
  isDarkMode: boolean; // Added isDarkMode prop
}

export default function ChartComponent({
  ppgData,
  valleys,
  isDarkMode,
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
          color: isDarkMode
            ? 'rgba(255, 255, 255, 0.1)' // Light grid lines for dark mode
            : 'rgba(0, 0, 0, 0.1)', // Dark grid lines for light mode
        },
        ticks: {
          color: isDarkMode
            ? 'rgba(255, 255, 255, 0.9)' // Adjusted to slightly off-white for better visibility in dark mode
            : 'rgba(33, 33, 33, 1)' // Darker gray for better visibility in light mode
        },
      },
      x: {
        grid: {
          color: isDarkMode
            ? 'rgba(255, 255, 255, 0.1)' // Light grid lines for dark mode
            : 'rgba(0, 0, 0, 0.1)', // Dark grid lines for light mode
        },
        ticks: {
          color: isDarkMode
            ? 'rgba(255, 255, 255, 0.9)' // Adjusted to slightly off-white for better visibility in dark mode
            : 'rgba(33, 33, 33, 1)' // Darker gray for better visibility in light mode
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: isDarkMode
            ? 'rgba(255, 255, 255, 0.9)' // Adjusted to slightly off-white for better visibility in dark mode
            : 'rgba(33, 33, 33, 1)' // Darker gray for better visibility in light mode
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
