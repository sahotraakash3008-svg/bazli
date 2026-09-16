import React, { useState, useEffect } from 'react';
import { Product, LoyaltyTier, BargainingSession } from '../types';
import {
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  ArrowRight,
  ShieldCheck,
  Tag,
  Scale
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  hapticBargainSubmit,
  hapticBargainSuccess,
  hapticAddToCart,
  hapticSelection
} from '../utils/haptics';

interface BargainModalProps {
  product: Product | null;
  isOpen?: boolean;
  onClose: () => void;
  loyaltyTier?: LoyaltyTier;
  userTier?: LoyaltyTier;
  selectedWeight?: string;
  variantBasePrice?: number;
  onBargainSuccess?: (product: Product, agreedPrice: number, selectedWeight?: string) => void;
  onOfferSubmit?: (productId: string, offerPrice: number) => Promise<BargainingSession>;
  onAddToCart?: (
    product: Product,
    session?: BargainingSession,
    selectedWeight?: string,
    unitPrice?: number
  ) => void;
  existingSession?: BargainingSession;
}

export const BargainModal: React.FC<BargainModalProps> = ({
  product,
  isOpen = true,
  onClose,
  loyaltyTier: propLoyaltyTier,
  userTier,
  selectedWeight,
  variantBasePrice,
  onBargainSuccess,
  onOfferSubmit,
  onAddToCart,
  existingSession
}) => {
  const currentLoyaltyTier = propLoyaltyTier || userTier || 'Gold';
  const effectiveBasePrice = variantBasePrice || product?.sellingPrice || 0;
  const effectiveWeight = selectedWeight || product?.quantity || '';

  const [customerOffer, setCustomerOffer] = useState<number>(
    Math.round(effectiveBasePrice * 0.92)
  );
  const [loading, setLoading] = useState(false);
  const [evalResult, setEvalResult] = useState<{
    status: 'pending' | 'accepted' | 'counter' | 'rejected';
    message: string;
    finalAgreedPrice?: number;
    counterOffer?: number;
    attemptsUsed: number;
    maxAttempts: number;
    expiresAt?: number;
    minAcceptablePrice?: number;
  }>({
    status: existingSession ? existingSession.status : 'pending',
    message: existingSession ? existingSession.message : '',
    finalAgreedPrice: existingSession?.finalAgreedPrice,
    counterOffer: existingSession?.counterOffer,
    attemptsUsed: existingSession?.attemptsUsed || 0,
    maxAttempts: existingSession?.maxAttempts || product?.maxBargainAttempts || 3
  });

  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 mins in seconds

  useEffect(() => {
    if (evalResult.status === 'accepted') {
      hapticBargainSuccess();
      if (evalResult.expiresAt) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      }
    }
  }, [evalResult.status]);

  useEffect(() => {
    let timer: any;
    if (evalResult.status === 'accepted' || evalResult.status === 'counter') {
      timer = setInterval(() => {
        setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [evalResult.status]);

  if (!isOpen || !product) return null;

  const maxTierDiscount = product.maxBargainDiscountPercent || 20; // Admin configured bargain discount percentage
  const maxPossibleSaving = Math.round((effectiveBasePrice * maxTierDiscount) / 100);
  const minPossiblePrice = Math.max(1, effectiveBasePrice - maxPossibleSaving);

  const handleEvaluateOffer = async (offerVal: number) => {
    hapticBargainSubmit();
    setLoading(true);
    try {
      if (onOfferSubmit && !variantBasePrice) {
        const session = await onOfferSubmit(product.id, offerVal);
        setEvalResult({
          status: session.status,
          message: session.message || '',
          finalAgreedPrice: session.finalAgreedPrice,
          counterOffer: session.counterOffer,
          attemptsUsed: session.attemptsUsed || 1,
          maxAttempts: session.maxAttempts || 3,
          expiresAt: session.expiresAt,
          minAcceptablePrice: session.minAcceptablePrice
        });
      } else {
        const res = await fetch('/api/bargain/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product.id,
            customerOffer: offerVal,
            userId: 'c1',
            loyaltyTier: currentLoyaltyTier,
            variantBasePrice: effectiveBasePrice,
            selectedWeight: effectiveWeight
          })
        });

        if (res.ok) {
          const data = await res.json();
          setEvalResult({
            status: data.status,
            message: data.message,
            finalAgreedPrice: data.finalAgreedPrice,
            counterOffer: data.counterOffer,
            attemptsUsed: data.attemptsUsed || 1,
            maxAttempts: data.maxAttempts || 3,
            expiresAt: data.expiresAt,
            minAcceptablePrice: data.minAcceptablePrice
          });
        } else {
          // Fallback algorithm locally
          const discountPct = ((effectiveBasePrice - offerVal) / effectiveBasePrice) * 100;
          if (discountPct <= maxTierDiscount) {
            setEvalResult({
              status: 'accepted',
              message: `Deal! Your price of ₹${offerVal} is accepted for ${effectiveWeight}.`,
              finalAgreedPrice: offerVal,
              attemptsUsed: evalResult.attemptsUsed + 1,
              maxAttempts: 3,
              expiresAt: Date.now() + 10 * 60 * 1000
            });
          } else {
            const counter = Math.round(effectiveBasePrice * (1 - (maxTierDiscount * 0.8) / 100));
            setEvalResult({
              status: 'counter',
              message: `Your offer was too low. Best price we can do is ₹${counter}.`,
              counterOffer: counter,
              attemptsUsed: evalResult.attemptsUsed + 1,
              maxAttempts: 3
            });
          }
        }
      }
    } catch (err) {
      console.error(err);
      // Fallback
      const discountPct = ((effectiveBasePrice - offerVal) / effectiveBasePrice) * 100;
      if (discountPct <= maxTierDiscount) {
        setEvalResult({
          status: 'accepted',
          message: `Deal accepted at ₹${offerVal}!`,
          finalAgreedPrice: offerVal,
          attemptsUsed: evalResult.attemptsUsed + 1,
          maxAttempts: 3,
          expiresAt: Date.now() + 10 * 60 * 1000
        });
      } else {
        const counter = Math.round(effectiveBasePrice * 0.88);
        setEvalResult({
          status: 'counter',
          message: `Seller counter-offer is ₹${counter}`,
          counterOffer: counter,
          attemptsUsed: evalResult.attemptsUsed + 1,
          maxAttempts: 3
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptCounterOffer = async () => {
    if (!evalResult.counterOffer) return;
    setLoading(true);
    try {
      setEvalResult(prev => ({
        ...prev,
        status: 'accepted',
        finalAgreedPrice: evalResult.counterOffer,
        expiresAt: Date.now() + 10 * 60 * 1000
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCartWithAgreed = () => {
    hapticAddToCart();
    const agreedPrice = evalResult.finalAgreedPrice || effectiveBasePrice;
    if (onBargainSuccess) {
      onBargainSuccess(product, agreedPrice, effectiveWeight);
    }
    if (onAddToCart) {
      onAddToCart(
        product,
        {
          id: 'bargain-' + Date.now(),
          userId: 'c1',
          productId: product.id,
          productName: product.name,
          originalPrice: effectiveBasePrice,
          customerOffer: agreedPrice,
          status: 'accepted',
          finalAgreedPrice: agreedPrice,
          attemptsUsed: evalResult.attemptsUsed,
          maxAttempts: evalResult.maxAttempts,
          expiresAt: evalResult.expiresAt || Date.now() + 600000,
          message: 'Agreed Price'
        },
        effectiveWeight,
        agreedPrice
      );
    }
    onClose();
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 relative animate-in zoom-in-95 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-pink-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-amber-300" />
            <div>
              <h3 className="font-black text-lg text-white">Bazli Bargaining & Negotiation</h3>
              <p className="text-xs font-bold text-pink-100">
                Tier: {currentLoyaltyTier} Customer (Negotiate in Real-Time)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Product Overview Card */}
          <div className="flex items-center space-x-4 bg-pink-50/60 p-3.5 rounded-2xl border border-pink-100">
            <img
              src={product.image}
              alt={product.name}
              className="w-16 h-16 object-cover rounded-xl bg-white border border-pink-200 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-black uppercase text-pink-700">
                {product.category}
              </span>
              <h4 className="font-black text-slate-900 text-sm truncate">{product.name}</h4>
              <div className="flex items-center gap-1 text-xs text-slate-600 mt-0.5">
                <Scale className="w-3 h-3 text-pink-600" />
                <span className="font-bold text-pink-900">Unit: {effectiveWeight}</span>
              </div>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-sm font-black text-slate-900">
                  Base Price: ₹{effectiveBasePrice}
                </span>
              </div>
            </div>
          </div>

          {/* Bargain Info Pill */}
          <div className="bg-amber-50/80 border border-amber-200 p-3 rounded-2xl flex items-center justify-between text-xs text-amber-950">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold">Live Bazli Bargaining</span>
                <span className="text-[11px] block text-amber-800">
                  Make your best reasonable offer for {effectiveWeight}
                </span>
              </div>
            </div>
            <span className="font-black text-amber-900 bg-amber-200/80 px-2.5 py-1 rounded-lg shrink-0">
              Listed ₹{effectiveBasePrice}
            </span>
          </div>

          {/* Status Display Area */}
          {evalResult.status === 'accepted' ? (
            <div className="bg-pink-50 border border-pink-300 p-5 rounded-2xl text-center space-y-3 animate-in zoom-in-95">
              <CheckCircle2 className="w-12 h-12 text-pink-600 mx-auto" />
              <div>
                <h4 className="text-lg font-black text-pink-950">OFFER ACCEPTED! 🎉</h4>
                <p className="text-xs text-pink-800 font-medium mt-0.5">
                  Your negotiated price is locked for {effectiveWeight}.
                </p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-pink-200 inline-block font-black text-2xl text-pink-700 shadow-xs">
                Agreed Price: ₹{evalResult.finalAgreedPrice}
              </div>

              <div className="flex items-center justify-center space-x-1.5 text-xs text-pink-800 font-semibold">
                <Clock className="w-4 h-4 text-pink-600" />
                <span>Price locked for: {formatTimer(timeLeft)} mins</span>
              </div>

              <button
                onClick={handleAddToCartWithAgreed}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-black py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer text-sm"
              >
                <span>
                  Add {effectiveWeight} to Cart at ₹{evalResult.finalAgreedPrice}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : evalResult.status === 'counter' ? (
            <div className="bg-amber-50 border border-amber-300 p-5 rounded-2xl text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
              <div>
                <h4 className="text-base font-extrabold text-amber-950">SELLER COUNTER OFFER</h4>
                <p className="text-xs text-amber-800 mt-1">{evalResult.message}</p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-amber-200 inline-block font-black text-2xl text-amber-900">
                Counter Offer: ₹{evalResult.counterOffer}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleAcceptCounterOffer}
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-xs cursor-pointer"
                >
                  Accept Counter (₹{evalResult.counterOffer})
                </button>
                <button
                  onClick={() => setEvalResult(prev => ({ ...prev, status: 'pending' }))}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2.5 rounded-xl text-xs cursor-pointer"
                >
                  Make New Offer
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                  Your Offer for {effectiveWeight} (₹)
                </label>
                <div className="flex items-center justify-center space-x-3">
                  <button
                    onClick={() => setCustomerOffer(prev => Math.max(minPossiblePrice, prev - 5))}
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-lg flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={customerOffer}
                    onChange={e => setCustomerOffer(Number(e.target.value))}
                    min={minPossiblePrice}
                    max={effectiveBasePrice}
                    className="w-32 text-center text-3xl font-black text-slate-900 bg-slate-50 border-2 border-amber-400 rounded-2xl py-2 outline-none"
                  />
                  <button
                    onClick={() => setCustomerOffer(prev => Math.min(effectiveBasePrice, prev + 5))}
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-lg flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <div className="text-xs text-slate-500 font-semibold pt-1">
                  Selling Price: ₹{effectiveBasePrice} | Potential Savings: ₹
                  {Math.max(0, effectiveBasePrice - customerOffer)}
                </div>
              </div>

              {/* Quick Offer Presets */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {[
                  Math.max(1, Math.round(effectiveBasePrice * 0.95)),
                  Math.max(1, Math.round(effectiveBasePrice * 0.90)),
                  Math.max(1, Math.round(effectiveBasePrice * 0.85)),
                  Math.max(1, Math.round(effectiveBasePrice * 0.80)),
                ]
                  .filter((val, idx, arr) => arr.indexOf(val) === idx && val < effectiveBasePrice)
                  .map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setCustomerOffer(val)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        customerOffer === val
                          ? 'bg-amber-400 border-amber-500 text-slate-950 font-black'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-amber-50'
                      }`}
                    >
                      Offer ₹{val}
                    </button>
                  ))}
              </div>

              {/* Submit Bargain Button */}
              <button
                onClick={() => handleEvaluateOffer(customerOffer)}
                disabled={loading || customerOffer <= 0 || customerOffer > effectiveBasePrice}
                className="w-full bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-slate-950 font-black py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer text-sm"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Bazli Engine Negotiating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Submit Offer for ₹{customerOffer}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
