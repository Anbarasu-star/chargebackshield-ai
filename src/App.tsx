import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewView } from './components/OverviewView';
import { TransactionRiskView } from './components/TransactionRiskView';
import { RiskMonitorView } from './components/RiskMonitorView';
import { ChargebackCasesView } from './components/ChargebackCasesView';
import { EvidenceAssistantView } from './components/EvidenceAssistantView';
import { AnalyticsView } from './components/AnalyticsView';
import { ModelPerformanceView } from './components/ModelPerformanceView';
import { SettingsView } from './components/SettingsView';
import { TransactionDetailModal } from './components/TransactionDetailModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { NewCaseModal } from './components/NewCaseModal';
import { RazorpayPaymentModal } from './components/RazorpayPaymentModal';
import { TabType, Transaction, AnomalyAlert } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>('CB_8291');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNewCaseOpen, setIsNewCaseOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [initialTxForCase, setInitialTxForCase] = useState<Transaction | null>(null);
  const [liveToast, setLiveToast] = useState<{ title: string; message: string; type: 'success' | 'warning' | 'critical' } | null>(null);

  // Global Alerts State
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([
    {
      id: 'ALT_01',
      type: 'SPIKE_DETECTED',
      severity: 'CRITICAL',
      title: '⚠️ TRANSACTION VOLUME SPIKE DETECTED',
      message: 'Current checkout rate is 740 tx/hour (+196% above 30-day baseline of 250 tx/hour).',
      timestamp: '2 mins ago',
      action: 'Review checkout velocity throttle',
    },
    {
      id: 'ALT_02',
      type: 'HIGH_RISK_SURGE',
      severity: 'HIGH',
      title: '⚠️ High-Risk Transaction Cluster',
      message: '8 high-risk transactions flagged within the last 15 minutes in digital goods category.',
      timestamp: '7 mins ago',
      action: 'Enforce OTP on >₹5,000 orders',
    },
  ]);

  // Real-time Server-Sent Events (SSE) stream listener for live payment gateway updates
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/stream/events');
      
      eventSource.addEventListener('payment.processed', (e) => {
        try {
          const data = JSON.parse(e.data);
          const tx = data.transaction;
          const isCritical = tx.risk_level === 'CRITICAL';
          const isHigh = tx.risk_level === 'HIGH';

          setLiveToast({
            title: `⚡ Payment Processed: ${tx.transaction_id}`,
            message: `₹${tx.amount.toLocaleString('en-IN')} - ${tx.risk_level} Risk (Score: ${tx.risk_score}) -> ${tx.recommended_action}`,
            type: isCritical ? 'critical' : isHigh ? 'warning' : 'success',
          });

          // Auto clear toast after 6s
          setTimeout(() => {
            setLiveToast((prev) => (prev?.title?.includes(tx.transaction_id) ? null : prev));
          }, 6000);
        } catch (err) {
          console.error('SSE JSON parse error:', err);
        }
      });

      eventSource.addEventListener('webhook.received', (e) => {
        try {
          const data = JSON.parse(e.data);
          setLiveToast({
            title: `🔔 Webhook Verified: ${data.event}`,
            message: `Razorpay signature HMAC verified. Transaction processed into AI risk pipeline.`,
            type: 'success',
          });
        } catch (err) {
          console.error('SSE Webhook event error:', err);
        }
      });

      eventSource.onerror = () => {
        // SSE auto reconnects, suppress noisy log
      };
    } catch (err) {
      console.warn('SSE not initialized:', err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  // Keyboard shortcut ⌘K / Ctrl+K for global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleOpenTransaction = (txId: string) => {
    setSelectedTransactionId(txId);
  };

  const handleOpenCaseFromTx = (tx: Transaction) => {
    setInitialTxForCase(tx);
    setIsNewCaseOpen(true);
  };

  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setActiveTab('evidence');
  };

  const handleCaseCreated = (newCaseId: string) => {
    setSelectedCaseId(newCaseId);
    setActiveTab('cases');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#030712] text-slate-100 antialiased font-sans">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openCasesCount={82}
        highRiskCount={347}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950/40 relative">
        {/* Header */}
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNewCase={() => {
            setInitialTxForCase(null);
            setIsNewCaseOpen(true);
          }}
          onOpenTestPayment={() => setIsPaymentModalOpen(true)}
          alerts={alerts}
          onDismissAlert={handleDismissAlert}
        />

        {/* Live SSE Toast Notification */}
        {liveToast && (
          <div className="absolute top-20 right-6 z-40 max-w-md p-4 rounded-2xl bg-slate-900/95 border shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4 fade-in duration-200 border-indigo-500/50">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      liveToast.type === 'critical'
                        ? 'bg-rose-500 animate-ping'
                        : liveToast.type === 'warning'
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                  {liveToast.title}
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-snug">{liveToast.message}</p>
              </div>
              <button
                onClick={() => setLiveToast(null)}
                className="text-slate-400 hover:text-white text-xs font-mono p-1"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* View Router */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'overview' && (
              <OverviewView
                onNavigate={(tab) => setActiveTab(tab)}
                onOpenTransaction={handleOpenTransaction}
                onOpenTestPayment={() => setIsPaymentModalOpen(true)}
                alerts={alerts}
                onDismissAlert={handleDismissAlert}
              />
            )}

            {activeTab === 'transactions' && (
              <TransactionRiskView
                onSelectTransaction={handleOpenTransaction}
                onOpenTestPayment={() => setIsPaymentModalOpen(true)}
              />
            )}

            {activeTab === 'monitor' && (
              <RiskMonitorView
                onOpenTransaction={handleOpenTransaction}
                alerts={alerts}
              />
            )}

            {activeTab === 'cases' && (
              <ChargebackCasesView
                onSelectCase={handleSelectCase}
                onOpenNewCaseModal={() => {
                  setInitialTxForCase(null);
                  setIsNewCaseOpen(true);
                }}
              />
            )}

            {activeTab === 'evidence' && (
              <EvidenceAssistantView initialCaseId={selectedCaseId} />
            )}

            {activeTab === 'analytics' && <AnalyticsView />}

            {activeTab === 'performance' && <ModelPerformanceView />}

            {activeTab === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>

      {/* Razorpay Test Payment Modal */}
      <RazorpayPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onTransactionCreated={(tx) => {
          setSelectedTransactionId(tx.transaction_id);
        }}
      />

      {/* Transaction Detail & SHAP Modal */}
      <TransactionDetailModal
        transactionId={selectedTransactionId}
        onClose={() => setSelectedTransactionId(null)}
        onOpenCaseForTx={handleOpenCaseFromTx}
      />

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTransaction={(txId) => {
          setSelectedTransactionId(txId);
        }}
        onSelectCase={(caseId) => {
          handleSelectCase(caseId);
        }}
      />

      {/* New Case Modal */}
      <NewCaseModal
        isOpen={isNewCaseOpen}
        onClose={() => setIsNewCaseOpen(false)}
        initialTransaction={initialTxForCase}
        onCaseCreated={handleCaseCreated}
      />
    </div>
  );
}

export default App;
