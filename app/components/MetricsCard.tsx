interface MetricsCardProps {
  title: string;
  value: number | string | { bpm?: number; sdnn?: number }; // Support for structured types
  unit?: string;
  confidence?: number; // Optional confidence for cases where it's not needed
}

export default function MetricsCard({
  title,
  value,
  unit,
  confidence,
}: MetricsCardProps) {
  return (
    <div className="bg-white dark:bg-darkForeground p-4 rounded-lg shadow-card flex-1 min-w-[150px]">
      <p className="text-gray-500 dark:text-gray-400">{title}</p>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {typeof value === 'number' && value > 0
          ? `${value} ${unit || ''}` // Display numeric values with optional units
          : typeof value === 'object' && value !== null
            ? value.bpm !== undefined
              ? `${value.bpm} BPM` // Handle HeartRateResult
              : value.sdnn !== undefined
                ? isNaN(value.sdnn)
                  ? '--' // Handle NaN for HRV
                  : `${value.sdnn} ms` // Handle HRVResult
                : '--'
            : '--'}{' '}
        {/* Fallback for undefined or invalid values */}
      </h2>
      {confidence !== undefined && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Confidence: {confidence.toFixed(1)}%
        </p>
      )}
    </div>
  );
}
