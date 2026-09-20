import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Zap,
  Lock,
  Smartphone,
  Building2,
  ArrowRight,
  FileText,
  BadgeCheck,
  HelpCircle,
  Server
} from 'lucide-react';

interface GatewayStatusData {
  success: boolean;
  isConfigured: boolean;
  mode: 'Live' | 'Test' | 'Custom' | 'Not Configured';
  isLive: boolean;
  isTest: boolean;
  maskedKeyId: string | null;
  hasWebhookSecret: boolean;
  currency: string;
  merchantName: string;
  supportedMethods: string[];
  pciCompliance: string;
  serverTime: string;
}

interface AdminPaymentGatewayTabProps {
  onOpenLegalModal?: (tab?: 'terms' | 'privacy' | 'refund' | 'shipping' | 'contact') => void;
}

export const AdminPaymentGatewayTab: React.FC<AdminPaymentGatewayTabProps> = ({
  onOpenLegalModal
}) => {
  const [statusData, setStatusData] = useState<GatewayStatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'success' | 'warning' | 'error'; message: string }>({
    status: 'idle',
    message: ''
  });

  const webhookUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://bazli.in'}/api/payments/razorpay/webhook`;

  const fetchGatewayStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payments/razorpay/status');
      if (res.ok) {
        const data = await res.json();
        setStatusData(data);
        if (data.isLive) {
          setTestResult({
            status: 'success',
            message: 'Razorpay Live Production Mode is active and accepting real customer payments.'
          });
        } else if (data.isTest) {
          setTestResult({
            status: 'warning',
            message: 'Razorpay is in Test/Sandbox Mode. Ready to switch to Live mode when you generate Live API keys.'
          });
        } else {
          setTestResult({
            status: 'warning',
            message: 'Razorpay keys not yet set in environment. App is using instant sandbox simulation.'
          });
        }
      } else {
        setTestResult({
          status: 'error',
          message: 'Unable to query payment status from server.'
        });
      }
    } catch (err: any) {
      setTestResult({
        status: 'error',
        message: err?.message || 'Failed to connect to backend server.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGatewayStatus();
  }, []);

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Gateway Overview */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-5 sm:p-7 rounded-3xl text-white shadow-xl border border-slate-700/80 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <CreditCard className="w-48 h-48 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Razorpay Standard Checkout
              </span>
              {statusData?.isLive ? (
                <span className="px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-emerald-500 text-slate-950 flex items-center gap-1 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" /> LIVE PRODUCTION ACTIVE
                </span>
              ) : statusData?.isTest ? (
                <span className="px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-amber-400 text-slate-950 flex items-center gap-1">
                  TEST / SANDBOX MODE
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  SANDBOX SIMULATOR READY
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Production Payment Gateway & Settlement Suite
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Accept real customer payments via UPI (GPay, PhonePe, Paytm), RuPay, Visa, MasterCard, and NetBanking directly to your business bank account with automated HMAC-SHA256 signature verification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={fetchGatewayStatus}
              disabled={loading}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer border border-white/10"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Checking...' : 'Ping Gateway'}</span>
            </button>
            <a
              href="https://dashboard.razorpay.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg"
            >
              <span>Razorpay Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Live Diagnostics Card */}
        <div className="mt-6 pt-5 border-t border-slate-700/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Active Mode</span>
            <span className="font-bold text-white text-sm mt-0.5 block">
              {statusData?.mode || 'Checking...'}
            </span>
          </div>

          <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Public Key ID</span>
            <span className="font-mono text-emerald-300 text-xs mt-0.5 block truncate">
              {statusData?.maskedKeyId || 'Configured via .env'}
            </span>
          </div>

          <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Key Secret Security</span>
            <span className="font-bold text-emerald-400 text-xs mt-0.5 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Server-Only Secret
            </span>
          </div>

          <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Webhook Signature</span>
            <span className="font-bold text-sky-300 text-xs mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> HMAC-SHA256 Active
            </span>
          </div>
        </div>
      </div>

      {/* Notification status bar */}
      {testResult.message && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-semibold ${
          testResult.status === 'success'
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
            : testResult.status === 'warning'
            ? 'bg-amber-50 text-amber-900 border-amber-200'
            : 'bg-rose-50 text-rose-900 border-rose-200'
        }`}>
          {testResult.status === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          )}
          <span>{testResult.message}</span>
        </div>
      )}

      {/* Grid: Webhook Setup & Live Key Switch Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Razorpay Webhook Configuration */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <Server className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Server Webhook Configuration</h3>
                <p className="text-[11px] text-slate-500">Real-time payment sync even if customer closes browser</p>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              Automated
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-700 block">Your Webhook URL</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={webhookUrl}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleCopy(webhookUrl, 'webhook')}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer"
              >
                {copiedField === 'webhook' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === 'webhook' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <span className="font-extrabold text-xs text-slate-800 block">Required Razorpay Webhook Events:</span>
            <div className="flex flex-wrap gap-1.5">
              {['order.paid', 'payment.captured', 'payment.failed'].map(evt => (
                <span key={evt} className="bg-white border border-slate-200 px-2 py-0.5 rounded-md text-[11px] font-mono text-indigo-900 font-bold">
                  {evt}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              Add this Webhook in <strong>Razorpay Dashboard &gt; Settings &gt; Webhooks &gt; Add New Webhook</strong>.
            </p>
          </div>
        </div>

        {/* Card 2: 5-Minute Go-Live Key Switch Guide */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Zap className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">How to Switch to Real Live Payments</h3>
                <p className="text-[11px] text-slate-500">Step-by-step from Razorpay Dashboard to Live Launch</p>
              </div>
            </div>
          </div>

          <ol className="space-y-2.5 text-xs text-slate-700">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
              <div>
                <span className="font-bold text-slate-900">Complete KYC on Razorpay:</span> Log in to <a href="https://dashboard.razorpay.com" target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-bold hover:underline">Razorpay Dashboard</a> and verify your Business PAN, Bank Account & Aadhaar.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
              <div>
                <span className="font-bold text-slate-900">Toggle from Test to Live Mode:</span> Click the mode switch on the top-left corner of Razorpay Dashboard and select <strong>"Live Mode"</strong>.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
              <div>
                <span className="font-bold text-slate-900">Generate Live Key:</span> Go to <strong>Settings &gt; API Keys</strong> and click <em>"Generate Live Key"</em>.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">4</span>
              <div>
                <span className="font-bold text-slate-900">Enter Credentials in Environment Variables:</span> Add your <code className="bg-slate-100 px-1 py-0.2 rounded font-mono text-[11px]">RAZORPAY_KEY_ID</code> and <code className="bg-slate-100 px-1 py-0.2 rounded font-mono text-[11px]">RAZORPAY_KEY_SECRET</code> in the project secrets panel.
              </div>
            </li>
          </ol>
        </div>

      </div>

      {/* Mandatory Statutory Compliance Matrix (Step 2 connection) */}
      <div className="bg-slate-50 p-5 sm:p-6 rounded-3xl border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <BadgeCheck className="w-5 h-5 text-emerald-600" />
              Razorpay & Bank Mandatory Merchant Compliance Checklist
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Razorpay verification team checks these exact 5 legal pages before approving bank settlements.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full self-start sm:self-auto">
            100% Ready on Bazli
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { tab: 'terms' as const, title: 'Terms of Use', desc: 'Governing IT Act 2000 rules' },
            { tab: 'privacy' as const, title: 'Privacy Policy', desc: 'DPDP 2023 & PCI-DSS rules' },
            { tab: 'refund' as const, title: 'Refund Policy', desc: '2-hr grocery return SLA' },
            { tab: 'shipping' as const, title: 'Shipping Policy', desc: '10-15 min hyperlocal SLA' },
            { tab: 'contact' as const, title: 'Contact & Grievance', desc: 'Officer Akash Sahotra' }
          ].map(pol => (
            <button
              key={pol.tab}
              type="button"
              onClick={() => onOpenLegalModal?.(pol.tab)}
              className="p-3.5 bg-white hover:bg-slate-100/90 rounded-2xl border border-slate-200 text-left transition-all hover:border-slate-300 cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
              </div>
              <span className="font-bold text-xs text-slate-900 block group-hover:text-emerald-700 transition-colors">
                {pol.title}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {pol.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
