// components/CameraFeed.tsx
import React from 'react';

interface CameraFeedProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

const CameraFeed: React.FC<CameraFeedProps> = ({ videoRef, canvasRef }) => {
  return (
    <div className="h-72"> {/* Match height with the graph */}
      {/* Video Element */}
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="w-full max-w-[640px] h-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-darkForeground"
      />
    </div>
  );
};

export default CameraFeed;
