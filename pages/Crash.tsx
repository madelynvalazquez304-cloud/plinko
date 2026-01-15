
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Smartphone, Timer, History, TrendingUp, Zap, Info, Rocket, Play, StopCircle, Users, User as UserIcon, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useUser } from '../context/UserContext';

interface LiveBet {
  id: string;
  user: string;
  amount: number;
  multiplier: number | null;
  payout: number | null;
  status: 'playing' | 'cashed';
}

const PLAYER_NAMES = [
  'Hidden_Shadow', 'M-Pesa_King', 'CryptoWhale', 'BetMaster_254', 
  'Elite_Gamer', 'LuckyShot', 'Nairobi_Sniper', 'Alpha_Dog', 
  'Zenith_Play', 'Volt_Hunter', 'Neon_Rider', 'Hyper_Jack'
];

const Crash: React.FC = () => {
  const navigate = useNavigate();
  const { user, addBet } = useUser();
  const [betAmount, setBetAmount] = useState('100');
  const [multiplier, setMultiplier] = useState(1.0);
  const [gameState, setGameState] = useState<'waiting' | 'flying' | 'crashed'>('waiting');
  const [history, setHistory] = useState<number[]>([]);
  const [currentBet, setCurrentBet] = useState<{ amount: number } | null>(null);
  const [liveBets, setLiveBets] = useState<LiveBet[]>([]);
  
  const timerRef = useRef<any>(null);
  const crashPointRef = useRef(0);

  const generateLiveBets = useCallback(() => {
    const numBets = Math.floor(Math.random() * 8) + 5;
    const newBets: LiveBet[] = Array.from({ length: numBets }).map((_, i) => ({
      id: `bot_${i}_${Date.now()}`,
      user: PLAYER_NAMES[Math.floor(Math.random() * PLAYER_NAMES.length)],
      amount: Math.floor(Math.random() * 5000) + 100,
      multiplier: null,
      payout: null,
      status: 'playing'
    }));
    setLiveBets(newBets);
  }, []);

  const startNewRound = useCallback(() => {
    setGameState('waiting');
    setMultiplier(1.0);
    generateLiveBets();
    const r = Math.random();
    crashPointRef.current = Math.max(1.0, 0.99 / (1 - r));
  }, [generateLiveBets]);

  const handlePlaceBet = () => {
    const amount = parseFloat(betAmount) || 0;
    const currentBal = user.isDemo ? user.demoBalance : user.balance;
    if (amount <= 0 || currentBal < amount || gameState !== 'waiting') return;
    
    setCurrentBet({ amount });
    setGameState('flying');
  };

  const handleCashout = () => {
    if (gameState !== 'flying' || !currentBet) return;
    
    const payout = currentBet.amount * multiplier;
    addBet('CRASH', currentBet.amount, multiplier, payout, 'win');
    setCurrentBet(null);
  };

  useEffect(() => {
    if (gameState === 'flying') {
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const nextMultiplier = Math.pow(Math.E, 0.065 * elapsed);
        
        setLiveBets(prev => prev.map(bet => {
          if (bet.status === 'playing' && Math.random() < 0.015 && nextMultiplier > 1.2) {
            return {
              ...bet,
              status: 'cashed',
              multiplier: nextMultiplier,
              payout: bet.amount * nextMultiplier
            };
          }
          return bet;
        }));

        if (nextMultiplier >= crashPointRef.current) {
          setGameState('crashed');
          setHistory(prev => [crashPointRef.current, ...prev].slice(0, 12));
          if (currentBet) {
             addBet('CRASH', currentBet.amount, crashPointRef.current, 0, 'loss');
             setCurrentBet(null);
          }
          clearInterval(timerRef.current);
          setTimeout(startNewRound, 4000);
        } else {
          setMultiplier(nextMultiplier);
        }
      }, 50);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState, currentBet, addBet, startNewRound]);

  useEffect(() => {
    startNewRound();
  }, [startNewRound]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0f212e] text-white font-sans selection:bg-orange-500/30">
      <Navbar isLoggedIn={true} />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto no-scrollbar relative bg-[#0f212e] 2xl:max-w-[1920px] 2xl:mx-auto 2xl:w-full">
          
          {/* Mobile Back Button */}
          <button onClick={() => navigate('/dashboard')} className="sm:hidden fixed top-20 left-6 z-50 bg-[#213743]/80 backdrop-blur-md p-3 rounded-xl border border-white/5 text-gray-400 hover:text-white transition-all shadow-xl">
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex flex-col lg:flex-row gap-8 mb-12">
            {/* Control Center */}
            <div className="w-full lg:w-[360px] xl:w-[420px] flex-shrink-0 bg-[#1a2c38] rounded-[3rem] border border-[#213743] p-8 flex flex-col gap-10 shadow-4xl z-20">
              <div className="space-y-5">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Entry Amount</span>
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-orange-500" />
                    <span className="text-[10px] font-black text-orange-500 uppercase italic">STK Active</span>
                  </div>
                </div>
                
                <div className="flex bg-[#0f212e] rounded-3xl border-2 border-[#213743] overflow-hidden focus-within:border-orange-500/50 transition-all shadow-xl group">
                  <div className="flex-1 flex items-center px-6 gap-3 py-5">
                    <span className="text-orange-500 font-black text-sm italic tracking-tighter">KSH</span>
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
              </div>

              {gameState === 'waiting' ? (
                <button 
                  onClick={handlePlaceBet} 
                  className="w-full bg-orange-500 hover:bg-orange-400 text-white font-black py-8 rounded-3xl transition-all shadow-[0_10px_0_rgb(180,80,0)] active:shadow-none active:translate-y-2 text-2xl uppercase italic tracking-tighter flex items-center justify-center gap-4 group"
                >
                  <Play className="w-7 h-7 fill-current group-hover:scale-110 transition-transform" />
                  INITIATE LAUNCH
                </button>
              ) : currentBet ? (
                <button 
                  onClick={handleCashout} 
                  className="w-full bg-[#00e701] hover:bg-[#1fff21] text-black font-black py-8 rounded-3xl transition-all shadow-[0_10px_0_rgb(0,180,0)] active:shadow-none active:translate-y-2 text-2xl uppercase italic tracking-tighter flex items-center justify-center gap-4 group animate-pulse"
                >
                  <StopCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
                  CASHOUT ({(currentBet.amount * multiplier).toFixed(0)})
                </button>
              ) : (
                <div className="w-full bg-[#2f4553] text-gray-400 font-black py-8 rounded-3xl opacity-50 text-2xl uppercase italic tracking-tighter text-center border-b-8 border-[#1a2c38]">
                  {gameState === 'crashed' ? 'BUSTED!' : 'IN ORBIT'}
                </div>
              )}

              <div className="mt-auto border-t border-[#213743] pt-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3 opacity-50">
                    <History className="w-4 h-4" />
                    <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Recent Multipliers</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {history.map((h, i) => (
                    <div key={i} className={`py-3 rounded-xl text-center text-[11px] font-black italic border-b-2 shadow-xl ${h >= 2 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-rose-500/10 text-rose-500 border-rose-500/30'}`}>
                      {h.toFixed(2)}x
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Game Canvas (Dynamic Scalable) */}
            <div className="flex-1 bg-[#1a2c38] min-h-[450px] lg:min-h-[600px] 2xl:min-h-[700px] rounded-[3rem] border border-[#213743] flex flex-col items-center justify-center relative overflow-hidden shadow-5xl group">
               <div className="absolute inset-0 z-0">
                 <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:48px_48px]"></div>
                 <div className={`absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-orange-500/10 to-transparent transition-opacity duration-1000 ${gameState === 'flying' ? 'opacity-100' : 'opacity-0'}`}></div>
               </div>

               {gameState === 'crashed' && (
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 text-center animate-in zoom-in-50 duration-300">
                   <div className="bg-rose-500 text-black px-12 py-6 rounded-[3rem] shadow-[0_0_80px_rgba(244,63,94,0.6)] border-4 border-white/20">
                     <h2 className="text-7xl sm:text-9xl font-black italic uppercase tracking-tighter leading-none">BUSTED!</h2>
                   </div>
                 </div>
               )}

               <div className="relative z-10 text-center">
                  <div className={`text-[12rem] lg:text-[16rem] 2xl:text-[22rem] font-black italic tabular-nums tracking-tighter transition-all duration-150 leading-none drop-shadow-[0_20px_60px_rgba(0,0,0,0.8)] ${gameState === 'crashed' ? 'text-rose-500 scale-110 opacity-30 blur-xl' : 'text-white'}`}>
                    {multiplier.toFixed(2)}<span className="text-5xl lg:text-7xl font-black not-italic opacity-40 ml-4">x</span>
                  </div>
               </div>

               {gameState === 'flying' && (
                 <div className="absolute bottom-24 left-24 animate-bounce transition-all duration-1000" style={{ transform: `scale(${1 + multiplier * 0.05}) translateY(-${multiplier * 15}px)` }}>
                    <Rocket className="w-24 h-24 2xl:w-40 2xl:h-40 text-orange-500 rotate-45 drop-shadow-[0_0_30px_rgba(249,115,22,0.8)]" />
                 </div>
               )}
            </div>
          </div>

          {/* Live Player Ledger */}
          <section className="bg-[#1a2c38] rounded-[3rem] border border-[#213743] overflow-hidden shadow-5xl">
             <div className="p-8 border-b border-[#213743] flex items-center justify-between bg-[#1a2c38]/50">
                <div className="flex items-center gap-5">
                   <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-inner">
                      <Users className="w-6 h-6 text-blue-500" />
                   </div>
                   <div>
                      <h3 className="text-base font-black text-white uppercase tracking-wider italic leading-none">Global Player Feed</h3>
                      <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-1.5">{liveBets.length} Active in Current Round</p>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-[pulse_1s_infinite]" />
                   <span className="text-[11px] font-black text-emerald-500 uppercase tracking-widest italic">REALTIME SYNC</span>
                </div>
             </div>
             
             <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left">
                   <thead className="bg-[#0f212e] text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
                      <tr>
                         <th className="px-10 py-5">Player Identity</th>
                         <th className="px-10 py-5">Wager</th>
                         <th className="px-10 py-5">Multiplier</th>
                         <th className="px-10 py-5 text-right">Yield</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-[#213743]">
                      {liveBets.map((bet) => (
                        <tr key={bet.id} className={`transition-all duration-500 ${bet.status === 'cashed' ? 'bg-emerald-500/5' : ''}`}>
                           <td className="px-10 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-[#213743] flex items-center justify-center border border-white/5">
                                    <UserIcon className="w-5 h-5 text-gray-500" />
                                 </div>
                                 <span className="text-sm font-black text-white italic uppercase tracking-tight">{bet.user}</span>
                              </div>
                           </td>
                           <td className="px-10 py-6">
                              <span className="text-sm font-black text-gray-400 tabular-nums tracking-tighter">Ksh {bet.amount.toLocaleString()}</span>
                           </td>
                           <td className="px-10 py-6">
                              {bet.status === 'cashed' ? (
                                <span className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[11px] font-black text-emerald-500 italic">
                                   {bet.multiplier?.toFixed(2)}x
                                </span>
                              ) : (
                                <span className="text-[11px] font-black text-gray-600 uppercase tracking-widest italic animate-pulse">Pending...</span>
                              )}
                           </td>
                           <td className="px-10 py-6 text-right">
                              {bet.status === 'cashed' ? (
                                <span className="text-base font-black text-emerald-500 italic tabular-nums animate-in zoom-in duration-300">
                                   + Ksh {bet.payout?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </span>
                              ) : (
                                <div className="flex justify-end gap-2">
                                   <div className="w-2 h-2 rounded-full bg-blue-500/20 animate-bounce" />
                                   <div className="w-2 h-2 rounded-full bg-blue-500/20 animate-bounce delay-100" />
                                   <div className="w-2 h-2 rounded-full bg-blue-500/20 animate-bounce delay-200" />
                                </div>
                              )}
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </section>

          <div className="h-20" />
        </main>
      </div>
    </div>
  );
};

export default Crash;
