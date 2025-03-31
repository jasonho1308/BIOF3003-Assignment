import React from 'react';

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
        <div className="bg-white dark:bg-darkForeground shadow-card p-4 rounded-lg">
            {loading ? (
                <div className="text-gray-500 dark:text-gray-400 text-lg items-center">Loading...</div>
            ) : confirmedSubject && lastAccess ? (
                <div className="text-gray-700 dark:text-gray-300 text-lg">
                    <p><strong>Subject Id:</strong> {confirmedSubject}</p>
                    <p><strong>Last Access:</strong> {lastAccess.toLocaleString()}</p>
                    <p><strong>Avg Heart Rate:</strong> {historicalData.avgHeartRate.toFixed(1)} BPM</p>
                    <p><strong>Avg HRV:</strong> {historicalData.avgHRV} ms</p>
                </div>
            ) : (
                confirmedSubject && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-lg">
                        No previous records found for Subject Id: {confirmedSubject}
                    </p>
                )
            )}
        </div>
    );
};

export default PastData;
