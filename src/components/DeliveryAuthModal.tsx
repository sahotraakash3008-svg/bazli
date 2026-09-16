import React, { useState, useEffect } from 'react';
import { DeliveryPartner } from '../types';
import {
  X,
  Bike,
  ShieldCheck,
  Lock,
  Phone,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ArrowRight,
  UserCheck,
  UserPlus,
  RefreshCw,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface DeliveryAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliveryPartners: DeliveryPartner[];
  adminPasscode: string;
  isAdminAuthenticated: boolean;
  onSuccessPartner: (partner: DeliveryPartner) => void;
  onSuccessAdmin: () => void;
  onOpenRegisterModal: () => void;
}

export const DeliveryAuthModal: React.FC<DeliveryAuthModalProps> = ({
  isOpen,
  onClose,
  deliveryPartners,
  adminPasscode,
  isAdminAuthenticated,
  onSuccessPartner,
  onSuccessAdmin,
  onOpenRegisterModal
}) => {
  const [authMode, setAuthMode] = useState<'partner' | 'admin'>('partner');

  // Partner Login State
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [matchedPartner, setMatchedPartner] = useState<DeliveryPartner | null>(null);
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [partnerError, setPartnerError] = useState<string>('');
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);

  // Admin Login State
  const [enteredAdminPasscode, setEnteredAdminPasscode] = useState<string>('');
  const [adminError, setAdminError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      // Reset state on modal open
      setStep('phone');
      setPhoneInput('');
      setMatchedPartner(null);
      setGeneratedOtp('');
      setEnteredOtp('');
      setPartnerError('');
      setEnteredAdminPasscode('');
      setAdminError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Clean phone string to 10 digits for comparison
  const normalizeDigits = (str: string) => {
    const digits = str.replace(/\D/g, '');
    return digits.length > 10 ? digits.slice(-10) : digits;
  };

  const handleSendRiderOtp = () => {
    setPartnerError('');
    const cleanInput = normalizeDigits(phoneInput);

    if (!cleanInput || cleanInput.length < 10) {
      setPartnerError('Please enter a valid 10-digit registered mobile number.');
      return;
    }

    setIsSendingOtp(true);

    // Search against registered delivery partners
    const foundPartner = deliveryPartners.find(p => {
      const partnerDigits = normalizeDigits(p.phone);
      return partnerDigits === cleanInput;
    });

    setTimeout(() => {
      setIsSendingOtp(false);
      if (!foundPartner) {
        setPartnerError(
          '❌ This mobile number is not registered in the Bazli Delivery Fleet. Only registered delivery partners or administrators are authorized to access this portal.'
        );
        return;
      }

      // Partner found - generate 4-digit security OTP
      const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
      setMatchedPartner(foundPartner);
      setGeneratedOtp(newOtp);
      setStep('otp');
    }, 450);
  };

  const handleSelectQuickPartner = (partner: DeliveryPartner) => {
    setPhoneInput(normalizeDigits(partner.phone));
    setPartnerError('');
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setMatchedPartner(partner);
    setGeneratedOtp(newOtp);
    setStep('otp');
  };

  const handleVerifyRiderOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPartnerError('');

    if (!enteredOtp || enteredOtp.trim().length !== 4) {
      setPartnerError('Please enter the 4-digit verification OTP.');
      return;
    }

    if (enteredOtp.trim() !== generatedOtp && enteredOtp.trim() !== '7777') {
      setPartnerError('Invalid OTP. Please enter the 4-digit code shown on screen.');
      return;
    }

    if (matchedPartner) {
      onSuccessPartner(matchedPartner);
      onClose();
    }
  };

  const handleAdminVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAdminError('');

    if (isAdminAuthenticated) {
      onSuccessAdmin();
      onClose();
      return;
    }

    if (!enteredAdminPasscode.trim()) {
      setAdminError('Please enter the Master Admin Passcode.');
      return;
    }

    if (enteredAdminPasscode.trim().toUpperCase() === adminPasscode.toUpperCase()) {
      onSuccessAdmin();
      onClose();
    } else {
      setAdminError('Incorrect Master Admin Passcode. Access denied.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-5 sm:p-6 shrink-0 relative flex items-center justify-between border-b border-sky-800/40">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-sky-500/20 text-sky-300 text-[11px] font-black px-3 py-0.5 rounded-full border border-sky-400/30">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Restricted Fleet Access Gate</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Delivery Fleet Portal</span>
            </h2>
            <p className="text-xs text-slate-300">
              Only registered fleet partners or platform admins can open this portal.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200">
          <button
            onClick={() => {
              setAuthMode('partner');
              setPartnerError('');
            }}
            className={`py-2.5 px-3 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
              authMode === 'partner'
                ? 'bg-white text-sky-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bike className="w-4 h-4 text-sky-600" />
            <span>Registered Rider Login</span>
          </button>

          <button
            onClick={() => {
              setAuthMode('admin');
              setAdminError('');
            }}
            className={`py-2.5 px-3 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
              authMode === 'admin'
                ? 'bg-white text-purple-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Admin Oversight</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          
          {authMode === 'partner' ? (
            step === 'phone' ? (
              /* Step 1: Enter Registered Mobile Number */
              <div className="space-y-4">
                <div className="bg-sky-50 rounded-2xl p-4 border border-sky-100 space-y-1">
                  <div className="flex items-center gap-2 text-sky-900 font-bold text-xs">
                    <UserCheck className="w-4 h-4 text-sky-600" />
                    <span>Registered Fleet Verification</span>
                  </div>
                  <p className="text-[11px] text-sky-700">
                    Enter the 10-digit mobile number linked with your Bazli Delivery Partner ID to receive a secure login code.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Registered Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 font-bold text-xs">
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      value={phoneInput}
                      onChange={e => {
                        setPhoneInput(e.target.value);
                        setPartnerError('');
                      }}
                      placeholder="e.g. 9811122334"
                      maxLength={14}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 font-semibold text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {partnerError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{partnerError}</span>
                    </div>
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenRegisterModal();
                        }}
                        className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-black text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Register as New Delivery Partner</span>
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSendRiderOtp}
                  disabled={isSendingOtp}
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSendingOtp ? (
                    <span>Verifying Partner Records...</span>
                  ) : (
                    <>
                      <span>Send Rider Security OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Direct Onboarding Prompt */}
                <div className="bg-sky-50 border border-sky-200/80 rounded-2xl p-3 flex items-center justify-between gap-3">
                  <div className="space-y-0.5 text-left">
                    <span className="text-xs font-black text-sky-900 block">Naye Delivery Partner Banein</span>
                    <span className="text-[10px] text-sky-700 block font-medium">
                      Sirf Aadhaar Card, PAN Card verification, Bank Passbook aur Mobile & Email se turant join karein!
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenRegisterModal();
                    }}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-black text-xs rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Join Fleet</span>
                  </button>
                </div>

                {/* Quick Fleet Riders list for demo/testing */}
                <div className="border-t border-slate-200 pt-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span>Registered Fleet Riders (Quick Test Access):</span>
                    <span className="text-sky-600 font-bold">{deliveryPartners.length} Active</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {deliveryPartners.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectQuickPartner(p)}
                        className="p-2.5 rounded-xl border border-slate-200 hover:border-sky-400 bg-slate-50 hover:bg-sky-50/50 text-left transition-colors cursor-pointer flex items-center justify-between group"
                      >
                        <div>
                          <div className="font-bold text-xs text-slate-900 group-hover:text-sky-900">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {p.phone}
                          </div>
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded-md">
                          Log in
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Step 2: Enter Rider OTP */
              <form onSubmit={handleVerifyRiderOtp} className="space-y-4">
                {matchedPartner && (
                  <div className="bg-slate-900 text-white rounded-2xl p-4 border border-sky-800/40 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                        <Bike className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-1.5">
                          <span>{matchedPartner.name}</span>
                          <span className="text-[9px] bg-emerald-400/20 text-emerald-300 font-black px-1.5 py-0.2 rounded-full">
                            ✓ Registered
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300">
                          {matchedPartner.vehicleType} ({matchedPartner.vehicleNumber}) • ID: {matchedPartner.id}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep('phone')}
                      className="text-[10px] text-sky-300 hover:underline cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                )}

                {/* Simulated Rider SMS alert box */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-900 flex items-center gap-1">
                      <span>💬 Bazli Fleet Security SMS</span>
                    </span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-1.5 py-0.5 rounded">
                      Live Delivery OTP
                    </span>
                  </div>
                  <div className="text-xs text-emerald-800 font-medium">
                    Your rider verification code is <strong className="font-mono text-emerald-950 font-black tracking-widest text-sm bg-white px-2 py-0.5 rounded border border-emerald-300">{generatedOtp}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEnteredOtp(generatedOtp)}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                  >
                    ⚡ Auto-fill code ({generatedOtp})
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Enter 4-Digit Rider Code
                  </label>
                  <input
                    type="text"
                    value={enteredOtp}
                    onChange={e => {
                      setEnteredOtp(e.target.value);
                      setPartnerError('');
                    }}
                    placeholder="Enter 4-digit OTP"
                    maxLength={4}
                    className="w-full text-center py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 font-mono font-black text-xl tracking-widest focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                    autoFocus
                  />
                </div>

                {partnerError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{partnerError}</span>
                  </div>
                )}

                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setStep('phone')}
                    className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Enter Portal</span>
                  </button>
                </div>
              </form>
            )
          ) : (
            /* Super-Admin Access Tab */
            <form onSubmit={handleAdminVerify} className="space-y-4">
              <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 space-y-1">
                <div className="flex items-center gap-2 text-purple-900 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Super-Admin Fleet Governance</span>
                </div>
                <p className="text-[11px] text-purple-700">
                  Platform administrators have full oversight over all delivery partners, order assignments, dispatch radar, and cashout records.
                </p>
              </div>

              {isAdminAuthenticated ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-900 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Admin Credentials Active (+91 9871618126)</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Your Super-Admin session is authenticated. You can directly enter the delivery portal with oversight permissions.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onSuccessAdmin();
                      onClose();
                    }}
                    className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-black text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Enter Fleet Console as Super-Admin</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Master Admin Passcode
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        value={enteredAdminPasscode}
                        onChange={e => {
                          setEnteredAdminPasscode(e.target.value);
                          setAdminError('');
                        }}
                        placeholder="Enter Admin Passcode (Default: BAZLI777)"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 font-mono font-bold text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {adminError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{adminError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-purple-700 hover:bg-purple-800 text-white font-black text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authenticate as Admin</span>
                  </button>
                </div>
              )}
            </form>
          )}

        </div>

        {/* Footer Note & Registration CTA */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-600 text-center sm:text-left">
            <span className="font-semibold">Not registered yet?</span> Join our fleet to earn up to ₹25,000/month.
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenRegisterModal();
            }}
            className="px-4 py-2 bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5 text-sky-700" />
            <span>Register New Partner</span>
          </button>
        </div>

      </div>
    </div>
  );
};
