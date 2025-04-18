
import React from 'react';
import { DetectedObject } from '@/types/camera';
import { DISPLAY_TYPE_MAPPING } from '@/types/camera';
import { 
  Smartphone, 
  AlertTriangle, 
  AlertCircle, 
  Scissors,
  Link2,
  Briefcase,
  Knife
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
  const isSuspicious = ["person", "cell phone", "knife", "baseball bat", "tennis racket", "scissors", "sports ball", "tie", "handbag"].includes(type.toLowerCase());
  
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
        return <Knife className="h-3 w-3 mr-1" color="red" />;
      case 'baseball bat':
        return <AlertTriangle className="h-3 w-3 mr-1" color="orange" />;
      case 'tie':
        return <Link2 className="h-3 w-3 mr-1" />; // Rope
      case 'handbag':
        return <Briefcase className="h-3 w-3 mr-1" color="red" />; // Gun
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
