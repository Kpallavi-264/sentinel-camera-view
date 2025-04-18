
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

// COCO dataset classes (80 classes in MS COCO dataset)
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

// Our target suspicious objects
export const TARGET_OBJECTS = [
  'knife',
  'smartphone',
  'rope',
  'bat',
  'gun',
  'scissors'
];

// Update SUSPICIOUS_OBJECT_TYPES to match COCO dataset equivalents
// Make sure knife is a top priority for detection
export const SUSPICIOUS_OBJECT_TYPES = [
  'knife',         // Direct COCO class - prioritized
  'cell phone',    // COCO class for smartphone
  'scissors',      // Direct COCO class
  'baseball bat',  // COCO class for bat
  'tie',           // closest COCO equivalent for rope
  'handbag',       // temporary mapping for gun since gun isn't in COCO
];

// Mapping of target objects to their COCO equivalents
export const OBJECT_TYPE_MAPPING = {
  'smartphone': 'cell phone',
  'cell phone': 'cell phone',
  'bat': 'baseball bat',
  'baseball bat': 'baseball bat',
  'rope': 'tie', // closest COCO equivalent
  'tie': 'tie',
  'gun': 'handbag', // temporary mapping since gun isn't in COCO
  'handbag': 'handbag',
  'knife': 'knife',  // Direct match in COCO
  'scissors': 'scissors'
};

// Reverse mapping to display our desired terms to users
export const DISPLAY_TYPE_MAPPING = {
  'cell phone': 'Smartphone',
  'scissors': 'Scissors',
  'knife': 'Knife',
  'baseball bat': 'Bat',
  'tie': 'Rope',
  'handbag': 'Gun',
};
