
// Common types for the camera system

export type CameraStatus = "active" | "alert" | "inactive";

export interface Alert {
  id: string;
  cameraId: string;
  objectType: string;
  timestamp: Date;
  message: string;
  boundingBox?: BoundingBox; // Optional because some older alerts might not have it
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Camera {
  id: string;
  name: string;
  status: CameraStatus;
  stream: MediaStream | null;
  lastImage: string | null;
  lastUpdated: Date;
  detectedObjects?: DetectedObject[]; // Add detected objects with bounding boxes
}

export interface DetectedObject {
  type: string;
  confidence: number;
  boundingBox: BoundingBox;
}

// Initial camera setup
export const initialCameras: Camera[] = [
  {
    id: "cam-1",
    name: "Front Entrance",
    status: "inactive",
    stream: null,
    lastImage: null,
    lastUpdated: new Date(),
  },
  {
    id: "cam-2",
    name: "Back Door",
    status: "inactive",
    stream: null,
    lastImage: null,
    lastUpdated: new Date(),
  },
  {
    id: "cam-3",
    name: "Parking Lot",
    status: "inactive",
    stream: null,
    lastImage: null,
    lastUpdated: new Date(),
  },
  {
    id: "cam-4",
    name: "Reception",
    status: "inactive",
    stream: null,
    lastImage: null,
    lastUpdated: new Date(),
  },
];

// COCO dataset classes (80 classes in MS COCO dataset) - YOLO uses these same classes
export const COCO_CLASSES = [
  'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 
  'boat', 'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 
  'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 
  'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 
  'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove', 
  'skateboard', 'surfboard', 'tennis racket', 'bottle', 'wine glass', 'cup', 
  'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich', 'orange', 
  'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch', 
  'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse', 
  'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink', 
  'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 
  'hair drier', 'toothbrush'
];

// Our target suspicious objects - updated to match YOLO classes
export const TARGET_OBJECTS = [
  'knife',
  'cell phone',
  'fork',
  'baseball bat',
  'scissors'
];

// Update SUSPICIOUS_OBJECT_TYPES to match YOLO dataset classes
export const SUSPICIOUS_OBJECT_TYPES = [
  'knife',         // Direct YOLO/COCO class - highest priority
  'fork',          // Added fork as per requirement
  'cell phone',    // YOLO/COCO class for smartphone
  'scissors',      // Direct YOLO/COCO class
  'baseball bat',  // YOLO/COCO class for bat
];

// Mapping of display names to their COCO/YOLO equivalents
export const OBJECT_TYPE_MAPPING = {
  'smartphone': 'cell phone',
  'cell phone': 'cell phone',
  'bat': 'baseball bat',
  'baseball bat': 'baseball bat',
  'knife': 'knife',
  'fork': 'fork',
  'scissors': 'scissors'
};

// Reverse mapping to display our desired terms to users
export const DISPLAY_TYPE_MAPPING = {
  'cell phone': 'Smartphone',
  'scissors': 'Scissors',
  'knife': 'Knife',
  'fork': 'Fork',
  'baseball bat': 'Bat',
};
