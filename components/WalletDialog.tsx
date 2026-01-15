
import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { getSupabase } from '../lib/supabase';
import { X, Wallet, ArrowDownCircle, ArrowUpCircle, Loader2, Phone, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface WalletDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const WalletDialog: React.FC<WalletDialogProps> = ({ isOpen, onClose }) => {
    const { user } = useUser();
    const [tab, setTab] = useState<'deposit' | 'withdraw'>('deposit');
    const [amount, setAmount] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [stkPushSent, setStkPushSent] = useState(false);
    const [checkoutRequestId, setCheckoutRequestId] = useState('');

    const handleDeposit = async () => {
        const amt = parseFloat(amount);
        if (!amt || amt <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        if (!phoneNumber || phoneNumber.length < 10) {
            setError('Please enter a valid M-Pesa phone number');
            return;
        }

        setLoading(true);
        setError('');
        setStkPushSent(false);
        const sb = getSupabase();

        try {
            // Try to call M-Pesa STK Push Edge Function
            let functionError = null;
            let data = null;

            try {
                const response = await sb.functions.invoke('mpesa-stk-push', {
                    body: {
                        phoneNumber: phoneNumber,
                        amount: amt,
                        userId: user.id
                    }
                });
                data = response.data;
                functionError = response.error;
            } catch (networkError: any) {
                // Catch network/CORS errors
                console.warn('Network or CORS error calling Edge Function:', networkError);
                functionError = networkError;
            }

            // If Edge Function failed, throw the error to show the user
            if (functionError) {
                console.error('------- FATAL STK ERROR -------');
                console.error('Error Object:', functionError);
                console.error('Error Message:', functionError.message);
                console.error('Response Data:', data);
                console.error('-------------------------------');

                throw new Error(functionError.message || 'Failed to send STK Push. Check console for details.');
            }

            if (data?.success) {
                setStkPushSent(true);
                setCheckoutRequestId(data.checkoutRequestId);
                setSuccess('STK Push sent! Check your phone to complete payment.');
                setAmount('');

                // Poll for transaction status
                pollTransactionStatus(data.checkoutRequestId);
            } else {
                throw new Error(data?.error || 'Failed to initiate M-Pesa payment');
            }
        } catch (err: any) {
            setError(err.message || 'Deposit failed. Please try again or contact support.');
            setStkPushSent(false);
        } finally {
            setLoading(false);
        }
    };

    const pollTransactionStatus = async (requestId: string) => {
        const sb = getSupabase();
        let attempts = 0;
        const maxAttempts = 20; // Poll for up to 1 minute (3s * 20)

        const interval = setInterval(async () => {
            attempts++;

            try {
                const { data: txData } = await sb
                    .from('mpesa_transactions')
                    .select('status, result_code, mpesa_receipt_number')
                    .eq('checkout_request_id', requestId)
                    .single();

                if (txData) {
                    if (txData.status === 'success') {
                        setSuccess(`Payment successful! Receipt: ${txData.mpesa_receipt_number}`);
                        setStkPushSent(false);
                        clearInterval(interval);

                        // Refresh page to show new balance
                        setTimeout(() => {
                            window.location.reload();
                        }, 2000);
                    } else if (txData.status === 'failed' || txData.status === 'cancelled') {
                        setError(`Payment ${txData.status}. Please try again.`);
                        setStkPushSent(false);
                        clearInterval(interval);
                    }
                }

                if (attempts >= maxAttempts) {
                    setError('Payment status unknown. Please check your transactions.');
                    setStkPushSent(false);
                    clearInterval(interval);
                }
            } catch (err) {
                console.error('Error polling transaction:', err);
            }
        }, 3000); // Poll every 3 seconds
    };

    const handleWithdrawal = async () => {
        const amt = parseFloat(amount);
        if (!amt || amt <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        if (amt > user.balance) {
            setError('Insufficient balance');
            return;
        }

        if (!phoneNumber || phoneNumber.length < 10) {
            setError('Please enter your M-Pesa phone number for withdrawal');
            return;
        }

        setLoading(true);
        setError('');
        const sb = getSupabase();

        try {
            const { data, error: rpcError } = await sb.rpc('create_withdrawal', {
                p_user_id: user.id,
                p_amount: amt,
                p_method: 'M-PESA'
            });

            if (rpcError) throw rpcError;

            setSuccess(`Withdrawal request created! Funds will be sent to ${phoneNumber} after admin approval.`);
            setAmount('');

            setTimeout(() => {
                setSuccess('');
                onClose();
                window.location.reload();
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Withdrawal failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md bg-[#1a2c38] rounded-[2rem] border border-[#213743] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-[#213743] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-xl">
                            <Wallet className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-white uppercase italic">Wallet</h2>
                            <p className="text-[10px] text-gray-500 font-bold">M-Pesa Deposits & Withdrawals</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-[#0f212e] hover:bg-[#213743] rounded-full text-gray-400 hover:text-white transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tab Selector */}
                <div className="p-6 pb-0">
                    <div className="flex bg-[#0f212e] rounded-2xl p-1 border border-[#213743] relative mb-6">
                        <button
                            onClick={() => setTab('deposit')}
                            className={`flex-1 py-3 text-[10px] font-black uppercase z-10 transition-all flex items-center justify-center gap-2 ${tab === 'deposit' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <ArrowDownCircle className="w-4 h-4" />
                            Deposit
                        </button>
                        <button
                            onClick={() => setTab('withdraw')}
                            className={`flex-1 py-3 text-[10px] font-black uppercase z-10 transition-all flex items-center justify-center gap-2 ${tab === 'withdraw' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <ArrowUpCircle className="w-4 h-4" />
                            Withdraw
                        </button>
                        <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#213743] rounded-xl transition-all duration-300 shadow-xl ${tab === 'withdraw' ? 'translate-x-full' : 'translate-x-0'}`} />
                    </div>

                    {/* Balance Display */}
                    <div className="bg-[#0f212e] p-4 rounded-xl border border-[#213743] mb-6">
                        <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Current Balance</p>
                        <p className={`text-2xl font-black ${user.isDemo ? 'text-orange-500' : 'text-emerald-500'}`}>
                            Ksh {user.isDemo ? Number(user.demoBalance).toLocaleString() : Number(user.balance).toLocaleString()}
                        </p>
                        {user.isDemo && (
                            <p className="text-[9px] text-orange-400 font-bold mt-2 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                                You are in DEMO mode
                            </p>
                        )}
                    </div>

                    {/* Demo Mode Warning */}
                    {user.isDemo && (
                        <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                            <p className="text-orange-500 text-xs font-bold mb-2">⚠️ Demo Mode Active</p>
                            <p className="text-gray-400 text-[10px] leading-relaxed">
                                Please switch to <span className="text-white font-black">REAL MODE</span> to deposit or withdraw actual funds. Demo mode is for practice only.
                            </p>
                        </div>
                    )}

                    {/* Phone Number Input */}
                    <div className="space-y-2 mb-4">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <Phone className="w-3 h-3" />
                            M-Pesa Phone Number
                        </label>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="0712345678"
                            disabled={loading || user.isDemo}
                            className="w-full bg-[#0f212e] border-2 border-[#213743] rounded-2xl py-4 px-5 text-white text-lg font-bold outline-none focus:border-blue-500 transition-all disabled:opacity-50"
                        />
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-2 mb-6">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Amount (KSH)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            disabled={loading || user.isDemo}
                            className="w-full bg-[#0f212e] border-2 border-[#213743] rounded-2xl py-4 px-5 text-white text-lg font-bold outline-none focus:border-blue-500 transition-all disabled:opacity-50"
                        />
                    </div>

                    {/* STK Push Status */}
                    {stkPushSent && (
                        <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-3">
                            <Clock className="w-5 h-5 text-blue-500 animate-pulse" />
                            <div>
                                <p className="text-blue-400 text-xs font-bold">Waiting for payment...</p>
                                <p className="text-gray-400 text-[10px]">Enter your M-Pesa PIN on your phone</p>
                            </div>
                        </div>
                    )}

                    {/* Error/Success Messages */}
                    {error && (
                        <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-rose-500" />
                            <p className="text-rose-500 text-xs font-bold">{error}</p>
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <p className="text-emerald-500 text-xs font-bold">{success}</p>
                        </div>
                    )}

                    {/* Action Button */}
                    <button
                        onClick={tab === 'deposit' ? handleDeposit : handleWithdrawal}
                        disabled={loading || user.isDemo || stkPushSent}
                        className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 mb-6 ${tab === 'deposit'
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                        {user.isDemo ? 'Switch to Real Mode' : (loading ? 'Processing...' : stkPushSent ? 'Waiting for Payment...' : (tab === 'deposit' ? 'Send STK Push' : 'Request Withdrawal'))}
                    </button>

                    {/* Help Text */}
                    <div className="p-3 bg-gray-500/10 border border-gray-500/20 rounded-xl">
                        <p className="text-gray-400 text-[10px] leading-relaxed">
                            {tab === 'deposit'
                                ? '💡 You will receive an STK Push on your phone. Enter your M-Pesa PIN to complete the payment.'
                                : '💡 Withdrawal requests require admin approval. Funds will be sent to your M-Pesa number within 24 hours.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletDialog;
