import React, { useState } from 'react';
import { X, FolderLock, Plus, Sparkles, CheckCircle2 } from 'lucide-react';
import { Transaction } from '../types';

interface NewCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTransaction?: Transaction | null;
  onCaseCreated: (newCaseId: string) => void;
}

export const NewCaseModal: React.FC<NewCaseModalProps> = ({
  isOpen,
  onClose,
  initialTransaction,
  onCaseCreated,
}) => {
  const [txId, setTxId] = useState(initialTransaction?.transaction_id || '');
  const [reasonCode, setReasonCode] = useState('10.4');
  const [reason, setReason] = useState('Fraudulent Transaction - Card Absent');
  const [claimedAmount, setClaimedAmount] = useState(initialTransaction?.amount ? String(initialTransaction.amount) : '8499');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/chargebacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_id: txId || 'RZP_8239281',
          reason_code: reasonCode,
          reason,
          claimed_amount: Number(claimedAmount),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        onCaseCreated(data.case_id);
        onClose();
      }
    } catch (err) {
      console.error('Failed to create chargeback case:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-100">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-100">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FolderLock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Open Chargeback Case</h2>
              <p className="text-[11px] text-slate-400">Ingest a bank dispute representation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Transaction ID</label>
            <input
              type="text"
              required
              placeholder="e.g. RZP_8239281"
              value={txId}
              onChange={(e) => setTxId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Reason Code</label>
              <select
                value={reasonCode}
                onChange={(e) => {
                  setReasonCode(e.target.value);
                  if (e.target.value === '10.4') setReason('Fraudulent Transaction - Card Absent');
                  else if (e.target.value === '4837') setReason('No Cardholder Authorization');
                  else if (e.target.value === '13.1') setReason('Merchandise Not Received');
                  else setReason('Defective / Not as Described');
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="10.4">10.4 - Fraud / Card Absent</option>
                <option value="4837">4837 - No Authorization</option>
                <option value="13.1">13.1 - Not Received</option>
                <option value="13.3">13.3 - Defective / Damaged</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Disputed Amount (₹)</label>
              <input
                type="number"
                required
                value={claimedAmount}
                onChange={(e) => setClaimedAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Dispute Description</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors flex items-center gap-1.5 shadow-sm shadow-indigo-500/25"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{submitting ? 'Creating Case...' : 'Create Case'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
