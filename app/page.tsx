// app/page.tsx
'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import CameraFeed from './components/CameraFeed';
import MetricsCard from './components/MetricsCard';
import SignalCombinationSelector from './components/SignalCombinationSelector';
import ChartComponent from './components/ChartComponent';
import PastData from './components/PastData';
import usePPGProcessing from './hooks/usePPGProcessing';
import useSignalQuality from './hooks/useSignalQuality';

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [signalCombination, setSignalCombination] = useState('default');
  const [showConfig, setShowConfig] = useState(false);
  const [currentSubject, setCurrentSubject] = useState('');
  const [confirmedSubject, setConfirmedSubject] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

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
        processFrame();
        animationFrame = requestAnimationFrame(processFrameLoop);
      }
    };
    if (isRecording) {
      processFrameLoop();
    }
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isRecording]);

  const [lastAccess, setLastAccess] = useState<Date | null>(null);
  const [historicalData, setHistoricalData] = useState({
    avgHeartRate: 0,
    avgHRV: 0,
  });

  const [loading, setIsLoading] = useState(false);

  const fetchLastAccess = async (subjectId: string) => {
    if (subjectId) {
      try {
        const response = await fetch(`/api/last-access?subjectId=${subjectId}`);
        const result = await response.json();
        if (result.success) {
          setLastAccess(new Date(result.lastAccess));
          const historialData = await fetch(`/api/save-record?subjectId=${subjectId}`);
          const historicalResult = await historialData.json();
          setHistoricalData({
            avgHeartRate: historicalResult.avgHeartRate || 0,
            avgHRV: historicalResult.avgHRV || 0,
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
    if (isUploading) return;

    setIsUploading(true);
    if (ppgData.length === 0) {
      console.warn('No PPG data to send to MongoDB');
      return;
    }
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
      setIsUploading(false);
    }
  }, [isUploading, ppgData, heartRate, hrv, confirmedSubject]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (ppgData.length > 0) {
      intervalId = setInterval(() => {
        pushDataToMongo();
      }, 10000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [ppgData, pushDataToMongo]);

  const confirmUser = () => {
    setIsLoading(true);
    const subjectId = currentSubject.trim();
    if (subjectId) {
      if (subjectId === confirmedSubject) {
        // Refresh data if the subjectId didn't change
        fetchLastAccess(subjectId);
      } else {
        setConfirmedSubject(subjectId);
        fetchLastAccess(subjectId);
      }
    } else {
      alert('Please enter a valid Subject ID.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-neutral dark:bg-darkBackground min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col items-center justify-center w-full max-w-5xl mb-6 bg-white dark:bg-darkForeground shadow-card p-6 rounded-lg space-y-6 md:space-y-0 md:flex-row md:justify-between">
        {/* Title with Icon */}
        <div className="flex items-center space-x-3">
          <div className="w-14 h-14 bg-primary dark:bg-darkPrimary rounded-full flex items-center justify-center border-4 border-primary dark:border-darkPrimary">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <Image
                src="/favicon.ico"
                alt="Heart Lens Icon"
                width={32}
                height={32}
                className="w-8 h-8"
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-primary dark:text-darkPrimary text-center md:text-left">
            Heart Lens
          </h1>
        </div>
        {/* Subject Input and Confirmation */}
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
          <input
            type="text"
            value={currentSubject}
            onChange={(e) => {
              const value = e.target.value;
              setCurrentSubject(value);
            }}
            placeholder="Enter Subject ID"
            className="w-full md:w-48 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-neutral dark:bg-darkBackground text-gray-900 dark:text-gray-100 h-12"
          />
          <button
            onClick={confirmUser}
            className="bg-primary dark:bg-darkPrimary text-white px-4 py-2 rounded-md text-lg h-12 flex items-center justify-center w-full md:w-auto"
            disabled={loading}
          >
            {loading ? 'Loading...' : currentSubject && currentSubject.trim() === confirmedSubject ? 'Refresh' : 'Confirm User'}
          </button>
        </div>

        {/* Recording Button */}
        <div className="flex justify-center md:justify-end w-full md:w-auto">
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`p-3 rounded-lg text-sm transition-all duration-300 w-full md:w-auto ${isRecording
              ? 'bg-danger dark:bg-darkDanger hover:bg-red-600 dark:hover:bg-red-700 text-white'
              : 'bg-primary dark:bg-darkPrimary hover:bg-cyan-600 dark:hover:bg-cyan-700 text-white'
              }`}
          >
            {isRecording ? '⏹ STOP' : '⏺ START'} RECORDING
          </button>
        </div>
      </div>

      {/* Main Grid: Camera, Chart, and Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 w-full max-w-5xl">
        {/* Left Column: Camera Feed and Real-Time Metrics */}
        <div className="flex flex-col gap-6">
          {/* Camera Feed */}
          <div className="bg-white dark:bg-darkForeground shadow-card p-4 rounded-lg">
            <div className="h-[200px] md:h-[300px] overflow-hidden">
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

          {/* Real-Time Metrics */}
          <div className="bg-white dark:bg-darkForeground shadow-card p-4 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-2 gap-4">
              <MetricsCard
                title="HEART RATE"
                value={heartRate || {}}
                confidence={heartRate?.confidence || 0}
              />
              <MetricsCard
                title="HRV"
                value={hrv || {}}
                confidence={hrv?.confidence || 0}
              />
              <MetricsCard
                title="SIGNAL QUALITY"
                value={signalQuality || '--'}
                confidence={qualityConfidence || 0}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Chart and Past Data */}
        <div className="flex flex-col gap-6">
          {/* Chart */}
          <div className="bg-white dark:bg-darkForeground shadow-card p-4 rounded-lg">
            <ChartComponent ppgData={ppgData} valleys={valleys} />
            <button
              onClick={pushDataToMongo}
              className="mt-4 w-full px-4 py-2 bg-secondary dark:bg-darkSecondary text-white rounded hover:bg-green-600 dark:hover:bg-green-700"
            >
              Save Data to MongoDB
            </button>
          </div>

          {/* Past Data */}
          <PastData
            loading={loading}
            confirmedSubject={confirmedSubject}
            lastAccess={lastAccess}
            historicalData={historicalData}
          />
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