// app/page.tsx
'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import CameraFeed from './components/CameraFeed';
import MetricsCard from './components/MetricsCard';
import SignalCombinationSelector from './components/SignalCombinationSelector';
import ChartComponent from './components/ChartComponent';
import usePPGProcessing from './hooks/usePPGProcessing';
import useSignalQuality from './hooks/useSignalQuality';

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [isSampling, setIsSampling] = useState(false); // New state for sampling
  const [isUploading, setIsUploading] = useState(false);
  const [signalCombination, setSignalCombination] = useState('default');
  const [showConfig, setShowConfig] = useState(false);
  const [currentSubject, setCurrentSubject] = useState('');
  const [confirmedSubject, setConfirmedSubject] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  // Define refs for video and canvas
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const {
    ppgData,
    valleys,
    heartRate,
    hrv,
    processFrame,
    startCamera,
    stopCamera,
  } = usePPGProcessing(isRecording, signalCombination, videoRef, canvasRef);

  const { signalQuality, qualityConfidence } = useSignalQuality(ppgData);

  // Start or stop recording
  useEffect(() => {
    if (isRecording) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isRecording]);

  useEffect(() => {
    let animationFrame: number;
    const processFrameLoop = () => {
      if (isRecording) {
        processFrame(); // Call the frame processing function
        animationFrame = requestAnimationFrame(processFrameLoop);
      }
    };
    if (isRecording) {
      processFrameLoop();
    }
    return () => {
      cancelAnimationFrame(animationFrame); // Clean up animation frame on unmount
    };
  }, [isRecording]);

  // Get the last access time and historical data
  const [lastAccess, setLastAccess] = useState<Date | null>(null);
  const [historicalData, setHistoricalData] = useState({
    avgHeartRate: 0,
    avgHRV: 0,
  });

  // Loading state for fetching last access
  const [loading, setIsLoading] = useState(false);

  const fetchLastAccess = async (subjectId: string) => {
    if (subjectId) {
      try {
        const response = await fetch(`/api/last-access?subjectId=${subjectId}`);
        const result = await response.json();
        if (result.success) {
          setLastAccess(new Date(result.lastAccess));
          setHistoricalData({
            avgHeartRate: result.avgHeartRate || 0,
            avgHRV: result.avgHRV || 0,
          });

        } else if (result.error == 'No records found') {
          setLastAccess(null);
          setHistoricalData({
            avgHeartRate: 0,
            avgHRV: 0,
          });
          console.log('Failed to fetch last access:', result.error);
        } else {
          setLastAccess(null);
          setHistoricalData({
            avgHeartRate: 0,
            avgHRV: 0,
          });
          console.error('Failed to fetch last access:', result.error);
        }
      } catch (error) {
        console.error('Error fetching last access:', error);
      }
    }
    setIsLoading(false);
  };

  const pushDataToMongo = useCallback(async () => {
    if (isUploading) return; // Prevent overlapping calls

    setIsUploading(true); // Lock the function
    if (ppgData.length === 0) {
      console.warn('No PPG data to send to MongoDB');
      return;
    }
    // Prepare the record data – adjust or add additional fields as needed
    const recordData = {
      subjectId: confirmedSubject || 'unknown',
      heartRate: {
        bpm: isNaN(heartRate.bpm) ? 0 : heartRate.bpm,
        confidence: hrv.confidence || 0,
      },
      hrv: {
        sdnn: isNaN(hrv.sdnn) ? 0 : hrv.sdnn,
        confidence: hrv.confidence || 0,
      },
      ppgData: ppgData,
      timestamp: new Date(),
    };

    try {
      const payload = { ...recordData, subjectId: confirmedSubject || 'unknown' };
      // Make a POST request to your backend endpoint that handles saving to MongoDB
      const response = await fetch('/api/save-record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        console.log('✅ Data successfully saved to MongoDB:', result.data);
      } else {
        console.error('❌ Upload failed:', result.error);
      }
    } catch (error: any) {
      console.error('🚨 Network error - failed to save data:', error);
    } finally {
      setIsUploading(false); // Unlock the function
    }
  }, [isUploading, ppgData, heartRate, hrv, confirmedSubject]);

  // Automatically send data every 10 seconds
  // Automatically send data every second when sampling is enabled
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isSampling && ppgData.length > 0) {
      intervalId = setInterval(() => {
        pushDataToMongo();
      }, 10000); // Send data every second
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isSampling, ppgData, pushDataToMongo]);


  // Confirm User Function
  const confirmUser = () => {
    setIsLoading(true);
    const subjectId = currentSubject.trim();
    if (subjectId) {
      setConfirmedSubject(subjectId);
      fetchLastAccess(subjectId);
    } else {
      alert('Please enter a valid Subject ID.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-neutral dark:bg-darkBackground min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-5xl mb-6 bg-white dark:bg-darkForeground shadow-card p-4 rounded-lg">
        {/* Title */}
        <h1 className="text-4xl font-bold text-primary dark:text-darkPrimary">HeartLen</h1>
        {/* Subject Input and Confirmation */}
        <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4 mt-4 md:mt-0 w-full md:w-auto">
          <input
            type="text"
            value={currentSubject}
            onChange={(e) => {
              const value = e.target.value;
              setCurrentSubject(value);
            }}
            placeholder="Enter Subject ID"
            className="w-48 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-neutral dark:bg-darkBackground text-gray-900 dark:text-gray-100 h-12" // Match height
          />
          <button
            onClick={confirmUser}
            className="bg-primary dark:bg-darkPrimary text-white px-4 py-2 rounded-md text-lg h-12 flex items-center justify-center" // Ensure consistent height
            disabled={loading} // Disable when loading
          >
            {loading ? 'Loading...' : 'Confirm User'}
          </button>
        </div>
        {/* Buttons */}
        <div className="flex space-x-4 mt-4 md:mt-0">
          {/* Recording Button */}
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`p-3 rounded-lg text-sm transition-all duration-300 ${isRecording
              ? 'bg-danger dark:bg-darkDanger hover:bg-red-600 dark:hover:bg-red-700 text-white'
              : 'bg-primary dark:bg-darkPrimary hover:bg-cyan-600 dark:hover:bg-cyan-700 text-white'
              }`}
          >
            {isRecording ? '⏹ STOP' : '⏺ START'} RECORDING
          </button>
        </div>
      </div>

      {/* Main Grid: Camera, Chart, and Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
        {/* Left Column: Camera Feed and Last Access */}
        <div className="flex flex-col gap-6">
          {/* Camera Feed */}
          <div className="bg-white dark:bg-darkForeground shadow-card p-4 rounded-lg h-auto flex flex-col justify-between">
            <div className="flex-1">
              <CameraFeed videoRef={videoRef} canvasRef={canvasRef} />
            </div>
            <div className="mt-4">
              <button
                onClick={() => setShowConfig((prev) => !prev)}
                className="px-4 py-2 bg-primary dark:bg-darkPrimary text-white rounded hover:bg-cyan-600 dark:hover:bg-cyan-700 w-full"
              >
                Toggle Config
              </button>
              {showConfig && (
                <SignalCombinationSelector
                  signalCombination={signalCombination}
                  setSignalCombination={setSignalCombination}
                />
              )}
            </div>
          </div>

          {/* Last Access and Historical Data */}
          <div className="bg-white dark:bg-darkForeground shadow-card p-4 rounded-lg h-auto">
            {loading ? (
              <div className="text-gray-500 dark:text-gray-400 text-lg items-center">Loading...</div>
            ) : confirmedSubject && (
              lastAccess ? (
                <div className="text-gray-700 dark:text-gray-300 text-lg">
                  <p><strong>Subject Id:</strong> {confirmedSubject}</p>
                  <p><strong>Last Access:</strong> {lastAccess.toLocaleString()}</p>
                  <p><strong>Avg Heart Rate:</strong> {historicalData.avgHeartRate} BPM</p>
                  <p><strong>Avg HRV:</strong> {historicalData.avgHRV} ms</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-lg">No previous records found for Subject Id: {confirmedSubject}</p>
              )
            )}
          </div>
        </div>

        {/* Right Column: Chart and Real-Time Metrics */}
        <div className="flex flex-col gap-6">
          {/* Chart */}
          <div className="bg-white dark:bg-darkForeground shadow-card p-4 rounded-lg h-auto">
            <ChartComponent ppgData={ppgData} valleys={valleys} />
            <button
              onClick={pushDataToMongo}
              className="mt-4 w-full px-4 py-2 bg-secondary dark:bg-darkSecondary text-white rounded hover:bg-green-600 dark:hover:bg-green-700"
            >
              Save Data to MongoDB
            </button>
          </div>

          {/* Real-Time Metrics */}
          <div className="bg-white dark:bg-darkForeground shadow-card p-4 rounded-lg flex flex-col h-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MetricsCard
                title="HEART RATE"
                value={heartRate || {}} // Pass the HeartRateResult object
                confidence={heartRate?.confidence || 0}
              />
              <MetricsCard
                title="HRV"
                value={hrv || {}} // Pass the HRVResult object
                confidence={hrv?.confidence || 0}
              />
              <MetricsCard
                title="SIGNAL QUALITY"
                value={signalQuality || '--'} // String value for signal quality
                confidence={qualityConfidence || 0}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Dark Mode Toggle Button */}
      <button
        onClick={toggleDarkMode}
        className="fixed bottom-4 right-4 p-3 rounded-full bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-400 dark:hover:bg-gray-600 shadow-lg transition-all duration-300"
      >
        {isDarkMode ? '☀️' : '🌙'}
      </button>
    </div>
  );
}
