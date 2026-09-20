import React, { useState } from 'react';
import { Seller, SellerType } from '../../types';
import { X, Store, Building2, Phone, Mail, MapPin, FileText, CheckCircle2, UtensilsCrossed, Clock, ShoppingBag } from 'lucide-react';

interface AdminAddSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSeller: (sellerData: Partial<Seller>) => Promise<void>;
  defaultSellerType?: SellerType;
}

export const AdminAddSellerModal: React.FC<AdminAddSellerModalProps> = ({
  isOpen,
  onClose,
  onAddSeller,
  defaultSellerType = 'grocery'
}) => {
  const [sellerType, setSellerType] = useState<SellerType>(defaultSellerType);
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [fssaiNumber, setFssaiNumber] = useState('');
  const [cuisines, setCuisines] = useState('');
  const [avgPrepTime, setAvgPrepTime] = useState<number>(20);
  const [autoVerify, setAutoVerify] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !ownerName || !phone) return;

    setIsSubmitting(true);
    try {
      const cuisineList = cuisines.split(',').map(c => c.trim()).filter(Boolean);
      await onAddSeller({
        businessName,
        ownerName,
        phone,
        email: email || `${ownerName.toLowerCase().replace(/\s+/g, '')}@${sellerType === 'restaurant' ? 'food.bazli.in' : 'bazli.in'}`,
        address: address || 'Shop #12, Main Market, Mumbai',
        gstNumber: gstNumber || '27AAAAA0000A1Z5',
        fssaiNumber: sellerType === 'restaurant' ? (fssaiNumber || '11521008000123') : fssaiNumber,
        sellerType,
        cuisineSpecialties: cuisineList.length > 0 ? cuisineList : (sellerType === 'restaurant' ? ['North Indian', 'Biryani'] : undefined),
        avgPrepTimeMinutes: sellerType === 'restaurant' ? avgPrepTime : undefined,
        isKitchenOpen: sellerType === 'restaurant' ? true : undefined,
        verificationStatus: autoVerify ? 'Verified' : 'Pending',
        active: true,
        rating: 4.9,
        totalSales: 0,
        totalRevenue: 0
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className={`p-5 flex items-center justify-between text-white ${
          sellerType === 'restaurant' ? 'bg-gradient-to-r from-slate-950 via-orange-950 to-slate-900' : 'bg-slate-900'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              sellerType === 'restaurant' ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {sellerType === 'restaurant' ? <UtensilsCrossed className="w-5 h-5" /> : <Store className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-base">
                {sellerType === 'restaurant' ? 'Onboard Restaurant / Cloud Kitchen' : 'Onboard Grocery Dark Store'}
              </h3>
              <p className="text-slate-400 text-xs">Direct Admin Provisioning & Verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Sector Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Select Merchant Sector *
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setSellerType('grocery')}
                className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  sellerType === 'grocery'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-400/30'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <ShoppingBag className={`w-4 h-4 ${sellerType === 'grocery' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <div className="text-left">
                  <div>🛒 Grocery Dark Store</div>
                  <div className="text-[10px] text-slate-400 font-normal">Kirana & Daily Essentials</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSellerType('restaurant')}
                className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  sellerType === 'restaurant'
                    ? 'border-orange-500 bg-orange-50 text-orange-950 ring-2 ring-orange-400/30'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <UtensilsCrossed className={`w-4 h-4 ${sellerType === 'restaurant' ? 'text-orange-600' : 'text-slate-400'}`} />
                <div className="text-left">
                  <div>🍽️ Restaurant Kitchen</div>
                  <div className="text-[10px] text-slate-400 font-normal">Dine-in, Meals & Cuisines</div>
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {sellerType === 'restaurant' ? 'Restaurant / Outlet Name *' : 'Store / Business Name *'}
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder={sellerType === 'restaurant' ? 'e.g. Biryani Blues Kitchen' : 'e.g. Royal Fresh Mart'}
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Owner / Head Chef Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Chef Sanjay Kapoor"
                value={ownerName}
                onChange={e => setOwnerName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  placeholder="+91 98200 11223"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Business Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  placeholder="contact@outlet.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Store / Kitchen Physical Address
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Unit 102, Food Court, Commercial Plaza, Mumbai"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                GSTIN / Tax ID
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="27AABCU9603R1ZM"
                  value={gstNumber}
                  onChange={e => setGstNumber(e.target.value.toUpperCase())}
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                />
              </div>
            </div>

            {sellerType === 'restaurant' ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>FSSAI Food License # *</span>
                  <span className="text-[10px] text-orange-600 font-extrabold">14-Digit UID</span>
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-orange-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="11521008000123"
                    value={fssaiNumber}
                    onChange={e => setFssaiNumber(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none bg-orange-50/40"
                  />
                </div>
              </div>
            ) : null}
          </div>

          {sellerType === 'restaurant' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cuisine Specialties (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="North Indian, Mughlai, Biryani"
                  value={cuisines}
                  onChange={e => setCuisines(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Avg Preparation Time (Mins)
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="number"
                    min={5}
                    max={60}
                    value={avgPrepTime}
                    onChange={e => setAvgPrepTime(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs text-emerald-950 font-bold">
                Auto-Approve & Grant Live Selling Status
              </span>
            </div>
            <input
              type="checkbox"
              checked={autoVerify}
              onChange={e => setAutoVerify(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded cursor-pointer accent-emerald-600"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2.5 rounded-xl text-xs font-black text-white shadow-md transition-all cursor-pointer disabled:opacity-50 ${
                sellerType === 'restaurant'
                  ? 'bg-orange-600 hover:bg-orange-500'
                  : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              {isSubmitting ? 'Registering...' : sellerType === 'restaurant' ? 'Register Restaurant' : 'Register Grocery Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
