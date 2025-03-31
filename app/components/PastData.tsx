import React from 'react';
import { FaHeartbeat, FaClock, FaExclamationCircle, FaIdBadge, FaCalendarAlt } from 'react-icons/fa';

interface PastDataProps {
    loading: boolean;
    confirmedSubject: string;
    lastAccess: Date | null;
    historicalData: {
        avgHeartRate: number;
        avgHRV: number;
    };
}

const PastData: React.FC<PastDataProps> = ({ loading, confirmedSubject, lastAccess, historicalData }) => {
    return (
        <div className="bg-white dark:bg-darkForeground shadow-card p-6 rounded-lg space-y-4">
            {loading ? (
                <div className="flex items-center justify-center text-gray-500 dark:text-gray-400 text-lg">
                    <FaClock className="mr-2" /> Loading...
                </div>
            ) : confirmedSubject ? (
                lastAccess ? (
                    <div className="text-gray-700 dark:text-gray-300 text-lg space-y-2">
                        <div className="flex items-center space-x-2">
                            <FaIdBadge className="text-green-500" />
                            <p><strong>Subject Id:</strong> {confirmedSubject}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <FaCalendarAlt className="text-purple-500" />
                            <p><strong>Last Access:</strong> {lastAccess.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <FaHeartbeat className="text-red-500" />
                            <p><strong>Avg Heart Rate:</strong> {historicalData.avgHeartRate.toFixed(1)} BPM</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <FaHeartbeat className="text-blue-500" />
                            <p><strong>Avg HRV:</strong> {historicalData.avgHRV} ms</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                        <FaExclamationCircle className="mr-2 text-yellow-500" />
                        No previous records found for Subject Id: {confirmedSubject}
                    </div>
                )
            ) : (
                <div className="text-gray-500 dark:text-gray-400 text-lg">
                    No subject selected.
                </div>
            )}
        </div>
    );
};

export default PastData;
