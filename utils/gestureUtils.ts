import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { GestureType } from "../types";

// Simple heuristic for checking if a hand is a fist
const isFist = (landmarks: NormalizedLandmark[]): boolean => {
  // Check if fingertips are below the PIP joints (proximal interphalangeal)
  // This assumes the hand is upright. For a fighting game, we might want to check relative distance to palm center.
  // Simplified: Check if fingertips are close to the wrist/palm center.
  
  const wrist = landmarks[0];
  const tips = [landmarks[8], landmarks[12], landmarks[16], landmarks[20]]; // Index, Middle, Ring, Pinky tips
  
  // Calculate average distance from wrist
  const avgDist = tips.reduce((acc, tip) => {
    return acc + Math.sqrt(Math.pow(tip.x - wrist.x, 2) + Math.pow(tip.y - wrist.y, 2));
  }, 0) / 4;

  return avgDist < 0.25; // Threshold for "closed" hand
};

// Heuristic for block (both hands visible and open palm near head level? Or just crossed?)
// For MVP: Block = Open Palms. Punch = Fist.
const isOpenPalm = (landmarks: NormalizedLandmark[]): boolean => {
  return !isFist(landmarks);
};

export const detectGesture = (results: any): GestureType => {
  if (!results.landmarks || results.landmarks.length === 0) {
    return GestureType.IDLE;
  }

  // Iterate through detected hands
  // In `results.handedness`, we can check if it's Left or Right.
  // Note: MediaPipe mirrors handedness in selfie mode often, but let's stick to index.
  
  let leftHand = null;
  let rightHand = null;

  // Map landmarks to handedness
  for (let i = 0; i < results.handedness.length; i++) {
    const category = results.handedness[i][0];
    const landmarks = results.landmarks[i];
    
    // Handedness is from the perspective of the camera usually. 
    // "Left" in handedness usually means the person's left hand.
    if (category.categoryName === "Left") leftHand = landmarks;
    if (category.categoryName === "Right") rightHand = landmarks;
  }

  // Priority: Block > Punch
  if (leftHand && rightHand) {
      if (isFist(leftHand) && isFist(rightHand)) {
          // Double punch? Treat as block for now or super move.
          return GestureType.BLOCK; 
      }
      if (isOpenPalm(leftHand) && isOpenPalm(rightHand)) {
          return GestureType.BLOCK;
      }
  }

  if (rightHand && isFist(rightHand)) return GestureType.RIGHT_PUNCH;
  if (leftHand && isFist(leftHand)) return GestureType.LEFT_PUNCH;

  return GestureType.IDLE;
};
