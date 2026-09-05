import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  X,
  Zap,
  Lock,
  ArrowRight,
  Smartphone,
  Building,
  RefreshCw,
  Sparkles,
  Info,
  ShieldAlert,
  Sliders,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  User,
  QrCode,
  Wallet,
  Clock,
  ArrowLeft,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  Shield
} from 'lucide-react';
import { RazorpayConfig, PaymentTestResponse, Transaction } from '../types';

interface RazorpayPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete?: (tx: Transaction) => void;
  onSelectTransaction?: (tx: Transaction) => void;
  onTransactionCreated?: (tx: Transaction) => void;
  initialAmount?: number;
  initialScenario?: string;
}

export type ScenarioType =
  | 'STANDARD_LOW_RISK'
  | 'MEDIUM_VELOCITY'
  | 'HIGH_RISK_DISPUTE'
  | 'CRITICAL_FRAUD'
  | 'ACME_CORP_DEFAULT'
  | 'CUSTOM';

export const RAZORPAY_TEST_KEY_ID = 'rzp_test_TX5AchbYtvH4Vd';

export const RazorpayPaymentModal: React.FC<RazorpayPaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentComplete,
  onSelectTransaction,
  onTransactionCreated,
  initialAmount = 6000,
  initialScenario = 'ACME_CORP_DEFAULT',
}) => {
  const [config, setConfig] = useState<RazorpayConfig | null>(null);
  const [scenario, setScenario] = useState<ScenarioType>(initialScenario);
  const [amount, setAmount] = useState<number>(initialAmount);
  const [merchantName, setMerchantName] = useState('Acme Corp');
  const [customerName, setCustomerName] = useState('Aditya Sharma');
  const [customerEmail, setCustomerEmail] = useState('aditya.sharma@example.com');
  const [customerPhone, setCustomerPhone] = useState('9000900009');
  const [countryCode, setCountryCode] = useState('+91');
  
  // Checkout Sub-Views: 'CONTACT' (Screen 1) | 'METHODS' (Screen 2) | 'NETBANKING' (Screen 3) | 'CARD' | 'UPI' | 'WALLET' | 'RESULT'
  const [activeStep, setActiveStep] = useState<
    'CONTACT' | 'METHODS' | 'NETBANKING' | 'CARD' | 'UPI' | 'WALLET' | 'PROCESSING' | 'RESULT'
  >('CONTACT');

  const [selectedBank, setSelectedBank] = useState<string>('SBI');
  const [otherBank, setOtherBank] = useState<string>('');
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [showPriceDetails, setShowPriceDetails] = useState(false);
  const [paymentMethodName, setPaymentMethodName] = useState('Netbanking');
  const [copiedKey, setCopiedKey] = useState(false);

  // Card sub-form
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [cardName, setCardName] = useState('Aditya Sharma');
  const [saveCard, setSaveCard] = useState(true);

  // UPI sub-form
  const [upiId, setUpiId] = useState('9000900009@paytm');
  const [upiTab, setUpiTab] = useState<'QR' | 'VPA'>('QR');

  // Loading & Result states
  const [isLoading, setIsLoading] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [paymentResult, setPaymentResult] = useState<PaymentTestResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync on open
  useEffect(() => {
    if (isOpen) {
      setActiveStep('CONTACT');
      setPaymentResult(null);
      setErrorMsg(null);
      setShowPriceDetails(false);
      
      if (initialAmount) setAmount(initialAmount);
      if (initialScenario) handleScenarioSelect(initialScenario);

      fetch('/api/razorpay/config')
        .then(async (res) => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          const contentType = res.headers.get('content-type') || '';
          if (!contentType.includes('application/json')) {
            throw new Error('Response is not JSON');
          }
          return res.json();
        })
        .then((data: RazorpayConfig) => {
          if (data && typeof data === 'object') {
            setConfig(data);
          }
        })
        .catch((err) => {
          console.warn('Using default Razorpay Test Sandbox configuration:', err?.message || err);
          setConfig({
            configured: true,
            mode: 'SANDBOX',
            key_id: RAZORPAY_TEST_KEY_ID,
            webhook_configured: true,
            features: {
              standard_checkout: true,
              signature_verification: true,
              idempotent_webhooks: true,
              realtime_risk_scoring: true,
              shap_waterfall_explanations: true
            }
          });
        });
    }
  }, [isOpen]);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(RAZORPAY_TEST_KEY_ID);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleScenarioSelect = (s: ScenarioType | string) => {
    setScenario(s as ScenarioType);
    setErrorMsg(null);
    if (s === 'ACME_CORP_DEFAULT') {
      setAmount(6000);
      setMerchantName('Acme Corp');
      setCustomerName('Aditya Sharma');
      setCustomerEmail('aditya.sharma@example.com');
      setCustomerPhone('9000900009');
      setPaymentMethodName('Netbanking');
      setSelectedBank('SBI');
    } else if (s === 'STANDARD_LOW_RISK') {
      setAmount(1499);
      setMerchantName('ChargebackShield Demo');
      setCustomerName('Aditya Sharma');
      setCustomerEmail('aditya.sharma@example.com');
      setCustomerPhone('9876543210');
      setPaymentMethodName('Credit Card');
    } else if (s === 'MEDIUM_VELOCITY') {
      setAmount(5999);
      setMerchantName('Acme Corp');
      setCustomerName('Rohan Verma');
      setCustomerEmail('rohan.v98@gmail.com');
      setCustomerPhone('9811223344');
      setPaymentMethodName('UPI');
    } else if (s === 'HIGH_RISK_DISPUTE') {
      setAmount(14999);
      setMerchantName('Acme Electronics');
      setCustomerName('Karan Malhotra');
      setCustomerEmail('karan.m.deals@tempinbox.org');
      setCustomerPhone('9988776655');
      setPaymentMethodName('Credit Card');
    } else if (s === 'CRITICAL_FRAUD') {
      setAmount(28500);
      setMerchantName('Acme Luxury Store');
      setCustomerName('Unknown Buyer (VPN)');
      setCustomerEmail('stealth_buyer_892@proton.me');
      setCustomerPhone('9123456780');
      setPaymentMethodName('Debit Card');
    }
  };

  // Trigger Realistic Razorpay Execution & AI Risk Engine
  const handleExecutePayment = async (selectedMethod: string = paymentMethodName) => {
    setIsLoading(true);
    setErrorMsg(null);
    setActiveStep('PROCESSING');
    setProcessingStage(`1. Connecting to Razorpay Gateway (${RAZORPAY_TEST_KEY_ID})...`);

    try {
      await new Promise((r) => setTimeout(r, 600));
      setProcessingStage('2. Verifying 3D Secure / OTP Signature HMAC-SHA256...');
      
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency: 'INR',
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: `${countryCode} ${customerPhone}`,
          scenario_preset: scenario,
          notes: {
            merchant_name: merchantName,
            bank: selectedMethod === 'Netbanking' ? (otherBank || selectedBank) : undefined,
          }
        }),
      });

      let orderId = `order_${Date.now().toString().slice(-8)}`;
      if (orderRes.ok) {
        try {
          const orderData = await orderRes.json();
          if (orderData?.order_id) orderId = orderData.order_id;
        } catch {
          // fallback order ID already assigned
        }
      }

      await new Promise((r) => setTimeout(r, 700));
      setProcessingStage('3. Running ChargebackShield AI Risk Engine & SHAP Tree Attribution...');

      const simulatedPaymentId = `pay_${Math.random().toString(36).substring(2, 10)}`;
      const simulatedSignature = `sig_sha256_${Math.random().toString(36).substring(2, 16)}`;

      const verifyRes = await fetch('/api/razorpay/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: simulatedPaymentId,
          razorpay_signature: simulatedSignature,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: `${countryCode} ${customerPhone}`,
          amount,
          payment_method: selectedMethod,
          scenario_preset: scenario,
        }),
      });

      if (!verifyRes.ok) {
        throw new Error(`Payment verification failed (HTTP ${verifyRes.status})`);
      }

      const result: PaymentTestResponse = await verifyRes.json();
      setPaymentResult(result);
      setActiveStep('RESULT');
      onPaymentComplete?.(result.transaction);
      onTransactionCreated?.(result.transaction);
    } catch (err: any) {
      console.error('Payment verification error:', err);
      setErrorMsg(err.message || 'Error executing Razorpay payment verification');
      setActiveStep('METHODS');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="razorpay-checkout-modal-container"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-4 sm:my-8 flex flex-col">
        {/* Top Developer & Test Key Bar */}
        <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400 font-medium">Test Mode Key:</span>
            <code className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-sky-400 font-mono font-semibold text-[11px]">
              {RAZORPAY_TEST_KEY_ID}
            </code>
            <button
              onClick={handleCopyKey}
              title="Copy Test Key ID"
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Quick Scenario Preset Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            <button
              onClick={() => handleScenarioSelect('ACME_CORP_DEFAULT')}
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all shrink-0 ${
                scenario === 'ACME_CORP_DEFAULT'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Acme Corp (₹6,000)
            </button>
            <button
              onClick={() => handleScenarioSelect('STANDARD_LOW_RISK')}
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all shrink-0 ${
                scenario === 'STANDARD_LOW_RISK'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Safe Low Risk
            </button>
            <button
              onClick={() => handleScenarioSelect('HIGH_RISK_DISPUTE')}
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all shrink-0 ${
                scenario === 'HIGH_RISK_DISPUTE'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Dispute Risk
            </button>
            <button
              onClick={() => handleScenarioSelect('CRITICAL_FRAUD')}
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all shrink-0 ${
                scenario === 'CRITICAL_FRAUD'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Critical Fraud
            </button>
          </div>
        </div>

        {/* -------------------------------------------------------------
            AUTHENTIC RAZORPAY CHECKOUT POPUP (EXACT AS SCREENSHOT)
        ------------------------------------------------------------- */}
        <div className="bg-white text-slate-900 rounded-b-2xl overflow-hidden flex flex-col min-h-[520px]">
          {errorMsg && (
            <div className="m-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* =========================================================
              VIEW 1: CONTACT DETAILS (SCREENSHOT 1)
          ========================================================= */}
          {activeStep === 'CONTACT' && (
            <div className="flex flex-col flex-1">
              {/* Vibrant Royal Blue Brand Header (as in screenshot 1) */}
              <div className="bg-[#1565C0] text-white p-6 sm:p-7 flex flex-col items-center justify-center relative select-none">
                {/* Top bar with language & close */}
                <div className="w-full flex items-center justify-between absolute top-3.5 px-4">
                  <div />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium flex items-center gap-1 border border-white/15 transition-colors"
                      title="Language switcher"
                    >
                      <span>文/A</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-colors"
                      title="Close checkout"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Avatar Icon */}
                <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white text-xl font-bold mt-2 shadow-inner">
                  {merchantName.charAt(0) || 'A'}
                </div>

                {/* Merchant Name */}
                <h3 className="text-base font-semibold text-white mt-2.5 tracking-wide">
                  {merchantName}
                </h3>

                {/* Razorpay Trusted Business Badge */}
                <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-white text-[11px] font-medium border border-white/20 backdrop-blur-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Razorpay Trusted Business</span>
                  <Info className="w-3 h-3 text-white/70" />
                </div>

                {/* Total Amount Center Display */}
                <div className="text-center mt-5 mb-4">
                  <div className="text-xs text-white/80 font-medium">Total Amount</div>
                  <div className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-0.5">
                    ₹ {amount.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Secured by Razorpay badge */}
                <div className="flex items-center gap-1.5 text-[11px] text-white/75 font-medium">
                  <Lock className="w-3 h-3" />
                  <span>Secured by</span>
                  <span className="font-bold tracking-wide italic text-white">razorpay</span>
                </div>
              </div>

              {/* White Contact Details Form Card */}
              <div className="p-6 flex-1 flex flex-col justify-between bg-white">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-800 text-sm font-semibold">
                    <User className="w-4 h-4 text-slate-500" />
                    <span>Contact Details</span>
                  </div>

                  {/* Phone number input with +91 prefix dropdown */}
                  <div className="relative pt-1">
                    <div className="border border-slate-300 hover:border-slate-400 focus-within:border-[#1565C0] focus-within:ring-1 focus-within:ring-[#1565C0] rounded-xl flex items-center transition-all bg-white overflow-hidden shadow-sm">
                      <div className="flex items-center gap-1 px-3 py-3 border-r border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                        <span>{countryCode}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <input
                        type="tel"
                        id="razorpay-phone-input"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="9000900009"
                        className="w-full px-3.5 py-3 text-sm font-medium text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400 font-mono tracking-wider"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      OTP and transaction alerts will be sent to this number
                    </span>
                  </div>

                  {/* Optional Email & Customer Name Fields */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[11px] font-medium text-slate-500 block mb-1">
                        Customer Name
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#1565C0]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-500 block mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#1565C0]"
                      />
                    </div>
                  </div>
                </div>

                {/* Big Royal Blue Proceed Button (Screenshot 1 bottom button) */}
                <div className="pt-6">
                  <button
                    id="razorpay-proceed-btn"
                    type="button"
                    onClick={() => setActiveStep('METHODS')}
                    className="w-full py-3.5 px-4 bg-[#1565C0] hover:bg-[#0D47A1] text-white text-sm font-bold rounded-xl shadow-md shadow-blue-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Proceed</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW 2: PAYMENT METHODS (SCREENSHOT 2: Cards, UPI & More)
          ========================================================= */}
          {activeStep === 'METHODS' && (
            <div className="flex flex-col flex-1">
              {/* Compact Header with Back Arrow, Merchant & Trust Badge */}
              <div className="bg-[#1565C0] text-white px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveStep('CONTACT')}
                    className="p-1.5 rounded-lg text-white/90 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                    {merchantName.charAt(0) || 'A'}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white leading-tight">
                      {merchantName}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-300" />
                      <span>Razorpay Trusted Business</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="px-1.5 py-0.5 rounded bg-white/10 text-white text-[10px] font-medium border border-white/15"
                  >
                    文/A ▾
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/15"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Payment Method List (Screenshot 2) */}
              <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-3">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Cards, UPI &amp; More
                </div>

                <div className="space-y-2">
                  {/* 1. Card */}
                  <div
                    onClick={() => {
                      setPaymentMethodName('Credit Card');
                      setActiveStep('CARD');
                    }}
                    className="p-3.5 border border-slate-200 hover:border-[#1565C0] hover:bg-blue-50/40 rounded-xl cursor-pointer transition-all flex items-center justify-between group shadow-sm"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1565C0] flex items-center justify-center">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-[#1565C0]">
                          Card
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Visa, MasterCard, RuPay &amp; More
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1565C0] group-hover:translate-x-0.5 transition-all" />
                  </div>

                  {/* 2. UPI / QR */}
                  <div
                    onClick={() => {
                      setPaymentMethodName('UPI');
                      setActiveStep('UPI');
                    }}
                    className="p-3.5 border border-slate-200 hover:border-[#1565C0] hover:bg-blue-50/40 rounded-xl cursor-pointer transition-all flex items-center justify-between group shadow-sm"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-[#1565C0]">
                          UPI / QR
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <span className="font-semibold text-emerald-600">GPay</span> •
                          <span className="font-semibold text-purple-600">PhonePe</span> •
                          <span className="font-semibold text-sky-600">Paytm</span> &amp; More
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1565C0] group-hover:translate-x-0.5 transition-all" />
                  </div>

                  {/* 3. Netbanking (Highlighted in screenshot with red box) */}
                  <div
                    id="razorpay-method-netbanking"
                    onClick={() => {
                      setPaymentMethodName('Netbanking');
                      setActiveStep('NETBANKING');
                    }}
                    className="p-3.5 border-2 border-blue-500/80 bg-blue-50/30 hover:bg-blue-50/60 rounded-xl cursor-pointer transition-all flex items-center justify-between group shadow-sm relative"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-[#1565C0]">
                          Netbanking
                        </div>
                        <div className="text-[11px] text-slate-500">
                          All Indian banks (SBI, ICICI, Axis, Kotak, HDFC &amp; More)
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600 text-white font-semibold">
                      Select Bank
                    </span>
                  </div>

                  {/* 4. Wallet */}
                  <div
                    onClick={() => {
                      setPaymentMethodName('Wallet');
                      setActiveStep('WALLET');
                    }}
                    className="p-3.5 border border-slate-200 hover:border-[#1565C0] hover:bg-blue-50/40 rounded-xl cursor-pointer transition-all flex items-center justify-between group shadow-sm"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-[#1565C0]">
                          Wallet
                        </div>
                        <div className="text-[11px] text-slate-500">
                          PhonePe, Paytm, Amazon Pay, Mobikwik
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1565C0] group-hover:translate-x-0.5 transition-all" />
                  </div>

                  {/* 5. EMI */}
                  <div
                    onClick={() => handleExecutePayment('EMI')}
                    className="p-3.5 border border-slate-200 hover:border-[#1565C0] hover:bg-blue-50/40 rounded-xl cursor-pointer transition-all flex items-center justify-between group shadow-sm"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-[#1565C0]">
                          EMI
                        </div>
                        <div className="text-[11px] text-slate-500">
                          EMI via Debit/Credit cards, axio &amp; More
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1565C0] group-hover:translate-x-0.5 transition-all" />
                  </div>

                  {/* 6. Pay Later */}
                  <div
                    onClick={() => handleExecutePayment('Pay Later')}
                    className="p-3.5 border border-slate-200 hover:border-[#1565C0] hover:bg-blue-50/40 rounded-xl cursor-pointer transition-all flex items-center justify-between group shadow-sm"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-[#1565C0]">
                          Pay Later
                        </div>
                        <div className="text-[11px] text-slate-500">
                          LazyPay, ICICI, and FlexiPay
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1565C0] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </div>

              {/* Fixed Bottom Footer (Screenshot 2: Amount on Left, Pay Now on Right) */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="text-base font-bold text-slate-900">
                    ₹ {amount.toLocaleString('en-IN')}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPriceDetails(!showPriceDetails)}
                    className="text-[11px] text-[#1565C0] font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>View Details</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${showPriceDetails ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                <button
                  id="razorpay-pay-now-btn"
                  type="button"
                  onClick={() => handleExecutePayment('Netbanking')}
                  className="py-2.5 px-7 bg-[#1565C0] hover:bg-[#0D47A1] text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
                >
                  Pay Now
                </button>
              </div>

              {/* Price Details Accordion */}
              {showPriceDetails && (
                <div className="p-3 bg-blue-50/80 border-t border-blue-100 text-xs space-y-1 text-slate-700 animate-in slide-in-from-bottom-2 duration-150">
                  <div className="flex justify-between">
                    <span>Order Subtotal:</span>
                    <span className="font-mono font-semibold">₹{amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Convenience Fee / Taxes:</span>
                    <span>₹0 (Waived)</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-semibold pt-1 border-t border-blue-200/60">
                    <span>ChargebackShield AI Defense:</span>
                    <span>Active Protection</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              VIEW 3: NETBANKING SELECT BANK (SCREENSHOT 3)
          ========================================================= */}
          {activeStep === 'NETBANKING' && (
            <div className="flex flex-col flex-1">
              {/* Header */}
              <div className="bg-[#1565C0] text-white px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveStep('METHODS')}
                    className="p-1.5 rounded-lg text-white/90 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                    {merchantName.charAt(0) || 'A'}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white leading-tight">
                      {merchantName}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-300" />
                      <span>Razorpay Trusted Business</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="px-1.5 py-0.5 rounded bg-white/10 text-white text-[10px] font-medium border border-white/15"
                  >
                    文/A ▾
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/15"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Netbanking 6-Bank Grid (Screenshot 3) */}
              <div className="p-5 flex-1 space-y-4">
                <div className="text-xs font-bold text-slate-800">
                  Select Bank
                </div>

                {/* 6 Grid of Banks (SBI, ICICI, Axis, Kotak, Yes, IDBI) */}
                <div className="grid grid-cols-3 gap-3">
                  {/* 1. SBI */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBank('SBI');
                      setOtherBank('');
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                      selectedBank === 'SBI' && !otherBank
                        ? 'border-[#1565C0] bg-blue-50/80 shadow-md ring-2 ring-blue-500/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {/* Iconic SBI Blue Keyhole Disc Logo */}
                    <div className="w-8 h-8 rounded-full bg-[#0080FF] flex items-center justify-center relative shadow-sm">
                      <div className="w-2.5 h-2.5 rounded-full bg-white relative">
                        <div className="w-1 h-2 bg-[#0080FF] absolute -bottom-1 left-0.75" />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-800">SBI</span>
                  </button>

                  {/* 2. ICICI */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBank('ICICI');
                      setOtherBank('');
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                      selectedBank === 'ICICI' && !otherBank
                        ? 'border-[#1565C0] bg-blue-50/80 shadow-md ring-2 ring-blue-500/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {/* Iconic ICICI Orange 'i' swirl */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#9B1E22] to-[#EE7123] flex items-center justify-center text-white font-serif font-black text-sm shadow-sm italic">
                      i
                    </div>
                    <span className="text-xs font-bold text-slate-800">ICICI</span>
                  </button>

                  {/* 3. Axis */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBank('Axis');
                      setOtherBank('');
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                      selectedBank === 'Axis' && !otherBank
                        ? 'border-[#1565C0] bg-blue-50/80 shadow-md ring-2 ring-blue-500/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {/* Iconic Axis Maroon Triangle */}
                    <div className="w-8 h-8 rounded-lg bg-[#97144D] flex items-center justify-center shadow-sm">
                      <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px] border-b-white" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">Axis</span>
                  </button>

                  {/* 4. Kotak */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBank('Kotak');
                      setOtherBank('');
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                      selectedBank === 'Kotak' && !otherBank
                        ? 'border-[#1565C0] bg-blue-50/80 shadow-md ring-2 ring-blue-500/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {/* Iconic Kotak Infinity Crest */}
                    <div className="w-8 h-8 rounded-full bg-[#E51B24] flex items-center justify-center text-white font-black text-xs shadow-sm">
                      ∞
                    </div>
                    <span className="text-xs font-bold text-slate-800">Kotak</span>
                  </button>

                  {/* 5. Yes */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBank('Yes');
                      setOtherBank('');
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                      selectedBank === 'Yes' && !otherBank
                        ? 'border-[#1565C0] bg-blue-50/80 shadow-md ring-2 ring-blue-500/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {/* Iconic Yes Bank Blue/Red Compass */}
                    <div className="w-8 h-8 rounded-lg bg-[#004B8D] flex items-center justify-center relative shadow-sm overflow-hidden">
                      <div className="w-4 h-1 bg-[#EE3124] rotate-45" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">Yes</span>
                  </button>

                  {/* 6. IDBI */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBank('IDBI');
                      setOtherBank('');
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                      selectedBank === 'IDBI' && !otherBank
                        ? 'border-[#1565C0] bg-blue-50/80 shadow-md ring-2 ring-blue-500/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {/* Iconic IDBI Orange/Blue */}
                    <div className="w-8 h-8 rounded-full bg-[#F37021] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                      <span className="text-[10px]">IDBI</span>
                    </div>
                    <span className="text-xs font-bold text-slate-800">IDBI</span>
                  </button>
                </div>

                {/* Dropdown: Select a different bank (Screenshot 3) */}
                <div className="pt-2">
                  <label className="text-[11px] font-medium text-slate-500 block mb-1">
                    Or select another Indian bank
                  </label>
                  <select
                    value={otherBank}
                    onChange={(e) => {
                      setOtherBank(e.target.value);
                      if (e.target.value) setSelectedBank(e.target.value);
                    }}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 bg-white focus:outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0] shadow-sm cursor-pointer"
                  >
                    <option value="">Select a different bank ▾</option>
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="Punjab National Bank">Punjab National Bank (PNB)</option>
                    <option value="Canara Bank">Canara Bank</option>
                    <option value="Bank of Baroda">Bank of Baroda</option>
                    <option value="Union Bank of India">Union Bank of India</option>
                    <option value="IndusInd Bank">IndusInd Bank</option>
                    <option value="Federal Bank">Federal Bank</option>
                    <option value="Central Bank of India">Central Bank of India</option>
                    <option value="Indian Overseas Bank">Indian Overseas Bank</option>
                    <option value="RBL Bank">RBL Bank</option>
                    <option value="AU Small Finance Bank">AU Small Finance Bank</option>
                  </select>
                </div>
              </div>

              {/* Fixed Bottom Footer (Screenshot 3) */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="text-base font-bold text-slate-900">
                    ₹ {amount.toLocaleString('en-IN')}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPriceDetails(!showPriceDetails)}
                    className="text-[11px] text-[#1565C0] font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>View Details</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>

                <button
                  id="razorpay-netbanking-pay-btn"
                  type="button"
                  onClick={() => handleExecutePayment(`Netbanking (${otherBank || selectedBank})`)}
                  className="py-2.5 px-7 bg-[#1565C0] hover:bg-[#0D47A1] text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Pay Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW 4: CARD DETAILS FORM
          ========================================================= */}
          {activeStep === 'CARD' && (
            <div className="flex flex-col flex-1">
              <div className="bg-[#1565C0] text-white px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveStep('METHODS')}
                    className="p-1.5 rounded-lg text-white/90 hover:text-white hover:bg-white/15 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <div className="text-xs font-semibold text-white">Enter Card Details</div>
                    <div className="text-[10px] text-emerald-200">Razorpay 256-bit Encrypted</div>
                  </div>
                </div>
                <button type="button" onClick={onClose} className="p-1 rounded-full text-white/80">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 flex-1 space-y-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4111 2222 3333 4444"
                      className="w-full pl-3.5 pr-14 py-2.5 border border-slate-300 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:border-[#1565C0]"
                    />
                    <span className="absolute right-3 top-2.5 text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                      TEST VISA
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Expiry (MM/YY)
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="12/28"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-[#1565C0]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      CVV
                    </label>
                    <input
                      type="password"
                      maxLength={3}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="888"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-[#1565C0]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#1565C0]"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={saveCard}
                    onChange={(e) => setSaveCard(e.target.checked)}
                    className="rounded border-slate-300 text-[#1565C0]"
                  />
                  <span>Save this card securely as per RBI guidelines</span>
                </label>
              </div>

              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="text-base font-bold text-slate-900">
                    ₹ {amount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-slate-500">Test Auth: 3DS 2.0</div>
                </div>

                <button
                  type="button"
                  onClick={() => handleExecutePayment('Credit Card (3DS 2.0)')}
                  className="py-2.5 px-7 bg-[#1565C0] hover:bg-[#0D47A1] text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Pay ₹{amount.toLocaleString('en-IN')}
                </button>
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW 5: UPI / QR FORM
          ========================================================= */}
          {activeStep === 'UPI' && (
            <div className="flex flex-col flex-1">
              <div className="bg-[#1565C0] text-white px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveStep('METHODS')}
                    className="p-1.5 rounded-lg text-white/90 hover:text-white hover:bg-white/15 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <div className="text-xs font-semibold text-white">UPI Payment</div>
                    <div className="text-[10px] text-emerald-200">Instant UPI Verification</div>
                  </div>
                </div>
                <button type="button" onClick={onClose} className="p-1 rounded-full text-white/80">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 flex-1 space-y-4">
                <div className="flex p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setUpiTab('QR')}
                    className={`w-1/2 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      upiTab === 'QR' ? 'bg-white text-[#1565C0] shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    Scan QR Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpiTab('VPA')}
                    className={`w-1/2 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      upiTab === 'VPA' ? 'bg-white text-[#1565C0] shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    Enter UPI ID
                  </button>
                </div>

                {upiTab === 'QR' ? (
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                    <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm mb-3">
                      <QrCode className="w-32 h-32 text-slate-800" />
                    </div>
                    <div className="text-xs font-bold text-slate-800">
                      Scan with any UPI App
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Google Pay, PhonePe, Paytm, BHIM, Cred
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Virtual Payment Address (UPI ID)
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@okhdfcbank"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-[#1565C0]"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Use <code className="text-blue-600 font-bold">success@razorpay</code> or mobile@upi
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="text-base font-bold text-slate-900">
                    ₹ {amount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-slate-500">Auto-approved in Sandbox</div>
                </div>

                <button
                  type="button"
                  onClick={() => handleExecutePayment('UPI')}
                  className="py-2.5 px-7 bg-[#1565C0] hover:bg-[#0D47A1] text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Pay ₹{amount.toLocaleString('en-IN')}
                </button>
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW 6: WALLET
          ========================================================= */}
          {activeStep === 'WALLET' && (
            <div className="flex flex-col flex-1">
              <div className="bg-[#1565C0] text-white px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveStep('METHODS')}
                    className="p-1.5 rounded-lg text-white/90 hover:text-white hover:bg-white/15 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="text-xs font-semibold text-white">Select Wallet</div>
                </div>
                <button type="button" onClick={onClose} className="p-1 rounded-full text-white/80">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 flex-1 space-y-2">
                {['PhonePe', 'Paytm Wallet', 'Amazon Pay', 'MobiKwik', 'Freecharge'].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => handleExecutePayment(`Wallet (${w})`)}
                    className="w-full p-3.5 border border-slate-200 hover:border-[#1565C0] hover:bg-blue-50/50 rounded-xl text-left flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer transition-all shadow-sm"
                  >
                    <span>{w}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================
              PROCESSING ANIMATION VIEW
          ========================================================= */}
          {activeStep === 'PROCESSING' && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-900 text-white min-h-[480px]">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#1565C0] to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/30 animate-bounce">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <RefreshCw className="w-20 h-20 text-sky-400/40 absolute -top-2 -left-2 animate-spin" />
              </div>

              <h4 className="text-base font-bold text-white mb-2">
                Processing Razorpay Test Payment
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                {processingStage}
              </p>

              <div className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-mono text-sky-300">
                Key ID: {RAZORPAY_TEST_KEY_ID}
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW 7: REAL-TIME AI RISK EVALUATION REPORT & SHAP
          ========================================================= */}
          {activeStep === 'RESULT' && paymentResult && (
            <div className="flex-1 flex flex-col p-6 bg-slate-900 text-white min-h-[500px] overflow-y-auto">
              {/* Top Banner Status */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between mb-5 ${
                  paymentResult.risk_analysis.level === 'LOW'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : paymentResult.risk_analysis.level === 'MEDIUM'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : paymentResult.risk_analysis.level === 'HIGH'
                    ? 'bg-orange-500/10 border-orange-500/30 text-orange-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                      paymentResult.risk_analysis.level === 'LOW'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : paymentResult.risk_analysis.level === 'MEDIUM'
                        ? 'bg-amber-500/20 text-amber-400'
                        : paymentResult.risk_analysis.level === 'HIGH'
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider">
                      Payment Authorized &amp; AI Evaluated
                    </div>
                    <div className="text-sm font-semibold text-white">
                      ₹{paymentResult.transaction.amount.toLocaleString('en-IN')} via {paymentResult.transaction.payment_method}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400">AI Risk Score</div>
                  <div className="text-2xl font-black font-mono">
                    {paymentResult.risk_analysis.score}
                    <span className="text-xs text-slate-400 font-normal">/100</span>
                  </div>
                </div>
              </div>

              {/* Transaction & Defense Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <div className="text-[10px] text-slate-400">Transaction ID</div>
                  <div className="text-xs font-mono font-bold text-white truncate">
                    {paymentResult.transaction.transaction_id}
                  </div>
                </div>
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <div className="text-[10px] text-slate-400">Payment ID</div>
                  <div className="text-xs font-mono font-bold text-sky-400 truncate">
                    {paymentResult.razorpay_payment_id}
                  </div>
                </div>
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <div className="text-[10px] text-slate-400">Risk Tier</div>
                  <div
                    className={`text-xs font-bold ${
                      paymentResult.risk_analysis.level === 'LOW'
                        ? 'text-emerald-400'
                        : paymentResult.risk_analysis.level === 'MEDIUM'
                        ? 'text-amber-400'
                        : paymentResult.risk_analysis.level === 'HIGH'
                        ? 'text-orange-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {paymentResult.risk_analysis.level} RISK
                  </div>
                </div>
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <div className="text-[10px] text-slate-400">Action</div>
                  <div className="text-xs font-bold text-indigo-300 truncate">
                    {paymentResult.risk_analysis.recommended_action}
                  </div>
                </div>
              </div>

              {/* Recommended Action Box */}
              <div className="p-3.5 bg-slate-800/40 border border-slate-700/60 rounded-xl mb-4">
                <div className="text-xs font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Defense Recommendation: {paymentResult.risk_analysis.recommended_action}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {paymentResult.risk_analysis.action_reason}
                </p>
              </div>

              {/* SHAP Factors Attribution Waterfall */}
              {paymentResult.risk_analysis.top_shap_factors &&
                paymentResult.risk_analysis.top_shap_factors.length > 0 && (
                  <div className="space-y-2 mb-5">
                    <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                      <span>SHAP Feature Attributions</span>
                      <span className="text-[10px] text-slate-500 font-mono">XGBoost Explainer</span>
                    </div>

                    <div className="space-y-1.5">
                      {paymentResult.risk_analysis.top_shap_factors.slice(0, 3).map((factor, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-semibold text-slate-200">{factor.feature}</div>
                            <div className="text-[10px] text-slate-400">{factor.description}</div>
                          </div>
                          <span
                            className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                              factor.direction === 'positive'
                                ? 'text-rose-400 bg-rose-950/40 border border-rose-800/40'
                                : 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/40'
                            }`}
                          >
                            {factor.impact > 0 ? `+${factor.impact}` : factor.impact}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2 mt-auto">
                <button
                  type="button"
                  onClick={() => {
                    setActiveStep('CONTACT');
                    setPaymentResult(null);
                  }}
                  className="w-1/2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Test Another Checkout</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onSelectTransaction) {
                      onSelectTransaction(paymentResult.transaction);
                    } else if (onTransactionCreated) {
                      onTransactionCreated(paymentResult.transaction);
                    }
                  }}
                  className="w-1/2 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Inspect in Transaction Table</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
