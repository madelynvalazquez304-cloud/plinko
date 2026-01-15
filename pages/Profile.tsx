import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { getSupabase } from '../lib/supabase';

const Profile: React.FC = () => {
  const { user } = useUser();
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const sb = getSupabase();
        // safe: mock client implements a `from(...).select()` that returns { data, error }
        const res: any = await sb.from('profiles').select('*').eq('email', user.email).limit(1).maybeSingle?.() ?? await sb.from('profiles').select('*').eq('email', user.email).limit(1).single();
        // The shape differs between mock and real client; normalize:
        const data = res.data ?? res;
        if (mounted) setProfile(data ?? null);
      } catch (err: any) {
        if (mounted) setError(err?.message ?? String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => { mounted = false; };
  }, [user.email]);

  const shown = profile ?? user;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>

      {loading && <p>Loading profile…</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="bg-[#0f1724] p-6 rounded-lg shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <img src={(shown.avatar_url ?? shown.avatarUrl) || '/avatar-placeholder.png'} alt="avatar" className="w-20 h-20 rounded-full object-cover" />
            <div>
              <div className="text-lg font-bold">{shown.display_name ?? shown.username ?? 'Unknown'}</div>
              <div className="text-sm text-gray-400">{shown.email}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-[#091021] rounded-lg">
              <div className="text-xs uppercase text-gray-400 font-black">Balance</div>
              <div className="text-2xl font-bold">${Number(shown.balance ?? 0).toFixed(2)}</div>
            </div>
            <div className="p-4 bg-[#091021] rounded-lg">
              <div className="text-xs uppercase text-gray-400 font-black">Demo Balance</div>
              <div className="text-2xl font-bold">${Number(shown.demo_balance ?? shown.demoBalance ?? 0).toFixed(2)}</div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-[#071018] rounded-lg">
            <div className="text-xs uppercase text-gray-400 font-black">Personal</div>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] text-gray-400">Phone</div>
                <div className="font-bold">{shown.phone ?? '—'}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-400">Role</div>
                <div className="font-bold">{shown.role ?? 'user'}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
