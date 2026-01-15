
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  ChevronDown,
  Plus,
  Minus,
  Settings2,
  XCircle,
  Clock,
  Menu,
  Search,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Navigation,
  RefreshCw,
  Info,
  TrendingUp,
  Activity,
  History as HistoryIcon,
  MoveHorizontal,
  Users,
  ArrowLeft,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useUser } from '../context/UserContext';

interface PricePoint {
  time: number;
  price: number;
}

interface Trade {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  entryPrice: number;
  exitPrice?: number;
  amount: number;
  entryTime: number;
  settleTime: number;
  avatar: string;
  status: 'open' | 'win' | 'loss';
  payout?: number;
}

const SYMBOLS = [
  { name: 'EUR / USD (OTC)', base: 1.164442, volatility: 0.000008, decimals: 6, icon: '🇪🇺', volLevel: 'low' },
  { name: 'GBP / JPY (OTC)', base: 182.450, volatility: 0.012, decimals: 3, icon: '🇬🇧', volLevel: 'high' },
  { name: 'BTC / USD', base: 48500, volatility: 45, decimals: 2, icon: '₿', volLevel: 'high' },
  { name: 'ETH / USD', base: 2650, volatility: 2.5, decimals: 2, icon: 'Ξ', volLevel: 'medium' },
  { name: 'DOGE / USD', base: 0.0842, volatility: 0.0002, decimals: 4, icon: '🐶', volLevel: 'low' },
  { name: 'SOL / USD', base: 112.5, volatility: 0.15, decimals: 2, icon: '☀️', volLevel: 'medium' },
];

const TIMEFRAMES = [
  { label: '30S', value: 30000 },
  { label: '1M', value: 60000 },
  { label: '2M', value: 120000 },
];

const PAYOUT_PERCENTAGE = 0.86;
const MAX_HISTORY_TIME = 150000;

const VolatilityIndicator: React.FC<{ level: string }> = ({ level }) => {
  const colors = {
    high: 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.8)]',
    medium: 'bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)]',
    low: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
  };
  const animations = {
    high: 'animate-[pulse_0.4s_ease-in-out_infinite] scale-110',
    medium: 'animate-[pulse_1.2s_ease-in-out_infinite]',
    low: 'animate-[pulse_2.5s_ease-in-out_infinite] opacity-80'
  };
  return (
    <div className={`w-3 h-3 rounded-full ${colors[level as keyof typeof colors]} ${animations[level as keyof typeof animations]}`} />
  );
};

const Trading: React.FC = () => {
  const navigate = useNavigate();
  const { user, addBet, deductBalance } = useUser();
  const [betAmount, setBetAmount] = useState(50);
  const [selectedSymbol, setSelectedSymbol] = useState(SYMBOLS[0]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [prices, setPrices] = useState<PricePoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState(selectedSymbol.base);
  const priceRef = useRef(selectedSymbol.base);
  const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAssetSelectorOpen, setIsAssetSelectorOpen] = useState(false);
  const [timeWindow, setTimeWindow] = useState(TIMEFRAMES[1].value);
  const [panOffset, setPanOffset] = useState(0); 
  const [isLive, setIsLive] = useState(true);
  const [hoverPoint, setHoverPoint] = useState<{ price: number, time: number, x: number, y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastX = useRef(0);

  const currentMinRef = useRef(0);
  const currentMaxRef = useRef(0);

  useEffect(() => { priceRef.current = currentPrice; }, [currentPrice]);

  useEffect(() => {
    setCurrentPrice(selectedSymbol.base);
    setPrices([]);
    setPanOffset(0);
    setIsLive(true);
    currentMinRef.current = 0;
  }, [selectedSymbol]);

  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * selectedSymbol.volatility * 2.5; 
      setCurrentPrice(prev => {
        const next = Math.max(0.000001, prev + change);
        setPrices(prevPrices => {
          const now = Date.now();
          return [...prevPrices, { time: now, price: next }].filter(p => p.time > now - MAX_HISTORY_TIME);
        });
        return next;
      });
    }, 100); 
    return () => clearInterval(interval);
  }, [selectedSymbol]);

  useEffect(() => {
    const settleInterval = setInterval(() => {
      const now = Date.now();
      const cp = priceRef.current;
      setTrades(prevTrades => {
        let hasSettleable = false;
        const updated = prevTrades.map(trade => {
          if (trade.status === 'open' && now >= trade.settleTime) {
            hasSettleable = true;
            const win = trade.type === 'buy' ? cp > trade.entryPrice : cp < trade.entryPrice;
            const payoutValue = win ? trade.amount * (1 + PAYOUT_PERCENTAGE) : 0;
            addBet('TRADING', trade.amount, 1 + PAYOUT_PERCENTAGE, Number(payoutValue.toFixed(2)), win ? 'win' : 'loss');
            return { ...trade, status: win ? 'win' : 'loss' as const, exitPrice: cp, payout: Number(payoutValue.toFixed(2)) };
          }
          return trade;
        });
        return hasSettleable ? updated : prevTrades;
      });
    }, 200);
    return () => clearInterval(settleInterval);
  }, [addBet]);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(prev => (prev <= 1 ? 30 : prev - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTrade = (type: 'buy' | 'sell') => {
    const currentBal = user.isDemo ? user.demoBalance : user.balance;
    if (betAmount <= 0) return;
    if (currentBal < betAmount) {
      alert("Insufficient balance for this trade!");
      return;
    }
    
    if (deductBalance(betAmount)) {
      const settleAt = Date.now() + (30 * 1000); 
      setTrades(prev => [{
        id: Math.random().toString(36).substr(2, 9),
        symbol: selectedSymbol.name,
        type,
        entryPrice: currentPrice,
        amount: betAmount,
        entryTime: Date.now(),
        settleTime: settleAt,
        avatar: `https://i.pravatar.cc/150?u=${Math.random()}`,
        status: 'open'
      }, ...prev]);
      setActiveTab('open');
      setIsSidebarOpen(true);
      if (!isLive) resetToLive();
    }
  };

  const chartData = useMemo(() => {
    if (prices.length < 2) return null;
    const now = Date.now();
    const endTime = isLive ? now : now - panOffset;
    const startTime = endTime - timeWindow;
    
    // We filter with a buffer to ensure settlement lines appearing in the near future are visible
    const visiblePrices = prices.filter(p => p.time >= startTime - 1000 && p.time <= endTime + 20000);
    if (visiblePrices.length < 2) return null;

    const allVisibleVals = visiblePrices.map(p => p.price);
    const rawMin = Math.min(...allVisibleVals);
    const rawMax = Math.max(...allVisibleVals);
    
    const rangeBuffer = (rawMax - rawMin) * 0.4 || 0.000001;
    const targetMin = rawMin - rangeBuffer;
    const targetMax = rawMax + rangeBuffer;

    if (currentMinRef.current === 0) {
      currentMinRef.current = targetMin;
      currentMaxRef.current = targetMax;
    } else {
      currentMinRef.current += (targetMin - currentMinRef.current) * 0.15;
      currentMaxRef.current += (targetMax - currentMaxRef.current) * 0.15;
    }

    const min = currentMinRef.current;
    const max = currentMaxRef.current;
    const range = max - min;
    
    const scaleY = (p: number) => 90 - ((p - min) / range) * 80;
    const scaleX = (t: number) => ((t - startTime) / timeWindow) * 100;

    const path = visiblePrices.map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.time)} ${scaleY(p.price)}`).join(" ");

    const openTradesOnChart = trades
      .filter(t => t.status === 'open' && t.symbol === selectedSymbol.name)
      .map(t => {
        const isWinning = t.type === 'buy' ? currentPrice > t.entryPrice : currentPrice < t.entryPrice;
        const profit = isWinning ? t.amount * PAYOUT_PERCENTAGE : -t.amount;
        return { 
          ...t, 
          y: scaleY(t.entryPrice), 
          xSettle: scaleX(t.settleTime), 
          xEntry: scaleX(t.entryTime),
          isWinning,
          profit
        };
      });

    return { path, labels: [max, (max + min) / 2, min].map(v => ({ val: v.toFixed(selectedSymbol.decimals), y: scaleY(v) })), currentY: scaleY(currentPrice), openTradesOnChart, scaleX, scaleY, startTime, endTime };
  }, [prices, trades, currentPrice, selectedSymbol, timeWindow, panOffset, isLive]);

  const onMouseMove = (e: React.MouseEvent) => {
    if (!chartData || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const percentX = (mouseX / rect.width) * 100;
    const hoveredTime = chartData.startTime + (percentX / 100) * timeWindow;

    let closest = prices[0];
    let minDiff = Infinity;
    for (let p of prices) {
      const diff = Math.abs(p.time - hoveredTime);
      if (diff < minDiff) { minDiff = diff; closest = p; }
    }
    if (closest && Math.abs(closest.time - hoveredTime) < timeWindow * 0.05) {
      setHoverPoint({ price: closest.price, time: closest.time, x: chartData.scaleX(closest.time), y: chartData.scaleY(closest.price) });
    } else { setHoverPoint(null); }
  };

  const resetToLive = () => { setIsLive(true); setPanOffset(0); setTimeWindow(TIMEFRAMES[1].value); };

  return (
    <div className="flex flex-col h-screen bg-[#0b0e14] overflow-hidden text-white font-sans select-none">
      <Navbar isLoggedIn={true} />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <main className="flex-1 flex flex-col relative bg-[#131722] overflow-hidden 2xl:max-w-[1920px] 2xl:mx-auto 2xl:w-full">
          
          <div className="h-16 bg-[#1a2c38]/95 backdrop-blur-md border-b border-[#213743] flex items-center justify-between px-4 sm:px-6 z-50">
             <div className="flex items-center gap-4">
                <button onClick={() => navigate('/dashboard')} className="p-2 sm:hidden bg-[#213743] rounded-xl mr-2"><ArrowLeft className="w-5 h-5 text-gray-400" /></button>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 lg:hidden bg-[#213743] rounded-xl"><Menu className="w-5 h-5" /></button>
                <div className="relative">
                  <button onClick={() => setIsAssetSelectorOpen(!isAssetSelectorOpen)} className="bg-[#213743] rounded-2xl px-5 py-2.5 flex items-center gap-3 transition-all shadow-xl group">
                    <span className="text-xl sm:text-2xl">{selectedSymbol.icon}</span>
                    <span className="text-[10px] sm:text-[13px] font-black uppercase tracking-[0.2em] text-white">{selectedSymbol.name}</span>
                    <VolatilityIndicator level={selectedSymbol.volLevel} />
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isAssetSelectorOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isAssetSelectorOpen && (
                    <div className="absolute top-full left-0 mt-3 w-80 bg-[#1e222d] border border-[#2a2e39] rounded-3xl shadow-3xl z-[60] py-2 animate-in fade-in slide-in-from-top-2">
                      {SYMBOLS.map(s => (
                        <button key={s.name} onClick={() => { setSelectedSymbol(s); setIsAssetSelectorOpen(false); }} className={`w-full flex items-center justify-between px-6 py-4 hover:bg-[#213743] transition-all ${selectedSymbol.name === s.name ? 'bg-blue-500/10' : ''}`}>
                          <div className="flex items-center gap-4">
                            <span className="text-2xl">{s.icon}</span>
                            <span className="text-[11px] font-black uppercase tracking-widest text-white">{s.name}</span>
                          </div>
                          <VolatilityIndicator level={s.volLevel} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
             </div>
             <div className="hidden sm:flex items-center gap-6">
                <div className="bg-[#213743] px-5 py-2.5 rounded-2xl flex items-center gap-3 border border-white/5">
                   <ShieldCheck className="w-4 h-4 text-emerald-400" />
                   <span className="text-[11px] font-black uppercase tracking-widest italic">Encrypted</span>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all active:scale-95 lg:hidden"
                >
                  <TrendingUp className="w-4 h-4" /> Positions
                </button>
             </div>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
            {/* Y-Axis */}
            <div className="hidden lg:flex w-24 border-r border-[#213743] flex-col justify-between py-20 px-4 text-[11px] text-gray-500 font-mono z-20">
               {chartData?.labels.map((lbl, i) => (
                 <div key={i} className="absolute left-4 whitespace-nowrap bg-[#1e222d] px-2 py-0.5 rounded border border-[#2a2e39] text-white font-black text-[9px]" style={{ top: `${lbl.y}%`, transform: 'translateY(-50%)' }}>{lbl.val}</div>
               ))}
            </div>

            {/* Chart Area */}
            <div 
              ref={containerRef}
              className={`flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing`}
              onMouseMove={onMouseMove}
              onMouseDown={(e) => { isDragging.current = true; lastX.current = e.clientX; setIsLive(false); }}
              onMouseUp={() => isDragging.current = false}
              onMouseLeave={() => { isDragging.current = false; setHoverPoint(null); }}
            >
               <button onClick={() => navigate('/dashboard')} className="sm:hidden absolute top-6 left-6 z-50 bg-[#1a2c38]/80 backdrop-blur-xl border border-white/5 p-3 rounded-2xl text-gray-400 shadow-2xl">
                 <ArrowLeft className="w-5 h-5" />
               </button>

               <button onClick={() => navigate('/dashboard')} className="hidden lg:flex absolute top-6 right-32 z-50 bg-[#1a2c38]/80 backdrop-blur-xl border border-white/5 p-3 rounded-2xl text-gray-400 hover:text-white transition-all shadow-xl group">
                 <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
               </button>

               <div className="absolute top-12 left-12 z-30 pointer-events-none">
                  <h1 className="text-7xl lg:text-[10rem] font-black italic tracking-tighter tabular-nums text-white leading-none drop-shadow-2xl">{currentPrice.toFixed(selectedSymbol.decimals)}</h1>
               </div>

               <div className="absolute top-8 right-8 z-40 bg-[#1a2c38]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-1.5 flex gap-1 shadow-2xl">
                  {TIMEFRAMES.map(tf => (
                    <button key={tf.value} onClick={() => { setTimeWindow(tf.value); setIsLive(true); setPanOffset(0); }} className={`px-5 py-2.5 rounded-xl text-[11px] font-black transition-all ${timeWindow === tf.value ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>{tf.label}</button>
                  ))}
               </div>

               <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full opacity-90">
                  {chartData && (
                    <>
                      <path d={chartData.path} fill="none" stroke="#3b82f6" strokeWidth="0.45" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
                      
                      {/* Vertical Settlement Lines & Open Orders */}
                      {chartData.openTradesOnChart.map(trade => {
                        const color = trade.type === 'buy' ? '#3b82f6' : '#ef4444';
                        const runningColor = trade.isWinning ? '#10b981' : '#f43f5e';
                        
                        return (
                          <g key={trade.id}>
                            <line x1="0" y1={trade.y} x2="100" y2={trade.y} stroke={color} strokeWidth="0.2" strokeDasharray="1,1" opacity="0.4" />
                            
                            {/* Settlement Vertical Line - High Performance Rendering */}
                            {trade.xSettle >= -5 && trade.xSettle <= 105 && (
                              <g>
                                <line x1={trade.xSettle} y1="0" x2={trade.xSettle} y2="100" stroke={runningColor} strokeWidth="0.5" strokeDasharray="1.5,1.5" className="animate-pulse" />
                                <g transform={`translate(${trade.xSettle}, 25)`}>
                                   <rect x="-18" y="-6" width="36" height="12" rx="4" fill="#0b0e14" stroke={runningColor} strokeWidth="1" />
                                   <text y="2.5" textAnchor="middle" fill="white" fontSize="4.5" fontWeight="900" fontStyle="italic" letterSpacing="0.1">SETTLE</text>
                                </g>
                              </g>
                            )}

                            <g transform={`translate(${Math.max(10, Math.min(90, trade.xEntry))}, ${trade.y - 12})`}>
                               <rect x="-20" y="-8" width="40" height="16" rx="5" fill="#0f212e" stroke={runningColor} strokeWidth="1" className="shadow-2xl" />
                               <text y="3" textAnchor="middle" fill={runningColor} fontSize="6" fontWeight="900" fontStyle="italic">
                                 {trade.isWinning ? '+' : ''}{trade.profit.toFixed(2)}
                               </text>
                            </g>
                          </g>
                        );
                      })}

                      {hoverPoint && (
                        <g>
                           <line x1={hoverPoint.x} y1="0" x2={hoverPoint.x} y2="100" stroke="#3b82f6" strokeWidth="0.15" strokeDasharray="1,1" opacity="0.4" />
                           <line x1="0" y1={hoverPoint.y} x2="100" y2={hoverPoint.y} stroke="#3b82f6" strokeWidth="0.15" strokeDasharray="1,1" opacity="0.4" />
                           <circle cx={hoverPoint.x} cy={hoverPoint.y} r="0.6" fill="#3b82f6" stroke="white" strokeWidth="0.1" />
                        </g>
                      )}
                    </>
                  )}
                  {isLive && chartData && (
                    <g transform={`translate(0, ${chartData.currentY})`}>
                      <line x1="0" y1="0" x2="100" y2="0" stroke="#3b82f6" strokeWidth="0.35" strokeDasharray="1.5,1.5" className="animate-pulse" />
                      <circle cx="100" cy="0" r="1.5" fill="#3b82f6" className="animate-pulse" />
                    </g>
                  )}
               </svg>

               <div className="absolute bottom-10 left-10 z-40 flex gap-4">
                  <button onClick={resetToLive} className={`px-8 py-4 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl transition-all ${isLive ? 'bg-emerald-500 text-black' : 'bg-blue-600 text-white shadow-blue-500/30'}`}><RefreshCw className={`w-4 h-4 ${isLive ? 'animate-spin' : ''}`} /> {isLive ? 'SYNCHRONIZED' : 'RESYNC TO LIVE'}</button>
               </div>
            </div>

            {/* Position Manager Sidebar - Mobile Back Button Added */}
            <div className={`fixed lg:relative inset-y-0 right-0 w-full sm:w-[420px] bg-[#1a2c38] border-l border-[#213743] z-[110] transform transition-transform duration-500 shadow-5xl lg:shadow-none ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
               <div className="h-full flex flex-col">
                  {/* Header with Prominent Back Button */}
                  <div className="p-5 border-b border-[#213743] bg-[#0f212e] flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                       <button onClick={() => setIsSidebarOpen(false)} className="p-3 bg-[#213743] rounded-2xl text-gray-400 flex items-center gap-2 hover:text-white transition-all group">
                          <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                          <span className="text-[12px] font-black uppercase lg:hidden">Back to Market</span>
                       </button>
                       <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Live Feed</span>
                       </div>
                    </div>
                    
                    <div className="flex p-1.5 bg-[#1a2c38] rounded-2xl w-full border border-white/5 shadow-inner">
                        <button 
                          onClick={() => setActiveTab('open')} 
                          className={`flex-1 py-4 text-[12px] font-black uppercase rounded-xl transition-all ${activeTab === 'open' ? 'bg-[#213743] text-white shadow-lg' : 'text-gray-500'}`}
                        >
                          Open Orders
                        </button>
                        <button 
                          onClick={() => setActiveTab('closed')} 
                          className={`flex-1 py-4 text-[12px] font-black uppercase rounded-xl transition-all ${activeTab === 'closed' ? 'bg-[#213743] text-white shadow-lg' : 'text-gray-500'}`}
                        >
                          History
                        </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar bg-[#131722]/60">
                    {trades.filter(t => activeTab === 'open' ? t.status === 'open' : t.status !== 'open').map(trade => {
                      const totalDuration = trade.settleTime - trade.entryTime;
                      const elapsed = Date.now() - trade.entryTime;
                      const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
                      
                      const isWinning = trade.type === 'buy' ? currentPrice > trade.entryPrice : currentPrice < trade.entryPrice;
                      const livePLValue = isWinning ? trade.amount * PAYOUT_PERCENTAGE : -trade.amount;
                      const displayColor = isWinning ? 'text-emerald-500' : 'text-rose-500';

                      return (
                        <div key={trade.id} className={`p-7 rounded-[3rem] border-2 shadow-2xl relative overflow-hidden group transition-all duration-300 ${trade.status === 'win' ? 'bg-emerald-500/10 border-emerald-500/30' : trade.status === 'loss' ? 'bg-rose-500/10 border-rose-500/30' : 'bg-[#1a2c38] border-[#213743] hover:border-blue-500/30'}`}>
                          {trade.status === 'open' && (
                            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#213743] overflow-hidden">
                              <div className={`h-full transition-all duration-1000 ease-linear ${isWinning ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${progress}%` }} />
                            </div>
                          )}
                          
                          <div className="flex justify-between items-start relative z-10">
                              <div className="flex items-center gap-5">
                                 <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center ${trade.type === 'buy' ? 'bg-blue-500/20 text-blue-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                    {trade.type === 'buy' ? <ArrowUp className="w-9 h-9" /> : <ArrowDown className="w-9 h-9" />}
                                 </div>
                                 <div className="min-w-0">
                                   <p className="text-base font-black text-white italic truncate max-w-[160px] uppercase tracking-tight">{trade.symbol}</p>
                                   <p className="text-[11px] text-gray-500 font-black uppercase mt-1.5 tracking-widest">Ksh {trade.amount.toLocaleString()}</p>
                                 </div>
                              </div>
                              <div className="text-right flex flex-col items-end">
                                 {/* REAL-TIME PROFIT/LOSS FEEDBACK */}
                                 <div className={`text-2xl font-black italic tabular-nums leading-none ${displayColor}`}>
                                   {trade.status === 'open' 
                                     ? (livePLValue > 0 ? `+${livePLValue.toFixed(2)}` : `${livePLValue.toFixed(2)}`)
                                     : trade.status === 'win' ? `+${trade.payout}` : `-${trade.amount}`
                                   }
                                 </div>
                                 {trade.status === 'open' && (
                                   <div className="flex items-center gap-2 mt-4 bg-black/40 px-4 py-1.5 rounded-full border border-white/5">
                                      <Clock className="w-3.5 h-3.5 text-blue-400 animate-spin" style={{ animationDuration: '4s' }} />
                                      <span className="text-[11px] text-blue-400 font-black italic tabular-nums">
                                        {Math.max(0, Math.ceil((trade.settleTime - Date.now()) / 1000))}s
                                      </span>
                                   </div>
                                 )}
                              </div>
                           </div>
                        </div>
                      );
                    })}
                    {trades.filter(t => activeTab === 'open' ? t.status === 'open' : t.status !== 'open').length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center opacity-10 py-32 text-center grayscale">
                         <Activity className="w-20 h-20 mb-8" />
                         <p className="text-[13px] font-black uppercase tracking-[0.5em] leading-relaxed">No Activity Records<br/>Found in Secure Feed</p>
                      </div>
                    )}
                  </div>
               </div>
            </div>
          </div>

          <div className="bg-[#1a2c38] border-t border-[#213743] p-4 sm:p-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-6 z-40 shadow-2xl relative">
             <div className="w-full sm:w-auto flex items-center gap-4 flex-1">
                <div className="bg-[#0f212e] border border-[#2a2e39] rounded-2xl sm:rounded-3xl flex items-center h-16 sm:h-20 flex-1 sm:max-w-[400px] shadow-inner">
                   <button onClick={() => setBetAmount(prev => Math.max(1, prev - 10))} className="px-6 h-full border-r border-[#2a2e39] hover:bg-[#213743] rounded-l-3xl transition-colors"><Minus className="w-5 h-5 text-gray-500 hover:text-white" /></button>
                   <div className="flex-1 flex flex-col items-center justify-center">
                      <span className="text-[9px] font-black text-gray-600 uppercase mb-1 opacity-50 tracking-[0.2em]">Investment</span>
                      <span className="text-xl sm:text-2xl font-black italic text-white tracking-tighter tabular-nums">KSH {betAmount}</span>
                   </div>
                   <button onClick={() => setBetAmount(prev => prev + 10)} className="px-6 h-full border-l border-[#2a2e39] hover:bg-[#213743] rounded-r-3xl transition-colors"><Plus className="w-5 h-5 text-gray-500 hover:text-white" /></button>
                </div>
                <div className="hidden md:flex bg-[#0f212e] border border-[#2a2e39] rounded-3xl h-20 px-10 items-center gap-4 shadow-inner">
                   <Clock className="w-5 h-5 text-blue-500 animate-spin" style={{ animationDuration: '4s' }} />
                   <span className="text-2xl font-black italic text-white tabular-nums tracking-tighter">00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
                </div>
             </div>
             <div className="w-full flex-1 max-w-2xl grid grid-cols-2 gap-4 sm:gap-6">
                <button onClick={() => handleTrade('sell')} className="bg-[#ef4444] hover:bg-[#ff5555] rounded-[2rem] h-16 sm:h-24 flex items-center justify-between px-6 sm:px-12 transition-all border-b-8 border-red-950 active:translate-y-2 active:border-b-0 shadow-3xl group">
                   <div className="text-left"><p className="text-2xl sm:text-4xl font-black italic uppercase leading-none text-white tracking-tighter">SELL</p><p className="text-[10px] font-black opacity-60 uppercase mt-1 tracking-widest">Payout 86%</p></div>
                   <ArrowDown className="w-8 h-8 sm:w-10 text-white group-hover:translate-y-2 transition-transform" />
                </button>
                <button onClick={() => handleTrade('buy')} className="bg-[#3b82f6] hover:bg-[#60a5fa] rounded-[2rem] h-16 sm:h-24 flex items-center justify-between px-6 sm:px-12 transition-all border-b-8 border-blue-950 active:translate-y-2 active:border-b-0 shadow-3xl group">
                   <div className="text-left"><p className="text-2xl sm:text-4xl font-black italic uppercase leading-none text-white tracking-tighter">BUY</p><p className="text-[10px] font-black opacity-60 uppercase mt-1 tracking-widest">Payout 86%</p></div>
                   <ArrowUp className="w-8 h-8 sm:w-10 text-white group-hover:-translate-y-2 transition-transform" />
                </button>
             </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Trading;
