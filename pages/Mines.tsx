
import React, { useState, useMemo, useCallback } from 'react';
import { Smartphone, Info, Shield, Bomb, Gem, Zap, CheckCircle2, History, TrendingUp, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useUser } from '../context/UserContext';

const Mines: React.FC = () => {
  const navigate = useNavigate();
  const { user, addBet } = useUser();
  const [betAmount, setBetAmount] = useState('100');
  const [mineCount, setMineCount] = useState(3);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle');
  const [tiles, setTiles] = useState<('hidden' | 'gem' | 'bomb')[]>(Array(25).fill('hidden'));
  const [minesPositions, setMinesPositions] = useState<number[]>([]);
  const [revealedTiles, setRevealedTiles] = useState<number[]>([]);

  const currentMultiplier = useMemo(() => {
    if (revealedTiles.length === 0) return 1.0;
    
    const factorial = (n: number): number => n <= 1 ? 1 : n * factorial(n - 1);
    const nCr = (n: number, r: number) => factorial(n) / (factorial(r) * factorial(n - r));
    
    const gems = 25 - mineCount;
    const revealedGems = revealedTiles.length;
    
    const prob = nCr(gems, revealedGems) / nCr(25, revealedGems);
    return Number((0.98 / prob).toFixed(2));
  }, [revealedTiles.length, mineCount]);

  const startNewGame = useCallback(() => {
    const amount = parseFloat(betAmount) || 0;
    const currentBal = user.isDemo ? user.demoBalance : user.balance;
    if (amount <= 0 || currentBal < amount) {
      alert("Insufficient balance to start this game!");
      return;
    }

    const positions: number[] = [];
    while (positions.length < mineCount) {
      const pos = Math.floor(Math.random() * 25);
      if (!positions.includes(pos)) positions.push(pos);
    }

    setMinesPositions(positions);
    setRevealedTiles([]);
    setTiles(Array(25).fill('hidden'));
    setGameState('playing');
  }, [betAmount, user, mineCount]);

  const handleTileClick = (index: number) => {
    if (gameState !== 'playing' || revealedTiles.includes(index)) return;

    if (minesPositions.includes(index)) {
      const newTiles = [...tiles];
      minesPositions.forEach(pos => newTiles[pos] = 'bomb');
      setTiles(newTiles);
      setGameState('ended');
      addBet('MINES', parseFloat(betAmount), 0, 0, 'loss');
    } else {
      const newRevealed = [...revealedTiles, index];
      setRevealedTiles(newRevealed);
      const newTiles = [...tiles];
      newTiles[index] = 'gem';
      setTiles(newTiles);
      
      if (newRevealed.length === 25 - mineCount) {
        handleCashout(currentMultiplier);
      }
    }
  };

  const handleCashout = (m = currentMultiplier) => {
    if (gameState !== 'playing' || revealedTiles.length === 0) return;
    const amount = parseFloat(betAmount);
    const payout = amount * m;
    addBet('MINES', amount, m, payout, 'win');
    setGameState('ended');
    const newTiles = [...tiles];
    minesPositions.forEach(pos => newTiles[pos] = 'bomb');
    setTiles(newTiles);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0f212e] text-white font-sans selection:bg-blue-500/30">
      <Navbar isLoggedIn={true} />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <main className="flex-1 flex flex-col lg:flex-row p-4 lg:p-8 2xl:p-12 gap-8 overflow-y-auto no-scrollbar relative 2xl:max-w-[1920px] 2xl:mx-auto 2xl:w-full">
          
          {/* Mobile Back Button */}
          <button onClick={() => navigate('/dashboard')} className="sm:hidden fixed top-20 left-6 z-50 bg-[#213743]/80 backdrop-blur-md p-3 rounded-xl border border-white/5 text-gray-400 hover:text-white transition-all shadow-xl">
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Action Hub */}
          <div className="w-full lg:w-[360px] xl:w-[420px] flex-shrink-0 bg-[#1a2c38] rounded-[3rem] border border-[#213743] p-8 flex flex-col gap-10 shadow-5xl z-20">
            <div className="space-y-6">
               <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest px-1">Bet Configuration</span>
               
               <div className="flex bg-[#0f212e] rounded-3xl border-2 border-[#213743] overflow-hidden focus-within:border-blue-500/50 transition-all shadow-xl group">
                 <div className="flex-1 flex items-center px-6 gap-3 py-5">
                   <span className="text-blue-500 font-black text-sm italic tracking-tighter">KSH</span>
                   <input 
                     type="text" 
                     value={betAmount} 
                     onChange={(e) => setBetAmount(e.target.value)} 
                     disabled={gameState === 'playing'}
                     className="bg-transparent text-white font-black w-full outline-none text-lg tracking-tight" 
                     placeholder="0.00"
                   />
                 </div>
                 <div className="flex border-l border-[#213743]">
                    <button onClick={() => setBetAmount((parseFloat(betAmount) / 2).toString())} disabled={gameState === 'playing'} className="px-6 hover:bg-[#213743] text-[11px] font-black text-gray-400">1/2</button>
                    <button onClick={() => setBetAmount((parseFloat(betAmount) * 2).toString())} disabled={gameState === 'playing'} className="px-6 border-l border-[#213743] hover:bg-[#213743] text-[11px] font-black text-gray-400">2x</button>
                 </div>
               </div>

               <div className="space-y-3">
                 <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Mines Quantity</label>
                 <div className="relative group">
                   <select 
                     value={mineCount} 
                     onChange={(e) => setMineCount(Number(e.target.value))} 
                     disabled={gameState === 'playing'}
                     className="w-full bg-[#0f212e] border-2 border-[#213743] rounded-3xl py-5 px-6 text-white text-sm font-black appearance-none outline-none focus:border-blue-500 transition-all shadow-lg"
                   >
                     {[1, 3, 5, 8, 10, 15, 20, 24].map(n => <option key={n} value={n}>{n} MINES</option>)}
                   </select>
                   <Zap className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-hover:text-blue-500 pointer-events-none" />
                 </div>
               </div>
            </div>

            {gameState === 'playing' ? (
              <button 
                onClick={() => handleCashout()} 
                className="w-full bg-[#00e701] hover:bg-[#1fff21] text-black font-black py-8 rounded-3xl transition-all shadow-[0_10px_0_rgb(0,180,0)] active:shadow-none active:translate-y-2 text-2xl uppercase italic tracking-tighter flex items-center justify-center gap-4 group animate-pulse"
              >
                <CheckCircle2 className="w-8 h-8 group-hover:scale-110 transition-transform" />
                CASHOUT ({(parseFloat(betAmount) * currentMultiplier).toFixed(0)})
              </button>
            ) : (
              <button 
                onClick={startNewGame} 
                className="w-full bg-blue-500 hover:bg-blue-400 text-white font-black py-8 rounded-3xl transition-all shadow-[0_10px_0_rgb(0,100,200)] active:shadow-none active:translate-y-2 text-2xl uppercase italic tracking-tighter flex items-center justify-center gap-4 group"
              >
                <TrendingUp className="w-6 h-6 group-hover:scale-110 transition-transform" />
                INITIATE BET
              </button>
            )}

            <div className="mt-auto space-y-6">
               <div className="bg-[#0f212e]/60 rounded-[2.5rem] p-8 border border-[#213743] flex flex-col items-center gap-4 shadow-inner">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Target Multiplier</span>
                  <div className="text-5xl font-black text-white italic tracking-tighter tabular-nums flex items-baseline gap-2">
                    {currentMultiplier}<span className="text-2xl not-italic text-blue-500 opacity-60">x</span>
                  </div>
                  <div className="w-full h-2 bg-[#1a2c38] rounded-full overflow-hidden mt-2 border border-white/5">
                    <div className="h-full bg-blue-500 transition-all duration-700" style={{ width: `${(revealedTiles.length / (25 - mineCount)) * 100}%` }} />
                  </div>
               </div>
            </div>
          </div>

          {/* Scalable Grid Container */}
          <div className="flex-1 bg-[#1a2c38] rounded-[3.5rem] border border-[#213743] flex flex-col items-center justify-center p-6 sm:p-12 lg:p-20 relative overflow-hidden shadow-5xl">
            <div className="grid grid-cols-5 gap-4 md:gap-6 w-full max-w-[700px] 2xl:max-w-[850px] aspect-square relative z-10">
              {tiles.map((state, i) => (
                <div 
                  key={i}
                  onClick={() => handleTileClick(i)}
                  className={`relative rounded-2xl md:rounded-[2rem] flex items-center justify-center cursor-pointer transition-all duration-300 transform-gpu border-b-8 border-black/40 active:translate-y-1 active:border-b-0 shadow-2xl overflow-hidden group ${
                    state === 'hidden' ? 'bg-[#2f4553] hover:bg-[#3d5161] hover:-translate-y-1.5' : 
                    state === 'gem' ? 'bg-emerald-500 shadow-[0_20px_40px_rgba(16,185,129,0.5)] border-emerald-700' : 
                    'bg-[#0f212e] border-[#1a2c38]'
                  }`}
                >
                  {state === 'gem' && (
                    <div className="animate-in zoom-in-50 duration-300 flex items-center justify-center w-full h-full p-3 sm:p-5">
                       <Gem className="w-full h-full text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.9)]" />
                    </div>
                  )}
                  {state === 'bomb' && (
                    <div className={`animate-in zoom-in spin-in-90 duration-500 w-full h-full p-3 sm:p-5 ${minesPositions.includes(i) ? 'opacity-100 scale-110' : 'opacity-20'}`}>
                       <Bomb className="w-full h-full text-rose-500" />
                    </div>
                  )}
                  {state === 'hidden' && (
                    <div className="w-5 h-5 rounded-full bg-white/10 group-hover:bg-white/20 transition-all group-hover:scale-125" />
                  )}
                </div>
              ))}
            </div>

            <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#ffffff_2px,transparent_2px)] [background-size:64px_64px] z-0"></div>
            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-blue-500/10 to-transparent pointer-events-none" />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Mines;
