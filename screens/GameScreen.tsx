import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ASSETS } from '../constants';
import { initializeHandLandmarker } from '../services/mediapipeService';
import { detectGesture } from '../utils/gestureUtils';
import { GestureType, GameState, PlayerStats } from '../types';
import { HandLandmarker } from '@mediapipe/tasks-vision';
import { HealthBar } from '../components/HealthBar';

interface GameScreenProps {
  onGameOver: (result: { stats: PlayerStats, won: boolean, time: number }) => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ onGameOver }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [landmarker, setLandmarker] = useState<HandLandmarker | null>(null);
  
  // Game State
  const [playerStats, setPlayerStats] = useState<PlayerStats>({ health: 100, score: 0, combo: 0 });
  const [cpuHealth, setCpuHealth] = useState(100);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentGesture, setCurrentGesture] = useState<GestureType>(GestureType.IDLE);
  const [lastActionTime, setLastActionTime] = useState(0);
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [showHitEffect, setShowHitEffect] = useState(false);

  // Initialize MediaPipe
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const lm = await initializeHandLandmarker();
      if (mounted) setLandmarker(lm);
    };
    init();
    return () => { mounted = false; };
  }, []);

  // Webcam Setup
  useEffect(() => {
    const startWebcam = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && videoRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480 } 
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.addEventListener('loadeddata', predictWebcam);
          }
        } catch (err) {
          console.error("Webcam error:", err);
          alert("Could not access webcam. Please allow camera permissions.");
        }
      }
    };

    let animationFrameId: number;

    const predictWebcam = () => {
      if (!landmarker || !videoRef.current || !canvasRef.current) return;
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw video to canvas (or just clear it for overlay)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Ideally, we don't redraw the video on the canvas if we want to show the video separately
      // But for overlay visualization we can draw landmarks.
      
      if (video.currentTime > 0 && !video.paused && !video.ended) {
          const startTimeMs = performance.now();
          const results = landmarker.detectForVideo(video, startTimeMs);

          if (results.landmarks) {
             // Draw landmarks simple logic
             ctx.fillStyle = "#f4c025";
             ctx.strokeStyle = "#f4c025";
             ctx.lineWidth = 2;

             for (const landmarks of results.landmarks) {
                 for (const point of landmarks) {
                     ctx.beginPath();
                     ctx.arc(point.x * canvas.width, point.y * canvas.height, 4, 0, 2 * Math.PI);
                     ctx.fill();
                 }
                 // Simple connections (just partial for MVP speed)
                 ctx.beginPath();
                 ctx.moveTo(landmarks[0].x * canvas.width, landmarks[0].y * canvas.height);
                 ctx.lineTo(landmarks[5].x * canvas.width, landmarks[5].y * canvas.height);
                 ctx.stroke();
             }
          }

          // Detect Gesture
          const gesture = detectGesture(results);
          if (gesture !== GestureType.IDLE) {
             handlePlayerAction(gesture);
          } else {
             setCurrentGesture(GestureType.IDLE);
          }
      }
      
      animationFrameId = requestAnimationFrame(predictWebcam);
    };

    if (landmarker) {
      startWebcam();
    }

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
         const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
         tracks.forEach(track => track.stop());
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [landmarker]);


  // Game Logic Loop
  const handlePlayerAction = useCallback((gesture: GestureType) => {
      const now = Date.now();
      // Debounce attacks (500ms cooldown)
      if (now - lastActionTime < 500) return;

      if (gesture === GestureType.LEFT_PUNCH || gesture === GestureType.RIGHT_PUNCH) {
          setLastActionTime(now);
          setCurrentGesture(gesture);
          
          // CPU Logic: Random chance to block or take hit
          const cpuBlockChance = Math.random();
          if (cpuBlockChance > 0.7) {
              setFeedbackText("BLOCKED!");
          } else {
              // Hit!
              const damage = Math.floor(Math.random() * 10) + 5;
              setCpuHealth(prev => Math.max(0, prev - damage));
              setPlayerStats(prev => ({ ...prev, combo: prev.combo + 1, score: prev.score + 100 }));
              setFeedbackText("HIT!");
              setShowHitEffect(true);
              setTimeout(() => setShowHitEffect(false), 200);
          }
      } else if (gesture === GestureType.BLOCK) {
          setCurrentGesture(GestureType.BLOCK);
      }
  }, [lastActionTime]);


  // Timer and CPU Attacks
  useEffect(() => {
    const interval = setInterval(() => {
        setTimeLeft(prev => {
            if (prev <= 1) {
                // Time Over
                clearInterval(interval);
                onGameOver({ stats: playerStats, won: cpuHealth < playerStats.health, time: 60 - prev });
                return 0;
            }
            return prev - 1;
        });

        // CPU Attack Logic
        if (Math.random() > 0.8) {
            // CPU Attacks
            if (currentGesture !== GestureType.BLOCK) {
                setPlayerStats(prev => ({...prev, health: Math.max(0, prev.health - 8), combo: 0 }));
            }
        }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentGesture, cpuHealth, playerStats.health, onGameOver]);

  // Check Win/Loss conditions immediately
  useEffect(() => {
      if (cpuHealth <= 0) {
          onGameOver({ stats: playerStats, won: true, time: 60 - timeLeft });
      }
      if (playerStats.health <= 0) {
          onGameOver({ stats: playerStats, won: false, time: 60 - timeLeft });
      }
  }, [cpuHealth, playerStats.health]);


  return (
    <div className="flex-1 flex justify-center p-4 lg:p-8 w-full max-w-[1400px] mx-auto animate-fade-in">
        <div className="flex flex-col lg:flex-row gap-6 w-full">
            
            {/* LEFT: Game Area */}
            <section className="flex flex-col gap-4 flex-[2] min-w-0">
                {/* HUD */}
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-5">
                        <HealthBar label="Player 1" value={playerStats.health} isPlayer={true} />
                    </div>
                    <div className="col-span-2 flex flex-col items-center justify-center rounded-lg bg-surface-dark border border-[#5a4d2b] py-2">
                        <span className="text-[#fa4238] text-xs font-bold uppercase tracking-widest mb-1">Time</span>
                        <p className={`text-3xl font-bold leading-none font-mono ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                            {timeLeft}
                        </p>
                    </div>
                    <div className="col-span-5">
                        <HealthBar label="CPU" value={cpuHealth} isPlayer={false} />
                    </div>
                </div>

                {/* Main Game Visual */}
                <div className="relative w-full aspect-video bg-surface-darker rounded-xl border-2 border-[#493f22] overflow-hidden shadow-2xl group">
                    {/* Background */}
                    <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: `url('${ASSETS.BG_GAME}')` }}></div>
                    
                    {/* Hit Effect Overlay */}
                    {showHitEffect && (
                        <div className="absolute inset-0 bg-white/20 z-20 animate-pulse"></div>
                    )}

                    {/* Characters */}
                    <div className="absolute inset-0 flex items-end justify-between px-16 pb-12 z-10">
                         {/* P1 */}
                         <div className={`relative w-32 h-48 bg-primary/20 border-2 border-primary rounded flex items-center justify-center backdrop-blur-sm transition-transform duration-100 ${currentGesture === GestureType.LEFT_PUNCH ? 'translate-x-10' : ''} ${currentGesture === GestureType.RIGHT_PUNCH ? 'translate-x-10' : ''}`}>
                             <span className="text-primary font-bold text-2xl">P1</span>
                             {currentGesture === GestureType.BLOCK && <div className="absolute inset-0 bg-blue-500/30 border-blue-500 rounded"></div>}
                         </div>

                         {/* Feedback Text */}
                         {feedbackText && (
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                                 <span className="text-6xl font-black text-white italic transform -rotate-12 drop-shadow-[0_4px_0_#fa4238] animate-slide-up">
                                     {feedbackText}
                                 </span>
                             </div>
                         )}

                         {/* CPU */}
                         <div className={`relative w-32 h-48 bg-red-500/20 border-2 border-red-500 rounded flex items-center justify-center backdrop-blur-sm ${showHitEffect ? 'translate-x-2 filter hue-rotate-90' : ''}`}>
                             <span className="text-red-500 font-bold text-2xl">CPU</span>
                         </div>
                    </div>
                    
                    {/* Grid Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-400 px-2">
                    <p>Stage: <span className="text-white">Neon Dojo</span></p>
                    <p>Difficulty: <span className="text-primary">Hard</span></p>
                </div>
            </section>

            {/* RIGHT: Input Feed & Controls */}
            <aside className="flex flex-col gap-6 flex-1 min-w-[320px]">
                <div className="bg-surface-dark rounded-xl p-4 border border-[#5a4d2b] shadow-lg flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">videocam</span>
                            Input Feed
                        </h3>
                        <div className="flex items-center gap-1.5">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                            </span>
                            <span className="text-xs font-mono text-red-400">LIVE</span>
                        </div>
                    </div>

                    <div className="relative aspect-[4/3] bg-black rounded-lg overflow-hidden border border-[#5a4d2b]">
                        <video 
                           ref={videoRef} 
                           autoPlay 
                           playsInline 
                           muted
                           className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1] opacity-70"
                        />
                        <canvas 
                           ref={canvasRef}
                           width={640}
                           height={480}
                           className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
                        />
                        
                        <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-md rounded px-3 py-1.5 border-l-4 border-primary">
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Detected Action</p>
                            <p className="text-white font-bold text-lg leading-none">{currentGesture.replace('_', ' ')}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono text-gray-400">
                         <div className="bg-surface-darker rounded p-2 border border-[#5a4d2b]/50">
                             FPS: <span className="text-white">60</span>
                         </div>
                         <div className="bg-surface-darker rounded p-2 border border-[#5a4d2b]/50">
                             Confidence: <span className="text-primary">98%</span>
                         </div>
                    </div>
                </div>
                
                {/* Instructions Hint */}
                <div className="bg-surface-dark rounded-xl p-4 border border-[#5a4d2b]">
                    <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Combo Log</h4>
                    <div className="space-y-1 font-mono text-sm h-32 overflow-y-auto">
                        <div className="flex items-center gap-2 text-white">
                            <span className="text-primary">{playerStats.combo}x</span>
                            <span>Combo Chain</span>
                        </div>
                    </div>
                </div>

            </aside>
        </div>
    </div>
  );
};
