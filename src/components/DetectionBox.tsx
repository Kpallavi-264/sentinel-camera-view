
import React from 'react';
import { DetectedObject } from '@/types/camera';
import { DISPLAY_TYPE_MAPPING } from '@/types/camera';
import { 
  Smartphone, 
  AlertTriangle, 
  AlertCircle, 
  Scissors,
  Sword,  // For knife detection
  Utensils, // For fork detection
  Briefcase  // For bat detection
} from 'lucide-react';

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
  
  // Update the suspicious items list to include knife and fork explicitly
  const isSuspicious = ["person", "cell phone", "knife", "fork", "baseball bat", "tennis racket", "scissors", "sports ball"].includes(type.toLowerCase());
  
  // Get display name from mapping or use original type
  const displayType = DISPLAY_TYPE_MAPPING[type.toLowerCase() as keyof typeof DISPLAY_TYPE_MAPPING] || type;
  
  const boxStyle: React.CSSProperties = {
    left: `${boundingBox.x * containerWidth}px`,
    top: `${boundingBox.y * containerHeight}px`,
    width: `${boundingBox.width * containerWidth}px`,
    height: `${boundingBox.height * containerHeight}px`,
    pointerEvents: 'none' as React.CSSProperties['pointerEvents'],
  };

  const renderIcon = () => {
    const lowerType = object.type.toLowerCase();
    
    switch(lowerType) {
      case 'cell phone':
        return <Smartphone className="h-3 w-3 mr-1" />;
      case 'scissors':
        return <Scissors className="h-3 w-3 mr-1" />;
      case 'knife':
        return <Sword className="h-3 w-3 mr-1" color="red" />;
      case 'fork':
        return <Utensils className="h-3 w-3 mr-1" color="red" />; // Added fork icon
      case 'baseball bat':
        return <Briefcase className="h-3 w-3 mr-1" color="orange" />;
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
        {`${displayType} (${Math.round(confidence * 100)}%)`}
      </div>
    </div>
  );
};

export default DetectionBox;
