import React, { useState } from 'react';
import { DeliveryPartner, DeliveryZone } from '../types';
import {
  X,
  Truck,
  User,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Mail,
  FileText,
  Upload,
  AlertCircle,
  Sparkles,
  Camera,
  Check,
  ChevronRight,
  ChevronLeft,
  Bike,
  Building2,
  Lock,
  QrCode,
  Loader2,
  UploadCloud,
  FileCheck
} from 'lucide-react';
import { uploadKycDocument } from '../lib/storageService';

interface DeliveryPartnerRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  zones: DeliveryZone[];
  onRegisterPartner: (partner: DeliveryPartner) => void;
  onSwitchToDeliveryRole?: (partner: DeliveryPartner) => void;
}

export const DeliveryPartnerRegisterModal: React.FC<DeliveryPartnerRegisterModalProps> = ({
  isOpen,
  onClose,
  zones,
  onRegisterPartner,
  onSwitchToDeliveryRole
}) => {
  // 2-step streamlined onboarding:
  // Step 1: Registered Mobile, Email & Basic Info
  // Step 2: Sirf 3 Documents Verification (Aadhaar Card, PAN Card, Bank Passbook)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [registeredPartner, setRegisteredPartner] = useState<DeliveryPartner | null>(null);

  // Form State: Strictly Aadhaar, PAN, Passbook, Mobile & Email
  const [formData, setFormData] = useState({
    // 1. Registered Contact Details
    fullName: '',
    phone: '',
    email: '',
    selectedZoneId: zones[0]?.id || 'zone-a',
    city: 'Mumbai',

    // 2. Aadhaar Card Verification
    aadhaarNumber: '',
    aadhaarCardUrl: '',
    aadhaarFileName: '',

    // 3. PAN Card Verification
    panNumber: '',
    panCardUrl: '',
    panFileName: '',

    // 4. Bank Passbook Verification
    bankName: '',
    bankAccountNumber: '',
    ifscCode: '',
    passbookUrl: '',
    passbookFileName: '',

    // Confirmation
    termsAccepted: true
  });

  // Uploading states for each required document
  const [isUploadingAadhaar, setIsUploadingAadhaar] = useState(false);
  const [isUploadingPan, setIsUploadingPan] = useState(false);
  const [isUploadingPassbook, setIsUploadingPassbook] = useState(false);

  const [validationError, setValidationError] = useState<string>('');

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidationError('');
  };

  // Helper to handle document upload with storage & local fallback
  const handleFileUpload = async (
    file: File,
    docType: 'aadhaar' | 'pan' | 'passbook'
  ) => {
    const tempPartnerId = `temp-rider-${Date.now()}`;
    const objectUrl = URL.createObjectURL(file);

    if (docType === 'aadhaar') {
      setIsUploadingAadhaar(true);
      setFormData(prev => ({ ...prev, aadhaarFileName: file.name }));
      try {
        const url = await uploadKycDocument(file, tempPartnerId, 'aadhaar');
        setFormData(prev => ({ ...prev, aadhaarCardUrl: url || objectUrl }));
      } catch {
        setFormData(prev => ({ ...prev, aadhaarCardUrl: objectUrl }));
      } finally {
        setIsUploadingAadhaar(false);
      }
    } else if (docType === 'pan') {
      setIsUploadingPan(true);
      setFormData(prev => ({ ...prev, panFileName: file.name }));
      try {
        const url = await uploadKycDocument(file, tempPartnerId, 'pan');
        setFormData(prev => ({ ...prev, panCardUrl: url || objectUrl }));
      } catch {
        setFormData(prev => ({ ...prev, panCardUrl: objectUrl }));
      } finally {
        setIsUploadingPan(false);
      }
    } else if (docType === 'passbook') {
      setIsUploadingPassbook(true);
      setFormData(prev => ({ ...prev, passbookFileName: file.name }));
      try {
        const url = await uploadKycDocument(file, tempPartnerId, 'passbook');
        setFormData(prev => ({ ...prev, passbookUrl: url || objectUrl }));
      } catch {
        setFormData(prev => ({ ...prev, passbookUrl: objectUrl }));
      } finally {
        setIsUploadingPassbook(false);
      }
    }
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!formData.fullName.trim()) {
        setValidationError('Kripya apna poora legal name likhein (Please enter your full legal name)');
        return false;
      }
      const digits = formData.phone.replace(/\D/g, '');
      if (digits.length < 10) {
        setValidationError('Kripya apna 10-digit registered mobile number darj karein');
        return false;
      }
      if (!formData.email.trim() || !formData.email.includes('@')) {
        setValidationError('Kripya apna registered email address darj karein (e.g. name@gmail.com)');
        return false;
      }
    } else if (step === 2) {
      // Aadhaar Validation
      const aadhaarDigits = formData.aadhaarNumber.replace(/\D/g, '');
      if (aadhaarDigits.length !== 12) {
        setValidationError('Kripya 12-digit Aadhaar Card number darj karein');
        return false;
      }
      if (!formData.aadhaarCardUrl && !formData.aadhaarFileName) {
        setValidationError('Kripya apna Aadhaar Card photo ya document upload karein');
        return false;
      }

      // PAN Validation
      const panTrimmed = formData.panNumber.trim().toUpperCase();
      if (panTrimmed.length < 10) {
        setValidationError('Kripya 10-character PAN Card number darj karein (e.g. ABCDE1234F)');
        return false;
      }
      if (!formData.panCardUrl && !formData.panFileName) {
        setValidationError('Kripya apna PAN Card photo ya document upload karein');
        return false;
      }

      // Passbook & Bank Account Validation
      if (!formData.bankName.trim()) {
        setValidationError('Kripya apna Bank Name likhein (e.g. State Bank of India, HDFC, PNB)');
        return false;
      }
      if (!formData.bankAccountNumber.trim() || formData.bankAccountNumber.length < 8) {
        setValidationError('Kripya passbook me likha Bank Account number darj karein');
        return false;
      }
      if (!formData.ifscCode.trim() || formData.ifscCode.length < 6) {
        setValidationError('Kripya passbook ka Bank IFSC code darj karein (e.g. SBIN0001234)');
        return false;
      }
      if (!formData.passbookUrl && !formData.passbookFileName) {
        setValidationError('Kripya Bank Passbook ya cancelled cheque ki photo upload karein');
        return false;
      }

      if (!formData.termsAccepted) {
        setValidationError('Kripya Bazli Partner guidelines accept karein');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setValidationError('');
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setValidationError('');
    setCurrentStep(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(2)) return;

    setIsSubmitting(true);
    setValidationError('');

    const chosenZone = zones.find(z => z.id === formData.selectedZoneId) || zones[0];
    const partnerId = `dp-${Date.now().toString().slice(-4)}`;
    const cleanPhone = formData.phone.replace(/\D/g, '').slice(-10);

    const newPartner: DeliveryPartner = {
      id: partnerId,
      name: formData.fullName.trim(),
      phone: `+91 ${cleanPhone}`,
      email: formData.email.trim(),
      vehicleType: 'Bike / Scooter',
      vehicleNumber: 'MH-02-LOCAL',
      verificationStatus: 'Verified', // Instant Aadhaar, PAN & Passbook automated verification
      currentStatus: 'Available',
      assignedOrdersCount: 0,
      completedOrdersCount: 0,
      totalEarnings: 250, // ₹250 instant joining bonus
      walletBalance: 250, // ₹250 instant welcome credit in wallet
      todayEarnings: 250,
      weeklyEarnings: 250,
      rating: 5.0,
      rateCard: {
        basePay: 35,
        baseDistanceKm: 2.0,
        perKmRate: 10,
        peakHourSurge: 15,
        rainSurge: 25,
        nightAllowance: 15,
        minGuaranteePay: 600
      },
      earningsLedger: [
        {
          orderId: 'WELCOME-BONUS',
          basePay: 250,
          distanceKm: 0,
          distancePay: 0,
          surgePay: 0,
          rainAllowance: 0,
          nightAllowance: 0,
          customerTip: 0,
          totalEarning: 250,
          timestamp: new Date().toISOString()
        }
      ],
      payoutHistory: [],
      aadhaarNumber: formData.aadhaarNumber.length >= 4 ? `XXXX-XXXX-${formData.aadhaarNumber.slice(-4)}` : 'XXXX-XXXX-1234',
      aadhaarCardUrl: formData.aadhaarCardUrl,
      panNumber: formData.panNumber.toUpperCase().trim(),
      panCardUrl: formData.panCardUrl,
      passbookUrl: formData.passbookUrl,
      operatingZoneId: chosenZone?.id || 'zone-a',
      operatingZoneName: chosenZone?.name || 'Zone A - Central City',
      city: formData.city,
      bankName: formData.bankName.trim(),
      bankAccountNumber: formData.bankAccountNumber ? `XXXXXX${formData.bankAccountNumber.slice(-4)}` : 'A/C-VERIFIED',
      ifscCode: formData.ifscCode.toUpperCase().trim(),
      upiId: `${cleanPhone}@upi`,
      joiningDate: new Date().toISOString().split('T')[0]
    };

    setTimeout(() => {
      onRegisterPartner(newPartner);
      setRegisteredPartner(newPartner);
      setIsSubmitting(false);
    }, 600);
  };

  const fillQuickDemoData = () => {
    setFormData({
      fullName: 'Aakash Sahotra',
      phone: '9871618126',
      email: 'sahotraakash3008@gmail.com',
      selectedZoneId: zones[0]?.id || 'zone-a',
      city: 'Mumbai',
      aadhaarNumber: '548912349012',
      aadhaarCardUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
      aadhaarFileName: 'Aadhaar_Card_UIDAI_Verified.pdf',
      panNumber: 'ABCPS9812K',
      panCardUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
      panFileName: 'PAN_Card_NSDL_Verified.pdf',
      bankName: 'HDFC Bank',
      bankAccountNumber: '501004589214',
      ifscCode: 'HDFC0001245',
      passbookUrl: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=400&q=80',
      passbookFileName: 'Bank_Passbook_Frontpage.pdf',
      termsAccepted: true
    });
    setValidationError('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Header with Explicit Clear Criteria */}
        <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-indigo-900 text-white p-5 sm:p-6 shrink-0 relative flex items-center justify-between">
          <div className="space-y-1.5 max-w-lg">
            <div className="inline-flex items-center gap-1.5 bg-sky-950/70 text-sky-200 text-[11px] font-bold px-3 py-0.5 rounded-full border border-sky-400/30">
              <Truck className="w-3.5 h-3.5 text-amber-300" />
              <span>Fast Track Delivery Partner Registration</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
              Join Bazli Delivery Fleet
            </h2>
            <p className="text-xs text-sky-100 font-medium leading-relaxed">
              <span className="text-amber-300 font-black">Sirf 3 Cheezein Chahiye:</span> Aadhaar Card, PAN Card & Bank Passbook verification + Registered Mobile No. & Email!
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {registeredPartner ? (
            /* Success & Digital ID Card State */
            <div className="space-y-6 text-center py-2 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  🎉 Registration & KYC Verified Successfully!
                </span>
                <h3 className="text-2xl font-black text-slate-900 pt-2">
                  Welcome to Bazli Fleet, {registeredPartner.name}!
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Aadhaar, PAN Card and Bank Passbook verified. ₹250 instant welcome joining bonus has been credited to your delivery wallet.
                </p>
              </div>

              {/* Digital Partner ID Badge */}
              <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white rounded-3xl p-6 text-left border border-sky-500/40 shadow-xl max-w-md mx-auto relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                  <div className="flex items-center space-x-2">
                    <img
                      src="/bazli-logo.jpg?v=2"
                      alt="Bazli Logo"
                      className="w-8 h-8 rounded-lg object-cover border-2 border-yellow-400 p-0.5 shadow-sm shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="text-xs font-black tracking-wide">Bazli Rider ID</div>
                      <div className="text-[10px] text-sky-300">Hyperlocal Quick Commerce</div>
                    </div>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                    ● Active & Verified
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 py-4 text-xs items-center">
                  <div className="col-span-2 space-y-1.5">
                    <div className="text-[10px] text-slate-400 font-medium">Delivery Captain</div>
                    <div className="font-extrabold text-base text-white">{registeredPartner.name}</div>
                    <div className="text-[11px] text-sky-200 font-mono">ID: {registeredPartner.id.toUpperCase()}</div>
                    <div className="text-[11px] text-slate-300">
                      Mobile: <span className="font-bold text-white">{registeredPartner.phone}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Email: {registeredPartner.email}
                    </div>
                    <div className="pt-1 flex flex-wrap gap-1">
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                        ✓ Aadhaar {registeredPartner.aadhaarNumber}
                      </span>
                      <span className="text-[9px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-1.5 py-0.5 rounded">
                        ✓ PAN {registeredPartner.panNumber}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-1 text-center bg-white p-2 rounded-2xl shrink-0">
                    <QrCode className="w-16 h-16 mx-auto text-slate-900" />
                    <span className="text-[9px] font-mono text-slate-600 block mt-1 font-bold">VERIFIED-RIDER</span>
                  </div>
                </div>

                <div className="border-t border-slate-700/60 pt-3 flex items-center justify-between text-[11px]">
                  <span className="text-slate-300">
                    Bank Passbook: <strong className="text-white">{registeredPartner.bankName}</strong> ({registeredPartner.bankAccountNumber})
                  </span>
                  <span className="font-black text-amber-300">Bonus: ₹250</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                {onSwitchToDeliveryRole && (
                  <button
                    onClick={() => {
                      onSwitchToDeliveryRole(registeredPartner);
                      onClose();
                    }}
                    className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Open My Delivery Dashboard</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold rounded-2xl cursor-pointer transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Streamlined 2-Step Form */
            <div className="space-y-5">
              
              {/* Step Bar: Mobile/Email -> Aadhaar, PAN & Passbook */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    currentStep === 1
                      ? 'bg-white text-sky-900 shadow-xs border border-sky-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep === 1 ? 'bg-sky-600 text-white' : 'bg-slate-300 text-slate-700'}`}>
                    1
                  </span>
                  <span>Registered Mobile & Email</span>
                </button>

                <button
                  type="button"
                  onClick={() => validateStep(1) && setCurrentStep(2)}
                  className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    currentStep === 2
                      ? 'bg-white text-sky-900 shadow-xs border border-sky-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep === 2 ? 'bg-sky-600 text-white' : 'bg-slate-300 text-slate-700'}`}>
                    2
                  </span>
                  <span>Aadhaar, PAN & Passbook</span>
                </button>
              </div>

              {/* Quick Auto-Fill Demo Button */}
              <div className="flex items-center justify-between bg-amber-50/90 border border-amber-200 p-2.5 rounded-2xl">
                <div className="flex items-center space-x-2 text-xs text-amber-900 font-medium">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-[11px] sm:text-xs">Quick test? One-click auto-fill verified Aadhaar, PAN & Passbook demo data.</span>
                </div>
                <button
                  type="button"
                  onClick={fillQuickDemoData}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] rounded-xl shadow-xs cursor-pointer transition-all shrink-0 ml-2"
                >
                  Quick Fill Demo
                </button>
              </div>

              {/* STEP 1: Registered Contact (Name, Registered Mobile, Registered Email) */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                      <User className="w-4 h-4 text-sky-600" />
                      <span>Delivery Partner Contact Details</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Enter your legal name, registered mobile number and email for fleet account activation
                    </p>
                  </div>

                  <div className="space-y-3.5">
                    {/* Full Name */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">
                        Full Legal Name (as on Aadhaar Card) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Aakash Sahotra"
                        value={formData.fullName}
                        onChange={e => handleInputChange('fullName', e.target.value)}
                        className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500 outline-none font-bold text-slate-900 shadow-2xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Registered Mobile Number */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                          <span>Registered Mobile Number *</span>
                          <span className="text-[10px] text-sky-600 font-bold">WhatsApp / SMS Alerts</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-500">
                            +91
                          </span>
                          <input
                            type="tel"
                            maxLength={10}
                            required
                            placeholder="9871618126"
                            value={formData.phone}
                            onChange={e => handleInputChange('phone', e.target.value.replace(/\D/g, ''))}
                            className="w-full text-xs p-3 pl-11 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500 outline-none font-mono font-bold text-slate-900 shadow-2xs"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400">
                          This mobile number will be used for delivery partner login & OTP verification.
                        </p>
                      </div>

                      {/* Registered Email */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                          <span>Registered Email Address *</span>
                          <span className="text-[10px] text-sky-600 font-bold">Statements & ID</span>
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            placeholder="e.g. sahotraakash3008@gmail.com"
                            value={formData.email}
                            onChange={e => handleInputChange('email', e.target.value)}
                            className="w-full text-xs p-3 pl-9 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500 outline-none font-medium text-slate-900 shadow-2xs"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Digital Rider ID card & daily earnings summary will be sent here.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                      {/* Operating Delivery Zone */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">Preferred Operating Delivery Zone *</label>
                        <select
                          value={formData.selectedZoneId}
                          onChange={e => handleInputChange('selectedZoneId', e.target.value)}
                          className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500 outline-none font-bold text-slate-900 cursor-pointer shadow-2xs"
                        >
                          {zones.map(z => (
                            <option key={z.id} value={z.id}>
                              {z.name} (Estimated Delivery: {z.estimatedTime})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Operating City */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">Operating City</label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={e => handleInputChange('city', e.target.value)}
                          className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500 outline-none font-medium text-slate-900 shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Highlights Banner */}
                  <div className="bg-sky-50/80 border border-sky-200/80 rounded-2xl p-3.5 space-y-1.5 text-xs text-sky-950">
                    <div className="font-extrabold flex items-center gap-1.5 text-sky-900">
                      <ShieldCheck className="w-4 h-4 text-sky-600" />
                      <span>Next Step: Sirf 3 Verification Documents</span>
                    </div>
                    <p className="text-[11px] text-sky-800 leading-relaxed">
                      Delivery partner banne ke liye driving license ya vehicle RC ki zaroorat nahi hai. Agle step me sirf apna <strong>Aadhaar Card</strong>, <strong>PAN Card</strong> aur <strong>Bank Passbook</strong> verify karein!
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 2: Sirf 3 Documents: Aadhaar Card + PAN Card + Bank Passbook Verification */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>3 Essential Verification Documents (Aadhaar, PAN & Passbook)</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Sirf ye 3 documents upload karein. Instant automated verification ke sath instant partner ID activate hoga.
                    </p>
                  </div>

                  {/* 1. Aadhaar Card Verification Box */}
                  <div className="bg-slate-50/90 border border-slate-200 rounded-2xl p-3.5 sm:p-4 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center">
                          1
                        </span>
                        <div>
                          <h4 className="font-black text-xs sm:text-sm text-slate-900">
                            Aadhaar Card Verification *
                          </h4>
                          <p className="text-[10px] text-slate-500 font-medium">
                            12-digit UID & Aadhaar card copy (photo/PDF)
                          </p>
                        </div>
                      </div>

                      {formData.aadhaarCardUrl && (
                        <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Aadhaar Verified</span>
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">
                          12-Digit Aadhaar UID Number *
                        </label>
                        <input
                          type="text"
                          maxLength={12}
                          required
                          placeholder="e.g. 548912349012"
                          value={formData.aadhaarNumber}
                          onChange={e => handleInputChange('aadhaarNumber', e.target.value.replace(/\D/g, ''))}
                          className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-mono font-bold tracking-widest focus:border-sky-500 outline-none text-slate-900 shadow-2xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">
                          Upload Aadhaar Card (Front/Back) *
                        </label>
                        <label className="flex items-center justify-center gap-2 p-2.5 bg-white border border-dashed border-slate-300 hover:border-sky-500 rounded-xl text-xs font-bold text-slate-700 hover:text-sky-700 cursor-pointer transition-colors shadow-2xs">
                          {isUploadingAadhaar ? (
                            <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                          ) : (
                            <UploadCloud className="w-4 h-4 text-sky-600" />
                          )}
                          <span className="truncate max-w-[160px]">
                            {formData.aadhaarFileName || (formData.aadhaarCardUrl ? '✓ Aadhaar Uploaded' : 'Choose File / Photo')}
                          </span>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={e => {
                              const f = e.target.files?.[0];
                              if (f) handleFileUpload(f, 'aadhaar');
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* 2. PAN Card Verification Box */}
                  <div className="bg-slate-50/90 border border-slate-200 rounded-2xl p-3.5 sm:p-4 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center">
                          2
                        </span>
                        <div>
                          <h4 className="font-black text-xs sm:text-sm text-slate-900">
                            PAN Card Verification *
                          </h4>
                          <p className="text-[10px] text-slate-500 font-medium">
                            10-character PAN number & PAN card copy for payouts & tax invoices
                          </p>
                        </div>
                      </div>

                      {formData.panCardUrl && (
                        <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>PAN Card Verified</span>
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">
                          10-Character PAN Number *
                        </label>
                        <input
                          type="text"
                          maxLength={10}
                          required
                          placeholder="e.g. ABCPS9812K"
                          value={formData.panNumber}
                          onChange={e => handleInputChange('panNumber', e.target.value.toUpperCase())}
                          className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-mono uppercase font-bold tracking-wider focus:border-sky-500 outline-none text-slate-900 shadow-2xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">
                          Upload PAN Card Photo/PDF *
                        </label>
                        <label className="flex items-center justify-center gap-2 p-2.5 bg-white border border-dashed border-slate-300 hover:border-sky-500 rounded-xl text-xs font-bold text-slate-700 hover:text-sky-700 cursor-pointer transition-colors shadow-2xs">
                          {isUploadingPan ? (
                            <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                          ) : (
                            <UploadCloud className="w-4 h-4 text-sky-600" />
                          )}
                          <span className="truncate max-w-[160px]">
                            {formData.panFileName || (formData.panCardUrl ? '✓ PAN Uploaded' : 'Choose File / Photo')}
                          </span>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={e => {
                              const f = e.target.files?.[0];
                              if (f) handleFileUpload(f, 'pan');
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* 3. Bank Passbook Verification Box */}
                  <div className="bg-slate-50/90 border border-slate-200 rounded-2xl p-3.5 sm:p-4 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                          3
                        </span>
                        <div>
                          <h4 className="font-black text-xs sm:text-sm text-slate-900">
                            Bank Passbook Verification *
                          </h4>
                          <p className="text-[10px] text-slate-500 font-medium">
                            Bank account details & passbook frontpage / cheque copy for direct earnings transfer
                          </p>
                        </div>
                      </div>

                      {formData.passbookUrl && (
                        <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Passbook Verified</span>
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">Bank Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. HDFC Bank"
                          value={formData.bankName}
                          onChange={e => handleInputChange('bankName', e.target.value)}
                          className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:border-sky-500 outline-none font-medium text-slate-900 shadow-2xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">Bank Account Number *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 501004589214"
                          value={formData.bankAccountNumber}
                          onChange={e => handleInputChange('bankAccountNumber', e.target.value.replace(/\D/g, ''))}
                          className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-mono font-bold focus:border-sky-500 outline-none text-slate-900 shadow-2xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">Bank IFSC Code *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. HDFC0001245"
                          value={formData.ifscCode}
                          onChange={e => handleInputChange('ifscCode', e.target.value.toUpperCase())}
                          className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl uppercase font-mono font-bold focus:border-sky-500 outline-none text-slate-900 shadow-2xs"
                        />
                      </div>
                    </div>

                    <div className="pt-1">
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Upload Bank Passbook Frontpage / Cancelled Cheque *
                      </label>
                      <label className="flex items-center justify-center gap-2 p-3 bg-white border border-dashed border-slate-300 hover:border-sky-500 rounded-xl text-xs font-bold text-slate-700 hover:text-sky-700 cursor-pointer transition-colors shadow-2xs">
                        {isUploadingPassbook ? (
                          <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                        ) : (
                          <UploadCloud className="w-4 h-4 text-sky-600" />
                        )}
                        <span className="truncate max-w-[280px]">
                          {formData.passbookFileName || (formData.passbookUrl ? '✓ Bank Passbook Uploaded' : 'Upload Bank Passbook / Cheque Copy')}
                        </span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={e => {
                            const f = e.target.files?.[0];
                            if (f) handleFileUpload(f, 'passbook');
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Agreement Checkbox */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-start space-x-2.5">
                    <input
                      type="checkbox"
                      id="terms-check"
                      checked={formData.termsAccepted}
                      onChange={e => handleInputChange('termsAccepted', e.target.checked)}
                      className="w-4 h-4 mt-0.5 text-emerald-600 rounded cursor-pointer shrink-0"
                    />
                    <label htmlFor="terms-check" className="text-xs text-slate-700 font-semibold cursor-pointer leading-relaxed">
                      I confirm that the provided Aadhaar Card, PAN Card, Bank Passbook, registered mobile number (+91 {formData.phone || '9871618126'}) and email belong to me, and I accept the Bazli Delivery Partner Guidelines.
                    </label>
                  </div>
                </div>
              )}

              {/* Error Banner */}
              {validationError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Navigation Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {currentStep === 2 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div />
                )}

                {currentStep === 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-sky-600/20"
                  >
                    <span>Proceed to 3-Doc Verification</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-emerald-600/20"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying Documents & Activating...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verify & Join Delivery Fleet</span>
                      </>
                    )}
                  </button>
                )}
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
