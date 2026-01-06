import React, { useEffect, useState } from 'react';
import { ASSETS } from '../constants';
import { PlayerStats, GameResult } from '../types';
import { getMatchCommentary } from '../services/geminiService';

interface ResultScreenProps {
  isVictory: boolean;
  gameResult: GameResult;
  onRestart: () => void;
  onMenu: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ isVictory, gameResult, onRestart, onMenu }) => {
  const [commentary, setCommentary] = useState<string>("Analyzing match data...");

  useEffect(() => {
    // Call Gemini API for dynamic commentary
    const fetchCommentary = async () => {
        const text = await getMatchCommentary(gameResult, isVictory);
        setCommentary(text);
    };
    fetchCommentary();
  }, [gameResult, isVictory]);

  return (
    <div className="relative flex h-full grow flex-col items-center justify-center p-4 sm:p-8 animate-fade-in w-full max-w-[1400px] mx-auto">
       <div className="layout-content-container flex flex-col w-full max-w-[960px] gap-8">
           {/* Header */}
           <div className="flex flex-col items-center text-center gap-2">
               <h1 className={`text-6xl sm:text-8xl font-black leading-tight tracking-[-0.033em] uppercase drop-shadow-[0_0_15px_${isVictory ? 'rgba(244,192,37,0.3)' : 'rgba(255,50,50,0.3)'}] ${isVictory ? 'text-primary' : 'text-red-500'}`}>
                   {isVictory ? 'YOU WIN!' : 'DEFEAT'}
               </h1>
               <p className="text-[#cbbc90] text-lg sm:text-xl font-normal leading-normal animate-slide-up">
                   {commentary}
               </p>
           </div>

           {/* Main Card */}
           <div className="w-full bg-background-dark/50 p-2 rounded-xl border border-white/5 shadow-2xl">
               <div className="w-full gap-1 overflow-hidden bg-[#1a160b] aspect-[16/9] sm:aspect-[21/9] rounded-lg flex relative group">
                   <div 
                      className={`w-full h-full bg-center bg-no-repeat bg-cover ${!isVictory ? 'grayscale opacity-60 mix-blend-luminosity' : ''}`}
                      style={{ backgroundImage: `url("${isVictory ? ASSETS.BG_VICTORY : ASSETS.BG_DEFEAT}")` }}
                   ></div>
                   
                   {/* Overlay Stats */}
                   <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex items-end p-8">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                            <StatBox label="Time Survived" value={`${gameResult.timeElapsed}s`} />
                            <StatBox label="Damage Dealt" value={gameResult.damageDealt.toString()} />
                            <StatBox label="Health Left" value={`${gameResult.finalHealth}%`} highlight={isVictory} />
                            <StatBox label="Max Combo" value={`${gameResult.maxCombo}x`} highlight={isVictory} />
                        </div>
                   </div>
               </div>
           </div>

           {/* Actions */}
           <div className="flex flex-col gap-4 w-full items-center pt-2">
               <button 
                 onClick={onRestart}
                 className="group relative flex w-full max-w-sm cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 px-8 bg-primary text-background-dark shadow-[0_0_20px_rgba(244,192,37,0.2)] hover:bg-[#ffcf3d] hover:shadow-[0_0_30px_rgba(244,192,37,0.4)] transition-all duration-300"
               >
                   <span className="absolute inset-0 w-full h-full bg-white/20 translate-y-full skew-y-12 group-hover:translate-y-0 transition-transform duration-500 ease-out"></span>
                   <div className="relative flex items-center gap-3">
                       <span className="material-symbols-outlined text-[28px] font-bold">refresh</span>
                       <span className="text-lg font-bold tracking-wider uppercase">Restart Match</span>
                   </div>
               </button>

               <button onClick={onMenu} className="text-[#cbbc90] hover:text-primary transition-colors text-sm font-bold tracking-widest uppercase py-2 border-b border-transparent hover:border-primary">
                   Return to Main Menu
               </button>
           </div>
           
           <div className="flex items-center justify-center gap-2 text-[#cbbc90]/60 text-sm font-medium py-2 px-4 rounded-full bg-white/5 border border-white/5">
                <span className="material-symbols-outlined text-lg">front_hand</span>
                <p>Tip: Raise your hand to restart instantly (feature coming soon)</p>
           </div>
       </div>
    </div>
  );
};

const StatBox = ({ label, value, highlight = false }: { label: string, value: string, highlight?: boolean }) => (
    <div className="flex flex-col items-center justify-center gap-1 rounded-lg p-3 border border-[#685a31] bg-[#2d2614]/80 backdrop-blur-sm">
        <p className="text-[#cbbc90] text-xs font-medium uppercase tracking-wider">{label}</p>
        <p className={`text-white tracking-tight text-2xl font-bold ${highlight ? 'text-green-400' : ''}`}>{value}</p>
    </div>
);
