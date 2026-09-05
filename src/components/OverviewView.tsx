import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  CreditCard,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  FolderLock,
  ChevronRight,
  Layers,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TabType, AnomalyAlert } from '../types';

interface OverviewViewProps {
  onNavigate: (tab: TabType) => void;
  onOpenTransaction: (txId: string) => void;
  onOpenTestPayment?: () => void;
  alerts: AnomalyAlert[];
  onDismissAlert: (id: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onNavigate,
  onOpenTransaction,
  onOpenTestPayment,
  alerts,
  onDismissAlert
}) => {
  const [summaryData, setSummaryData] = useState({
    total_transactions: 24832,
    high_risk_transactions: 347,
    chargeback_cases: 82,
    potential_loss: 1240000.0,
    potential_loss_prevented: 840000.0,
    risk_rate: 1.4,
  });

  const [trendsData, setTrendsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [sumRes, trendRes] = await Promise.all([
          fetch('/api/risk-summary'),
          fetch('/api/risk-trends')
        ]);
        if (sumRes.ok) {
          const sumJson = await sumRes.json();
          setSummaryData(sumJson);
        }
        if (trendRes.ok) {
          const trendJson = await trendRes.json();
          setTrendsData(trendJson);
        }
      } catch (e) {
        console.error('Failed to load overview data:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const fallbackVolume = [
    { date: 'Aug 01', volume: 780, high_risk: 11, chargebacks: 2 },
    { date: 'Aug 05', volume: 820, high_risk: 14, chargebacks: 3 },
    { date: 'Aug 10', volume: 910, high_risk: 12, chargebacks: 1 },
    { date: 'Aug 15', volume: 1150, high_risk: 22, chargebacks: 4 },
    { date: 'Aug 20', volume: 1280, high_risk: 28, chargebacks: 5 },
    { date: 'Aug 25', volume: 940, high_risk: 15, chargebacks: 2 },
    { date: 'Aug 30', volume: 1040, high_risk: 18, chargebacks: 3 },
  ];

  const fallbackRiskDist = [
    { name: 'LOW (0-30)', value: 21850, color: '#10b981' },
    { name: 'MEDIUM (31-60)', value: 2635, color: '#f59e0b' },
    { name: 'HIGH (61-80)', value: 285, color: '#f97316' },
    { name: 'CRITICAL (81-100)', value: 62, color: '#ef4444' },
  ];

  const fallbackPaymentMethod = [
    { method: 'Credit Card', total: 6450, high_risk: 182, rate: 2.82 },
    { method: 'UPI', total: 11920, high_risk: 74, rate: 0.62 },
    { method: 'Debit Card', total: 3470, high_risk: 48, rate: 1.38 },
    { method: 'Netbanking', total: 1980, high_risk: 24, rate: 1.21 },
    { method: 'Wallet', total: 1012, high_risk: 19, rate: 1.87 },
  ];

  const fallbackCategory = [
    { category: 'Electronics', total: 5460, high_risk: 142, loss: 5.12 },
    { category: 'Jewelry', total: 990, high_risk: 46, loss: 3.20 },
    { category: 'Digital Goods', total: 3720, high_risk: 84, loss: 1.98 },
    { category: 'Travel', total: 2980, high_risk: 45, loss: 1.35 },
    { category: 'Fashion', total: 6210, high_risk: 22, loss: 0.55 },
    { category: 'Groceries', total: 3972, high_risk: 8, loss: 0.20 },
  ];

  const volumeData = trendsData?.volumeOverTime || fallbackVolume;
  const riskDistData = trendsData?.riskDistribution?.map((r: any) => ({ name: r.name, value: r.count, color: r.color })) || fallbackRiskDist;
  const paymentData = trendsData?.riskByPaymentMethod || fallbackPaymentMethod;
  const categoryData = trendsData?.riskByMerchantCategory?.map((c: any) => ({ category: c.category, high_risk: c.high_risk, loss: Number((c.loss_amount / 100000).toFixed(2)) })) || fallbackCategory;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner: Anomaly Alert if any */}
      {alerts.length > 0 && alerts[0] && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900/80 to-amber-950/30 border border-rose-500/30 shadow-lg shadow-rose-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center flex-shrink-0 text-rose-400 mt-0.5">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">{alerts[0].title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                  {alerts[0].timestamp}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">{alerts[0].message}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end md:self-center">
            <button
              onClick={() => onNavigate('monitor')}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Inspect Anomaly</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDismissAlert(alerts[0].id)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Razorpay Test Mode Live Gateway Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/40 via-indigo-950/30 to-slate-900 border border-sky-500/20 shadow-lg shadow-sky-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Razorpay Test Mode Payment Gateway
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                Active Sandbox
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Simulate checkout scenarios (Safe, Velocity Surge, Dispute Risk, Fraud) and stream real-time AI risk scores &amp; SHAP factors.
            </p>
          </div>
        </div>

        {onOpenTestPayment && (
          <button
            id="overview-make-test-payment-btn"
            onClick={onOpenTestPayment}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-sky-500/20 flex items-center gap-2 shrink-0 active:scale-95"
          >
            <CreditCard className="w-4 h-4" />
            <span>Make Test Payment</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Hero Welcome / Value Proposition */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            Merchant Risk Overview
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Live Monitoring
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time defensive intelligence protecting payment gateways, reducing chargeback loss, and automating dispute evidence.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onOpenTransaction('RZP_8239281')}
            className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Open Golden High-Risk (RZP_8239281)</span>
          </button>
          <button
            onClick={() => onNavigate('performance')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm shadow-indigo-500/25"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Held-Out Test Results</span>
          </button>
        </div>
      </div>

      {/* 6 Core KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Transactions */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Transactions</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-extrabold text-white font-mono">
            {summaryData.total_transactions.toLocaleString('en-IN')}
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-emerald-400">
            <ArrowUpRight className="w-3 h-3" />
            <span>+14.2% vs last month</span>
          </div>
        </div>

        {/* High Risk Transactions */}
        <div
          onClick={() => onNavigate('transactions')}
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-amber-500/40 transition-all shadow-sm cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold group-hover:text-amber-400 transition-colors">High Risk Tx</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold text-amber-400 font-mono">
            {summaryData.high_risk_transactions}
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-400">
            <span>Score ≥ 61 (Hold/Verify)</span>
          </div>
        </div>

        {/* Chargeback Cases */}
        <div
          onClick={() => onNavigate('cases')}
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-indigo-500/40 transition-all shadow-sm cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold group-hover:text-indigo-400 transition-colors">Chargeback Cases</span>
            <FolderLock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-extrabold text-white font-mono">
            {summaryData.chargeback_cases}
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-indigo-300">
            <span>82.6% Win Rate</span>
          </div>
        </div>

        {/* Potential Loss */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Potential Loss</span>
            <DollarSign className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-extrabold text-rose-400 font-mono">
            ₹{(summaryData.potential_loss / 100000).toFixed(1)}L
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-400">
            <span>Disputed Amount</span>
          </div>
        </div>

        {/* Potential Loss Prevented */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30 bg-emerald-950/10 hover:border-emerald-500/50 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-emerald-300">Loss Prevented</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-emerald-400 font-mono">
            ₹{(summaryData.potential_loss_prevented / 100000).toFixed(1)}L
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
            <span>67.7% Net Saved</span>
          </div>
        </div>

        {/* Risk Rate */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Risk Rate</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-extrabold text-cyan-400 font-mono">
            {summaryData.risk_rate}%
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-400">
            <span>Well below 2.0% alert</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row 1: Volume & Chargeback Trends + Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Volume over time & High Risk */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white">Transaction Volume & Risk Trend</h2>
              <p className="text-[11px] text-slate-400">Daily transaction throughput vs flagged high-risk transactions</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500"></span>
                <span className="text-slate-300 text-[11px]">Total Volume</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
                <span className="text-slate-300 text-[11px]">High Risk</span>
              </div>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="volume" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#volGrad)" />
                <Area type="monotone" dataKey="high_risk" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#riskGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Donut */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Risk Tier Distribution</h2>
            <p className="text-[11px] text-slate-400">Classified by XGBoost calibrated model</p>
          </div>
          <div className="h-52 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskDistData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val.toLocaleString()} tx`, 'Volume']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-800">
            {riskDistData.map((tier: any) => (
              <div key={tier.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tier.color }}></span>
                <span className="text-slate-300 font-medium">{tier.name.split(' ')[0]}</span>
                <span className="text-slate-400 font-mono ml-auto">{tier.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Charts Row 2: Risk by Payment Method & Risk by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk by Payment Method */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white">Risk by Payment Method</h2>
              <p className="text-[11px] text-slate-400">High-risk transaction count per instrument</p>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Razorpay Instruments</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="method" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Bar dataKey="high_risk" fill="#f59e0b" radius={[6, 6, 0, 0]} name="High-Risk Transactions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk by Merchant Category */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white">Risk & Loss by Merchant Category</h2>
              <p className="text-[11px] text-slate-400">High-risk count & potential financial exposure (₹ Lakhs)</p>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Category Exposure</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="category" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any, name: any) => [name === 'loss' ? `₹${val} Lakhs` : val, name === 'loss' ? 'Potential Loss' : 'High Risk Count']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Bar dataKey="high_risk" fill="#6366f1" radius={[6, 6, 0, 0]} name="High Risk Count" />
                <Bar dataKey="loss" fill="#ef4444" radius={[6, 6, 0, 0]} name="Loss Exposure (₹ Lakhs)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
