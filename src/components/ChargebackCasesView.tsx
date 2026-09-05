import React, { useState, useEffect } from 'react';
import {
  FolderLock,
  Search,
  Plus,
  ChevronRight,
  Sparkles,
  FileText,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  DollarSign
} from 'lucide-react';
import { ChargebackCase } from '../types';

interface ChargebackCasesViewProps {
  onSelectCase: (caseId: string) => void;
  onOpenNewCaseModal: () => void;
}

export const ChargebackCasesView: React.FC<ChargebackCasesViewProps> = ({
  onSelectCase,
  onOpenNewCaseModal,
}) => {
  const [cases, setCases] = useState<ChargebackCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchCases = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/chargebacks?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCases(data.cases || []);
      }
    } catch (err) {
      console.error('Failed to load chargeback cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCases();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'New':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            New Dispute
          </span>
        );
      case 'Investigating':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Investigating
          </span>
        );
      case 'Evidence Ready':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 w-fit">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            Evidence Ready
          </span>
        );
      case 'Submitted':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 w-fit">
            <CheckCircle2 className="w-3 h-3 text-indigo-400" />
            Submitted to Bank
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 w-fit">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            Chargeback Case Management
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              {cases.length} Open Disputes
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage incoming bank dispute representations, organize merchant fulfillment records, and generate audit-ready defense binders.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={onOpenNewCaseModal}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-500/25"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Open Chargeback Case</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
          {['', 'New', 'Investigating', 'Evidence Ready', 'Submitted'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {st === '' ? 'All Cases' : st}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Case ID or Customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </form>
      </div>

      {/* Cases Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] uppercase font-semibold text-slate-400 tracking-wider">
              <tr>
                <th className="py-3 px-4">Case ID</th>
                <th className="py-3 px-4">Transaction Ref</th>
                <th className="py-3 px-4">Disputed Amount</th>
                <th className="py-3 px-4">Reason Code</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Defense Assistant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Loading dispute cases...
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No chargeback cases found.
                  </td>
                </tr>
              ) : (
                cases.map((cb) => (
                  <tr
                    key={cb.case_id}
                    onClick={() => onSelectCase(cb.case_id)}
                    className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-indigo-400 group-hover:text-indigo-300">
                      {cb.case_id}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {cb.transaction_id}
                    </td>
                    <td className="py-3 px-4 font-bold text-white font-mono">
                      ₹{cb.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{cb.reason}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Code {cb.reason_code}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{cb.customer_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{cb.customer_id}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>{cb.due_date}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(cb.status)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCase(cb.case_id);
                        }}
                        className="px-3 py-1 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold transition-all inline-flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Assemble</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
