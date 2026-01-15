
import React, { useState } from 'react';
import { Smartphone, X, ArrowUpRight, ArrowDownLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface MpesaModalProps {
  type: 'deposit' | 'withdraw';
  onClose: () => void;
}

const MpesaModal: React.FC<MpesaModalProps> = ({ type, onClose }) => {
  const { user, addTransaction } = useUser();
  const [amount, setAmount] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleAction = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    
    if (type === 'withdraw') {
      if (val > user.balance) {
        alert("Insufficient balance");
        return;
      }
      setShowConfirmation(true);
      return;
    }

    addTransaction('deposit', val);
    onClose();
  };

  const finalizeWithdrawal = () => {
    const val = parseFloat(amount);
    addTransaction('withdrawal', val);
    onClose();
  };

  if (showConfirmation) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="bg-[#1a2c38] w-full max-w-sm rounded-[2.5rem] border border-[#213743] overflow-hidden shadow-5xl animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
           <div className="p-8 border-b border-[#213743] bg-gradient-to-b from-[#213743]/50 to-transparent flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/20">
                 <AlertCircle className="w-8 h-8 text-blue-500" />
              </div>
              <h2 className="text-xl font-black text-white italic tracking-tighter uppercase mb-1">Confirm Withdrawal</h2>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest italic">Review your request details</p>
           </div>
           
           <div className="p-8 space-y-6">
              <div className="space-y-4">
                 <div className="flex justify-between items-center bg-[#0f212e] p-4 rounded-2xl border border-white/5">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Method</span>
                    <span className="text-xs font-black text-white italic">M-PESA Global</span>
                 </div>
                 <div className="flex justify-between items-center bg-blue-500/5 p-4 rounded-2xl border border-blue-500/10">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Net Cashout</span>
                    <span className="text-lg font-black text-blue-400 italic tracking-tighter">Ksh {parseFloat(amount).toLocaleString()}</span>
                 </div>
              </div>
              
              <div className="flex gap-3">
                 <button onClick={() => setShowConfirmation(false)} className="flex-1 bg-[#213743] text-gray-400 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest">Cancel</button>
                 <button onClick={finalizeWithdrawal} className="flex-1 bg-[#49b34a] text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest">Finalize</button>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div className="bg-[#1a2c38] w-full max-w-sm rounded-3xl border border-[#213743] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
         <div className="bg-[#49b34a] p-8 text-center relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            <Smartphone className="w-12 h-12 text-white mx-auto mb-4" />
            <h2 className="text-white font-black text-2xl tracking-tighter uppercase italic">M-PESA {type === 'deposit' ? 'DEPOSIT' : 'WITHDRAWAL'}</h2>
         </div>
         <div className="p-8 flex flex-col gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
              <input type="text" defaultValue="254700000000" className="w-full bg-[#0f212e] border-2 border-[#2f4553] rounded-xl py-4 px-4 text-white font-black outline-none focus:border-[#49b34a]" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount (Ksh)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-[#0f212e] border-2 border-[#2f4553] rounded-xl py-4 px-4 text-white font-black outline-none focus:border-[#49b34a]" placeholder="Min Ksh 10" />
            </div>
            <button onClick={handleAction} className="w-full bg-[#49b34a] text-white font-black py-5 rounded-2xl transition-all shadow-xl uppercase tracking-tight active:scale-95">
              {type === 'deposit' ? 'Request STK Push' : 'Process Withdrawal'}
            </button>
         </div>
      </div>
    </div>
  );
};

export default MpesaModal;
