import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  Zap,
  Radio,
  Clock,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Sliders,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { AnomalyAlert, Transaction } from '../types';

interface RiskMonitorViewProps {
  onOpenTransaction: (txId: string) => void;
  alerts: AnomalyAlert[];
}

export const RiskMonitorView: React.FC<RiskMonitorViewProps> = ({
  onOpenTransaction,
  alerts,
}) => {
  const [liveMetrics, setLiveMetrics] = useState({
    transactions_per_minute: 28,
    transactions_last_hour: 740,
    baseline_hourly_average: 250,
    current_risk_level: 'HIGH',
    live_chargeback_rate: 1.82,
  });

  const [liveStream, setLiveStream] = useState<any[]>([]);

  useEffect(() => {
    // Fetch initial anomaly status
    fetch('/api/anomalies')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.live_status) setLiveMetrics(data.live_status);
      })
      .catch((e) => console.error(e));

    // Seed initial live stream
    const initialStream = [
      { id: 'RZP_8239290', time: 'Just now', amount: 45999, method: 'Credit Card', score: 96, level: 'CRITICAL', city: 'Delhi', reason: 'High amount + Multiple failed attempts' },
      { id: 'RZP_8239281', time: '1m ago', amount: 8499, method: 'Credit Card', score: 87, level: 'HIGH', city: 'Mumbai', reason: 'Previous dispute + New device' },
      { id: 'RZP_8239310', time: '2m ago', amount: 1499, method: 'UPI', score: 14, level: 'LOW', city: 'Bengaluru', reason: 'Trusted account tenure' },
      { id: 'RZP_8239311', time: '3m ago', amount: 3200, method: 'Debit Card', score: 48, level: 'MEDIUM', city: 'Pune', reason: 'Rapid successive checkout' },
      { id: 'RZP_8239312', time: '4m ago', amount: 750, method: 'UPI', score: 8, level: 'LOW', city: 'Ahmedabad', reason: 'Clean historical profile' },
    ];
    setLiveStream(initialStream);

    // Live polling simulation
    const interval = setInterval(() => {
      setLiveMetrics((prev) => ({
        ...prev,
        transactions_per_minute: 26 + Math.floor(Math.random() * 8),
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            Real-Time Risk Monitor
            <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              Live Gateway Ingress
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Continuous anomaly detection comparing live transaction velocity against 30-day statistical baselines.
          </p>
        </div>
      </div>

      {/* Primary Statistical Anomaly Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/60 via-slate-900 to-amber-950/40 border border-rose-500/40 shadow-xl shadow-rose-950/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center flex-shrink-0 text-rose-400">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-sm font-extrabold text-rose-300 uppercase tracking-wider">
                  ⚠️ TRANSACTION VOLUME SPIKE DETECTED
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/30 text-rose-200 border border-rose-500/40 font-mono font-bold">
                  +196% Over Baseline
                </span>
              </div>
              <p className="text-xs text-slate-200 mt-1.5 leading-relaxed">
                Current throughput: <strong className="text-white font-mono">{liveMetrics.transactions_last_hour} tx/hour</strong> vs. 30-day baseline average of <strong className="text-white font-mono">{liveMetrics.baseline_hourly_average} tx/hour</strong>.
              </p>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-2">
                <span className="text-indigo-400 font-semibold">Recommended Defense Action:</span>
                <span>Enforce step-up 2FA/OTP on orders over ₹5,000 to mitigate bot velocity abuse.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Live Monitoring Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold">Live Velocity</span>
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {liveMetrics.transactions_per_minute} <span className="text-xs text-slate-400 font-normal">tx/min</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Normal operating band</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold">Hourly Ingress</span>
            <TrendingUp className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-rose-400 font-mono">
            {liveMetrics.transactions_last_hour} <span className="text-xs text-slate-400 font-normal">tx/hr</span>
          </div>
          <div className="text-[11px] text-rose-400 font-medium mt-1">Spike trigger active</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold">Live Risk Rate</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">
            {liveMetrics.live_chargeback_rate}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Threshold alert at 2.0%</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold">Active Watchdogs</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-400 font-mono">
            4 / 4
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Velocity, Geo, Bin & ML</div>
        </div>
      </div>

      {/* Live Transaction Feed */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Live Ingress Stream</h2>
            <p className="text-[11px] text-slate-400">Inspecting transactions scored in real-time</p>
          </div>
          <span className="text-[11px] text-indigo-400 font-mono">Updated real-time</span>
        </div>

        <div className="space-y-2.5">
          {liveStream.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onOpenTransaction(item.id)}
              className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                    item.score > 80
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : item.score > 60
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : item.score > 30
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {item.score}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-indigo-400 group-hover:text-indigo-300 text-xs">
                      {item.id}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">• {item.time}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {item.city}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">{item.reason}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-auto">
                <div className="text-right">
                  <div className="font-bold text-white font-mono text-xs">₹{item.amount.toLocaleString('en-IN')}</div>
                  <div className="text-[10px] text-slate-400">{item.method}</div>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400 group-hover:text-white group-hover:bg-indigo-600 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
