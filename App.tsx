import React, { useState } from 'react';
import { GameState, GameResult, PlayerStats } from './types';
import { TitleScreen } from './screens/TitleScreen';
import { GameScreen } from './screens/GameScreen';
import { ResultScreen } from './screens/ResultScreen';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.TITLE);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startGame = () => {
    setIsLoading(true);
    // Simulate loading AI models
    setTimeout(() => {
        setIsLoading(false);
        setGameState(GameState.PLAYING);
    }, 1500);
  };

  const handleGameOver = (result: { stats: PlayerStats, won: boolean, time: number }) => {
     setGameResult({
         timeElapsed: result.time,
         damageDealt: result.stats.score, // Simplified logic
         finalHealth: result.stats.health,
         maxCombo: result.stats.combo,
     });
     setGameState(result.won ? GameState.VICTORY : GameState.DEFEAT);
  };

  const returnToMenu = () => {
      setGameState(GameState.TITLE);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark text-white overflow-hidden font-display selection:bg-primary selection:text-background-dark">
       
       {/* Global Header for persistent branding */}
       {gameState !== GameState.TITLE && (
         <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#493f22] px-6 lg:px-10 py-4 bg-background-dark sticky top-0 z-50">
            <div className="flex items-center gap-4 text-white cursor-pointer" onClick={returnToMenu}>
                <div className="size-8 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl">sports_martial_arts</span>
                </div>
                <h2 className="text-white text-xl font-bold leading-tight tracking-tight">BAKA GESTURE FIGHTER <span className="text-primary text-sm align-top">[BETA]</span></h2>
            </div>
            <div className="flex gap-4">
                 <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary hover:bg-yellow-400 text-background-dark text-sm font-bold transition-colors" onClick={() => window.location.reload()}>
                    <span className="material-symbols-outlined mr-2 text-sm">refresh</span>
                    <span className="truncate">Reset</span>
                </button>
            </div>
         </header>
       )}

       <main className="flex-1 flex flex-col items-center w-full">
           {gameState === GameState.TITLE && (
               <TitleScreen onStart={startGame} isLoading={isLoading} />
           )}
           
           {gameState === GameState.PLAYING && (
               <GameScreen onGameOver={handleGameOver} />
           )}
           
           {(gameState === GameState.VICTORY || gameState === GameState.DEFEAT) && gameResult && (
               <ResultScreen 
                  isVictory={gameState === GameState.VICTORY} 
                  gameResult={gameResult} 
                  onRestart={() => setGameState(GameState.PLAYING)}
                  onMenu={returnToMenu}
               />
           )}
       </main>
       
       <footer className="text-center py-4 text-[#685a31] text-xs">
            <p>© 2024 Gesture Fighter Project. Powered by MediaPipe & Gemini.</p>
       </footer>
    </div>
  );
};

export default App;
