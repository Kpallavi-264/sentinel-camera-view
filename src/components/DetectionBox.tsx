
import React from 'react';
import { DetectedObject } from '@/types/camera';

interface DetectionBoxProps {
  object: DetectedObject;
  containerWidth: number;
  containerHeight: number;
}

const DetectionBox: React.FC<DetectionBoxProps> = ({ 
  object, 
  containerWidth, 
  containerHeight 
}) => {
  const { boundingBox, type, confidence } = object;
  const isSuspicious = ["Phone", "Bat", "Knife", "Rope", "Gun"].includes(type);

  return (
    <div
      className={`absolute border-2 ${
        isSuspicious ? 'border-destructive' : 'border-yellow-400'
      }`}
      style={{
        left: `${boundingBox.x * containerWidth}px`,
        top: `${boundingBox.y * containerHeight}px`,
        width: `${boundingBox.width * containerWidth}px`,
        height: `${boundingBox.height * containerHeight}px`,
      }}
    >
      <div
        className={`absolute top-0 left-0 transform -translate-y-6 px-2 py-0.5 text-xs font-bold rounded ${
          isSuspicious ? 'bg-destructive text-destructive-foreground' : 'bg-yellow-400 text-yellow-950'
        }`}
      >
        {`${type} (${Math.round(confidence * 100)}%)`}
      </div>
    </div>
  );
};

export default DetectionBox;
