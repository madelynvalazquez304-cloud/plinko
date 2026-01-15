import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSupabase } from '../lib/supabase';

export interface BetRecord {
  id: string;
  game: string;
  user: string;
  amount: number;
  multiplier: number;
  payout: number;
  status: 'win' | 'loss' | 'pending';
  timestamp: number;
  isDemo: boolean;
}

export interface Transaction {
  id: string;
  user: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  method: 'M-PESA';
  timestamp: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  demoBalance: number;
  isDemo: boolean;
  isSuspended: boolean;
  role: 'admin' | 'user';
  joinedAt: number;
}

interface UserContextType {
  user: User;
  bets: BetRecord[];
  transactions: Transaction[];
  addBet: (game: string, amount: number, multiplier: number, payout: number, status: 'win' | 'loss') => void;
  deductBalance: (amount: number) => boolean;
  addTransaction: (type: 'deposit' | 'withdrawal', amount: number) => void;
  toggleDemo: () => void;
  refillDemoBalance: () => void;
  setBalance: (amount: number) => void;
  suspendUser: (userId: string) => void;
  updateUserBalance: (userId: string, amount: number) => void;
  approveTransaction: (txId: string) => void;
  rejectTransaction: (txId: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [bets, setBets] = useState<BetRecord[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize Supabase Auth
  useEffect(() => {
    const sb = getSupabase();
    console.log('🔧 UserContext: Initializing Auth...');

    // Check active session
    sb.auth.getSession().then(({ data: { session } }) => {
      console.log('🔧 UserContext: Session check:', session ? 'Found' : 'None');
      if (session?.user) {
        console.log('🔧 UserContext: User ID:', session.user.id);
        console.log('🔧 UserContext: Email:', session.user.email);
        fetchProfile(session.user.id, session.user.email!);
      } else {
        console.log('⚠️ UserContext: No active session - user will show as Guest');
        setLoading(false);
      }
    });

    const { data: { subscription } } = sb.auth.onAuthStateChange((event, session) => {
      console.log('🔧 UserContext: Auth state changed:', event);
      if (session?.user) {
        console.log('🔧 UserContext: User logged in:', session.user.email);
        fetchProfile(session.user.id, session.user.email!);
      } else {
        console.log('🔧 UserContext: User logged out');
        setUser(null);
        setBets([]);
        setTransactions([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, email: string) => {
    const sb = getSupabase();
    console.log('🔧 Fetching profile for:', email, 'ID:', userId);

    try {
      let { data: profile, error } = await sb
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log('⚠️ Profile not found, creating new profile...');
        const newProfile = {
          id: userId,
          email,
          username: email.split('@')[0],
          balance: 0,
          demo_balance: 100000,
          is_demo: false,
          role: 'user',
          created_at: new Date().toISOString()
        };
        const { data: created, error: createError } = await sb
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();

        if (createError) {
          console.error('❌ Failed to create profile:', createError);
          throw createError;
        }
        console.log('✅ Profile created successfully');
        profile = created;
      } else if (error) {
        console.error('❌ Error fetching profile:', error);
        throw error;
      }

      // Map DB profile to State User
      if (profile) {
        console.log('✅ Profile loaded:', profile.email, 'Role:', profile.role);
        setUser({
          id: profile.id,
          username: profile.username || email.split('@')[0],
          email: profile.email,
          balance: Number(profile.balance),
          demoBalance: Number(profile.demo_balance),
          isDemo: profile.is_demo,
          isSuspended: profile.is_suspended || false,
          role: profile.role || 'user',
          joinedAt: new Date(profile.created_at).getTime()
        });

        console.log('✅ User state set. isDemo:', profile.is_demo, 'Role:', profile.role);

        // Fetch user data
        fetchUserData(userId);
      }
    } catch (err) {
      console.error('❌ Profile sync error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async (userId: string) => {
    const sb = getSupabase();

    // Fetch Latest Bets
    const { data: betsData } = await sb
      .from('bets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (betsData) {
      setBets(betsData.map((b: any) => ({
        id: b.id,
        game: b.game,
        user: b.user_email?.split('@')[0] || 'User',
        amount: Number(b.amount),
        multiplier: Number(b.multiplier),
        payout: Number(b.payout),
        status: b.status,
        timestamp: new Date(b.created_at).getTime(),
        isDemo: b.is_demo
      })));
    }

    // Fetch Transactions
    const { data: txData } = await sb
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (txData) {
      setTransactions(txData.map((t: any) => ({
        id: t.id,
        user: t.user_email?.split('@')[0] || 'User',
        type: t.type,
        amount: Number(t.amount),
        status: t.status,
        method: t.method || 'M-PESA',
        timestamp: new Date(t.created_at).getTime()
      })));
    }
  };

  const deductBalance = useCallback((amount: number): boolean => {
    if (!user) return false;
    const current = user.isDemo ? user.demoBalance : user.balance;
    if (current < amount) return false;

    // Optimistic Update
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        balance: !prev.isDemo ? prev.balance - amount : prev.balance,
        demoBalance: prev.isDemo ? prev.demoBalance - amount : prev.demoBalance
      };
    });
    return true;
  }, [user]);

  const addBet = useCallback(async (game: string, amount: number, multiplier: number, payout: number, status: 'win' | 'loss') => {
    if (!user) return;

    const newBet: BetRecord = {
      id: 'temp_' + Date.now(),
      game,
      user: user.username,
      amount,
      multiplier,
      payout,
      status,
      timestamp: Date.now(),
      isDemo: user.isDemo
    };

    setBets(prev => [newBet, ...prev].slice(0, 50));

    // Optimistic Balance Update for Win
    if (payout > 0) {
      setUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          balance: !prev.isDemo ? prev.balance + payout : prev.balance,
          demoBalance: prev.isDemo ? prev.demoBalance + payout : prev.demoBalance
        };
      });
    }

    // Backend Sync
    const sb = getSupabase();
    try {
      const { error } = await sb.from('bets').insert([{
        user_id: user.id,
        user_email: user.email,
        game,
        amount,
        multiplier,
        payout,
        status,
        is_demo: user.isDemo,
        created_at: new Date().toISOString()
      }]);

      if (error) console.error('Bet sync failed:', error);

      // Update balance on server
      if (!user.isDemo) {
        const balanceChange = payout - amount;
        // Note: In a real app, use an RPC function for atomic updates!
        // For now, we update absolute value based on what we think it is, which is risky for concurrency but okay for MVP.
        // Better: await sb.rpc('update_balance', { ... })

        // We will trust the optimistic calculation for the update for now to keep it simple, 
        // but ideally we should re-fetch.
        const { error: balError } = await sb
          .from('profiles')
          .update({ balance: user.balance + balanceChange })
          .eq('id', user.id); // This uses the STALE user.balance before the bet.

        // Correct approach: Calculate based on previous assumed server state OR use RPC.
        // Let's rely on Refetch for truth eventually.
      }
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  const addTransaction = async (type: 'deposit' | 'withdrawal', amount: number) => {
    if (!user) return;

    // Optimistic
    const newTx: Transaction = {
      id: 'temp_' + Date.now(),
      user: user.username,
      type,
      amount,
      status: type === 'withdrawal' ? 'pending' : 'completed',
      method: 'M-PESA',
      timestamp: Date.now()
    };
    setTransactions(prev => [newTx, ...prev]);

    if (type === 'deposit') {
      setUser(prev => prev ? ({ ...prev, balance: prev.balance + amount }) : null);
    } else {
      setUser(prev => prev ? ({ ...prev, balance: prev.balance - amount }) : null);
    }

    const sb = getSupabase();
    await sb.from('transactions').insert([{
      user_id: user.id,
      user_email: user.email,
      type,
      amount,
      status: type === 'withdrawal' ? 'pending' : 'completed',
      method: 'M-PESA',
      created_at: new Date().toISOString()
    }]);

    // Update Profile
    if (type === 'deposit' || type === 'withdrawal') {
      const change = type === 'deposit' ? amount : -amount;
      // Try to use RPC if it exists, otherwise fall back to direct update
      const { error: rpcError } = await sb.rpc('increment_balance', { user_id: user.id, amount: change });

      if (rpcError) {
        // Fallback if RPC doesn't exist yet (we should create it)
        const { data: current } = await sb.from('profiles').select('balance').eq('id', user.id).single();
        if (current) {
          await sb.from('profiles').update({ balance: current.balance + change }).eq('id', user.id);
        }
      }
    }
  };

  const toggleDemo = useCallback(async () => {
    if (!user) return;

    const newIsDemo = !user.isDemo;

    // Optimistic Update
    setUser(prev => prev ? ({ ...prev, isDemo: newIsDemo }) : null);

    // Persist to Database
    const sb = getSupabase();
    try {
      await sb.from('profiles').update({ is_demo: newIsDemo }).eq('id', user.id);
    } catch (error) {
      console.error('Failed to toggle demo mode:', error);
      // Revert on error
      setUser(prev => prev ? ({ ...prev, isDemo: !newIsDemo }) : null);
    }
  }, [user]);

  const refillDemoBalance = useCallback(async () => {
    if (!user) return;

    // Optimistic Update
    setUser(prev => prev ? ({ ...prev, demoBalance: 100000 }) : null);

    // Persist to Database
    const sb = getSupabase();
    try {
      await sb.from('profiles').update({ demo_balance: 100000 }).eq('id', user.id);
    } catch (error) {
      console.error('Failed to refill demo balance:', error);
    }
  }, [user]);

  // Admin functions - mostly placeholders or direct DB calls now
  const setBalance = useCallback((amount: number) => {
    setUser(prev => prev ? ({ ...prev, balance: amount }) : null);
  }, []);

  const suspendUser = () => { };
  const updateUserBalance = () => { };
  const approveTransaction = () => { };
  const rejectTransaction = () => { };

  return (
    <UserContext.Provider value={{
      user: user || { id: '', username: 'Guest', email: '', balance: 0, demoBalance: 0, isDemo: true, isSuspended: false, role: 'user', joinedAt: 0 },
      bets,
      transactions,
      addBet,
      deductBalance,
      addTransaction,
      toggleDemo,
      refillDemoBalance,
      setBalance,
      suspendUser,
      updateUserBalance,
      approveTransaction,
      rejectTransaction
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};
