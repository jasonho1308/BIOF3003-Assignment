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


  const fetchLastAccess = async () => {
    if (confirmedSubject) {
      try {
        const response = await fetch(`/api/last-access?subjectId=${confirmedSubject}`);
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


  useEffect(() => {
    fetchLastAccess();
    return;
  }, [confirmedSubject]);


  // Confirm User Function
  const confirmUser = () => {
    console.log('Confirming user:', currentSubject);
    setIsLoading(true)
    if (currentSubject.trim()) {
      setConfirmedSubject(currentSubject.trim());
    } else {
      alert('Please enter a valid Subject ID.');
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-4xl mb-4">
        {/* Title */}
        <h1 className="text-3xl font-bold">HeartLen</h1>
        {/* Recording Button */}
        <button
          onClick={() => setIsRecording(!isRecording)}
          className={`p-3 rounded-lg text-sm transition-all duration-300 ${isRecording
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-cyan-500 hover:bg-cyan-600 text-white'
            }`}
        >
          {isRecording ? '⏹ STOP' : '⏺ START'} RECORDING
        </button>
        {/* Sampling Button */}
        <button
          onClick={() => setIsSampling(!isSampling)}
          className={`p-3 rounded-lg text-sm transition-all duration-300 ml-2 ${isSampling
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : 'bg-gray-500 hover:bg-gray-600 text-white'
            }`}
          disabled={!isRecording} // Enable only when recording is active
        >
          {isSampling ? '⏹ STOP SAMPLING' : '⏺ START SAMPLING'}
        </button>
      </div>

      {/* Main Grid: Camera and Chart Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
        {/* Left Column: Camera Feed */}
        <div className="space-y-4">
          {/* Camera Feed */}
          <CameraFeed videoRef={videoRef} canvasRef={canvasRef} />
          {/* Signal Combination Selector */}
          <button
            onClick={() => setShowConfig((prev) => !prev)}
            className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 w-full"
          >
            Toggle Config
          </button>
          {showConfig && (
            <SignalCombinationSelector
              signalCombination={signalCombination}
              setSignalCombination={setSignalCombination}
            />
          )}
          <div>
            {/* Input Field */}
            <input
              type="text"
              value={currentSubject}
              onChange={(e) =>
                setCurrentSubject(e.target.value)
              }
              placeholder="Enter Subject ID"
              className="border border-gray-300 rounded-md p-2"
            />
            {/* Confirm Button */}
            <button
              onClick={confirmUser}
              className="bg-cyan-500 text-white px-4 py-2 rounded-md ml-2"
              disabled={loading} // Disable when loading
            >
              {loading ? 'Loading...' : 'Confirm User'}
            </button>
          </div>
          <div>
            {confirmedSubject && !loading && (
              lastAccess ? (
                <div>
                  <p>Subject Id: {confirmedSubject}</p>
                  <p>Last Access: {lastAccess.toLocaleString()}</p>
                  <p>Avg Heart Rate: {historicalData.avgHeartRate} BPM</p>
                  <p>Avg HRV: {historicalData.avgHRV} ms</p>
                </div>
              ) : (
                <p>No previous records found for Subject Id: {confirmedSubject}</p>
              )
            )}
          </div>
        </div>

        {/* Right Column: Chart and Metrics */}
        <div className="space-y-4">
          {/* Chart */}
          <ChartComponent ppgData={ppgData} valleys={valleys} />

          {/* Save Data to MongoDB Button */}
          <button
            onClick={pushDataToMongo}
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Save Data to MongoDB
          </button>

          {/* Metrics Cards (Side by Side) */}
          <div className="flex flex-wrap gap-4">
            {/* Heart Rate Card */}
            <MetricsCard
              title="HEART RATE"
              value={heartRate || {}} // Pass the HeartRateResult object
              confidence={heartRate?.confidence || 0}
            />

            {/* HRV Card */}
            <MetricsCard
              title="HRV"
              value={hrv || {}} // Pass the HRVResult object
              confidence={hrv?.confidence || 0}
            />

            {/* Signal Quality Card (Fallback for now) */}
            <MetricsCard
              title="SIGNAL QUALITY"
              value={signalQuality || '--'} // String value for signal quality
              confidence={qualityConfidence || 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
