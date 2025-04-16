
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

// Object types for detection
export const OBJECT_TYPES = ["Person", "Vehicle", "Animal", "Unknown"];

// Suspicious object types that should trigger alerts
export const SUSPICIOUS_OBJECT_TYPES = ["Phone", "Bat", "Knife", "Rope", "Gun"];

