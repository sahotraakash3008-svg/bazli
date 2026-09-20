import React, { useState } from 'react';
import { Product, ProductReview } from '../types';
import { X, Star, CheckCircle, MessageSquare, ShieldCheck, ThumbsUp, Sparkles, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProductReviewsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  reviews: ProductReview[];
  hasPurchased: boolean;
  onAddReview: (productId: string, rating: number, comment: string) => void;
}

export const ProductReviewsModal: React.FC<ProductReviewsModalProps> = ({
  product,
  isOpen,
  onClose,
  reviews,
  hasPurchased,
  onAddReview
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen || !product) return null;

  const productReviews = reviews.filter(r => r.productId === product.id);
  const avgRating = productReviews.length > 0
    ? (productReviews.reduce((acc, r) => acc + r.rating, 0) / productReviews.length).toFixed(1)
    : product.rating.toFixed(1);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPurchased) {
      setErrorMsg('Only customers who previously purchased this item can post a review.');
      return;
    }
    if (!comment.trim()) {
      setErrorMsg('Please write a brief comment sharing your experience.');
      return;
    }
    if (rating < 1 || rating > 5) {
      setErrorMsg('Please select a valid rating between 1 and 5 stars.');
      return;
    }

    onAddReview(product.id, rating, comment.trim());
    setSubmitted(true);
    setComment('');
    setErrorMsg('');

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={product.image}
              alt={product.name}
              className="w-12 h-12 rounded-xl object-cover border-2 border-white/20 bg-white shadow-xs"
            />
            <div>
              <h3 className="font-extrabold text-base leading-snug line-clamp-1">{product.name}</h3>
              <div className="flex items-center space-x-2 text-xs text-emerald-200 mt-0.5">
                <div className="flex items-center text-amber-300">
                  <Star className="w-3.5 h-3.5 fill-amber-300 mr-1" />
                  <strong className="text-white">{avgRating}</strong>
                </div>
                <span>•</span>
                <span>{productReviews.length} customer {productReviews.length === 1 ? 'review' : 'reviews'}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          
          {/* Add Review Section (For Customers Who Previously Purchased) */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <h4 className="font-extrabold text-slate-900 text-sm">Write a Customer Review</h4>
              </div>
              {hasPurchased ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Buyer
                </span>
              ) : (
                <span className="text-[11px] font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                  Purchased Customers Only
                </span>
              )}
            </div>

            {hasPurchased ? (
              submitted ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-center space-y-1.5 animate-in fade-in">
                  <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto" />
                  <p className="text-xs font-bold text-emerald-900">Thank you! Your verified review has been posted.</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-[11px] text-emerald-700 underline font-semibold hover:text-emerald-800 cursor-pointer"
                  >
                    Submit another note
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-3 pt-1">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Your Rating:
                    </label>
                    <div className="flex items-center space-x-1.5">
                      {[1, 2, 3, 4, 5].map(starVal => (
                        <button
                          key={starVal}
                          type="button"
                          onMouseEnter={() => setHoverRating(starVal)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(starVal)}
                          className="p-1 rounded-lg hover:bg-amber-50 transition-transform active:scale-95 cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              (hoverRating || rating) >= starVal
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-xs font-extrabold text-slate-700">
                        {rating} / 5 Stars
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Your Review / Comment:
                    </label>
                    <textarea
                      rows={3}
                      value={comment}
                      onChange={e => {
                        setComment(e.target.value);
                        if (errorMsg) setErrorMsg('');
                      }}
                      placeholder="Share details about product freshness, packaging, taste, or your bargaining savings..."
                      className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                    />
                  </div>

                  {errorMsg && (
                    <p className="text-xs text-rose-600 font-semibold">{errorMsg}</p>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post Verified Review</span>
                  </button>
                </form>
              )
            ) : (
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Verified Buyer Reviews Only</p>
                  <p className="text-[11px] text-amber-800/90 mt-0.5">
                    To maintain 100% authentic feedback, only customers who have previously ordered this product can write a review. Add this item to your cart and place an order to unlock reviews!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Existing Customer Reviews List */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center justify-between">
              <span>Customer Reviews ({productReviews.length})</span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                ⭐ {avgRating} Average
              </span>
            </h4>

            {productReviews.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 space-y-1">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">No customer reviews yet</p>
                <p className="text-[11px]">Be the first verified customer to share your thoughts!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {productReviews.map(rev => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-2 shadow-2xs hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                          {rev.customerName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-bold text-slate-900">{rev.customerName}</span>
                            {rev.verifiedPurchase && (
                              <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
                                <CheckCircle className="w-2.5 h-2.5 mr-0.5 text-emerald-600" />
                                Verified Buyer
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">{rev.date}</span>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            className={`w-3.5 h-3.5 ${
                              idx < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-normal">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
