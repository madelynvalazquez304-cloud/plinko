
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, User, Wallet, Settings, ShieldCheck, Zap, Loader2 } from 'lucide-react';
import { useUser } from '../context/UserContext';
import ProfileDialog from './ProfileDialog';

const Navbar: React.FC<{ isLoggedIn?: boolean }> = ({ isLoggedIn = false }) => {
  const navigate = useNavigate();
  const { user, toggleDemo } = useUser();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleAuthNavigation = () => {
    setIsNavigating(true);
    setTimeout(() => {
      navigate('/auth');
    }, 300);
  };

  return (
    <>
      <header className="h-16 lg:h-20 bg-[#1a2c38]/95 backdrop-blur-xl border-b border-[#213743] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-[100] shadow-2xl">
        <div className="flex items-center gap-4 sm:gap-10">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 transition-transform hover:scale-105 active:scale-95 group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 rotate-3 group-hover:rotate-0 transition-transform">
              <span className="font-black text-xl sm:text-2xl italic text-white">S</span>
            </div>
            <span className="font-black text-lg sm:text-xl tracking-tighter hidden sm:block uppercase italic">STAKECLONE</span>
          </Link>

          {isLoggedIn && (
            <div className="hidden lg:flex items-center bg-[#0f212e] rounded-xl px-4 py-2 border border-[#213743] w-96 group focus-within:border-blue-500 transition-all shadow-inner">
              <Search className="w-4 h-4 text-gray-500 mr-3 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search markets or games..."
                className="bg-transparent border-none outline-none text-[11px] font-black uppercase tracking-widest w-full text-white placeholder-gray-600"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 lg:gap-5">
          {isLoggedIn ? (
            <>
              {/* Real-time Status */}
              <div className="hidden xl:flex items-center gap-4 border-r border-[#213743] pr-6 mr-1">
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Exchange</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-white italic">MARKET OPEN</span>
                  </div>
                </div>
              </div>

              {/* Demo Toggle */}
              <div
                onClick={toggleDemo}
                className={`hidden md:flex items-center gap-3 px-4 py-2 rounded-xl cursor-pointer transition-all border group ${user.isDemo ? 'bg-orange-500/10 border-orange-500/30 text-orange-500' : 'bg-[#213743] border-[#2f4553] text-gray-500 hover:text-white'}`}
              >
                <Zap className={`w-3.5 h-3.5 ${user.isDemo ? 'fill-current animate-pulse' : ''}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">{user.isDemo ? 'DEMO MODE' : 'REAL MODE'}</span>
              </div>

              <div
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center bg-[#213743] rounded-lg sm:rounded-xl px-2 sm:px-4 py-1.5 sm:py-2.5 gap-2 sm:gap-3 cursor-pointer hover:bg-[#2f4553] transition-all group border border-white/5 shadow-lg active:scale-95"
              >
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg flex items-center justify-center ${user.isDemo ? 'bg-orange-500/20 text-orange-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                  <Wallet className="w-3 h-3 sm:w-4 h-4 group-hover:rotate-12 transition-transform" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] sm:text-[11px] font-black tabular-nums tracking-tighter text-white">
                    {user.isDemo ? 'Ksh ' + (Number(user.demoBalance) >= 1000 ? (Number(user.demoBalance) / 1000).toFixed(0) + 'k' : Number(user.demoBalance).toFixed(0)) : 'Ksh ' + (Number(user.balance) >= 1000 ? (Number(user.balance) / 1000).toFixed(1) + 'k' : Number(user.balance).toFixed(2))}
                  </span>
                  <span className={`text-[7px] sm:text-[8px] font-black uppercase tracking-widest ${user.isDemo ? 'text-orange-500' : 'text-emerald-500'}`}>
                    {user.isDemo ? 'Demo' : 'Real'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                <button onClick={() => navigate('/mainadmin')} className="p-2 sm:p-3 text-gray-500 hover:text-blue-500 transition-all rounded-xl hover:bg-blue-500/10 active:scale-90" title="System Settings">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button className="hidden sm:block p-3 text-gray-500 hover:text-white transition-all rounded-xl hover:bg-white/5 active:scale-90 relative">
                  <Bell className="w-5 h-5" />
                  <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#1a2c38]" />
                </button>
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="p-0.5 sm:p-1 rounded-lg sm:rounded-xl border-2 border-[#213743] hover:border-blue-500 transition-all active:scale-90"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500">
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 sm:gap-5">
              <button
                onClick={handleAuthNavigation}
                disabled={isNavigating}
                className="text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isNavigating && <Loader2 className="w-3 h-3 animate-spin" />}
                Sign In
              </button>
              <button
                onClick={handleAuthNavigation}
                disabled={isNavigating}
                className="bg-blue-500 hover:bg-blue-600 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-widest px-4 sm:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all shadow-[0_10px_30px_rgba(59,130,246,0.3)] active:scale-95 flex items-center gap-2 disabled:opacity-50"
              >
                {isNavigating && <Loader2 className="w-3 h-3 animate-spin" />}
                Register
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Profile Dialog */}
      {isLoggedIn && <ProfileDialog isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />}
    </>
  );
};

export default Navbar;