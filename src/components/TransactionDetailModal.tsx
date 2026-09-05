import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  User,
  CreditCard,
  Laptop,
  ShoppingBag,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  PlusCircle,
  FileDown,
  Info
} from 'lucide-react';
import { Transaction, SHAPFactor } from '../types';

interface TransactionDetailModalProps {
  transactionId: string | null;
  onClose: () => void;
  onOpenCaseForTx: (tx: Transaction) => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transactionId,
  onClose,
  onOpenCaseForTx,
}) => {
  const [tx, setTx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!transactionId) return;
    setLoading(true);
    fetch(`/api/transactions/${transactionId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setTx(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [transactionId]);

  if (!transactionId) return null;

  const getRiskColor = (level?: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'text-rose-400 bg-rose-500/20 border-rose-500/40';
      case 'HIGH':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/40';
      case 'MEDIUM':
        return 'text-amber-400 bg-amber-500/20 border-amber-500/40';
      default:
        return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Modal Top Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-white font-mono">
                  {tx?.transaction_id || transactionId}
                </h2>
                {tx && (
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getRiskColor(tx.risk_level)}`}>
                    {tx.risk_level} RISK ({tx.risk_score}/100)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Processed at {tx?.timestamp} via {tx?.payment_method}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading || !tx ? (
            <div className="py-16 text-center text-xs text-slate-400">
              <Sparkles className="w-6 h-6 text-indigo-400 animate-spin mx-auto mb-2" />
              Retrieving transaction intelligence and SHAP factors...
            </div>
          ) : (
            <>
              {/* Score & Recommended Action Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Recommended Action:
                    </span>
                    <span className="text-xs font-bold text-indigo-300 px-2.5 py-0.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
                      {tx.recommended_action}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">{tx.action_reason}</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0 self-end md:self-auto">
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Transaction Value</div>
                    <div className="text-lg font-extrabold text-white font-mono">
                      ₹{tx.amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>

              {/* WHY IS THIS TRANSACTION RISKY (SHAP Factor Attribution) */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Why is this transaction risky? (SHAP Explanations)
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    TreeExplainer Contribution
                  </span>
                </div>

                <div className="space-y-2.5">
                  {tx.shap_factors && tx.shap_factors.length > 0 ? (
                    tx.shap_factors.map((factor, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-[11px] ${
                              factor.impact > 0
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {factor.impact > 0 ? `+${factor.impact}` : `${factor.impact}`}
                          </span>
                          <div className="truncate">
                            <div className="font-semibold text-slate-200">{factor.feature}</div>
                            <div className="text-[11px] text-slate-400">{factor.description}</div>
                          </div>
                        </div>

                        {/* Visual contribution bar */}
                        <div className="w-24 h-2 rounded-full bg-slate-800 overflow-hidden flex-shrink-0 hidden sm:block">
                          <div
                            className={`h-full rounded-full ${
                              factor.impact > 0 ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.abs(factor.impact) * 3.5)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 italic py-2">
                      Standard transaction profile with safe baseline attributions.
                    </div>
                  )}
                </div>
              </div>

              {/* 4 Metadata Cards: Customer, Payment, Device, Order */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Information */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300 pb-1 border-b border-slate-800">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Customer Profile</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Customer Name</span>
                      <span className="font-medium text-slate-200">{tx.customer_name}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Customer ID</span>
                      <span className="font-mono text-slate-300">{tx.customer_id}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Account Age</span>
                      <span className="text-slate-300">{tx.customer_account_age} days</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Prior Chargebacks</span>
                      <span className={`font-bold font-mono ${tx.previous_chargebacks > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                        {tx.previous_chargebacks}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment & Security */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300 pb-1 border-b border-slate-800">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Payment & Security</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Payment Method</span>
                      <span className="font-medium text-slate-200">{tx.payment_method}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Velocity (10m)</span>
                      <span className={`font-mono ${tx.transaction_velocity >= 3 ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>
                        {tx.transaction_velocity} attempts
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Failed Attempts</span>
                      <span className={`font-mono ${tx.failed_attempts > 0 ? 'text-amber-400 font-bold' : 'text-slate-300'}`}>
                        {tx.failed_attempts}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">3D Secure 2FA</span>
                      <span className="text-emerald-400 font-medium">Authenticated</span>
                    </div>
                  </div>
                </div>

                {/* Device & Location */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300 pb-1 border-b border-slate-800">
                    <Laptop className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Device & Network</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Device Age</span>
                      <span className={`font-mono ${tx.device_age < 5 ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>
                        {tx.device_age} day(s)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Device Fingerprint</span>
                      <span className="text-slate-300 truncate block">{tx.device_type} ({tx.device_browser})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">IP Address</span>
                      <span className="font-mono text-slate-300">{tx.ip_address}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">IP City</span>
                      <span className="text-slate-300">{tx.city}</span>
                    </div>
                  </div>
                </div>

                {/* Order & Address Match */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300 pb-1 border-b border-slate-800">
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                    <span>Order & Fulfillment</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Order ID</span>
                      <span className="font-mono text-slate-300">{tx.order_id}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Billing / Shipping</span>
                      <span className={`font-semibold ${tx.billing_shipping_match === 1 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tx.billing_shipping_match === 1 ? 'Match (Safe)' : 'Mismatch Detected'}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500 text-[10px] block">Items</span>
                      <span className="text-slate-300 truncate block">{tx.order_items}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-indigo-400" />
            <span>XGBoost calibrated prediction & SHAP explainability</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Close
            </button>
            {tx && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCaseForTx(tx);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm shadow-indigo-500/20"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Open Chargeback Case</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
