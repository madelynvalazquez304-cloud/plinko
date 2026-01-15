
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { OVERVIEW_NAV } from '../constants';
import { ArrowUpRight, ArrowDownLeft, Wallet, RefreshCw, LogOut, Settings, ShieldAlert } from 'lucide-react';
import { useUser } from '../context/UserContext';
import WalletDialog from './WalletDialog';

const Sidebar: React.FC = () => {
  const [activeMpesa, setActiveMpesa] = useState<'deposit' | 'withdraw' | null>(null);
  const { user, refillDemoBalance } = useUser();

  return (
    <aside className="w-64 flex-shrink-0 bg-[#0f212e] border-r border-[#213743] h-screen sticky top-0 flex flex-col hidden md:flex z-40">
      <div className="p-4 flex flex-col gap-6 flex-1 overflow-y-auto no-scrollbar">
        {/* Wallet Section */}
        <div className={`rounded-xl p-4 border shadow-inner transition-colors ${user.isDemo ? 'bg-orange-500/5 border-orange-500/20' : 'bg-[#1a2c38] border-[#213743]'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Wallet className={`w-4 h-4 ${user.isDemo ? 'text-orange-500' : 'text-blue-400'}`} />
            <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">
              {user.isDemo ? 'Demo Wallet' : 'My Wallet'}
            </span>
          </div>
          <div className="mb-4">
            <span className={`text-xl font-black tabular-nums ${user.isDemo ? 'text-orange-500' : 'text-white'}`}>
              Ksh {(user.isDemo ? user.demoBalance : user.balance).toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {user.isDemo ? (
              <button onClick={refillDemoBalance} className="col-span-2 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg transition-all active:scale-95 group font-black uppercase text-[10px]">
                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                Refill Demo Funds
              </button>
            ) : (
              <>
                <button onClick={() => setActiveMpesa('deposit')} className="flex flex-col items-center justify-center gap-1 bg-[#49b34a] hover:bg-[#3d9e40] text-white py-2 rounded-lg transition-all active:scale-95 group">
                  <ArrowDownLeft className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-tighter">Deposit</span>
                </button>
                <button onClick={() => setActiveMpesa('withdraw')} className="flex flex-col items-center justify-center gap-1 bg-[#2f4553] hover:bg-[#3d5161] text-white py-2 rounded-lg transition-all active:scale-95 group border border-[#4d6371]">
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-tighter">Withdraw</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Primary Pages Hub */}
        <div>
          <h3 className="px-3 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Overview</h3>
          <nav className="space-y-1">
            {OVERVIEW_NAV.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-[#1a2c38]'}`}
              >
                {item.icon} {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Admin Link at the very bottom of nav */}
        {user.role === 'admin' && (
          <div className="mt-4 border-t border-[#213743] pt-4">
            <NavLink
              to="/mainadmin"
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${isActive ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'text-gray-500 hover:text-rose-400'}`}
            >
              <ShieldAlert className="w-5 h-5" /> Admin Panel
            </NavLink>
          </div>
        )}
      </div>

      {/* Profile Section */}
      <div className="p-4 border-t border-[#213743] bg-[#0b161f]/50">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#1a2c38] border border-white/5 shadow-xl group cursor-pointer hover:bg-[#213743] transition-all">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white font-black italic shadow-lg">
              {user.username[0]}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#1a2c38] rounded-full animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-white truncate uppercase tracking-tight italic">{user.username}</p>
            <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em]">{user.role}</p>
          </div>
          <button className="text-gray-600 group-hover:text-gray-400 transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
        <button className="w-full mt-4 flex items-center justify-center gap-2 py-3 text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] hover:text-white transition-colors">
          <LogOut className="w-3.5 h-3.5" /> Log Out
        </button>
      </div>

      {activeMpesa && (
        <WalletDialog
          isOpen={!!activeMpesa}
          onClose={() => setActiveMpesa(null)}
          initialTab={activeMpesa}
        />
      )}
    </aside>
  );
};

export default Sidebar;
