
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User, CheckCircle, Smartphone, Fingerprint, Globe } from 'lucide-react';
import { getSupabase } from '../lib/supabase';

// Small helper to normalize supabase auth calls across versions and mock
async function supabaseSignIn(sb: any, email: string, password: string) {
  if (!sb || !sb.auth) return { user: null, error: new Error('No Supabase client') };
  try {
    if (typeof sb.auth.signInWithPassword === 'function') {
      const res = await sb.auth.signInWithPassword({ email, password });
      return { user: res.data?.user ?? null, error: res.error ?? null };
    }
    if (typeof sb.auth.signIn === 'function') {
      const res = await sb.auth.signIn({ email, password });
      return { user: res.user ?? res.data?.user ?? null, error: res.error ?? null };
    }
    return { user: null, error: new Error('Unsupported auth client') };
  } catch (err: any) {
    return { user: null, error: err };
  }
}

async function supabaseSignUp(sb: any, email: string, password: string) {
  if (!sb || !sb.auth) return { user: null, error: new Error('No Supabase client') };
  try {
    if (typeof sb.auth.signUp === 'function') {
      const res = await sb.auth.signUp({ email, password });
      return { user: res.data?.user ?? null, error: res.error ?? null };
    }
    // Mock fallback: some mocks implement signIn for both actions
    if (typeof sb.auth.signIn === 'function') {
      const res = await sb.auth.signIn({ email, password });
      return { user: res.user ?? res.data?.user ?? null, error: res.error ?? null };
    }
    return { user: null, error: new Error('Unsupported auth client') };
  } catch (err: any) {
    return { user: null, error: err };
  }
}

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (async () => {
      setError(null);
      setLoading(true);
      const sb = getSupabase();
      const emailTrim = email.trim().toLowerCase();
      const pwd = password;

      if (!emailTrim || !pwd || pwd.length < 6) {
        setError('Please provide a valid email and a password with at least 6 characters.');
        setLoading(false);
        return;
      }

      if (isLogin) {
        const { user: signedInUser, error } = await supabaseSignIn(sb, emailTrim, pwd);
        if (error) {
          setError(error.message ?? String(error));
          setLoading(false);
          return;
        }
        // Successful sign in
        navigate('/dashboard');
      } else {
        // Register flow
        const { user: newUser, error } = await supabaseSignUp(sb, emailTrim, pwd);
        if (error) {
          setError(error.message ?? String(error));
          setLoading(false);
          return;
        }

        // Profile is now auto-created by Database Trigger (0006_auth_hooks.sql)
        // No manual upsert needed here.

        navigate('/dashboard');
      }
      setLoading(false);
    })();
  };

  return (
    <div className="min-h-screen bg-[#0f212e] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1)_0%,transparent_50%)] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.05)_0%,transparent_50%)] pointer-events-none" />

      <button
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 flex items-center gap-2 text-gray-400 hover:text-white transition-all group z-20"
      >
        <div className="w-10 h-10 rounded-full bg-[#1a2c38] flex items-center justify-center group-hover:bg-[#213743] transition-colors border border-white/5">
          <ArrowLeft className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Return to Home</span>
      </button>

      <div className="w-full max-w-md bg-[#1a2c38]/60 backdrop-blur-3xl rounded-[2.5rem] border border-[#213743] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)] z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="p-10">
          <div className="flex justify-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(59,130,246,0.4)] rotate-3">
              <span className="font-black text-3xl italic text-white tracking-tighter">S</span>
            </div>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-3">
              {isLogin ? 'Access Portal' : 'Create Identity'}
            </h2>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest opacity-60">
              {isLogin ? 'Sign in to sync your progress' : 'Join 2.4 million players globally'}
            </p>
          </div>

          <div className="flex bg-[#0f212e]/80 rounded-2xl p-1 mb-8 border border-[#213743] shadow-inner relative">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 text-[10px] font-black uppercase z-10 transition-all ${isLogin ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 text-[10px] font-black uppercase z-10 transition-all ${!isLogin ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Register
            </button>
            <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#213743] rounded-xl transition-all duration-300 shadow-xl ${!isLogin ? 'translate-x-full' : 'translate-x-0'}`} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2 group">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Universal ID</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    placeholder="StakePlayer_88"
                    maxLength={30}
                    autoComplete="username"
                    className="w-full bg-[#0f212e]/80 border-2 border-[#213743] rounded-2xl py-4 pl-12 pr-4 text-white text-sm font-bold outline-none focus:border-blue-500 transition-all shadow-lg"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Secure Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="vault@stake.com"
                  autoComplete="email"
                  className="w-full bg-[#0f212e]/80 border-2 border-[#213743] rounded-2xl py-4 pl-12 pr-4 text-white text-sm font-bold outline-none focus:border-blue-500 transition-all shadow-lg"
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Encrypted Key</label>
                {isLogin && <button type="button" className="text-[10px] font-black text-blue-500 uppercase tracking-tighter hover:text-blue-400">Recover Key?</button>}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  minLength={6}
                  className="w-full bg-[#0f212e]/80 border-2 border-[#213743] rounded-2xl py-4 pl-12 pr-4 text-white text-sm font-bold outline-none focus:border-blue-500 transition-all shadow-lg"
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Display name (optional)</label>
                <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Player One" className="w-full bg-[#0f212e]/80 border-2 border-[#213743] rounded-2xl py-3 px-4 text-white text-sm font-bold outline-none focus:border-blue-500 transition-all shadow-lg" maxLength={50} />

                <div className="flex items-start gap-3 pt-2 group cursor-pointer">
                  <div className="mt-1 relative flex items-center">
                    <input type="checkbox" className="w-5 h-5 rounded-lg bg-[#0f212e] border-2 border-[#213743] checked:bg-blue-500 transition-all appearance-none cursor-pointer" required />
                    <CheckCircle className="w-3 h-3 text-white absolute left-1 pointer-events-none opacity-0 group-hover:opacity-20 transition-opacity" />
                  </div>
                  <p className="text-[10px] text-gray-500 leading-relaxed font-bold uppercase tracking-tight">
                    I confirm elite membership terms and age eligibility (18+). I accept all <span className="text-blue-500 hover:underline">security protocols</span>.
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-black py-5 rounded-2xl transition-all mt-4 shadow-[0_15px_40px_rgba(59,130,246,0.3)] text-lg uppercase italic tracking-tighter active:scale-95 flex items-center justify-center gap-3 group disabled:opacity-60"
            >
              <Fingerprint className="w-6 h-6 group-hover:scale-110 transition-transform" />
              {loading ? (isLogin ? 'Signing in…' : 'Registering…') : (isLogin ? 'Initiate Login' : 'Begin Journey')}
            </button>
            {errorMsg && <div className="text-sm text-red-400 mt-3">{errorMsg}</div>}
          </form>

          <div className="mt-12 flex flex-col gap-4">
            <p className="text-[9px] text-gray-600 text-center uppercase font-black tracking-[0.3em]">Alternate Identification</p>
            <div className="grid grid-cols-2 gap-4">
              <button className="bg-[#0f212e] border border-[#213743] hover:bg-[#213743] p-3 rounded-xl transition-all flex items-center justify-center gap-2 group">
                <Globe className="w-4 h-4 text-gray-500 group-hover:text-white" />
                <span className="text-[10px] font-black uppercase text-gray-400 group-hover:text-white">Google</span>
              </button>
              <button className="bg-[#0f212e] border border-[#213743] hover:bg-[#213743] p-3 rounded-xl transition-all flex items-center justify-center gap-2 group">
                <Smartphone className="w-4 h-4 text-gray-500 group-hover:text-white" />
                <span className="text-[10px] font-black uppercase text-gray-400 group-hover:text-white">M-Pesa</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
