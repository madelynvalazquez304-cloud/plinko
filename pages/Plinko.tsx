import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, RefreshCw, Zap, TrendingUp, Trophy, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useUser } from '../context/UserContext';

interface Ball {
  id: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  row: number;
  path: number[];
  progress: number;
}

interface ActiveHit {
  index: number;
  id: number;
}

const Plinko: React.FC = () => {
  const navigate = useNavigate();
  const { user, addBet, deductBalance } = useUser();
  const [betAmount, setBetAmount] = useState('100');
  const [difficulty, setDifficulty] = useState('High'); 
  const [rows, setRows] = useState(16);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [activeHits, setActiveHits] = useState<ActiveHit[]>([]);
  const [recentHistory, setRecentHistory] = useState<{val: number, colorClass: string}[]>([]);
  
  const ballIdCounter = useRef(0);
  const hitIdCounter = useRef(0);

  // Constants for geometry - Compressed to reduce padding
  const BOARD_WIDTH = 100;
  const BOARD_HEIGHT = 100;
  const VERTICAL_PADDING = 1.5; 
  const BOTTOM_RESERVE = 7.5; // Aggressively reduced to bring pins closer to multipliers
  
  const vGap = (BOARD_HEIGHT - VERTICAL_PADDING - BOTTOM_RESERVE) / (rows + 1);
  const hGap = useMemo(() => {
    return (BOARD_WIDTH * 0.90) / (rows + 2); 
  }, [rows]);

  const multipliers = useMemo(() => {
    const getMultipliers = () => {
      if (rows === 8) {
        if (difficulty === 'Low') return [5.6, 2.1, 1.3, 1.0, 0.5, 1.0, 1.3, 2.1, 5.6];
        if (difficulty === 'Medium') return [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13];
        return [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29];
      }
      if (rows === 12) {
        if (difficulty === 'Low') return [10, 4.5, 2, 1.6, 1.4, 1.2, 1.1, 1.2, 1.4, 1.6, 2, 4.5, 10];
        if (difficulty === 'Medium') return [33, 11, 4, 2, 1.1, 0.6, 0.3, 0.6, 1.1, 2, 4, 11, 33];
        return [170, 48, 11, 4, 2, 0.2, 0.2, 0.2, 2, 4, 11, 48, 170];
      }
      if (rows === 16) {
        if (difficulty === 'Low') return [16, 9, 4.2, 2.1, 1.5, 1.2, 1.1, 1.0, 0.5, 1.0, 1.1, 1.2, 1.5, 2.1, 4.2, 9, 16];
        if (difficulty === 'Medium') return [110, 41, 10, 5, 3, 1.5, 1.0, 0.5, 0.3, 0.5, 1.0, 1.5, 3, 5, 10, 41, 110];
        return [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000];
      }
      return Array(rows + 1).fill(1.0);
    };

    const values = getMultipliers();
    return values.map(val => {
      let colorClass = 'from-emerald-500 to-emerald-700';
      if (val >= 1000) colorClass = 'from-rose-600 to-rose-700 shadow-rose-500/50';
      else if (val >= 100) colorClass = 'from-rose-500 to-rose-600';
      else if (val >= 20) colorClass = 'from-rose-400 to-rose-500';
      else if (val >= 4) colorClass = 'from-orange-500 to-orange-600';
      else if (val >= 2) colorClass = 'from-orange-400 to-orange-500';
      else if (val < 1) colorClass = 'from-yellow-400 to-yellow-500';
      
      return { val, colorClass };
    });
  }, [rows, difficulty]);

  const dropBall = useCallback(() => {
    const amount = parseFloat(betAmount) || 0;
    if (amount <= 0) return;
    
    if (deductBalance(amount)) {
      const path: number[] = [];
      for (let i = 0; i < rows; i++) {
        path.push(Math.random() < 0.5 ? 1 : 0);
      }

      const startX = BOARD_WIDTH / 2;
      const startY = VERTICAL_PADDING;

      const newBall: Ball = {
        id: ballIdCounter.current++,
        x: startX,
        y: startY,
        startX,
        startY,
        targetX: startX,
        targetY: startY + vGap,
        row: 0,
        path,
        progress: 0,
      };

      setBalls(prev => [...prev, newBall]);
    }
  }, [rows, betAmount, deductBalance, vGap]);

  useEffect(() => {
    let animationFrame: number;
    const update = () => {
      setBalls(prevBalls => {
        if (prevBalls.length === 0) return prevBalls;
        const nextBalls = prevBalls.map(ball => {
          const speed = 0.14 + (Math.random() * 0.04);
          const newProgress = ball.progress + speed;
          
          if (newProgress >= 1) {
            if (ball.row >= rows) {
              const finalSlotIndex = ball.path.reduce((acc, curr) => acc + curr, 0);
              const multiplier = multipliers[finalSlotIndex];
              const hitId = hitIdCounter.current++;
              
              setActiveHits(prev => [...prev, { index: finalSlotIndex, id: hitId }]);
              setTimeout(() => { setActiveHits(prev => prev.filter(h => h.id !== hitId)); }, 400);
              
              const amount = parseFloat(betAmount);
              const payout = amount * multiplier.val;
              addBet('PLINKO', amount, multiplier.val, payout, multiplier.val >= 1 ? 'win' : 'loss');
              setRecentHistory(prev => [{ val: multiplier.val, colorClass: multiplier.colorClass }, ...prev].slice(0, 10));
              return null; 
            }

            const nextRow = ball.row + 1;
            const direction = ball.path[ball.row]; 
            const currentOffset = ball.path.slice(0, ball.row).reduce((a, b) => a + (b === 1 ? 0.5 : -0.5), 0);
            const nextOffset = currentOffset + (direction === 1 ? 0.5 : -0.5);

            return {
              ...ball,
              row: nextRow,
              progress: 0,
              startX: ball.targetX,
              startY: ball.targetY,
              targetX: (BOARD_WIDTH / 2) + (nextOffset * hGap),
              targetY: VERTICAL_PADDING + (nextRow + 1) * vGap,
            };
          }

          const lerpX = ball.startX + (ball.targetX - ball.startX) * newProgress;
          const bounceArc = Math.sin(Math.PI * newProgress) * (vGap * 0.45);
          const lerpY = ball.startY + (ball.targetY - ball.startY) * newProgress - bounceArc;

          return { ...ball, progress: newProgress, x: lerpX, y: lerpY };
        }).filter(Boolean) as Ball[];
        return nextBalls;
      });
      animationFrame = requestAnimationFrame(update);
    };
    animationFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrame);
  }, [rows, betAmount, multipliers, addBet, hGap, vGap]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0f212e] text-white font-sans selection:bg-blue-500/30">
      <Navbar isLoggedIn={true} />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto no-scrollbar relative bg-[#0f212e] 2xl:max-w-[1920px] 2xl:mx-auto 2xl:w-full">
          {/* Mobile Back Button */}
          <button onClick={() => navigate('/dashboard')} className="sm:hidden fixed top-20 left-6 z-50 bg-[#213743]/80 backdrop-blur-md p-3 rounded-xl border border-white/5 text-gray-400 hover:text-white transition-all shadow-xl">
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex flex-col lg:flex-row gap-8 mb-12">
            {/* Control Hub */}
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
                      className="bg-transparent text-white font-black w-full outline-none text-lg tracking-tight" 
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex border-l border-[#213743]">
                     <button onClick={() => setBetAmount((parseFloat(betAmount) / 2).toString())} className="px-6 hover:bg-[#213743] text-[11px] font-black text-gray-400">1/2</button>
                     <button onClick={() => setBetAmount((parseFloat(betAmount) * 2).toString())} className="px-6 border-l border-[#213743] hover:bg-[#213743] text-[11px] font-black text-gray-400">2x</button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Risk Level</label>
                  <div className="flex bg-[#0f212e] rounded-2xl p-1 border border-[#213743] relative">
                    {['Low', 'Medium', 'High'].map((lvl) => (
                      <button 
                        key={lvl}
                        onClick={() => setDifficulty(lvl)}
                        className={`flex-1 py-2 text-[10px] font-black uppercase z-10 transition-all ${difficulty === lvl ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                      >
                        {lvl}
                      </button>
                    ))}
                    <div 
                      className="absolute top-1 bottom-1 bg-[#213743] rounded-xl transition-all duration-300 shadow-xl" 
                      style={{ 
                        width: 'calc(33.33% - 4px)', 
                        left: difficulty === 'Low' ? '4px' : difficulty === 'Medium' ? 'calc(33.33% + 2px)' : 'calc(66.66% + 1px)' 
                      }} 
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Rows Count</label>
                  <select 
                    value={rows} 
                    onChange={(e) => setRows(Number(e.target.value))}
                    className="w-full bg-[#0f212e] border-2 border-[#213743] rounded-2xl py-4 px-5 text-white font-bold outline-none focus:border-blue-500 transition-all"
                  >
                    {[8, 12, 16].map(r => <option key={r} value={r}>{r} Rows</option>)}
                  </select>
                </div>
              </div>

              <button 
                onClick={dropBall}
                className="w-full bg-blue-500 hover:bg-blue-400 text-white font-black py-8 rounded-3xl transition-all shadow-[0_10px_0_rgb(0,100,200)] active:shadow-none active:translate-y-2 text-2xl uppercase italic tracking-tighter flex items-center justify-center gap-4 group"
              >
                <Zap className="w-7 h-7 fill-current group-hover:scale-110 transition-transform" />
                DROP BALL
              </button>
            </div>

            {/* Plinko Board Area */}
            <div className="flex-1 bg-[#1a2c38] min-h-[550px] lg:min-h-[750px] rounded-[3.5rem] border border-[#213743] flex flex-col items-center justify-center p-4 relative overflow-hidden shadow-5xl">
              <div className="relative w-full max-w-[650px] aspect-[4/5]">
                {/* Pins Overlay */}
                {Array.from({ length: rows }).map((_, r) => (
                  <div key={r} className="flex justify-center">
                    {Array.from({ length: r + 3 }).map((_, c) => {
                      const x = 50 + (c - (r + 2) / 2 + 0.5) * (hGap / (BOARD_WIDTH / 100));
                      const y = VERTICAL_PADDING + (r + 1) * vGap;
                      return (
                        <div 
                          key={c}
                          className="absolute w-1.5 h-1.5 bg-white/20 rounded-full"
                          style={{ left: `${x}%`, top: `${y}%` }}
                        />
                      );
                    })}
                  </div>
                ))}

                {/* Bottom Slots - Matching provided image arrangement */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1 sm:gap-1.5 px-2">
                  {multipliers.map((m, i) => (
                    <div 
                      key={i} 
                      className={`flex-1 min-w-0 max-w-[48px] aspect-[4/5] sm:aspect-square rounded-lg bg-gradient-to-t ${m.colorClass} flex flex-col items-center justify-center shadow-[0_4px_0_rgba(0,0,0,0.3)] transition-all ${activeHits.some(h => h.index === i) ? 'scale-125 -translate-y-3 z-50' : ''}`}
                    >
                      <span className="text-[7px] sm:text-[11px] font-black text-white italic tracking-tighter leading-none">
                        {m.val >= 1000 ? '1K' : m.val}
                      </span>
                      {m.val < 1000 && <span className="text-[5px] sm:text-[7px] font-black text-white/60 -mt-0.5">x</span>}
                    </div>
                  ))}
                </div>

                {/* Animated Balls - Proportional to pins */}
                {balls.map(ball => (
                  <div 
                    key={ball.id}
                    className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,1)] z-30"
                    style={{ left: `${ball.x}%`, top: `${ball.y}%`, transform: 'translate(-50%, -50%)' }}
                  />
                ))}
              </div>

              {/* History HUD */}
              <div className="absolute top-10 right-10 flex flex-col gap-2">
                 {recentHistory.map((h, i) => (
                   <div key={i} className={`px-4 py-2 rounded-xl bg-gradient-to-r ${h.colorClass} text-white font-black text-[10px] italic shadow-xl animate-in slide-in-from-right-10 border border-white/10`}>
                      {h.val >= 1000 ? '1K' : h.val}x
                   </div>
                 ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Plinko;
