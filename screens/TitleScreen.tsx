import React from 'react';
import { ASSETS } from '../constants';

interface TitleScreenProps {
  onStart: () => void;
  isLoading: boolean;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart, isLoading }) => {
  return (
    <div className="flex flex-col flex-1 justify-center items-center py-5 px-4 md:px-10 lg:px-40 animate-fade-in">
      <div className="flex flex-col w-full max-w-[960px] flex-1 gap-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-xl border border-[#493f22] shadow-2xl">
           <div 
             className="flex min-h-[480px] flex-col gap-6 items-center justify-center p-8 bg-cover bg-center"
             style={{ backgroundImage: `linear-gradient(rgba(35, 30, 16, 0.8) 0%, rgba(35, 30, 16, 0.6) 100%), url("${ASSETS.BG_TITLE}")` }}
           >
              <div className="flex flex-col gap-4 text-center z-10 max-w-[700px]">
                <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-[#342d18] border border-[#493f22] w-fit mx-auto">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-xs font-medium text-[#cbbc90] uppercase tracking-wider">MVP Edition v1.0</span>
                </div>
                <h1 className="text-white text-5xl font-black leading-none tracking-[-0.033em] md:text-7xl uppercase drop-shadow-lg">
                  Gesture<br/><span className="text-primary">Fighter</span>
                </h1>
                <h2 className="text-[#eaddc5] text-lg font-normal leading-relaxed md:text-xl max-w-[600px] mx-auto">
                  The first browser-based fighting game controlled entirely by your webcam. No controller needed—just you and your moves.
                </h2>
              </div>
              
              <button 
                onClick={onStart}
                disabled={isLoading}
                className="z-10 flex min-w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 px-8 bg-primary text-[#231e10] text-lg font-black leading-normal tracking-wide shadow-[0_0_20px_rgba(244,192,37,0.4)] hover:shadow-[0_0_30px_rgba(244,192,37,0.6)] hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-wait"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-[#231e10] border-t-transparent rounded-full animate-spin"></span>
                    LOADING AI...
                  </span>
                ) : (
                  <>
                    <span className="material-symbols-outlined mr-2">play_arrow</span>
                    START GAME
                  </>
                )}
              </button>
           </div>
        </div>

        {/* Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InstructionCard 
            icon="front_hand" 
            title="Hand Mode" 
            desc={<span>Keep hands visible. Make a <span className="text-white font-bold">Fist</span> to punch. Open palms to <span className="text-white font-bold">Block</span>.</span>} 
          />
          <InstructionCard 
            icon="accessibility_new" 
            title="Body Mode" 
            desc={<span>Stand back so your torso is visible. <span className="text-white font-bold">Tilt</span> your body left or right to dodge.</span>} 
          />
           <InstructionCard 
            icon="compare_arrows" 
            title="Strategies" 
            desc={<span>Wait for the CPU to drop their guard. Time your punches for <span className="text-white font-bold">Critical Hits</span>.</span>} 
          />
        </div>

        {/* Permissions Warning */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 rounded-xl border border-primary/30 bg-gradient-to-r from-[#2a2415] to-[#231e10] p-6 shadow-lg relative overflow-hidden">
           <div className="absolute -left-10 -top-10 w-32 h-32 bg-primary/10 blur-3xl rounded-full pointer-events-none"></div>
           <div className="flex flex-col gap-2 z-10 relative">
             <div className="flex items-center gap-2">
               <span className="material-symbols-outlined text-primary">videocam</span>
               <p className="text-white text-lg font-bold">Camera Access Required</p>
             </div>
             <p className="text-[#cbbc90] text-sm">
               We process all motion data locally on your device using MediaPipe—no video is sent to our servers.
             </p>
           </div>
        </div>

      </div>
    </div>
  );
};

const InstructionCard = ({ icon, title, desc }: { icon: string, title: string, desc: React.ReactNode }) => (
  <div className="flex flex-1 gap-4 rounded-xl border border-[#493f22] bg-[#2a2415] hover:bg-[#342d18] transition-colors p-6 flex-col items-start group">
    <div className="p-3 rounded-lg bg-[#342d18] text-primary group-hover:bg-[#493f22] transition-colors">
      <span className="material-symbols-outlined text-[32px]">{icon}</span>
    </div>
    <div className="flex flex-col gap-2">
      <h2 className="text-white text-xl font-bold leading-tight">{title}</h2>
      <p className="text-[#cbbc90] text-sm font-normal leading-relaxed">{desc}</p>
    </div>
  </div>
);
