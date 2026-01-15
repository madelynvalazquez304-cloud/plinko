
import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { getSupabase } from '../lib/supabase';
import { X, User, Wallet, Phone, ShieldCheck, LogOut, Copy, Check, Edit2, Save, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WalletDialog from './WalletDialog';

interface ProfileDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const ProfileDialog: React.FC<ProfileDialogProps> = ({ isOpen, onClose }) => {
    const { user, refillDemoBalance } = useUser();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any | null>(null);
    const [copied, setCopied] = useState(false);
    const [isWalletOpen, setIsWalletOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editPhone, setEditPhone] = useState('');
    const [editUsername, setEditUsername] = useState('');
    const [saving, setSaving] = useState(false);
    const [refilling, setRefilling] = useState(false);

    useEffect(() => {
        if (isOpen && user?.email) {
            // Refresh profile data when dialog opens
            const sb = getSupabase();
            sb.from('profiles').select('*').eq('email', user.email).single()
                .then(({ data }) => {
                    if (data) {
                        setProfile(data);
                        setEditPhone(data.phone || '');
                        setEditUsername(data.username || '');
                    }
                });
        }
    }, [isOpen, user?.email]);

    const handleLogout = async () => {
        const sb = getSupabase();
        await sb.auth.signOut();
        onClose();
        navigate('/');
    };

    const handleSaveProfile = async () => {
        if (!user) return;

        setSaving(true);
        const sb = getSupabase();

        try {
            const { error } = await sb.from('profiles').update({
                phone: editPhone,
                username: editUsername
            }).eq('id', user.id);

            if (error) throw error;

            // Refresh profile
            const { data } = await sb.from('profiles').select('*').eq('id', user.id).single();
            if (data) setProfile(data);

            setIsEditing(false);
        } catch (err) {
            console.error('Failed to update profile:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleRefillDemo = async () => {
        setRefilling(true);
        await refillDemoBalance();

        // Refresh profile to show new balance
        setTimeout(() => {
            const sb = getSupabase();
            sb.from('profiles').select('*').eq('email', user.email).single()
                .then(({ data }) => {
                    if (data) setProfile(data);
                    setRefilling(false);
                });
        }, 500);
    };

    const copyId = () => {
        if (!user) return;
        navigator.clipboard.writeText(user.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen || !user) return null;

    const displayUser = profile || user;

    return (
        <>
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={onClose}
                />

                <div className="relative w-full max-w-md bg-[#1a2c38] rounded-[2rem] border border-[#213743] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                    {/* Header Background */}
                    <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-all backdrop-blur-md"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="absolute top-4 left-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-all backdrop-blur-md"
                        >
                            {isEditing ? <X className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Profile Content */}
                    <div className="px-8 pb-8 -mt-16 relative">
                        {/* Avatar */}
                        <div className="flex justify-center mb-6">
                            <div className="w-32 h-32 rounded-3xl bg-[#0f212e] border-4 border-[#1a2c38] flex items-center justify-center shadow-2xl relative group cursor-pointer overflow-hidden">
                                {displayUser.avatar_url ? (
                                    <img src={displayUser.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-5xl font-black text-gray-700 select-none group-hover:text-blue-500 transition-colors uppercase italic">
                                        {displayUser.username?.[0] || displayUser.email?.[0] || 'U'}
                                    </span>
                                )}
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[10px] font-black uppercase text-white">Change</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-center space-y-1 mb-8">
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editUsername}
                                    onChange={(e) => setEditUsername(e.target.value)}
                                    className="text-2xl font-black text-white italic tracking-tighter uppercase bg-[#0f212e] border-2 border-blue-500 rounded-xl px-4 py-2 text-center outline-none w-full"
                                    placeholder="Username"
                                />
                            ) : (
                                <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">
                                    {displayUser.username || displayUser.email?.split('@')[0] || 'Anonymous'}
                                </h2>
                            )}
                            <p className="text-xs font-bold text-gray-500">{user.email}</p>

                            <div
                                onClick={copyId}
                                className="inline-flex items-center gap-2 px-3 py-1 bg-[#0f212e] rounded-lg border border-[#213743] hover:border-blue-500/50 cursor-pointer transition-all mt-2 group"
                            >
                                <span className="text-[10px] font-mono text-gray-400 group-hover:text-blue-400 max-w-[150px] truncate">
                                    ID: {user.id?.slice(0, 8)}...
                                </span>
                                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-gray-600 group-hover:text-blue-500" />}
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-8">
                            <div className="bg-[#0f212e] p-4 rounded-xl border border-[#213743]">
                                <div className="flex items-center gap-2 mb-2 text-gray-500">
                                    <Wallet className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Real Balance</span>
                                </div>
                                <p className="text-lg font-black text-emerald-500">Ksh {Number(displayUser.balance || 0).toLocaleString()}</p>
                            </div>
                            <div className="bg-[#0f212e] p-4 rounded-xl border border-[#213743]">
                                <div className="flex items-center gap-2 mb-2 text-gray-500">
                                    <ShieldCheck className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Demo Balance</span>
                                </div>
                                <p className="text-lg font-black text-orange-500">Ksh {Number(displayUser.demo_balance ?? displayUser.demoBalance ?? 0).toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Actions List */}
                        <div className="space-y-2">
                            {/* Demo Refill */}
                            <button
                                onClick={handleRefillDemo}
                                disabled={refilling}
                                className="w-full flex items-center justify-between p-4 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 transition-colors group disabled:opacity-50"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-500/20 rounded-lg text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                        <RefreshCw className={`w-4 h-4 ${refilling ? 'animate-spin' : ''}`} />
                                    </div>
                                    <span className="text-xs font-bold text-orange-500 uppercase">Refill Demo Balance</span>
                                </div>
                                <span className="text-[10px] bg-orange-500/20 text-orange-500 px-2 py-1 rounded font-black uppercase">100K</span>
                            </button>

                            {/* Wallet */}
                            <button
                                onClick={() => setIsWalletOpen(true)}
                                className="w-full flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                        <Wallet className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-bold text-emerald-500 uppercase">Deposit / Withdraw</span>
                                </div>
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-500 px-2 py-1 rounded font-black uppercase">Open</span>
                            </button>

                            {/* Phone Number */}
                            <div className="w-full flex items-center justify-between p-4 rounded-xl bg-[#0f212e] hover:bg-[#213743] border border-[#213743] transition-colors group">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            value={editPhone}
                                            onChange={(e) => setEditPhone(e.target.value)}
                                            placeholder="0712345678"
                                            className="flex-1 bg-[#1a2c38] border border-blue-500 rounded-lg px-3 py-1 text-white text-xs font-bold outline-none"
                                        />
                                    ) : (
                                        <span className="text-xs font-bold text-white uppercase">M-Pesa: {displayUser.phone || 'Not Set'}</span>
                                    )}
                                </div>
                            </div>

                            {/* Save Button (when editing) */}
                            {isEditing && (
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={saving}
                                    className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    <span className="text-xs font-black uppercase tracking-widest">{saving ? 'Saving...' : 'Save Changes'}</span>
                                </button>
                            )}

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 mt-6 text-rose-500 hover:text-rose-400 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="text-xs font-black uppercase tracking-widest">Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Wallet Dialog */}
            <WalletDialog isOpen={isWalletOpen} onClose={() => setIsWalletOpen(false)} />
        </>
    );
};

export default ProfileDialog;
