import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Eye,
  RefreshCw,
  SlidersHorizontal,
  CreditCard,
  X,
  Copy,
  Check,
  Building,
  Zap,
  ShieldCheck,
  Info,
  ExternalLink,
  ArrowRight,
  Lock
} from 'lucide-react';
import { Transaction } from '../types';

interface TransactionRiskViewProps {
  onSelectTransaction: (txId: string) => void;
  onOpenTestPayment?: () => void;
}

const RAZORPAY_TEST_KEY_ID = 'rzp_test_TX5AchbYtvH4Vd';

export const TransactionRiskView: React.FC<TransactionRiskViewProps> = ({
  onSelectTransaction,
  onOpenTestPayment,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [copiedKey, setCopiedKey] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [riskLevel, setRiskLevel] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [idPrefixFilter, setIdPrefixFilter] = useState<string>('');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (search) params.set('search', search);
      if (riskLevel) params.set('risk_level', riskLevel);
      if (paymentMethod) params.set('payment_method', paymentMethod);
      if (idPrefixFilter) params.set('id_prefix', idPrefixFilter);
      if (minAmount) params.set('min_amount', minAmount);
      if (maxAmount) params.set('max_amount', maxAmount);

      const res = await fetch(`/api/transactions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.data || []);
        setTotal(data.total || 0);
        setTotalPages(data.total_pages || 1);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, riskLevel, paymentMethod, idPrefixFilter, minAmount, maxAmount]);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(RAZORPAY_TEST_KEY_ID);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const clearFilters = () => {
    setSearch('');
    setRiskLevel('');
    setPaymentMethod('');
    setIdPrefixFilter('');
    setMinAmount('');
    setMaxAmount('');
    setPage(1);
  };

  const getRiskBadge = (level: string, score: number) => {
    switch (level) {
      case 'LOW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            LOW ({score})
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            MEDIUM ({score})
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-orange-500/15 text-orange-400 border border-orange-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
            HIGH ({score})
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            CRITICAL ({score})
          </span>
        );
      default:
        return <span>{score}</span>;
    }
  };

  const getActionBadge = (action: string) => {
    if (action.toLowerCase().includes('allow')) {
      return (
        <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          Allow
        </span>
      );
    }
    if (action.toLowerCase().includes('additional') || action.toLowerCase().includes('2fa')) {
      return (
        <span className="text-[11px] text-amber-300 font-medium flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          Additional Verification
        </span>
      );
    }
    if (action.toLowerCase().includes('manual')) {
      return (
        <span className="text-[11px] text-orange-300 font-medium flex items-center gap-1">
          <ShieldAlert className="w-3 h-3 text-orange-400" />
          Manual Review
        </span>
      );
    }
    return (
      <span className="text-[11px] text-rose-300 font-medium flex items-center gap-1">
        <AlertOctagon className="w-3 h-3 text-rose-400" />
        Enhanced Verification
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* =========================================================================
          FEATURED RAZORPAY TEST GATEWAY BANNER (With key rzp_test_TX5AchbYtvH4Vd)
      ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-blue-950/70 via-indigo-950/50 to-slate-900 border border-blue-800/40 shadow-xl relative overflow-hidden">
        {/* Background decorative glow */}
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#1565C0] text-white shadow-sm">
                <CreditCard className="w-3 h-3" />
                Razorpay Test Gateway
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Sandbox
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-300 font-medium">Active Test Key ID:</span>
              <code className="px-2.5 py-1 rounded-lg bg-slate-950/90 border border-slate-700/80 text-sky-400 font-mono font-bold text-xs flex items-center gap-2 shadow-inner">
                <span>{RAZORPAY_TEST_KEY_ID}</span>
                <button
                  onClick={handleCopyKey}
                  title="Copy Key ID"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {copiedKey ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </code>
              {copiedKey && <span className="text-emerald-400 text-[11px] font-medium animate-in fade-in">Copied!</span>}
            </div>

            <p className="text-xs text-slate-300/80 max-w-xl leading-relaxed">
              Trigger authentic test payments with <strong>Acme Corp</strong> (Cards, UPI, Netbanking, Wallets) to stream live transactions directly into the ML risk &amp; SHAP attribution engine.
            </p>
          </div>

          {/* Quick Action Button */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0">
            {onOpenTestPayment && (
              <button
                id="razorpay-banner-open-checkout-btn"
                onClick={onOpenTestPayment}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#1565C0] hover:bg-[#0D47A1] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-95 transition-all cursor-pointer"
              >
                <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center text-[10px] font-black">
                  A
                </div>
                <span>Open Razorpay Checkout (₹6,000)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            Transaction Risk Analysis
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {total.toLocaleString()} Records
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time ML risk scoring and SHAP feature attribution on incoming payment traffic.
          </p>
        </div>

        {/* Quick Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {onOpenTestPayment && (
            <button
              id="tx-view-make-test-payment-btn"
              onClick={onOpenTestPayment}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-sky-500/20 active:scale-95 shrink-0 cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Make Test Payment</span>
            </button>
          )}

          {/* Dedicated Razorpay Prefix / Status Quick Dropdown */}
          <div className="relative">
            <select
              id="tx-view-id-prefix-quick-select"
              value={idPrefixFilter}
              onChange={(e) => {
                setIdPrefixFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer hover:border-slate-700 transition-colors"
            >
              <option value="">All ID Prefixes &amp; Status</option>
              <optgroup label="Razorpay ID Prefixes & Sandbox">
                <option value="rzp_test_">🧪 rzp_test_ (Test Sandbox)</option>
                <option value="RZP_">🏢 RZP_ (Live Merchant)</option>
                <option value="pay_">💳 pay_ (Payment Ref)</option>
                <option value="ORD_">📦 ORD_ / order_ (Order ID)</option>
                <option value="CUST_">👤 CUST_ (Customer ID)</option>
              </optgroup>
              <optgroup label="Risk & Status Categories">
                <option value="AUTHORIZED">🟢 AUTHORIZED (Low Risk)</option>
                <option value="UNDER_REVIEW">🟠 UNDER_REVIEW (High Risk)</option>
                <option value="FLAGGED_CRITICAL">🔴 FLAGGED_CRITICAL (Critical)</option>
                <option value="ADDITIONAL_VERIFICATION">🟡 ADDITIONAL_VERIFICATION (2FA)</option>
                <option value="TEST_SANDBOX">⚡ TEST_SANDBOX Mode</option>
              </optgroup>
            </select>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ID, Customer, Order..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </form>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-xl border text-xs font-medium transition-colors flex items-center gap-1.5 ${
              showFilters || riskLevel || paymentMethod || minAmount || idPrefixFilter
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Filters</span>
            {(riskLevel || paymentMethod || minAmount || idPrefixFilter) && (
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
            )}
          </button>
          <button
            onClick={fetchTransactions}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Quick Filter Badges / Chips */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-slate-400 text-[11px] font-medium mr-1">Quick Filter:</span>
        <button
          onClick={() => { setIdPrefixFilter(''); setRiskLevel(''); setPage(1); }}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
            !idPrefixFilter && !riskLevel
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          All Records
        </button>
        <button
          id="filter-chip-rzp-test"
          onClick={() => { setIdPrefixFilter('rzp_test_'); setPage(1); }}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all ${
            idPrefixFilter === 'rzp_test_'
              ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
              : 'bg-slate-900 border border-slate-800 text-sky-400 hover:bg-sky-950/40 hover:border-sky-800/50'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
          rzp_test_ (Sandbox)
        </button>
        <button
          id="filter-chip-rzp-live"
          onClick={() => { setIdPrefixFilter('RZP_'); setPage(1); }}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-all ${
            idPrefixFilter === 'RZP_'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          RZP_ (Live)
        </button>
        <button
          id="filter-chip-pay-ref"
          onClick={() => { setIdPrefixFilter('pay_'); setPage(1); }}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-all ${
            idPrefixFilter === 'pay_'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          pay_ (Ref)
        </button>
        <button
          id="filter-chip-authorized"
          onClick={() => { setIdPrefixFilter('AUTHORIZED'); setPage(1); }}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all ${
            idPrefixFilter === 'AUTHORIZED'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-900 border border-slate-800 text-emerald-400 hover:bg-emerald-950/40'
          }`}
        >
          <Check className="w-3 h-3" />
          AUTHORIZED
        </button>
        <button
          id="filter-chip-under-review"
          onClick={() => { setIdPrefixFilter('UNDER_REVIEW'); setPage(1); }}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all ${
            idPrefixFilter === 'UNDER_REVIEW'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'bg-slate-900 border border-slate-800 text-orange-400 hover:bg-orange-950/40'
          }`}
        >
          <AlertTriangle className="w-3 h-3" />
          UNDER_REVIEW
        </button>
        <button
          id="filter-chip-flagged-critical"
          onClick={() => { setIdPrefixFilter('FLAGGED_CRITICAL'); setPage(1); }}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all ${
            idPrefixFilter === 'FLAGGED_CRITICAL'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-slate-900 border border-slate-800 text-rose-400 hover:bg-rose-950/40'
          }`}
        >
          <AlertOctagon className="w-3 h-3" />
          FLAGGED_CRITICAL
        </button>
      </div>

      {/* Filter Expansion Tray */}
      {showFilters && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 animate-in fade-in slide-in-from-top-2">
          {/* Razorpay ID Prefix / Status Category Filter Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-sky-400" />
              ID Prefix / Status
            </label>
            <select
              id="tx-filter-id-prefix-select"
              value={idPrefixFilter}
              onChange={(e) => { setIdPrefixFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All ID Prefixes &amp; Status</option>
              <optgroup label="Razorpay ID Prefixes & Sandbox">
                <option value="rzp_test_">rzp_test_ (Test Sandbox Gateway)</option>
                <option value="RZP_">RZP_ (Live Merchant Traffic)</option>
                <option value="pay_">pay_ (Gateway Payment Ref)</option>
                <option value="ORD_">ORD_ / order_ (Order ID)</option>
                <option value="CUST_">CUST_ (Customer ID)</option>
              </optgroup>
              <optgroup label="Transaction Status Categories">
                <option value="AUTHORIZED">AUTHORIZED (Low Risk / Approved)</option>
                <option value="UNDER_REVIEW">UNDER_REVIEW (High Risk / Review)</option>
                <option value="FLAGGED_CRITICAL">FLAGGED_CRITICAL (Critical / Block)</option>
                <option value="ADDITIONAL_VERIFICATION">ADDITIONAL_VERIFICATION (2FA)</option>
                <option value="TEST_SANDBOX">TEST_SANDBOX (Interactive Test Mode)</option>
              </optgroup>
            </select>
          </div>

          {/* Risk Level Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Risk Level</label>
            <select
              value={riskLevel}
              onChange={(e) => { setRiskLevel(e.target.value); setPage(1); }}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Risk Levels</option>
              <option value="LOW">LOW (0 - 30)</option>
              <option value="MEDIUM">MEDIUM (31 - 60)</option>
              <option value="HIGH">HIGH (61 - 80)</option>
              <option value="CRITICAL">CRITICAL (81 - 100)</option>
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => { setPaymentMethod(e.target.value); setPage(1); }}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Methods</option>
              <option value="UPI">UPI</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Netbanking">Netbanking</option>
              <option value="Wallet">Wallet</option>
            </select>
          </div>

          {/* Min Amount */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Min Amount (₹)</label>
            <input
              type="number"
              placeholder="e.g. 5000"
              value={minAmount}
              onChange={(e) => { setMinAmount(e.target.value); setPage(1); }}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Max Amount & Clear */}
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Max Amount (₹)</label>
              <input
                type="number"
                placeholder="e.g. 50000"
                value={maxAmount}
                onChange={(e) => { setMaxAmount(e.target.value); setPage(1); }}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Active Filter Indicator Tag */}
      {(idPrefixFilter || riskLevel || paymentMethod || search || minAmount || maxAmount) && (
        <div className="flex flex-wrap items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
          <span className="text-slate-400 text-[11px] font-medium">Active Filters:</span>
          {idPrefixFilter && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-300 text-[11px] font-mono">
              Prefix / Status: <strong>{idPrefixFilter}</strong>
              <button
                onClick={() => { setIdPrefixFilter(''); setPage(1); }}
                className="hover:text-white cursor-pointer ml-0.5"
                title="Remove filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {riskLevel && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[11px]">
              Risk: <strong>{riskLevel}</strong>
              <button
                onClick={() => { setRiskLevel(''); setPage(1); }}
                className="hover:text-white cursor-pointer ml-0.5"
                title="Remove filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {paymentMethod && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-[11px]">
              Method: <strong>{paymentMethod}</strong>
              <button
                onClick={() => { setPaymentMethod(''); setPage(1); }}
                className="hover:text-white cursor-pointer ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {search && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-[11px]">
              Query: <strong>"{search}"</strong>
              <button
                onClick={() => { setSearch(''); setPage(1); }}
                className="hover:text-white cursor-pointer ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={clearFilters}
            className="text-[11px] text-slate-400 hover:text-rose-400 ml-auto font-medium transition-colors cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Transactions Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] uppercase font-semibold text-slate-400 tracking-wider">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Date / Time</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Recommended Action</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-400" />
                    Analyzing transaction risk...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No transactions match your active filters.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isTestPrefix =
                    tx.transaction_id.toLowerCase().startsWith('rzp_test') ||
                    (tx.key_id && tx.key_id.toLowerCase().includes('rzp_test')) ||
                    (tx.gateway_ref && tx.gateway_ref.toLowerCase().includes('test')) ||
                    Boolean(tx.scenario_preset);

                  return (
                    <tr
                      key={tx.transaction_id}
                      onClick={() => onSelectTransaction(tx.transaction_id)}
                      className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-indigo-400 group-hover:text-indigo-300">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{tx.transaction_id}</span>
                          {isTestPrefix && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                              TEST
                            </span>
                          )}
                        </div>
                        {tx.gateway_ref && (
                          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                            <CreditCard className="w-2.5 h-2.5 text-slate-400" />
                            {tx.gateway_ref}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {tx.timestamp}
                      </td>
                      <td className="py-3 px-4 font-bold text-white font-mono">
                        ₹{tx.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-medium">
                          {tx.payment_method}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-200">{tx.customer_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{tx.customer_id}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                tx.risk_score > 80
                                  ? 'bg-rose-500'
                                  : tx.risk_score > 60
                                  ? 'bg-orange-500'
                                  : tx.risk_score > 30
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, tx.risk_score)}%` }}
                            />
                          </div>
                          <span className="font-mono font-semibold text-xs text-white">
                            {tx.risk_score}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getRiskBadge(tx.risk_level, tx.risk_score)}
                      </td>
                      <td className="py-3 px-4">
                        {getActionBadge(tx.recommended_action)}
                      </td>
                      <td className="py-3 px-4 text-right">
                      <span className="p-1.5 rounded-lg text-slate-400 group-hover:text-indigo-300 group-hover:bg-slate-800 inline-flex items-center transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-950/40 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <span className="text-white font-medium">{transactions.length}</span> of{' '}
            <span className="text-white font-medium">{total}</span> transactions
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
