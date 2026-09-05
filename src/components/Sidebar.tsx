import React from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  Activity,
  FolderLock,
  FileText,
  LineChart,
  Cpu,
  Settings,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { TabType } from '../types';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  openCasesCount?: number;
  highRiskCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  openCasesCount = 82,
  highRiskCount = 347,
}) => {
  const navItems: { id: TabType; label: string; icon: React.ElementType; badge?: string | number; badgeColor?: string }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transaction Risk', icon: ShieldAlert, badge: highRiskCount, badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    { id: 'monitor', label: 'Risk Monitor', icon: Activity, badge: 'Live', badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse' },
    { id: 'cases', label: 'Chargeback Cases', icon: FolderLock, badge: openCasesCount, badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
    { id: 'evidence', label: 'Evidence Assistant', icon: FileText, badge: 'RAG AI', badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { id: 'analytics', label: 'Analytics', icon: LineChart },
    { id: 'performance', label: 'Model Performance', icon: Cpu, badge: 'ML', badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col flex-shrink-0 select-none z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base text-slate-100 tracking-tight">ChargebackShield</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">AI</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Razorpay Risk Manager</p>
          </div>
        </div>

        <div className="mt-3 px-2.5 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <p className="text-[10px] text-slate-400 italic leading-snug">
            “Predict payment risk. Prevent avoidable losses. Defend every dispute.”
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
          Risk Management
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-950/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Defensive Mode Badge & System Health */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Defense Mode Active
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">XGB-0.89</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Strictly non-intrusive merchant risk scoring and dispute representation.
          </p>
        </div>
      </div>
    </aside>
  );
};
