
import React from 'react';
import { DetectedObject } from '@/types/camera';
import { Smartphone, AlertTriangle, AlertCircle } from 'lucide-react';

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
  
  // Convert bounding box to pixels
  const boxStyle: React.CSSProperties = {
    left: `${boundingBox.x * containerWidth}px`,
    top: `${boundingBox.y * containerHeight}px`,
    width: `${boundingBox.width * containerWidth}px`,
    height: `${boundingBox.height * containerHeight}px`,
    pointerEvents: 'none' as React.CSSProperties['pointerEvents'], // Ensure the box doesn't interfere with clicks
  };

  // Select icon based on object type
  const renderIcon = () => {
    switch (type) {
      case "Phone":
        return <Smartphone className="h-3 w-3 mr-1" />;
      case "Knife":
      case "Gun":
        return <AlertCircle className="h-3 w-3 mr-1" />;
      default:
        return <AlertTriangle className="h-3 w-3 mr-1" />;
    }
  };

  return (
    <div
      className={`absolute border-2 ${
        isSuspicious ? 'border-destructive animate-pulse' : 'border-yellow-400'
      }`}
      style={boxStyle}
    >
      <div
        className={`absolute top-0 left-0 transform -translate-y-6 px-2 py-0.5 text-xs font-bold rounded flex items-center ${
          isSuspicious ? 'bg-destructive text-destructive-foreground' : 'bg-yellow-400 text-yellow-950'
        }`}
      >
        {renderIcon()}
        {`${type} (${Math.round(confidence * 100)}%)`}
      </div>
    </div>
  );
};

export default DetectionBox;
