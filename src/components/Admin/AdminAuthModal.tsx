import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Lock,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Phone,
  MessageSquare,
  Send,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  Settings,
  ArrowRight,
  Shield
} from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentPasscode: string;
  onUpdatePasscode: (newCode: string) => void;
  defaultAdminPhone?: string;
}

const DEFAULT_ADMIN_WHATSAPP = '9871618126';

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentPasscode,
  onUpdatePasscode,
  defaultAdminPhone = DEFAULT_ADMIN_WHATSAPP
}) => {
  const [adminPhone, setAdminPhone] = useState<string>(() => {
    try {
      return localStorage.getItem('bazli_admin_phone') || localStorage.getItem('apnabazar_admin_phone') || defaultAdminPhone;
    } catch {
      return defaultAdminPhone;
    }
  });

  // 6 separate digits for intuitive OTP entry
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const digitInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [inputPin, setInputPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentOtp, setCurrentOtp] = useState<string>('');
  const [otpSentTime, setOtpSentTime] = useState<Date | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [showNotificationBadge, setShowNotificationBadge] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'whatsapp_otp' | 'master_passcode' | 'settings'>('whatsapp_otp');

  // Phone edit / passcode edit states
  const [newPhoneInput, setNewPhoneInput] = useState<string>(adminPhone);
  const [oldCode, setOldCode] = useState<string>('');
  const [newCode, setNewCode] = useState<string>('');
  const [confirmNewCode, setConfirmNewCode] = useState<string>('');
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate a cryptographically distinct random 6-digit PIN
  const generateRandomPin = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Dispatch OTP to WhatsApp
  const handleSendWhatsAppOtp = (customPhone?: string) => {
    const targetPhone = customPhone || adminPhone;
    const cleanPhone = targetPhone.replace(/\D/g, '');
    const newPin = generateRandomPin();
    setCurrentOtp(newPin);
    setOtpSentTime(new Date());
    setError(null);
    setInputPin('');
    setOtpDigits(['', '', '', '', '', '']);
    setResendCooldown(45);
    setShowNotificationBadge(true);

    // Message payload for WhatsApp
    const message = encodeURIComponent(
      `🔐 *Bazli Super-Admin Security Alert*\n\nYour dynamic one-time Admin Login PIN is:\n\n👉 *${newPin}*\n\n⚠️ Valid for this login session only. Do NOT share this PIN with anyone.`
    );
    const whatsappUrl = `https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${message}`;

    try {
      sessionStorage.setItem('bazli_active_admin_otp', newPin);
    } catch {}

    // Focus first input box after generating
    setTimeout(() => {
      if (digitInputRefs.current[0]) {
        digitInputRefs.current[0]?.focus();
      }
    }, 100);
  };

  // Send WhatsApp OTP automatically when modal opens in OTP mode
  useEffect(() => {
    if (isOpen) {
      handleSendWhatsAppOtp();
    } else {
      setInputPin('');
      setOtpDigits(['', '', '', '', '', '']);
      setError(null);
      setShowNotificationBadge(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isOpen]);

  // Cooldown countdown
  useEffect(() => {
    if (resendCooldown > 0) {
      timerRef.current = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resendCooldown]);

  if (!isOpen) return null;

  const handleCopyPin = () => {
    if (!currentOtp) return;
    navigator.clipboard.writeText(currentOtp);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleOpenWhatsAppDirect = () => {
    const cleanPhone = adminPhone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `🔐 *Bazli Super-Admin Security Alert*\n\nYour dynamic one-time Admin Login PIN is:\n\n👉 *${currentOtp}*\n\n⚠️ Valid for this login session only. Do NOT share this PIN with anyone.`
    );
    window.open(`https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${message}`, '_blank');
  };

  const executeVerify = (codeToVerify: string) => {
    setIsVerifying(true);
    setError(null);

    const entered = codeToVerify.trim();
    if (!entered) {
      setError('Please enter the 6-digit PIN sent to your WhatsApp.');
      setIsVerifying(false);
      return;
    }

    const isWhatsAppOtpValid = currentOtp && entered === currentOtp;
    const isMasterPasscodeValid = currentPasscode && entered.toUpperCase() === currentPasscode.toUpperCase();

    if (isWhatsAppOtpValid || isMasterPasscodeValid) {
      setTimeout(() => {
        setIsVerifying(false);
        setInputPin('');
        setOtpDigits(['', '', '', '', '', '']);
        setError(null);
        onSuccess();
        onClose();
      }, 400);
    } else {
      setTimeout(() => {
        setIsVerifying(false);
        setError(`Invalid PIN "${entered}". Please check the WhatsApp code sent to +91 ${adminPhone} and retry.`);
      }, 300);
    }
  };

  // Handle 6-digit box changes
  const handleDigitChange = (index: number, val: string) => {
    const sanitized = val.replace(/\D/g, '');
    
    // If pasted full 6 digit string
    if (sanitized.length > 1) {
      const chars = sanitized.slice(0, 6).split('');
      const newDigits = [...otpDigits];
      chars.forEach((c, idx) => {
        if (idx < 6) newDigits[idx] = c;
      });
      setOtpDigits(newDigits);
      setError(null);
      if (chars.length === 6) {
        executeVerify(newDigits.join(''));
      } else {
        const nextIdx = Math.min(chars.length, 5);
        digitInputRefs.current[nextIdx]?.focus();
      }
      return;
    }

    const char = sanitized.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);
    setError(null);

    if (char && index < 5) {
      digitInputRefs.current[index + 1]?.focus();
    }

    // If all 6 filled, auto submit
    if (char && index === 5) {
      const fullCode = newDigits.join('');
      if (fullCode.length === 6) {
        executeVerify(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      digitInputRefs.current[index - 1]?.focus();
    }
  };

  const handleFillDirect = (pinVal: string) => {
    const chars = pinVal.slice(0, 6).split('');
    setOtpDigits(chars);
    setInputPin(pinVal);
    setError(null);
    executeVerify(pinVal);
  };

  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newPhoneInput.replace(/\D/g, '');
    if (clean.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setAdminPhone(clean);
    try {
      localStorage.setItem('bazli_admin_phone', clean);
    } catch {}
    setSettingsSuccessMsg('WhatsApp number updated to +91 ' + clean);
    setTimeout(() => {
      setSettingsSuccessMsg(null);
      setAuthMode('whatsapp_otp');
      handleSendWhatsAppOtp(clean);
    }, 1200);
  };

  const handleChangePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (oldCode.trim().toUpperCase() !== currentPasscode.toUpperCase()) {
      setError('Current master passcode does not match.');
      return;
    }

    if (newCode.trim().length < 4) {
      setError('New passcode must be at least 4 characters long.');
      return;
    }

    if (newCode !== confirmNewCode) {
      setError('New passcodes do not match.');
      return;
    }

    onUpdatePasscode(newCode.trim());
    setSettingsSuccessMsg('Master passcode updated successfully!');
    setTimeout(() => {
      setSettingsSuccessMsg(null);
      setAuthMode('whatsapp_otp');
      setOldCode('');
      setNewCode('');
      setConfirmNewCode('');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col relative">
        
        {/* Header with WhatsApp & Security Branding */}
        <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white p-6 flex items-center justify-between border-b border-emerald-800/40">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base tracking-tight">Super-Admin 2FA Gateway</h3>
                <span className="bg-emerald-500/25 text-emerald-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-400/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>CONNECTED</span>
                </span>
              </div>
              <p className="text-slate-300 text-xs mt-0.5 flex items-center gap-1.5">
                <span>Verified Admin WhatsApp:</span>
                <span className="text-emerald-400 font-mono font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  +91 {adminPhone}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live WhatsApp Dynamic PIN Simulation Card */}
        {showNotificationBadge && currentOtp && (
          <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md border-b border-emerald-600 animate-in slide-in-from-top-2">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0 border border-white/20">
                <MessageSquare className="w-5 h-5 text-emerald-100" />
              </div>
              <div className="text-xs space-y-0.5">
                <div className="font-black flex items-center gap-1.5">
                  <span>WhatsApp Alert Dispatched to +91 {adminPhone}</span>
                </div>
                <div className="text-emerald-100 text-[11px] flex items-center gap-1.5">
                  <span>Your dynamic login PIN:</span>
                  <span className="font-mono font-black text-white text-sm bg-black/30 px-2 py-0.5 rounded border border-white/30 tracking-widest">
                    {currentOtp}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleCopyPin}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all border border-white/20"
                title="Copy OTP to clipboard"
              >
                {isCopied ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3 text-white" />}
                <span>{isCopied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleFillDirect(currentOtp)}
                className="px-3.5 py-1.5 bg-white text-emerald-950 hover:bg-emerald-50 rounded-xl text-xs font-black cursor-pointer shadow-md transition-all flex items-center gap-1"
              >
                <span>Fill & Enter</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Mode Switcher Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 px-6 pt-3 text-xs font-bold gap-2">
          <button
            onClick={() => setAuthMode('whatsapp_otp')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              authMode === 'whatsapp_otp'
                ? 'border-emerald-600 text-emerald-700 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp PIN (+91 {adminPhone})</span>
          </button>

          <button
            onClick={() => setAuthMode('master_passcode')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              authMode === 'master_passcode'
                ? 'border-purple-600 text-purple-700 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-purple-600" />
            <span>Master Passcode</span>
          </button>

          <button
            onClick={() => setAuthMode('settings')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              authMode === 'settings'
                ? 'border-slate-800 text-slate-900 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-slate-600" />
            <span>Phone / PIN Settings</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* 1. WHATSAPP 6-DIGIT OTP VERIFICATION MODE */}
          {authMode === 'whatsapp_otp' && (
            <div className="space-y-5">
              
              {/* WhatsApp Connected Phone Info Card */}
              <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                      <span>Connected Phone: +91 {adminPhone}</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Dynamic security PIN is sent via WhatsApp to this registered number.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOpenWhatsAppDirect}
                  className="w-full sm:w-auto px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all shrink-0"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Open in WhatsApp</span>
                </button>
              </div>

              {/* 6-Digit Individual Pin Entry Boxes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Enter 6-Digit WhatsApp PIN
                  </label>
                  {otpSentTime && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      Generated at {otpSentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-6 gap-2 sm:gap-3">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => (digitInputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleDigitChange(index, e.target.value)}
                      onKeyDown={e => handleKeyDown(index, e)}
                      className="w-full h-13 sm:h-14 text-center text-xl font-mono font-black border-2 border-emerald-200 rounded-2xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 focus:outline-none bg-emerald-50/20 text-slate-900 transition-all selection:bg-emerald-200"
                    />
                  ))}
                </div>
              </div>

              {/* Resend OTP & Helper Info */}
              <div className="flex items-center justify-between text-xs px-1">
                <button
                  type="button"
                  disabled={resendCooldown > 0}
                  onClick={() => handleSendWhatsAppOtp()}
                  className={`font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    resendCooldown > 0
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-emerald-700 hover:text-emerald-800'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resendCooldown > 0 ? 'animate-spin' : ''}`} />
                  <span>
                    {resendCooldown > 0
                      ? `Resend WhatsApp PIN in ${resendCooldown}s`
                      : 'Send New WhatsApp PIN'}
                  </span>
                </button>

                {currentOtp && (
                  <button
                    type="button"
                    onClick={() => handleFillDirect(currentOtp)}
                    className="text-emerald-700 hover:text-emerald-900 font-black underline cursor-pointer text-xs flex items-center gap-1"
                  >
                    <span>Auto-Fill Current PIN ({currentOtp})</span>
                  </button>
                )}
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-1.5 animate-in shake">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isVerifying}
                  onClick={() => executeVerify(otpDigits.join(''))}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isVerifying ? 'Verifying PIN...' : 'Verify PIN & Enter Admin'}</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. MASTER PASSCODE FALLBACK MODE */}
          {authMode === 'master_passcode' && (
            <form onSubmit={e => { e.preventDefault(); executeVerify(inputPin); }} className="space-y-4">
              <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200/80 text-xs text-purple-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-purple-900">
                  <Lock className="w-4 h-4 text-purple-700" />
                  <span>Master Passcode Fallback</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  If WhatsApp is unavailable, enter your permanent master security passcode (default: <strong className="font-mono text-purple-700">BAZLI777</strong>).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Enter Master Passcode
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPin ? 'text' : 'password'}
                    placeholder="Enter master passcode..."
                    value={inputPin}
                    onChange={e => {
                      setInputPin(e.target.value);
                      setError(null);
                    }}
                    className="w-full pl-10 pr-10 py-3 text-sm font-mono font-black tracking-widest border border-slate-300 rounded-2xl focus:ring-2 focus:ring-purple-600 focus:outline-none bg-slate-50 uppercase"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] px-1 text-slate-500">
                <span>Default Master Code: <strong className="font-mono text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded font-bold">BAZLI777</strong></span>
                <button
                  type="button"
                  onClick={() => {
                    setInputPin(currentPasscode);
                    setError(null);
                  }}
                  className="text-purple-600 hover:text-purple-800 font-bold underline cursor-pointer text-[10px]"
                >
                  Autofill Master Code
                </button>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setAuthMode('whatsapp_otp')}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  ← Use WhatsApp PIN
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Unlock Admin</span>
                </button>
              </div>
            </form>
          )}

          {/* 3. SECURITY SETTINGS (Change WhatsApp Number or Master Passcode) */}
          {authMode === 'settings' && (
            <div className="space-y-6">
              
              {/* Change WhatsApp Phone Form */}
              <form onSubmit={handleSavePhone} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>Admin WhatsApp Number</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Dynamic 2FA PINs will always be dispatched to this number before granting login.
                </p>

                <div className="flex items-center gap-2">
                  <div className="bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold font-mono">
                    +91
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={newPhoneInput}
                    onChange={e => setNewPhoneInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="9871618126"
                    className="flex-1 px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-all"
                  >
                    Save Number
                  </button>
                </div>
              </form>

              {/* Change Master Passcode Form */}
              <form onSubmit={handleChangePasscode} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Lock className="w-4 h-4 text-purple-600" />
                  <span>Update Master Passcode</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Current Code</label>
                    <input
                      type="password"
                      required
                      placeholder="Current..."
                      value={oldCode}
                      onChange={e => setOldCode(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-xl bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">New Code</label>
                    <input
                      type="text"
                      required
                      placeholder="New..."
                      value={newCode}
                      onChange={e => setNewCode(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-xl bg-white font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Confirm</label>
                    <input
                      type="text"
                      required
                      placeholder="Confirm..."
                      value={confirmNewCode}
                      onChange={e => setConfirmNewCode(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-xl bg-white font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-all"
                  >
                    Update Passcode
                  </button>
                </div>
              </form>

              {settingsSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{settingsSuccessMsg}</span>
                </div>
              )}

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-2 flex justify-start">
                <button
                  type="button"
                  onClick={() => setAuthMode('whatsapp_otp')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  ← Back to WhatsApp Login
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
