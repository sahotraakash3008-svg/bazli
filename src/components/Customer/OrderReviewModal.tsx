import React, { useState } from 'react';
import { Order, OrderReview } from '../../types';
import {
  Star,
  X,
  Heart,
  ThumbsUp,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Bike,
  Store,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface OrderReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onSubmitReview?: (review: OrderReview) => void;
}

export const OrderReviewModal: React.FC<OrderReviewModalProps> = ({
  isOpen,
  onClose,
  order,
  onSubmitReview
}) => {
  const [orderRating, setOrderRating] = useState<number>(5);
  const [riderRating, setRiderRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Fresh Packaging', 'Super Fast']);
  const [orderComment, setOrderComment] = useState<string>('');
  const [riderComment, setRiderComment] = useState<string>('');
  const [extraTip, setExtraTip] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const AVAILABLE_TAGS = [
    'Fresh Packaging',
    'Super Fast',
    'Followed Instructions',
    'Polite Rider',
    'Crisp & Hot',
    'Best Value',
    'Accurate Quantity'
  ];

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const review: OrderReview = {
      id: `REV-${Date.now()}`,
      orderId: order.id,
      customerName: order.customerName,
      orderRating,
      riderRating,
      orderFeedback: orderComment,
      riderFeedback: riderComment,
      tags: selectedTags,
      addedTip: extraTip,
      createdAt: new Date().toISOString()
    };

    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    setIsSubmitted(true);
    if (typeof onSubmitReview === 'function') {
      onSubmitReview(review);
    }

    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl text-white relative">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-500/20 via-slate-900 to-emerald-500/20 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Rate Your Experience</h3>
              <p className="text-xs text-slate-400">Order #{order.id} • {order.items.length} items</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-white">Thank You for Your Feedback!</h4>
            <p className="text-xs text-slate-300">
              Your rating helps us keep delivery lightning-fast and products ultra-fresh. You've earned <strong className="text-amber-400">+25 Bazli Coins!</strong>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* 1. Food / Grocery Quality Rating */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-200 flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-amber-400" />
                  <span>Items & Packaging Quality</span>
                </span>
                <span className="text-xs font-bold text-amber-400">
                  {orderRating === 5 ? 'Exceptional ⭐⭐⭐⭐⭐' : `${orderRating} Stars`}
                </span>
              </div>
              <div className="flex items-center justify-center space-x-2 py-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setOrderRating(star)}
                    className="p-1 hover:scale-125 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= orderRating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Delivery Partner Rating */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-200 flex items-center gap-1.5">
                  <Bike className="w-4 h-4 text-sky-400" />
                  <span>Delivery Hero ({order.deliveryPartnerName || 'Rider'})</span>
                </span>
                <span className="text-xs font-bold text-sky-400">
                  {riderRating === 5 ? 'Lightning Fast ⚡' : `${riderRating} Stars`}
                </span>
              </div>
              <div className="flex items-center justify-center space-x-2 py-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRiderRating(star)}
                    className="p-1 hover:scale-125 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= riderRating
                          ? 'text-sky-400 fill-sky-400'
                          : 'text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Feedback Tags */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">What went well?</label>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_TAGS.map(tag => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Optional Comment */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Detailed Feedback (Optional)</label>
              <textarea
                value={orderComment}
                onChange={e => setOrderComment(e.target.value)}
                placeholder="Share any suggestions or praise for the dark store / kitchen..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none h-18"
              />
            </div>

            {/* 5. Add Tip for Delivery Hero */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-slate-200 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <span>Send a Tip to Rider</span>
                </span>
                <p className="text-[10px] text-slate-400">100% credited to rider's wallet</p>
              </div>
              <div className="flex items-center space-x-1.5">
                {[0, 20, 30, 50].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setExtraTip(amt)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      extraTip === amt
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {amt === 0 ? 'No Tip' : `₹${amt}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Submit Rating & Claim 25 Coins</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
