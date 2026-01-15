
import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import { useUser } from '../context/UserContext';
import { getSupabase } from '../lib/supabase';
import {
  Users, TrendingUp, ArrowDownCircle, ArrowUpCircle, Activity, ShieldAlert,
  Search, CheckCircle, XCircle, Ban, LayoutDashboard, Wallet, Settings,
  Flame, Clock, ExternalLink, ChevronRight, ChevronDown, ChevronUp, Filter,
  CreditCard, Key, Globe, Plus, Trash2, Cpu, Smartphone, ShieldCheck,
  Save, Info, Hash, Calendar, Layers, Edit2
} from 'lucide-react';

type AdminTab = 'dashboard' | 'users' | 'financials' | 'gateways' | 'games' | 'logs';

const Admin: React.FC = () => {
  const { user: currentUser } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  // Gateway editing state (moved to top level to follow Rules of Hooks)
  const [editingGateway, setEditingGateway] = useState<string | null>(null);
  const [gatewayForms, setGatewayForms] = useState<any>({});
  const [savingGateway, setSavingGateway] = useState(false);

  // Data States
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allBets, setAllBets] = useState<any[]>([]);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [gateways, setGateways] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔧 Admin Panel: Current User:', currentUser);
    console.log('🔧 Admin Panel: User Role:', currentUser?.role);
    console.log('🔧 Admin Panel: Is Admin?:', currentUser?.role === 'admin');

    if (currentUser) {
      if (currentUser.role === 'admin') {
        console.log('✅ Admin access granted');
        setIsAdmin(true);
        fetchAdminData();
        subscribeToRealtime();
      } else {
        console.log('❌ Admin access denied - Role is:', currentUser.role);
        setIsAdmin(false);
        setLoading(false);
      }
    } else {
      console.log('⚠️ No user logged in');
      setLoading(false);
    }
  }, [currentUser]);

  const fetchAdminData = async () => {
    setLoading(true);
    const sb = getSupabase();

    // Fetch Users
    const { data: usersData } = await sb.from('profiles').select('*').order('created_at', { ascending: false });
    if (usersData) setAllUsers(usersData);

    // Fetch Bets
    const { data: betsData } = await sb.from('bets').select('*').order('created_at', { ascending: false }).limit(100);
    if (betsData) setAllBets(betsData);

    // Fetch Transactions
    const { data: txData } = await sb.from('transactions').select('*').order('created_at', { ascending: false }).limit(100);
    if (txData) setAllTransactions(txData);

    // Fetch Gateways
    const { data: gwData } = await sb.from('gateways').select('*');
    if (gwData) setGateways(gwData);

    setLoading(false);
  };

  const subscribeToRealtime = () => {
    const sb = getSupabase();

    // Subscribe to new bets
    const betSub = sb.channel('admin-bets')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bets' }, payload => {
        setAllBets(prev => [payload.new, ...prev].slice(0, 100));
      })
      .subscribe();

    // Subscribe to transactions
    const txSub = sb.channel('admin-tx')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, payload => {
        if (payload.eventType === 'INSERT') {
          setAllTransactions(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setAllTransactions(prev => prev.map(t => t.id === payload.new.id ? payload.new : t));
        }
      })
      .subscribe();

    return () => {
      sb.removeChannel(betSub);
      sb.removeChannel(txSub);
    };
  };

  // Actions
  const suspendUser = async (userId: string, currentStatus: boolean) => {
    const sb = getSupabase();
    const { error } = await sb.from('profiles').update({ is_suspended: !currentStatus }).eq('id', userId);
    if (!error) {
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, is_suspended: !currentStatus } : u));
    }
  };

  const updateUserBalance = async (userId: string, currentBalance: number) => {
    const amountStr = prompt(`Current Balance: ${currentBalance}\nEnter new balance:`);
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount)) return;

    const sb = getSupabase();
    const { error } = await sb.from('profiles').update({ balance: amount }).eq('id', userId);
    if (!error) {
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, balance: amount } : u));
    }
  };

  const updateTransactionStatus = async (txId: string, status: 'completed' | 'failed', amount: number, userId: string, type: string) => {
    const sb = getSupabase();
    const { error } = await sb.from('transactions').update({ status }).eq('id', txId);

    if (!error) {
      setAllTransactions(prev => prev.map(tx => tx.id === txId ? { ...tx, status } : tx));

      // If rejecting a withdrawal, refund the user
      if (status === 'failed' && type === 'withdrawal') {
        // We need to fetch current balance first to be safe, but for now we essentially doing a refund
        // Ideally use RPC. 
        // Simple update:
        await sb.rpc('increment_balance', { user_id: userId, amount: amount });
      }
    }
  };

  const stats = useMemo(() => {
    // These calculations are client-side on the fetched 100 limit, so they are approximations for "Recent" activity
    // For specific totals, we should run proper aggregate queries, but for this Admin Panel UI it works for "Live" view.
    const totalDeposits = allTransactions.filter(t => t.type === 'deposit' && t.status === 'completed').reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
    const totalWithdrawals = allTransactions.filter(t => t.type === 'withdrawal' && t.status === 'completed').reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
    const totalBetsAmount = allBets.filter(b => !b.is_demo).reduce((acc, b) => acc + (Number(b.amount) || 0), 0);
    const totalPayouts = allBets.filter(b => !b.is_demo).reduce((acc, b) => acc + (Number(b.payout) || 0), 0);
    const houseProfit = totalBetsAmount - totalPayouts;

    return {
      users: allUsers.length,
      profit: houseProfit,
      deposits: totalDeposits,
      withdrawals: totalWithdrawals,
      activeBets: allBets.length,
      pendingFinance: allTransactions.filter(t => t.status === 'pending').length
    };
  }, [allBets, allTransactions, allUsers]);

  if (loading) return <div className="h-screen bg-[#0f212e] text-white flex items-center justify-center font-bold animate-pulse">LOADING ADMIN DASHBOARD...</div>;
  if (!isAdmin) return <div className="h-screen bg-[#0f212e] text-rose-500 flex flex-col items-center justify-center font-black uppercase text-2xl gap-4"><ShieldAlert className="w-16 h-16" /><span>Access Denied</span></div>;

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.users.toLocaleString(), icon: <Users />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Est. House Profit', value: `Ksh ${stats.profit.toLocaleString()}`, icon: <TrendingUp />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Recent Deposits', value: `Ksh ${stats.deposits.toLocaleString()}`, icon: <ArrowDownCircle />, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'Pending Requests', value: stats.pendingFinance.toString(), icon: <Wallet />, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#1a2c38] p-6 rounded-2xl border border-[#213743] shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className={`${stat.bg} ${stat.color} p-2.5 rounded-xl`}>
                {React.cloneElement(stat.icon as React.ReactElement<any>, { className: 'w-5 h-5' })}
              </div>
            </div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-xl font-black text-white tabular-nums">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Live System Activity */}
        <div className="lg:col-span-2 bg-[#1a2c38] rounded-2xl border border-[#213743] overflow-hidden">
          <div className="p-5 border-b border-[#213743] flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live System Activity</h3>
            <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded font-black flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> REALTIME
            </span>
          </div>
          <div className="p-2 space-y-1">
            {allBets.slice(0, 8).map((bet) => (
              <div key={bet.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#213743] transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${bet.status === 'win' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'}`}></div>
                  <div>
                    <p className="text-xs font-bold text-white uppercase">{(bet.user_email || 'User').split('@')[0]}</p>
                    <p className="text-[10px] text-gray-500">{bet.game} • {bet.multiplier?.toFixed(2)}x</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-black ${bet.status === 'win' ? 'text-emerald-500' : 'text-gray-400'}`}>
                    {bet.status === 'win' ? `+ Ksh ${Number(bet.payout).toFixed(2)}` : `- Ksh ${Number(bet.amount).toFixed(2)}`}
                  </p>
                  <p className="text-[10px] text-gray-500 italic">{new Date(bet.created_at).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Withdrawals */}
        <div className="bg-[#1a2c38] rounded-2xl border border-[#213743] overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#213743]">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Pending Withdrawals</h3>
          </div>
          <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[400px]">
            {allTransactions.filter(t => t.status === 'pending' && t.type === 'withdrawal').length > 0 ? (
              allTransactions.filter(t => t.status === 'pending' && t.type === 'withdrawal').map(tx => (
                <div key={tx.id} className="bg-[#0f212e] p-3 rounded-xl border border-[#213743] space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-white uppercase">{(tx.user_email || 'User').split('@')[0]}</p>
                      <p className="text-[10px] text-gray-400">Ksh {Number(tx.amount).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateTransactionStatus(tx.id, 'completed', tx.amount, tx.user_id, tx.type)}
                        className="bg-emerald-500 text-black p-1.5 rounded hover:bg-emerald-400 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateTransactionStatus(tx.id, 'failed', tx.amount, tx.user_id, tx.type)}
                        className="bg-rose-500 text-white p-1.5 rounded hover:bg-rose-400 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full opacity-30 py-10">
                <Clock className="w-8 h-8 mb-2" />
                <p className="text-[10px] font-bold uppercase">Queue is empty</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="bg-[#1a2c38] rounded-2xl border border-[#213743] overflow-hidden">
      <div className="p-6 border-b border-[#213743] flex items-center justify-between bg-[#1a2c38]/50">
        <h3 className="text-lg font-bold text-white">Platform Users</h3>
        <div className="flex gap-3">
          <div className="flex items-center bg-[#0f212e] rounded-lg px-3 py-1.5 border border-[#213743]">
            <Search className="w-4 h-4 text-gray-500 mr-2" />
            <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-xs text-white w-48" />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[#0f212e] text-[10px] font-black text-gray-500 uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">User Details</th>
              <th className="px-6 py-4">Wallet Balance</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#213743]">
            {allUsers.map((u) => (
              <tr key={u.id} className="text-sm hover:bg-[#213743]/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white font-black italic shadow-lg">
                      {u.username?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-white">{u.username}</p>
                      <p className="text-[10px] text-gray-500">{u.email}</p>
                      <p className="text-[9px] text-gray-600 font-mono">{u.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-mono font-bold text-white text-base">Ksh {Number(u.balance).toLocaleString()}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${u.is_suspended ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${u.is_suspended ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                    {u.is_suspended ? 'Suspended' : 'Clear'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => suspendUser(u.id, u.is_suspended)}
                      className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition-all ${u.is_suspended ? 'bg-emerald-500 text-black hover:bg-emerald-400' : 'bg-rose-500 text-white hover:bg-rose-400'}`}
                    >
                      {u.is_suspended ? 'Unblock' : 'Block'}
                    </button>
                    <button
                      onClick={() => updateUserBalance(u.id, u.balance)}
                      className="bg-[#213743] text-white px-4 py-2 rounded-lg text-xs font-black uppercase hover:bg-[#2f4553]"
                    >
                      Adjust
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderFinancials = () => (
    <div className="space-y-6">
      <div className="bg-[#1a2c38] rounded-2xl border border-[#213743] overflow-hidden">
        <div className="p-6 border-b border-[#213743] flex items-center justify-between">
          <h3 className="text-lg font-bold text-white uppercase tracking-wider italic">Financial Ledger</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#0f212e] text-[10px] font-black text-gray-500 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4 w-10"></th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Value</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#213743]">
              {allTransactions.map((tx) => (
                <React.Fragment key={tx.id}>
                  <tr
                    onClick={() => setExpandedTxId(expandedTxId === tx.id ? null : tx.id)}
                    className={`text-sm hover:bg-[#213743]/40 transition-all cursor-pointer group ${expandedTxId === tx.id ? 'bg-[#213743]/60' : ''}`}
                  >
                    <td className="px-6 py-5">
                      {expandedTxId === tx.id ? <ChevronUp className="w-4 h-4 text-blue-500" /> : <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-white" />}
                    </td>
                    <td className="px-6 py-5 font-bold text-white">{(tx.user_email || 'Unknown').split('@')[0]}</td>
                    <td className="px-6 py-5">
                      <span className={`font-black uppercase tracking-widest text-[10px] ${tx.type === 'deposit' ? 'text-emerald-400' : 'text-blue-400'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-black italic text-white">Ksh {Number(tx.amount).toLocaleString()}</td>
                    <td className="px-6 py-5 text-right">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${tx.status === 'completed' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' :
                        tx.status === 'pending' ? 'text-orange-500 bg-orange-500/10 border-orange-500/20 animate-pulse' :
                          'text-rose-500 bg-rose-500/10 border-rose-500/20'
                        }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                  {expandedTxId === tx.id && (
                    <tr className="bg-[#0f212e]/50">
                      <td colSpan={5} className="px-6 py-4 text-white">
                        <p className="text-xs">Transaction ID: {tx.id}</p>
                        <p className="text-xs text-gray-500">Method: {tx.method}</p>
                        <p className="text-xs text-gray-500">Date: {new Date(tx.created_at).toLocaleString()}</p>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Gateway Configuration with Edit Forms
  const renderGateways = () => {
    const handleEditGateway = (gateway: any) => {
      setEditingGateway(gateway.id);
      setGatewayForms({
        ...gatewayForms,
        [gateway.id]: { ...gateway.config }
      });
    };

    const handleSaveGateway = async (gatewayId: string) => {
      setSavingGateway(true);
      const sb = getSupabase();

      try {
        const { error } = await sb
          .from('gateways')
          .update({ config: gatewayForms[gatewayId] })
          .eq('id', gatewayId);

        if (error) throw error;

        // Refresh gateways
        const { data } = await sb.from('gateways').select('*');
        if (data) setGateways(data);

        setEditingGateway(null);
      } catch (err) {
        console.error('Failed to save gateway:', err);
      } finally {
        setSavingGateway(false);
      }
    };

    const updateFormField = (gatewayId: string, field: string, value: any) => {
      setGatewayForms({
        ...gatewayForms,
        [gatewayId]: {
          ...gatewayForms[gatewayId],
          [field]: value
        }
      });
    };

    const handleDeleteGateway = async (gatewayId: string) => {
      if (!window.confirm('Are you sure you want to delete this gateway configuration? This cannot be undone.')) return;

      const sb = getSupabase();
      try {
        const { error } = await sb.from('gateways').delete().eq('id', gatewayId);
        if (error) throw error;

        // Refresh gateways
        const { data } = await sb.from('gateways').select('*');
        if (data) setGateways(data);
      } catch (err) {
        console.error('Failed to delete gateway:', err);
      }
    };

    return (
      <div className="space-y-6">
        {gateways.length === 0 && (
          <div className="bg-[#1a2c38] p-8 rounded-2xl border border-[#213743] text-center">
            <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-white font-bold">No Gateways Configured</p>
            <p className="text-gray-500 text-sm mt-2">Run migrations to set up payment gateways</p>
          </div>
        )}

        {gateways.map((gateway) => {
          const isEditing = editingGateway === gateway.id;
          const config = isEditing ? (gatewayForms[gateway.id] || gateway.config) : gateway.config;

          return (
            <div key={gateway.id} className="bg-[#1a2c38] rounded-2xl border border-[#213743] overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-[#213743] flex items-center justify-between bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                <div className="flex items-center gap-4">
                  <div className="bg-[#0f212e] p-3 rounded-xl">
                    <CreditCard className="text-blue-500 w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-white font-black uppercase text-lg">{gateway.name}</h3>
                    <p className="text-gray-500 text-xs font-bold uppercase">{gateway.type} Gateway</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-lg border border-emerald-500/20 uppercase font-black">
                    {gateway.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {!isEditing ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeleteGateway(gateway.id)}
                        className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg transition-all"
                        title="Delete Gateway"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditGateway(gateway)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-black uppercase flex items-center gap-2 transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                        Configure
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingGateway(null)}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-xs font-black uppercase transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveGateway(gateway.id)}
                        disabled={savingGateway}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-black uppercase flex items-center gap-2 transition-all disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        {savingGateway ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Configuration Form */}
              <div className="p-6">
                {gateway.type === 'mpesa' && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">
                        Account Type
                      </label>
                      <div className="flex bg-[#0f212e] p-1 rounded-xl border-2 border-[#213743]">
                        <button
                          onClick={() => isEditing && updateFormField(gateway.id, 'type', 'paybill')}
                          className={`flex-1 py-2 rounded-lg text-xs font-black uppercase transition-all ${(config.type || 'paybill') === 'paybill' ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'
                            }`}
                          disabled={!isEditing}
                        >
                          Paybill
                        </button>
                        <button
                          onClick={() => isEditing && updateFormField(gateway.id, 'type', 'till')}
                          className={`flex-1 py-2 rounded-lg text-xs font-black uppercase transition-all ${config.type === 'till' ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'
                            }`}
                          disabled={!isEditing}
                        >
                          Till Number (Buy Goods)
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">
                        {(config.type || 'paybill') === 'paybill' ? 'Business Shortcode (Paybill No)' : 'Store Number (Head Office)'}
                      </label>
                      <input
                        type="text"
                        value={config.shortcode || config.business_shortcode || ''}
                        onChange={(e) => updateFormField(gateway.id, 'shortcode', e.target.value)}
                        disabled={!isEditing}
                        className="w-full bg-[#0f212e] border-2 border-[#213743] rounded-xl py-3 px-4 text-white text-sm font-mono outline-none focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder={(config.type || 'paybill') === 'paybill' ? "e.g. 174379" : "e.g. 174379"}
                      />
                    </div>

                    {(config.type === 'till') && (
                      <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">
                          Till Number
                        </label>
                        <input
                          type="text"
                          value={config.till_number || ''}
                          onChange={(e) => updateFormField(gateway.id, 'till_number', e.target.value)}
                          disabled={!isEditing}
                          className="w-full bg-[#0f212e] border-2 border-[#213743] rounded-xl py-3 px-4 text-white text-sm font-mono outline-none focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          placeholder="e.g. 123456"
                        />
                      </div>
                    )}

                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">
                        Environment
                      </label>
                      <select
                        value={config.env || config.environment || 'sandbox'}
                        onChange={(e) => updateFormField(gateway.id, 'env', e.target.value)}
                        disabled={!isEditing}
                        className="w-full bg-[#0f212e] border-2 border-[#213743] rounded-xl py-3 px-4 text-white text-sm font-bold outline-none focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="sandbox">Sandbox (Testing)</option>
                        <option value="production">Production (Live)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">
                        Consumer Key
                      </label>
                      <input
                        type="text"
                        value={config.consumerKey || config.consumer_key || ''}
                        onChange={(e) => updateFormField(gateway.id, 'consumerKey', e.target.value)}
                        disabled={!isEditing}
                        className="w-full bg-[#0f212e] border-2 border-[#213743] rounded-xl py-3 px-4 text-white text-sm font-mono outline-none focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Consumer Key from Daraja"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">
                        Consumer Secret
                      </label>
                      <input
                        type="password"
                        value={config.consumerSecret || config.consumer_secret || ''}
                        onChange={(e) => updateFormField(gateway.id, 'consumerSecret', e.target.value)}
                        disabled={!isEditing}
                        className="w-full bg-[#0f212e] border-2 border-[#213743] rounded-xl py-3 px-4 text-white text-sm font-mono outline-none focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Consumer Secret from Daraja"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">
                        Passkey (Lipa Na M-Pesa Online Passkey)
                      </label>
                      <input
                        type="password"
                        value={config.passkey || ''}
                        onChange={(e) => updateFormField(gateway.id, 'passkey', e.target.value)}
                        disabled={!isEditing}
                        className="w-full bg-[#0f212e] border-2 border-[#213743] rounded-xl py-3 px-4 text-white text-sm font-mono outline-none focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Passkey from Daraja"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">
                        Callback URL
                      </label>
                      <input
                        type="url"
                        value={config.callback_url || ''}
                        onChange={(e) => updateFormField(gateway.id, 'callback_url', e.target.value)}
                        disabled={!isEditing}
                        className="w-full bg-[#0f212e] border-2 border-[#213743] rounded-xl py-3 px-4 text-white text-sm font-mono outline-none focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="https://your-project.supabase.co/functions/v1/mpesa-callback"
                      />
                    </div>
                  </div>
                )}

                {gateway.type === 'crypto' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">
                        Wallet Address
                      </label>
                      <input
                        type="text"
                        value={config.address || config.wallet_address || ''}
                        onChange={(e) => updateFormField(gateway.id, 'address', e.target.value)}
                        disabled={!isEditing}
                        className="w-full bg-[#0f212e] border-2 border-[#213743] rounded-xl py-3 px-4 text-white text-sm font-mono outline-none focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="0x... or bc1..."
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">
                        Network
                      </label>
                      <input
                        type="text"
                        value={config.network || ''}
                        onChange={(e) => updateFormField(gateway.id, 'network', e.target.value)}
                        disabled={!isEditing}
                        className="w-full bg-[#0f212e] border-2 border-[#213743] rounded-xl py-3 px-4 text-white text-sm font-bold outline-none focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="ERC20, TRC20, BTC, etc."
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">
                          Min Amount
                        </label>
                        <input
                          type="number"
                          value={config.min_amount || 10}
                          onChange={(e) => updateFormField(gateway.id, 'min_amount', parseFloat(e.target.value))}
                          disabled={!isEditing}
                          className="w-full bg-[#0f212e] border-2 border-[#213743] rounded-xl py-3 px-4 text-white text-sm font-bold outline-none focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">
                          Confirmations Required
                        </label>
                        <input
                          type="number"
                          value={config.confirmations_required || 3}
                          onChange={(e) => updateFormField(gateway.id, 'confirmations_required', parseInt(e.target.value))}
                          disabled={!isEditing}
                          className="w-full bg-[#0f212e] border-2 border-[#213743] rounded-xl py-3 px-4 text-white text-sm font-bold outline-none focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Help Text */}
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <p className="text-blue-400 text-xs font-bold flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    {gateway.type === 'mpesa'
                      ? 'Get your M-Pesa Daraja credentials from developer.safaricom.co.ke'
                      : 'Ensure you control this wallet address and keep the private keys secure'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-[#0f212e]">
      <Navbar isLoggedIn={true} />

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-[#1a2c38] border-r border-[#213743] flex flex-col p-4 gap-2">
          <div className="mb-6 px-2">
            <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Command Center</h2>
            <p className="text-xs text-white font-bold opacity-70">Administrator Access</p>
          </div>

          {[
            { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard /> },
            { id: 'users', label: 'Users & Security', icon: <Users /> },
            { id: 'financials', label: 'Finance & Ledger', icon: <Wallet /> },
            { id: 'gateways', label: 'Gateways', icon: <CreditCard /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black transition-all group ${activeTab === tab.id ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:bg-[#213743] hover:text-white'
                }`}
            >
              {React.cloneElement(tab.icon as React.ReactElement<any>, { className: `w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-gray-500 group-hover:text-blue-400'}` })}
              {tab.label}
              {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto" />}
            </button>
          ))}
        </aside>

        <main className="flex-1 overflow-y-auto p-8 bg-[#0f212e] no-scrollbar">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase flex items-center gap-3">
                {activeTab}
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              </h1>
            </div>

            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'financials' && renderFinancials()}
            {activeTab === 'gateways' && renderGateways()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
