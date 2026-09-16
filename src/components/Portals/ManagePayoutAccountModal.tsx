import React, { useState, useEffect } from 'react';
import { PayoutAccountDetails } from '../../types';
import {
  X,
  Building2,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Zap,
  Lock,
  ArrowRight,
  Info,
  CreditCard,
  Building,
  Check
} from 'lucide-react';

interface ManagePayoutAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'seller' | 'delivery' | 'deliveryPartner';
  entityName: string;
  entityPhone?: string;
  accountHolderName?: string;
  currentDetails?: PayoutAccountDetails;
  initialDetails?: PayoutAccountDetails;
  onSaveDetails: (details: PayoutAccountDetails) => void;
}

const POPULAR_BANKS = [
  'State Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank',
  'Bank of Baroda',
  'Canara Bank',
  'Union Bank of India',
  'IndusInd Bank',
  'IDFC FIRST Bank',
  'Federal Bank',
  'Yes Bank',
  'Paytm Payments Bank',
  'Airtel Payments Bank'
];

export const ManagePayoutAccountModal: React.FC<ManagePayoutAccountModalProps> = ({
  isOpen,
  onClose,
  entityType,
  entityName,
  entityPhone = '',
  accountHolderName: propAccountHolderName,
  currentDetails,
  initialDetails,
  onSaveDetails
}) => {
  const activeDetails = currentDetails || initialDetails;
  const safePhone = (entityPhone || '').replace(/\D/g, '').slice(-10);
  const fallbackUpi = safePhone ? `${safePhone}@upi` : 'merchant@upi';

  const [payoutMode, setPayoutMode] = useState<'UPI' | 'Bank Transfer'>(
    activeDetails?.payoutMode || 'UPI'
  );
  
  // UPI State
  const [upiId, setUpiId] = useState<string>(
    activeDetails?.upiId || fallbackUpi
  );
  
  // Bank Account State
  const [accountHolderName, setAccountHolderName] = useState<string>(
    activeDetails?.accountHolderName || propAccountHolderName || entityName || ''
  );
  const [bankName, setBankName] = useState<string>(
    activeDetails?.bankName || 'HDFC Bank'
  );
  const [accountNumber, setAccountNumber] = useState<string>(
    activeDetails?.accountNumber || ''
  );
  const [confirmAccountNumber, setConfirmAccountNumber] = useState<string>(
    activeDetails?.accountNumber || ''
  );
  const [ifscCode, setIfscCode] = useState<string>(
    activeDetails?.ifscCode || 'HDFC0000123'
  );
  const [accountType, setAccountType] = useState<'Savings' | 'Current'>(
    activeDetails?.accountType || (entityType === 'seller' ? 'Current' : 'Savings')
  );

  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationSuccess, setVerificationSuccess] = useState<boolean>(false);

  useEffect(() => {
    const details = currentDetails || initialDetails;
    if (isOpen) {
      if (details) {
        setPayoutMode(details.payoutMode || 'UPI');
        if (details.upiId) setUpiId(details.upiId);
        if (details.accountHolderName) setAccountHolderName(details.accountHolderName);
        if (details.bankName) setBankName(details.bankName);
        if (details.accountNumber) {
          setAccountNumber(details.accountNumber);
          setConfirmAccountNumber(details.accountNumber);
        }
        if (details.ifscCode) setIfscCode(details.ifscCode);
        if (details.accountType) setAccountType(details.accountType);
      } else {
        if (propAccountHolderName || entityName) {
          setAccountHolderName(propAccountHolderName || entityName || '');
        }
      }
    }
  }, [isOpen, currentDetails, initialDetails, propAccountHolderName, entityName]);

  if (!isOpen) return null;

  // Validation
  const validateUPI = (vpa: string) => {
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    return upiRegex.test(vpa.trim());
  };

  const validateIFSC = (code: string) => {
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(code.trim().toUpperCase());
  };

  const handleSave = () => {
    setErrorMsg('');

    if (payoutMode === 'UPI') {
      if (!upiId.trim()) {
        setErrorMsg('Please enter a valid UPI ID / VPA.');
        return;
      }
      if (!validateUPI(upiId)) {
        setErrorMsg('Invalid UPI ID format. Example: yourname@okaxis, 9876543210@paytm');
        return;
      }
    } else {
      if (!accountHolderName.trim()) {
        setErrorMsg('Please enter the Account Holder Name matching your bank passbook.');
        return;
      }
      if (!accountNumber.trim() || accountNumber.length < 8) {
        setErrorMsg('Please enter a valid Bank Account Number (minimum 8 digits).');
        return;
      }
      if (accountNumber !== confirmAccountNumber) {
        setErrorMsg('Bank account numbers do not match. Please re-check.');
        return;
      }
      if (!validateIFSC(ifscCode)) {
        setErrorMsg('Invalid IFSC Code. Must be 11 characters (e.g. HDFC0000123, SBIN0001234).');
        return;
      }
    }

    setIsVerifying(true);

    // Simulate Penny-drop / RazorpayX Fund Account verification
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationSuccess(true);

      const generatedContactId = currentDetails?.beneficiaryContactId || `cont_${Date.now().toString().slice(-10)}`;
      const generatedFundAccountId = currentDetails?.fundAccountId || `fa_${Date.now().toString().slice(-10)}`;

      const details: PayoutAccountDetails = {
        payoutMode,
        accountHolderName: accountHolderName.trim() || entityName,
        bankName: payoutMode === 'Bank Transfer' ? bankName : undefined,
        accountNumber: payoutMode === 'Bank Transfer' ? accountNumber.trim() : undefined,
        ifscCode: payoutMode === 'Bank Transfer' ? ifscCode.trim().toUpperCase() : undefined,
        accountType: payoutMode === 'Bank Transfer' ? accountType : undefined,
        upiId: payoutMode === 'UPI' ? upiId.trim() : undefined,
        isVerified: true,
        beneficiaryContactId: generatedContactId,
        fundAccountId: generatedFundAccountId,
        updatedAt: new Date().toISOString()
      };

      setTimeout(() => {
        onSaveDetails(details);
        setVerificationSuccess(false);
        onClose();
      }, 700);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 bg-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-black uppercase text-emerald-300 border border-emerald-400/30">
                <ShieldCheck className="w-3 h-3" />
                <span>RazorpayX & NPCI Payout Ready</span>
              </div>
              <h3 className="text-lg font-black text-white">
                {entityType === 'seller' ? 'Store Payout & Bank Account' : 'Rider Earnings & UPI Account'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-800">
          
          {/* Account Type Selector Tabs */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Choose Payout Method:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setPayoutMode('UPI')}
                className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-all cursor-pointer text-left ${
                  payoutMode === 'UPI'
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                  payoutMode === 'UPI' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-extrabold text-xs block">Instant UPI (VPA)</span>
                  <span className="text-[10px] text-slate-500 font-medium">Fastest • 0-Sec Transfer</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPayoutMode('Bank Transfer')}
                className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-all cursor-pointer text-left ${
                  payoutMode === 'Bank Transfer'
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                  payoutMode === 'Bank Transfer' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-extrabold text-xs block">Bank Account</span>
                  <span className="text-[10px] text-slate-500 font-medium">IMPS / NEFT Transfer</span>
                </div>
              </button>
            </div>
          </div>

          {/* Form: UPI Input */}
          {payoutMode === 'UPI' && (
            <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200 space-y-3.5 animate-in fade-in duration-150">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  UPI ID / Virtual Payment Address (VPA) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value.toLowerCase().trim())}
                    placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                    className="w-full bg-white border-2 border-slate-300 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 outline-none transition-colors"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    Instant IMPS
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Supports Google Pay, PhonePe, Paytm, BHIM, and all Indian Bank UPI handles.
                </p>
              </div>

              {/* Quick Handle Suggestions */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Quick Suffixes:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['@okhdfcbank', '@okaxis', '@okicici', '@oksbi', '@paytm', '@ybl', '@ibl'].map((suffix) => {
                    const baseUser = upiId.split('@')[0] || safePhone || 'merchant';
                    return (
                      <button
                        key={suffix}
                        type="button"
                        onClick={() => setUpiId(`${baseUser}${suffix}`)}
                        className="text-[10px] font-mono font-bold bg-white hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 border border-slate-200 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        {suffix}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Form: Bank Account Inputs */}
          {payoutMode === 'Bank Transfer' && (
            <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200 space-y-3.5 animate-in fade-in duration-150 text-xs">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Account Holder Name (as per Bank Passbook) *
                </label>
                <input
                  type="text"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar / Fresh Mart Foods Pvt Ltd"
                  className="w-full bg-white border-2 border-slate-300 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Bank Name *
                  </label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-white border-2 border-slate-300 focus:border-emerald-500 rounded-xl px-3 py-2.5 font-bold text-slate-900 outline-none transition-colors cursor-pointer"
                  >
                    {POPULAR_BANKS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Account Type *
                  </label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value as 'Savings' | 'Current')}
                    className="w-full bg-white border-2 border-slate-300 focus:border-emerald-500 rounded-xl px-3 py-2.5 font-bold text-slate-900 outline-none transition-colors cursor-pointer"
                  >
                    <option value="Current">Current Account (Business/Store)</option>
                    <option value="Savings">Savings Account (Individual/Rider)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Bank Account Number *
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 50100489123456"
                  maxLength={18}
                  className="w-full bg-white border-2 border-slate-300 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 font-mono font-bold text-slate-900 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Re-enter Account Number (Confirm) *
                </label>
                <input
                  type="text"
                  value={confirmAccountNumber}
                  onChange={(e) => setConfirmAccountNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="Confirm exact account number"
                  maxLength={18}
                  className={`w-full bg-white border-2 rounded-xl px-3.5 py-2.5 font-mono font-bold text-slate-900 outline-none transition-colors ${
                    confirmAccountNumber && accountNumber !== confirmAccountNumber
                      ? 'border-rose-400 bg-rose-50/50'
                      : 'border-slate-300 focus:border-emerald-500'
                  }`}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800 block">
                    IFSC Code (11 Digits) *
                  </label>
                  <span className="text-[10px] font-mono text-slate-500 font-bold">
                    Format: 4 Letters + 0 + 6 Characters
                  </span>
                </div>
                <input
                  type="text"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase().trim())}
                  placeholder="e.g. HDFC0000123 or SBIN0001234"
                  maxLength={11}
                  className="w-full bg-white border-2 border-slate-300 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 font-mono font-bold uppercase text-slate-900 outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {/* RazorpayX / Cashfree Payouts Notice Card */}
          <div className="bg-emerald-50/80 border border-emerald-200 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-950">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-extrabold block">Direct RazorpayX Payout Gateway Ready</span>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                When Razorpay is linked in settings, all payouts trigger real-time instant bank deposits (IMPS) or UPI credits without any manual delays.
              </p>
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isVerifying || verificationSuccess}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              {isVerifying ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Account...</span>
                </>
              ) : verificationSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>Account Linked!</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Save & Link Payout Account</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
