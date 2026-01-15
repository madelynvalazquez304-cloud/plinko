
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  Shield, 
  Zap, 
  Trophy, 
  Users, 
  Globe, 
  ChevronRight, 
  Star, 
  ArrowUpRight, 
  PlayCircle, 
  Flame,
  LayoutGrid,
  Sparkles,
  Dices,
  CirclePlay,
  ArrowRight,
  TrendingUp,
  Coins,
  Medal,
  Activity
} from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[#0f212e] text-white selection:bg-blue-500/30 font-sans overflow-x-hidden">
      <Navbar isLoggedIn={false} />
      
      <main className="flex-grow">
        {/* Cinematic Hero Section */}
        <section className="relative pt-16 sm:pt-24 pb-32 sm:pb-40 px-4 overflow-hidden">
          {/* Immersive Background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1200px] bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.2)_0%,rgba(16,185,129,0.08)_30%,transparent_70%)] pointer-events-none" />
          <div className="absolute -top-60 -left-60 w-[800px] h-[800px] bg-blue-600/20 blur-[180px] rounded-full animate-pulse opacity-60" />
          <div className="absolute top-1/4 -right-60 w-[700px] h-[700px] bg-emerald-500/10 blur-[150px] rounded-full animate-pulse delay-1000 opacity-50" />
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/30 to-emerald-500/30 border border-white/20 px-6 py-2.5 rounded-full text-blue-400 text-[9px] sm:text-[11px] font-black uppercase tracking-[0.4em] mb-10 sm:mb-12 shadow-3xl backdrop-blur-xl animate-fade-in ring-1 ring-white/10">
                  <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" /> 
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-emerald-300">Platform Online & Secure</span>
                </div>
                
                <h1 className="text-4xl xs:text-5xl sm:text-8xl lg:text-[10rem] font-black italic tracking-tighter mb-8 sm:mb-10 leading-[0.9] sm:leading-[0.8] uppercase">
                  Play the <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-100 to-blue-600 drop-shadow-2xl">Extreme.</span>
                </h1>
                
                <p className="text-gray-400 text-lg sm:text-3xl mb-12 sm:mb-14 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed opacity-90 tracking-tight">
                  The ultimate destination for provably fair gaming. <br className="hidden sm:block" />
                  <span className="text-white">Instant M-PESA</span> payouts and multi-chain support.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 justify-center lg:justify-start">
                  <button 
                    onClick={() => navigate('/auth')}
                    className="group relative overflow-hidden bg-blue-500 hover:bg-blue-400 text-white px-10 sm:px-14 py-5 sm:py-7 rounded-2xl sm:rounded-[2.5rem] font-black text-xl sm:text-2xl transition-all shadow-[0_25px_60px_rgba(59,130,246,0.5)] flex items-center justify-center gap-4 sm:gap-5 active:scale-95 border-b-[6px] border-blue-700 active:border-0 active:translate-y-1.5"
                  >
                    <span>START PLAYING</span>
                    <ArrowRight className="w-6 h-6 sm:w-7 h-7 group-hover:translate-x-2 transition-transform" />
                  </button>
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="bg-[#1a2c38]/60 backdrop-blur-2xl hover:bg-[#213743] text-white px-10 sm:px-14 py-5 sm:py-7 rounded-2xl sm:rounded-[2.5rem] font-black text-xl sm:text-2xl transition-all border border-white/10 shadow-3xl active:scale-95 flex items-center justify-center gap-4 group"
                  >
                    <Dices className="w-6 h-6 sm:w-7 h-7 text-blue-400 group-hover:rotate-12 transition-transform" />
                    LOBBY PREVIEW
                  </button>
                </div>

                <div className="mt-12 sm:mt-16 flex items-center gap-6 sm:gap-8 justify-center lg:justify-start opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                   <div className="flex flex-col">
                      <span className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Licensed By</span>
                      <Shield className="w-8 h-8 sm:w-10 h-10 text-white" />
                   </div>
                   <div className="w-px h-8 sm:h-10 bg-white/10" />
                   <div className="flex flex-col">
                      <span className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Audited By</span>
                      <div className="font-black text-lg sm:text-xl italic tracking-tighter uppercase">iTech Labs</div>
                   </div>
                </div>
              </div>

              {/* Floating Hero Visual */}
              <div className="flex-1 w-full max-w-2xl perspective-2000 hidden lg:block">
                <div className="relative group animate-float-slow">
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-emerald-500/20 to-blue-500/20 rounded-[4rem] blur-[100px] opacity-40 group-hover:opacity-60 transition-opacity" />
                  
                  {/* Floating Multiplier Badge */}
                  <div className="absolute -top-10 -right-10 z-30 bg-[#1a2c38] border border-blue-500/30 p-6 rounded-[2rem] shadow-4xl animate-bounce-slow">
                     <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Max Win</span>
                        <span className="text-4xl font-black italic text-white tracking-tighter">110,000x</span>
                     </div>
                  </div>

                  <div className="relative bg-[#1a2c38]/90 backdrop-blur-3xl rounded-[4rem] border border-white/10 p-4 overflow-hidden shadow-5xl ring-1 ring-white/10">
                    <img 
                      src="https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&q=80&w=1200" 
                      className="w-full aspect-video object-cover rounded-[3rem] opacity-70 group-hover:scale-105 transition-transform duration-1000" 
                      alt="Casino Preview"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a2c38] via-transparent to-transparent" />
                    
                    <div className="absolute bottom-12 left-12 right-12">
                       <div className="flex items-center gap-3 mb-4">
                          <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-[9px] font-black text-blue-400 uppercase tracking-widest">LIVE NOW</span>
                          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                             24,812 PLAYERS ONLINE
                          </span>
                       </div>
                       <h3 className="text-5xl font-black text-white italic tracking-tighter uppercase mb-6 drop-shadow-2xl">Sugar Rush Deluxe</h3>
                       <div className="flex justify-between items-center">
                          <button 
                            onClick={() => navigate('/auth')}
                            className="bg-white text-black px-10 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl hover:shadow-white/20"
                          >
                            PLAY PREVIEW
                          </button>
                          <div className="flex gap-4">
                             <div className="w-12 h-12 rounded-xl bg-[#213743] border border-white/5 flex items-center justify-center text-gray-400">
                                <TrendingUp className="w-6 h-6" />
                             </div>
                             <div className="w-12 h-12 rounded-xl bg-[#213743] border border-white/5 flex items-center justify-center text-gray-400">
                                <Star className="w-6 h-6" />
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Winners Ticker */}
        <section className="bg-[#0b161f] border-y border-white/5 py-6 overflow-hidden">
           <div className="flex items-center whitespace-nowrap animate-marquee">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="flex items-center gap-4 px-12 border-r border-white/5">
                   <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-blue-400" />
                   </div>
                   <span className="text-xs font-black uppercase tracking-widest text-gray-500">
                      User_9{i}4 won <span className="text-emerald-500 italic font-black">Ksh {(Math.random() * 50000).toLocaleString(undefined, {maximumFractionDigits: 0})}</span> on <span className="text-white">Crash</span>
                   </span>
                </div>
              ))}
           </div>
        </section>

        {/* Casino Categories Preview */}
        <section className="py-24 sm:py-32 bg-[#0b161f] relative">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 sm:mb-20 gap-8">
              <div>
                <h2 className="text-4xl sm:text-7xl font-black italic tracking-tighter uppercase mb-5 leading-none">The Lobby</h2>
                <p className="text-gray-500 font-bold uppercase tracking-[0.4em] text-[10px]">Elite Tier Provably Fair Gaming Selections</p>
              </div>
              <div className="flex gap-4">
                <button className="bg-[#1a2c38] px-8 sm:px-10 py-4 sm:py-5 rounded-[2rem] text-white font-black text-[11px] sm:text-[12px] uppercase tracking-widest hover:bg-[#213743] transition-all border border-white/10 flex items-center gap-4 shadow-2xl">
                  <LayoutGrid className="w-5 h-5 text-blue-500" /> BROWSE ALL 2,400+ GAMES
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 sm:gap-12">
              {/* Originals Card */}
              <div 
                onClick={() => navigate('/auth')}
                className="group relative h-[500px] sm:h-[600px] rounded-[3rem] sm:rounded-[4rem] overflow-hidden cursor-pointer shadow-5xl hover:-translate-y-4 transition-all duration-700"
              >
                <img 
                  src="https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&q=80&w=800" 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  alt="Originals"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-blue-900/40 to-transparent" />
                <div className="absolute inset-0 p-8 sm:p-12 flex flex-col justify-end">
                   <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-500 rounded-3xl flex items-center justify-center mb-6 sm:mb-8 shadow-3xl group-hover:rotate-12 transition-transform">
                      <Flame className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                   </div>
                   <h3 className="text-4xl sm:text-6xl font-black italic text-white uppercase tracking-tighter mb-4 sm:mb-5 leading-tight">STAKE <br /> ORIGINALS</h3>
                   <p className="text-blue-100/70 text-sm sm:text-base font-medium mb-8 sm:mb-10 leading-relaxed">Provably fair games built in-house for maximum thrill and instant results.</p>
                   <div className="flex items-center justify-between border-t border-white/10 pt-6 sm:pt-8">
                      <span className="text-[10px] sm:text-[11px] font-black text-blue-400 uppercase tracking-widest">12 Exclusive Titles</span>
                      <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8 text-white group-hover:translate-x-3 transition-transform" />
                   </div>
                </div>
              </div>

              {/* Slots Card */}
              <div 
                onClick={() => navigate('/auth')}
                className="group relative h-[500px] sm:h-[600px] rounded-[3rem] sm:rounded-[4rem] overflow-hidden cursor-pointer shadow-5xl hover:-translate-y-4 transition-all duration-700"
              >
                <img 
                  src="https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&q=80&w=800" 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  alt="Slots"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900 via-emerald-900/40 to-transparent" />
                <div className="absolute inset-0 p-8 sm:p-12 flex flex-col justify-end">
                   <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mb-6 sm:mb-8 shadow-3xl group-hover:-rotate-12 transition-transform">
                      <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                   </div>
                   <h3 className="text-4xl sm:text-6xl font-black italic text-white uppercase tracking-tighter mb-4 sm:mb-5 leading-tight">PREMIUM <br /> SLOTS</h3>
                   <p className="text-emerald-100/70 text-sm sm:text-base font-medium mb-8 sm:mb-10 leading-relaxed">Thousands of high-definition titles from world-class providers like Pragmatic Play.</p>
                   <div className="flex items-center justify-between border-t border-white/10 pt-6 sm:pt-8">
                      <span className="text-[10px] sm:text-[11px] font-black text-emerald-400 uppercase tracking-widest">New Titles Weekly</span>
                      <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8 text-white group-hover:translate-x-3 transition-transform" />
                   </div>
                </div>
              </div>

              {/* Live Casino Card */}
              <div 
                onClick={() => navigate('/auth')}
                className="group relative h-[500px] sm:h-[600px] rounded-[3rem] sm:rounded-[4rem] overflow-hidden cursor-pointer shadow-5xl hover:-translate-y-4 transition-all duration-700"
              >
                <img 
                  src="https://images.unsplash.com/photo-1605870445919-838d190e8e1b?auto=format&fit=crop&q=80&w=800" 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  alt="Live Casino"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900 via-purple-900/40 to-transparent" />
                <div className="absolute inset-0 p-8 sm:p-12 flex flex-col justify-end">
                   <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-500 rounded-3xl flex items-center justify-center mb-6 sm:mb-8 shadow-3xl group-hover:scale-110 transition-transform">
                      <CirclePlay className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                   </div>
                   <h3 className="text-4xl sm:text-6xl font-black italic text-white uppercase tracking-tighter mb-4 sm:mb-5 leading-tight">LIVE <br /> DEALERS</h3>
                   <p className="text-purple-100/70 text-sm sm:text-base font-medium mb-8 sm:mb-10 leading-relaxed">Experience the casino floor from anywhere with real-time dealers and 4K streams.</p>
                   <div className="flex items-center justify-between border-t border-white/10 pt-6 sm:pt-8">
                      <span className="text-[10px] sm:text-[11px] font-black text-purple-400 uppercase tracking-widest">Evolution Gaming API</span>
                      <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8 text-white group-hover:translate-x-3 transition-transform" />
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Casinos Available Preview - SPECIFIC TITLES GRID */}
        <section className="py-24 sm:py-32 bg-[#0f212e]">
           <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16 sm:mb-20">
                 <div className="inline-flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full text-blue-500 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-6">
                    <Medal className="w-4 h-4" /> Global Top Hits
                 </div>
                 <h2 className="text-3xl sm:text-6xl font-black italic tracking-tighter uppercase mb-6 leading-tight">Available Right Now</h2>
                 <p className="text-gray-500 max-w-2xl mx-auto font-medium text-base sm:text-lg">Instant access to the world's most popular titles. Join thousands of players in real-time battles.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5 sm:gap-6">
                 {[
                   { name: 'Gates of Olympus', img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400', tag: 'Pragmatic' },
                   { name: 'Crazy Time', img: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=400', tag: 'Evolution' },
                   { name: 'Sweet Bonanza', img: 'https://images.unsplash.com/photo-1611252110292-16e6d191295c?auto=format&fit=crop&q=80&w=400', tag: 'Pragmatic' },
                   { name: 'Crash Royale', img: 'https://images.unsplash.com/photo-1611974717483-3600991e1645?auto=format&fit=crop&q=80&w=400', tag: 'Original' },
                   { name: 'Lightning Roulette', img: 'https://images.unsplash.com/photo-1518623489648-a173ef7824f3?auto=format&fit=crop&q=80&w=400', tag: 'Evolution' },
                   { name: 'The Dog House', img: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&q=80&w=400', tag: 'Pragmatic' },
                 ].map((game, i) => (
                   <div key={i} className="group cursor-pointer">
                      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-3 border border-white/5 shadow-2xl transition-all hover:-translate-y-2">
                         <img src={game.img} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={game.name} />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <PlayCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                         </div>
                         <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg text-[7px] sm:text-[8px] font-black text-white/80 uppercase tracking-widest border border-white/10">
                            {game.tag}
                         </div>
                      </div>
                      <p className="text-[9px] sm:text-[10px] font-black uppercase text-gray-400 group-hover:text-white transition-colors tracking-tight text-center">{game.name}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Global Features Section */}
        <section className="py-24 sm:py-40 px-6 bg-[#0f212e]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16">
            <div className="flex flex-col items-center text-center p-8 sm:p-12 rounded-[3rem] sm:rounded-[4rem] bg-[#1a2c38]/40 border border-white/5 shadow-4xl hover:bg-[#1a2c38]/60 transition-all group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-500/10 rounded-3xl flex items-center justify-center mb-8 sm:mb-10 border border-blue-500/20 group-hover:rotate-6 transition-transform">
                 <Globe className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500" />
              </div>
              <h4 className="text-3xl sm:text-4xl font-black italic mb-4 uppercase tracking-tighter">GLOBAL ACCESS</h4>
              <p className="text-gray-500 text-[10px] sm:text-[12px] font-black uppercase tracking-[0.3em]">Available in 150+ Regions</p>
            </div>
            <div className="flex flex-col items-center text-center p-8 sm:p-12 rounded-[3rem] sm:rounded-[4rem] bg-[#1a2c38]/40 border border-white/5 shadow-4xl hover:bg-[#1a2c38]/60 transition-all group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-8 sm:mb-10 border border-emerald-500/20 group-hover:-rotate-6 transition-transform">
                 <Users className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-500" />
              </div>
              <h4 className="text-3xl sm:text-4xl font-black italic mb-4 uppercase tracking-tighter">ELITE COMMUNITY</h4>
              <p className="text-gray-500 text-[10px] sm:text-[12px] font-black uppercase tracking-[0.3em]">2.4M Verified Players</p>
            </div>
            <div className="flex flex-col items-center text-center p-8 sm:p-12 rounded-[3rem] sm:rounded-[4rem] bg-[#1a2c38]/40 border border-white/5 shadow-4xl hover:bg-[#1a2c38]/60 transition-all group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-yellow-500/10 rounded-3xl flex items-center justify-center mb-8 sm:mb-10 border border-yellow-500/20 group-hover:rotate-6 transition-transform">
                 <Coins className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-500" />
              </div>
              <h4 className="text-3xl sm:text-4xl font-black italic mb-4 uppercase tracking-tighter">KSH 1.2B TOTAL</h4>
              <p className="text-gray-500 text-[10px] sm:text-[12px] font-black uppercase tracking-[0.3em]">Monthly Payout Volume</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#0b161f] border-t border-[#213743] py-20 sm:py-24 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 sm:gap-16">
           <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-500 rounded-[1.2rem] sm:rounded-[1.5rem] flex items-center justify-center shadow-3xl shadow-blue-500/30">
                <span className="font-black text-3xl sm:text-4xl italic text-white leading-none">S</span>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-2xl sm:text-3xl tracking-tighter uppercase italic leading-none">StakeClone</span>
                <span className="text-[9px] sm:text-[10px] font-black uppercase text-blue-500 tracking-[0.4em] mt-1.5 sm:mt-2">Next-Gen Hub</span>
              </div>
           </div>
           <p className="text-gray-600 text-[10px] sm:text-[12px] font-black uppercase tracking-[0.2em] text-center md:max-w-md leading-relaxed opacity-60">
             © 2024 StakeClone Global • Licensed & Provably Fair • 18+ Only • Instant M-PESA Payouts • Crypto Enabled
           </p>
           <div className="flex gap-4 sm:gap-6">
              {[Globe, Shield, Zap].map((Icon, i) => (
                <div key={i} className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#1a2c38] flex items-center justify-center border border-white/5 hover:bg-[#213743] transition-colors cursor-pointer group shadow-xl">
                  <Icon className="w-6 h-6 sm:w-7 h-7 text-gray-500 group-hover:text-blue-400" />
                </div>
              ))}
           </div>
        </div>
      </footer>

      <style>{`
        @keyframes float-slow {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(1deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-vertical {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee-vertical {
          animation: marquee-vertical 3s linear infinite;
        }
        .perspective-2000 {
          perspective: 2000px;
        }
        .shadow-4xl {
          box-shadow: 0 40px 80px -20px rgba(0,0,0,0.8);
        }
        .shadow-5xl {
          box-shadow: 0 60px 120px -30px rgba(0,0,0,0.9);
        }
      `}</style>
    </div>
  );
};

export default Landing;
