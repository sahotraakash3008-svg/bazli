import React, { useState, useEffect } from 'react';
import { Seller, SellerType } from '../../types';
import { X, Store, Building2, Phone, Mail, MapPin, FileText, CheckCircle2, ShieldCheck, UtensilsCrossed, Clock, ShoppingBag } from 'lucide-react';

interface AdminEditSellerModalProps {
  isOpen: boolean;
  seller: Seller | null;
  onClose: () => void;
  onUpdateSeller: (sellerId: string, updates: Partial<Seller>) => Promise<void>;
}

export const AdminEditSellerModal: React.FC<AdminEditSellerModalProps> = ({
  isOpen,
  seller,
  onClose,
  onUpdateSeller
}) => {
  const [sellerType, setSellerType] = useState<SellerType>('grocery');
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [fssaiNumber, setFssaiNumber] = useState('');
  const [cuisines, setCuisines] = useState('');
  const [avgPrepTime, setAvgPrepTime] = useState<number>(20);
  const [isKitchenOpen, setIsKitchenOpen] = useState(true);
  const [active, setActive] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'Verified' | 'Pending' | 'Rejected'>('Verified');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (seller) {
      const isRest = seller.sellerType === 'restaurant' || seller.category === 'Restaurant' || !!seller.fssaiNumber || seller.id.startsWith('rest-');
      setSellerType(isRest ? 'restaurant' : 'grocery');
      setBusinessName(seller.businessName);
      setOwnerName(seller.ownerName);
      setPhone(seller.phone);
      setEmail(seller.email);
      setAddress(seller.address);
      setGstNumber(seller.gstNumber || '');
      setFssaiNumber(seller.fssaiNumber || '');
      setCuisines(seller.cuisineSpecialties?.join(', ') || '');
      setAvgPrepTime(seller.avgPrepTimeMinutes || 20);
      setIsKitchenOpen(seller.isKitchenOpen !== false);
      setActive(seller.active);
      setVerificationStatus(seller.verificationStatus);
    }
  }, [seller]);

  if (!isOpen || !seller) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const cuisineList = cuisines.split(',').map(c => c.trim()).filter(Boolean);
      await onUpdateSeller(seller.id, {
        businessName,
        ownerName,
        phone,
        email,
        address,
        gstNumber,
        fssaiNumber: sellerType === 'restaurant' ? fssaiNumber : seller.fssaiNumber,
        sellerType,
        cuisineSpecialties: cuisineList.length > 0 ? cuisineList : seller.cuisineSpecialties,
        avgPrepTimeMinutes: sellerType === 'restaurant' ? avgPrepTime : seller.avgPrepTimeMinutes,
        isKitchenOpen: sellerType === 'restaurant' ? isKitchenOpen : seller.isKitchenOpen,
        active,
        verificationStatus
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
              sellerType === 'restaurant' ? 'bg-orange-500/20 text-orange-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              {sellerType === 'restaurant' ? <UtensilsCrossed className="w-5 h-5" /> : <Store className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-base">
                Edit {sellerType === 'restaurant' ? 'Restaurant Partner' : 'Merchant Store'} #{seller.id}
              </h3>
              <p className="text-slate-400 text-xs">Update business credentials & operational state</p>
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
          {/* Sector Badge / Switch */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Store Sector
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSellerType('grocery')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  sellerType === 'grocery'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-400/30'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>🛒 Grocery Dark Store</span>
              </button>
              <button
                type="button"
                onClick={() => setSellerType('restaurant')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  sellerType === 'restaurant'
                    ? 'border-orange-500 bg-orange-50 text-orange-950 ring-2 ring-orange-400/30'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <UtensilsCrossed className="w-4 h-4 text-orange-600" />
                <span>🍽️ Restaurant Kitchen</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {sellerType === 'restaurant' ? 'Restaurant Name' : 'Store Business Name'}
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Owner / Manager Name
              </label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={e => setOwnerName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Physical Address
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                GSTIN / Trade UID
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={gstNumber}
                  onChange={e => setGstNumber(e.target.value.toUpperCase())}
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Verification State
              </label>
              <select
                value={verificationStatus}
                onChange={e => setVerificationStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
              >
                <option value="Verified">Verified (Approved)</option>
                <option value="Pending">Pending Audit</option>
                <option value="Rejected">Rejected / Suspended</option>
              </select>
            </div>
          </div>

          {sellerType === 'restaurant' && (
            <div className="p-3.5 bg-orange-50/70 rounded-2xl border border-orange-200 space-y-3">
              <div className="text-xs font-black text-orange-950 flex items-center gap-1.5">
                <UtensilsCrossed className="w-4 h-4 text-orange-600" />
                <span>Restaurant Kitchen Configuration</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    FSSAI Food License #
                  </label>
                  <input
                    type="text"
                    value={fssaiNumber}
                    onChange={e => setFssaiNumber(e.target.value)}
                    placeholder="11521008000123"
                    className="w-full px-3 py-2 text-xs font-mono font-bold border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Avg Kitchen Prep Time (Mins)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={60}
                    value={avgPrepTime}
                    onChange={e => setAvgPrepTime(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Cuisines (comma separated)
                </label>
                <input
                  type="text"
                  value={cuisines}
                  onChange={e => setCuisines(e.target.value)}
                  placeholder="North Indian, Biryani, Mughlai"
                  className="w-full px-3 py-2 text-xs border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white"
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-xs font-bold text-orange-950 block">Live Kitchen Orders</span>
                  <span className="text-[10px] text-orange-800">Toggle whether customers can place live food orders</span>
                </div>
                <input
                  type="checkbox"
                  checked={isKitchenOpen}
                  onChange={e => setIsKitchenOpen(e.target.checked)}
                  className="w-4 h-4 accent-orange-600 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-900 font-bold block">
                Store Operating Status
              </span>
              <span className="text-[10px] text-slate-500">
                When active, products appear in customer app search and feeds
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={e => setActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
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
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-black text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving Changes...' : 'Save Updates'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
