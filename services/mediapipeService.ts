import { FilesetResolver, HandLandmarker, DrawingUtils } from "@mediapipe/tasks-vision";
import { MEDIAPIPE_MODEL_PATH, MEDIAPIPE_WASM_PATH } from "../constants";

let handLandmarker: HandLandmarker | null = null;

export const initializeHandLandmarker = async (): Promise<HandLandmarker> => {
  if (handLandmarker) return handLandmarker;

  const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_PATH);
  
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: MEDIAPIPE_MODEL_PATH,
      delegate: "GPU"
    },
    runningMode: "VIDEO",
    numHands: 2
  });

  return handLandmarker;
};

export const getHandLandmarker = () => handLandmarker;
