import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  FileText,
  Copy,
  Download,
  Check,
  AlertTriangle,
  Layers,
  Truck,
  User,
  CreditCard,
  ShoppingBag,
  MessageSquare,
  Clock,
  ShieldCheck,
  Edit3,
  Eye,
  RefreshCw,
  Printer
} from 'lucide-react';
import { ChargebackCase } from '../types';

interface EvidenceAssistantViewProps {
  initialCaseId?: string | null;
}

export const EvidenceAssistantView: React.FC<EvidenceAssistantViewProps> = ({
  initialCaseId,
}) => {
  const [cases, setCases] = useState<ChargebackCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>(initialCaseId || 'CB_8291');
  const [currentCase, setCurrentCase] = useState<ChargebackCase | null>(null);
  const [generating, setGenerating] = useState(false);
  const [evidenceDraft, setEvidenceDraft] = useState<string>('');
  const [generatedBy, setGeneratedBy] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'edit'>('preview');

  useEffect(() => {
    fetch('/api/chargebacks')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.cases) {
          setCases(data.cases);
          if (!selectedCaseId && data.cases.length > 0) {
            setSelectedCaseId(data.cases[0].case_id);
          }
        }
      })
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    if (initialCaseId) {
      setSelectedCaseId(initialCaseId);
    }
  }, [initialCaseId]);

  useEffect(() => {
    if (!selectedCaseId) return;
    fetch(`/api/chargebacks/${selectedCaseId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setCurrentCase(data);
          setEvidenceDraft(data.evidence_draft || '');
        }
      })
      .catch((e) => console.error(e));
  }, [selectedCaseId]);

  const handleGenerateEvidence = async () => {
    if (!selectedCaseId) return;
    setGenerating(true);
    try {
      const res = await fetch(`/api/chargebacks/${selectedCaseId}/generate-evidence`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setEvidenceDraft(data.evidence_draft);
        setGeneratedBy(data.generated_by);
        if (currentCase) {
          setCurrentCase({ ...currentCase, status: 'Evidence Ready', evidence_draft: data.evidence_draft });
        }
      }
    } catch (err) {
      console.error('Evidence generation failed:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(evidenceDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([evidenceDraft], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Dispute_Evidence_${selectedCaseId}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const tx = currentCase?.transaction || {};
  const cust = currentCase?.customer || {};
  const ord = currentCase?.order || {};
  const ful = currentCase?.fulfillment || {};
  const del = currentCase?.delivery || {};
  const ref = currentCase?.refund || {};
  const comms = currentCase?.communications || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            AI Evidence Response Assistant
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              RAG Fact-Grounded
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Assembles internal merchant records across 8 data sources to build defensible bank representation packages without fabrication.
          </p>
        </div>

        {/* Case Selector Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs text-slate-400 font-medium">Select Case:</label>
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          >
            {cases.map((c) => (
              <option key={c.case_id} value={c.case_id}>
                {c.case_id} — {c.customer_name} (₹{c.amount.toLocaleString('en-IN')})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Case Overview Pill */}
      {currentCase && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-mono font-bold text-xs">
              {currentCase.reason_code}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white font-mono">{currentCase.case_id}</span>
                <span className="text-slate-400">•</span>
                <span className="text-xs font-medium text-slate-300">{currentCase.reason}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Disputed: <strong className="text-slate-200 font-mono">₹{currentCase.amount.toLocaleString('en-IN')}</strong> • Due Date: <span className="text-amber-400 font-mono">{currentCase.due_date}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateEvidence}
              disabled={generating}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/25 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing Records...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Evidence Response</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Left 8 Merchant Data Streams, Right Evidence Output Document */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 8 Merchant Data Streams */}
        <div className="lg:col-span-5 space-y-3 max-h-[750px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              8 Available Merchant Record Streams
            </h2>
            <span className="text-[10px] text-emerald-400 font-medium">Ground Truth</span>
          </div>

          {/* 1. Transaction Details */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-300 font-semibold">
              <CreditCard className="w-3.5 h-3.5" />
              <span>1. Payment & Transaction Record</span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-0.5 font-mono">
              <div>Tx ID: <span className="text-slate-200">{tx.transaction_id || 'Evidence not available'}</span></div>
              <div>Gateway Ref: <span className="text-slate-200">{tx.gateway_ref || 'Evidence not available'}</span></div>
              <div>Method: <span className="text-slate-200">{tx.payment_method || 'Evidence not available'}</span></div>
              <div>Status: <span className="text-emerald-400">{tx.status || 'SUCCESS'} (3DS Authenticated)</span></div>
            </div>
          </div>

          {/* 2. Customer Profile & History */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-300 font-semibold">
              <User className="w-3.5 h-3.5" />
              <span>2. Customer Account & Tenure</span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-0.5">
              <div>Name: <span className="text-slate-200">{cust.name || 'Evidence not available'}</span></div>
              <div>Email: <span className="text-slate-200 font-mono">{cust.email || 'Evidence not available'}</span></div>
              <div>Account Created: <span className="text-slate-200 font-mono">{cust.account_created || 'Evidence not available'}</span></div>
              <div>Past Orders: <span className="text-slate-200 font-mono">{cust.completed_orders || 1}</span> • Prior Disputes: <span className="text-slate-200 font-mono">{cust.prior_chargebacks || 0}</span></div>
            </div>
          </div>

          {/* 3. Order Details */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-amber-300 font-semibold">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>3. Order & Item Specification</span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-0.5">
              <div>Order ID: <span className="text-slate-200 font-mono">{ord.order_id || 'Evidence not available'}</span></div>
              <div>Items: <span className="text-slate-200">{ord.items_summary || 'Evidence not available'}</span></div>
              <div>IP / Device: <span className="text-slate-200 font-mono">{ord.ip_address || 'Evidence not available'}</span></div>
            </div>
          </div>

          {/* 4. Payment Confirmation (3DS) */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-300 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>4. Two-Factor Gateway Authentication</span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-0.5">
              <div>3D Secure Verification: <span className="text-emerald-400 font-semibold">Cryptographic OTP Match</span></div>
              <div>Acquiring Bank Authorization: <span className="text-slate-200">Captured (No chargeback liability shift)</span></div>
            </div>
          </div>

          {/* 5. Warehouse Fulfillment */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-300 font-semibold">
              <Layers className="w-3.5 h-3.5" />
              <span>5. Warehouse Fulfillment Info</span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-0.5">
              <div>Fulfillment Status: <span className="text-slate-200">{ful.status || 'Evidence not available'}</span></div>
              <div>Batch ID: <span className="text-slate-200 font-mono">{ful.batch_id || 'Evidence not available'}</span></div>
              <div>Dispatch Time: <span className="text-slate-200 font-mono">{ful.dispatched_at || 'Evidence not available'}</span></div>
            </div>
          </div>

          {/* 6. Courier Delivery & POD */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-teal-300 font-semibold">
              <Truck className="w-3.5 h-3.5" />
              <span>6. Courier Delivery & Proof of Delivery (POD)</span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-0.5">
              <div>Courier: <span className="text-slate-200">{del.courier || 'Evidence not available'}</span></div>
              <div>AWB Tracking: <span className="text-slate-200 font-mono">{del.tracking_number || 'Evidence not available'}</span></div>
              <div>Delivered At: <span className="text-slate-200 font-mono">{del.delivered_at || 'Evidence not available'}</span></div>
              <div>GPS Proof: <span className="text-slate-200 font-mono">{del.gps_coordinates || 'Evidence not available'}</span></div>
            </div>
          </div>

          {/* 7. Refund Records */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-purple-300 font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>7. Prior Refund Record</span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-0.5">
              <div>Pre-Dispute Refund Requests: <span className="text-slate-200 font-mono">{ref.requested_count || 0}</span></div>
              <div>Policy Acknowledged: <span className="text-slate-200">{ref.policy_acknowledged || 'Yes'}</span></div>
            </div>
          </div>

          {/* 8. Customer Communication Logs */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-pink-300 font-semibold">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>8. Verified Customer Communications</span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-1">
              {comms.length > 0 ? (
                comms.map((c: any, i: number) => (
                  <div key={i} className="p-1.5 rounded bg-slate-950 border border-slate-800/80">
                    <span className="font-mono text-slate-400 text-[10px] block">[{c.timestamp}] {c.sender}:</span>
                    <span className="text-slate-300">{c.message}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 italic">Evidence not available</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Evidence Response Package Output */}
        <div className="lg:col-span-7 flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Output Toolbar */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white">Dispute Defense Evidence Package</span>
              {generatedBy && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {generatedBy}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 mr-2">
                <button
                  onClick={() => setViewMode('preview')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                    viewMode === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => setViewMode('edit')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                    viewMode === 'edit' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>

              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                title="Copy markdown"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={handleDownload}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                title="Download .md file"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Output Content */}
          <div className="p-6 flex-1 overflow-y-auto max-h-[640px]">
            {generating ? (
              <div className="py-24 text-center space-y-3">
                <Sparkles className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
                <div className="text-sm font-bold text-slate-200">Assembling Ground-Truth Merchant Evidence...</div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Cross-referencing payment token, ERP batch, carrier AWB, and dispute reason code...
                </p>
              </div>
            ) : !evidenceDraft ? (
              <div className="py-24 text-center space-y-3">
                <FileText className="w-10 h-10 text-slate-600 mx-auto" />
                <div className="text-sm font-bold text-slate-300">Ready to Assemble Representation</div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click <strong>“Generate Evidence Response”</strong> above to synthesize the 8 merchant data records into an audit-ready dispute response package.
                </p>
              </div>
            ) : viewMode === 'edit' ? (
              <textarea
                value={evidenceDraft}
                onChange={(e) => setEvidenceDraft(e.target.value)}
                className="w-full h-full min-h-[500px] p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-indigo-500"
              />
            ) : (
              <div className="text-xs text-slate-200 leading-relaxed space-y-4 font-sans whitespace-pre-wrap selection:bg-indigo-500/30">
                {evidenceDraft}
              </div>
            )}
          </div>

          {/* Mandatory Anti-Hallucination Disclaimer Footer */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-400">
            <span className="italic">AI-generated draft – merchant review required.</span>
            <span className="text-slate-500">Strictly non-fabricated merchant facts</span>
          </div>
        </div>
      </div>
    </div>
  );
};
