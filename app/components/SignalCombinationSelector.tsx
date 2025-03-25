// components/SignalCombinationSelector.tsx
interface SignalCombinationSelectorProps {
  signalCombination: string;
  setSignalCombination: (value: string) => void;
}

export default function SignalCombinationSelector({
  signalCombination,
  setSignalCombination,
}: SignalCombinationSelectorProps) {
  const options = [
    { value: 'default', label: 'Default (2R - G - B)' },
    { value: 'redOnly', label: 'Red Only' },
    { value: 'greenOnly', label: 'Green Only' },
    { value: 'blueOnly', label: 'Blue Only' },
    { value: 'redMinusBlue', label: 'Red - Blue' },
    { value: 'custom', label: 'Custom (3R - G - B)' },
  ];

  return (
    <div className="mt-4">
      <label
        htmlFor="signal-combination"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Signal Combination
      </label>
      <select
        id="signal-combination"
        value={signalCombination}
        onChange={(e) => setSignalCombination(e.target.value)}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary dark:focus:ring-darkPrimary focus:border-primary dark:focus:border-darkPrimary sm:text-sm rounded-md bg-white dark:bg-darkForeground text-gray-900 dark:text-gray-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
