import React, { useState, useEffect } from 'react';
import { Search, X, ShieldAlert, FolderLock, User, ArrowRight } from 'lucide-react';
import { TabType } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTransaction: (txId: string) => void;
  onSelectCase: (caseId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTransaction,
  onSelectCase,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ transactions: any[]; cases: any[] }>({
    transactions: [],
    cases: [],
  });

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults({ transactions: [], cases: [] });
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ transactions: [], cases: [] });
      return;
    }

    const q = query.toLowerCase();

    // Fetch matching transactions & cases
    Promise.all([
      fetch(`/api/transactions?search=${encodeURIComponent(q)}&limit=4`).then((r) => (r.ok ? r.json() : { data: [] })),
      fetch(`/api/chargebacks?search=${encodeURIComponent(q)}`).then((r) => (r.ok ? r.json() : { cases: [] })),
    ])
      .then(([txData, caseData]) => {
        setResults({
          transactions: txData?.data || [],
          cases: (caseData?.cases || []).slice(0, 4),
        });
      })
      .catch((e) => console.error(e));
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-100">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-100">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/80">
          <Search className="w-4 h-4 text-indigo-400" />
          <input
            type="text"
            autoFocus
            placeholder="Search by Transaction ID (e.g. RZP_8239281), Customer Name, or Case ID (e.g. CB_8291)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="p-4 max-h-96 overflow-y-auto space-y-4 text-xs">
          {!query.trim() ? (
            <div className="py-8 text-center text-slate-500 space-y-1">
              <div>Quickly search across risk-scored transactions and dispute cases.</div>
              <div className="text-[11px] text-slate-600">Try searching "RZP_8239281" or "Rohan Mehta" or "CB_8291"</div>
            </div>
          ) : results.transactions.length === 0 && results.cases.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              No matching transactions or cases found for "{query}".
            </div>
          ) : (
            <>
              {/* Transactions Result */}
              {results.transactions.length > 0 && (
                <div>
                  <div className="text-[10px] uppercase font-semibold text-slate-400 mb-2 px-1">
                    Transactions
                  </div>
                  <div className="space-y-1.5">
                    {results.transactions.map((tx) => (
                      <div
                        key={tx.transaction_id}
                        onClick={() => {
                          onClose();
                          onSelectTransaction(tx.transaction_id);
                        }}
                        className="p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 transition-colors flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <ShieldAlert className="w-4 h-4 text-indigo-400" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-white group-hover:text-indigo-300">
                                {tx.transaction_id}
                              </span>
                              <span className="text-slate-400">• {tx.customer_name}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              ₹{tx.amount.toLocaleString('en-IN')} via {tx.payment_method}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              tx.risk_level === 'CRITICAL' || tx.risk_level === 'HIGH'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            Score: {tx.risk_score}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cases Result */}
              {results.cases.length > 0 && (
                <div>
                  <div className="text-[10px] uppercase font-semibold text-slate-400 mb-2 px-1">
                    Chargeback Cases
                  </div>
                  <div className="space-y-1.5">
                    {results.cases.map((cb) => (
                      <div
                        key={cb.case_id}
                        onClick={() => {
                          onClose();
                          onSelectCase(cb.case_id);
                        }}
                        className="p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 transition-colors flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <FolderLock className="w-4 h-4 text-emerald-400" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-white group-hover:text-emerald-300">
                                {cb.case_id}
                              </span>
                              <span className="text-slate-400">• {cb.reason}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              ₹{cb.amount.toLocaleString('en-IN')} (Due: {cb.due_date})
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-slate-300 px-2 py-0.5 rounded-full bg-slate-800">
                            {cb.status}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
