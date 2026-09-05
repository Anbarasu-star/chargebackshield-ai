import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  ShieldCheck,
  Cpu,
  Sliders,
  DollarSign,
  Save,
  CheckCircle2,
  Lock,
  Database,
  Radio,
  Sparkles
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [lowMax, setLowMax] = useState(30);
  const [medMax, setMedMax] = useState(60);
  const [highMax, setHighMax] = useState(80);

  const [avgCbLoss, setAvgCbLoss] = useState(2000);
  const [verCost, setVerCost] = useState(50);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            Platform Settings & Defense Guardrails
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure risk decision boundaries, default financial loss assumptions, and integration parameters.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm shadow-indigo-500/20"
        >
          {saved ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : <Save className="w-3.5 h-3.5" />}
          <span>{saved ? 'Saved Successfully' : 'Save Configuration'}</span>
        </button>
      </div>

      {/* 1. Risk Tier Thresholds */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <span>Risk Classification Thresholds</span>
        </div>
        <p className="text-xs text-slate-400">
          Define score bands for automated actions (Allow, Additional Verification, Manual Review, Hold).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-1.5">
            <span className="font-semibold text-emerald-400 block">LOW (Allow)</span>
            <div className="flex items-center justify-between text-slate-300">
              <span>0 to {lowMax}</span>
              <span className="text-[10px] text-slate-500">Score Range</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 space-y-1.5">
            <span className="font-semibold text-amber-400 block">MEDIUM (2FA / Verify)</span>
            <div className="flex items-center justify-between text-slate-300">
              <span>{lowMax + 1} to {medMax}</span>
              <span className="text-[10px] text-slate-500">Score Range</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-rose-500/30 space-y-1.5">
            <span className="font-semibold text-rose-400 block">HIGH / CRITICAL (Hold)</span>
            <div className="flex items-center justify-between text-slate-300">
              <span>{medMax + 1} to 100</span>
              <span className="text-[10px] text-slate-500">Score Range</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Financial Cost Assumptions */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span>Default Financial Loss Parameters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1.5">Average Chargeback Loss (₹)</label>
            <input
              type="number"
              value={avgCbLoss}
              onChange={(e) => setAvgCbLoss(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Value of disputed item + acquiring penalty</span>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1.5">Verification Cost per False Positive (₹)</label>
            <input
              type="number"
              value={verCost}
              onChange={(e) => setVerCost(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Cost of OTP gateway, step-up challenge, or review team</span>
          </div>
        </div>
      </div>

      {/* 3. Defense-Only Architecture Declaration */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Defensive Security Architecture</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 space-y-2">
          <p className="leading-relaxed">
            ChargebackShield AI operates in <strong>Defense-Only Mode</strong>. It strictly protects merchants from friendly fraud and payment dispute losses without enabling offensive scraping, credential stuffing, or checkout exploits.
          </p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Anti-Hallucination RAG Grounding Active
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              SHAP TreeExplainer Enabled
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
