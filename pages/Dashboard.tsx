
import React, { useState, useEffect, useRef, Suspense } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { ORIGINALS } from '../constants';
import { Flame, Star, Trophy, History, ArrowRight, Zap, PlayCircle, Layers, TrendingUp, Menu, Search, Filter } from 'lucide-react';

// Lazy-loaded GameCard
const GameCard = React.lazy(() => import('../components/GameCard'));

const Dashboard: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0f212e] text-white font-sans selection:bg-blue-500/30">
      <Navbar isLoggedIn={true} />
      
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        
        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
           <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] md:hidden" onClick={() => setIsMobileSidebarOpen(false)}>
              <div className="w-64 h-full bg-[#0f212e]" onClick={e => e.stopPropagation()}>
                 <Sidebar />
              </div>
           </div>
        )}

        <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto no-scrollbar relative bg-[#0f212e]">
          {/* Dashboard Header Banner */}
          <section className="mb-8 sm:mb-12">
             <div className="bg-gradient-to-br from-blue-600/20 via-blue-900/10 to-transparent p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] border border-blue-500/20 relative overflow-hidden group shadow-3xl">
                <div className="absolute -top-10 -right-10 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-1000 group-hover:rotate-12 group-hover:scale-110 pointer-events-none">
                   <PlayCircle className="w-64 sm:w-96 h-64 sm:h-96" />
                </div>
                <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-4 sm:mb-5">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                        <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 animate-pulse" />
                      </div>
                      <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-blue-400 italic">Account Status: Elite Tier</span>
                   </div>
                   <h1 className="text-2xl sm:text-4xl md:text-6xl font-black italic tracking-tighter uppercase mb-4 sm:mb-6 leading-none">Welcome Back, <span className="text-blue-400">Player One</span></h1>
                   <p className="text-gray-400 text-xs sm:text-base md:text-lg max-w-xl font-medium leading-relaxed opacity-80 mb-6 sm:mb-0">
                      High-performance gaming is active. <span className="text-emerald-400 font-bold">KSH 12,400</span> available in payouts.
                   </p>
                   <div className="mt-6 sm:mt-10 flex flex-wrap gap-4 sm:gap-5">
                      <button className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 border-b-4 border-blue-700 active:translate-y-1">DAILY RELOAD</button>
                      <button className="w-full sm:w-auto bg-[#1a2c38]/60 backdrop-blur-md hover:bg-[#213743] text-white px-8 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all border border-white/5 active:scale-95">VIEW REWARDS</button>
                   </div>
                </div>
             </div>
          </section>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
             {[
               { label: 'Global Wagered', value: 'KSH 1.2M', icon: <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
               { label: 'Today Profit', value: '+KSH 12.4K', icon: <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
               { label: 'Current Bets', value: '4 OPEN', icon: <Layers className="w-4 h-4 sm:w-5 sm:h-5" />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
               { label: 'Elite Points', value: '14,820 XP', icon: <Star className="w-4 h-4 sm:w-5 sm:h-5" />, color: 'text-pink-500', bg: 'bg-pink-500/10' }
             ].map((stat, i) => (
               <div key={i} className="bg-[#1a2c38]/40 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:rounded-[2rem] border border-[#213743] flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-6 group hover:bg-[#213743]/60 transition-all cursor-default shadow-xl hover:-translate-y-1 text-center sm:text-left">
                  <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-2xl ${stat.bg} border border-[#213743] flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner`}>
                     {React.cloneElement(stat.icon as React.ReactElement, { className: stat.color })}
                  </div>
                  <div>
                     <p className="text-[8px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5 sm:mb-1.5 leading-none">{stat.label}</p>
                     <p className="text-sm sm:text-lg font-black text-white italic tracking-tighter tabular-nums leading-none">{stat.value}</p>
                  </div>
               </div>
             ))}
          </div>

          {/* Clean Overview Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-6">
             <div className="w-full sm:w-[450px] flex items-center bg-[#1a2c38] rounded-2xl px-5 py-4 border border-[#213743] group focus-within:border-blue-500 transition-all shadow-xl">
                <Search className="w-5 h-5 text-gray-500 mr-4 group-focus-within:text-blue-500" />
                <input 
                  type="text" 
                  placeholder="SEARCH GAMES OR MARKETS..." 
                  className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest w-full text-white placeholder-gray-600"
                />
             </div>
             
             <div className="flex items-center gap-4 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none bg-[#1a2c38] px-6 py-4 rounded-2xl border border-[#213743] flex items-center justify-center gap-3 hover:bg-[#213743] transition-all group">
                   <Filter className="w-4 h-4 text-gray-500 group-hover:text-blue-400" />
                   <span className="text-[10px] font-black uppercase tracking-widest">Advanced Filters</span>
                </button>
                <div className="hidden lg:flex items-center gap-3 bg-[#1a2c38] px-4 py-3 rounded-2xl border border-[#213743]">
                   <History className="w-4 h-4 text-gray-500" />
                   <div className="w-px h-4 bg-[#213743]" />
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recent Activity</span>
                </div>
             </div>
          </div>
          
          {/* Games Content */}
          <section className="mb-16 sm:mb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-10 gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                   <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-xl sm:text-3xl font-black italic tracking-tighter uppercase text-white leading-none">Stake Originals</h2>
                  <span className="text-[8px] sm:text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-0.5 sm:mt-1">Fair Play, High Intensity</span>
                </div>
              </div>
              <button className="flex items-center gap-2 text-[9px] sm:text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] hover:text-blue-400 transition-all group w-fit">
                 VIEW ALL GAMES <ArrowRight className="w-3.5 sm:w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-8">
              <Suspense fallback={<div className="h-64 rounded-2xl bg-[#1a2c38] animate-pulse" />}>
                {ORIGINALS.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </Suspense>
            </div>
          </section>

          {/* Teaser Section */}
          <section className="pb-10">
             <div className="bg-[#1a2c38]/30 rounded-2xl sm:rounded-[2.5rem] border border-[#213743] p-6 sm:p-10 flex flex-col md:flex-row items-center gap-8 sm:gap-10">
                <div className="flex-1 text-center md:text-left">
                   <h3 className="text-xl sm:text-2xl font-black italic uppercase tracking-tighter mb-3 sm:mb-4">Weekend Elite Series</h3>
                   <p className="text-gray-500 text-xs sm:text-sm font-medium leading-relaxed mb-6">
                      Battle for <span className="text-yellow-500 font-bold">KSH 250,000</span>. The top multiplier in Trading or Crash takes the crown.
                   </p>
                   <button className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-black px-8 py-3 rounded-xl font-black text-[10px] sm:text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-lg">JOIN TOURNAMENT</button>
                </div>
                <div className="w-full md:w-auto grid grid-cols-3 gap-3 sm:gap-4">
                   {[1,2,3].map(i => (
                     <div key={i} className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#0f212e] border border-[#213743] flex items-center justify-center">
                        <Trophy className={`w-6 h-6 sm:w-8 sm:h-8 ${i === 1 ? 'text-yellow-500' : i === 2 ? 'text-gray-400' : 'text-orange-600'}`} />
                     </div>
                   ))}
                </div>
             </div>
          </section>
        </main>
      </div>

      {/* Mobile Nav Toggle */}
      <button 
        onClick={() => setIsMobileSidebarOpen(true)}
        className="md:hidden fixed bottom-6 left-6 z-[60] w-12 h-12 bg-[#213743] rounded-xl flex items-center justify-center border border-white/5 shadow-2xl"
      >
        <Menu className="w-6 h-6 text-white" />
      </button>

      {/* Floating Support */}
      <div className="fixed bottom-6 sm:bottom-10 right-6 sm:right-10 z-[60]">
        <button className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500 hover:bg-blue-600 rounded-xl sm:rounded-[2rem] flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-90 group border-4 border-[#0f212e]">
          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 rounded-full border-[2px] sm:border-[3px] border-[#0f212e] animate-pulse" />
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
