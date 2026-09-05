import React, { useState } from 'react';
import {
  Search,
  Bell,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  Plus
} from 'lucide-react';
import { AnomalyAlert } from '../types';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenNewCase: () => void;
  onOpenTestPayment: () => void;
  alerts: AnomalyAlert[];
  onDismissAlert: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenNewCase,
  onOpenTestPayment,
  alerts,
  onDismissAlert,
}) => {
  const [showAlertsMenu, setShowAlertsMenu] = useState(false);

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Search Bar Trigger */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 hover:border-slate-700 hover:text-slate-200 transition-colors shadow-inner"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span>Search Transaction ID, Customer, or Case ID...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Prominent Razorpay Test Payment Gateway Trigger */}
        <button
          id="header-make-test-payment-btn"
          onClick={onOpenTestPayment}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-sky-500/20 active:scale-95 group"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping group-hover:animate-none" />
          <span className="hidden xs:inline">Razorpay</span>
          <span>Make Test Payment</span>
        </button>

        {/* ML Status Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/50 border border-slate-800 text-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-400">ML:</span>
          <span className="font-semibold text-indigo-300">XGBoost + SHAP</span>
        </div>

        {/* New Case Button */}
        <button
          onClick={onOpenNewCase}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Dispute</span>
        </button>

        {/* Notifications / Alerts Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowAlertsMenu(!showAlertsMenu)}
            className="relative p-2 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center ring-2 ring-slate-900 animate-pulse">
                {alerts.length}
              </span>
            )}
          </button>

          {showAlertsMenu && (
            <div className="absolute right-0 mt-2 w-84 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/80 z-50 p-4 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Risk & Anomaly Alerts</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{alerts.length} active</span>
              </div>

              <div className="mt-3 space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {alerts.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500">
                    No active anomaly alerts. Systems normal.
                  </div>
                ) : (
                  alerts.map((alt) => (
                    <div
                      key={alt.id}
                      className={`p-3 rounded-xl border text-xs relative ${
                        alt.severity === 'CRITICAL'
                          ? 'bg-rose-950/30 border-rose-800/50 text-rose-200'
                          : alt.severity === 'HIGH'
                          ? 'bg-amber-950/30 border-amber-800/50 text-amber-200'
                          : 'bg-slate-950/50 border-slate-800 text-slate-300'
                      }`}
                    >
                      <button
                        onClick={() => onDismissAlert(alt.id)}
                        className="absolute top-2.5 right-2.5 text-slate-400 hover:text-slate-200"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="font-semibold text-xs mb-1 pr-6">{alt.title}</div>
                      <p className="text-[11px] text-slate-300 leading-snug mb-2">{alt.message}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-mono">{alt.timestamp}</span>
                        <span className="text-indigo-400 font-medium">{alt.action}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
