import React, { useState, useRef, useEffect } from 'react';
import { ScratchCardReward } from '../../types';
import {
  Sparkles,
  X,
  Gift,
  Coins,
  CheckCircle2,
  Copy,
  Check,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ScratchCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward: ScratchCardReward;
  onClaimReward?: (reward: ScratchCardReward) => void;
}

export const ScratchCardModal: React.FC<ScratchCardModalProps> = ({
  isOpen,
  onClose,
  reward,
  onClaimReward
}) => {
  const [isRevealed, setIsRevealed] = useState<boolean>(reward?.isScratched || false);
  const [copiedCoupon, setCopiedCoupon] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    if (!isOpen || isRevealed || !reward) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw gold foil scratch layer
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#d97706');
    gradient.addColorStop(0.5, '#fde047');
    gradient.addColorStop(1, '#b45309');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative text on scratch layer
    ctx.fillStyle = '#1e1b4b';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨ Scratch Here to Reveal ✨', canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = '12px sans-serif';
    ctx.fillText('Move mouse / finger across card', canvas.width / 2, canvas.height / 2 + 15);
  }, [isOpen, isRevealed, reward]);

  if (!isOpen || !reward) return null;

  const handleScratch = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (isRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.fill();

    // Check scratch percentage
    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let clearedPixels = 0;
      for (let i = 3; i < imgData.data.length; i += 4 * 16) {
        if (imgData.data[i] === 0) clearedPixels++;
      }
      const totalSampled = imgData.data.length / (4 * 16);
      if (clearedPixels / totalSampled > 0.35) {
        revealCard();
      }
    } catch {
      // Fallback
    }
  };

  const revealCard = () => {
    if (isRevealed) return;
    setIsRevealed(true);
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
    if (typeof onClaimReward === 'function') {
      onClaimReward({ ...reward, isScratched: true });
    }
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border-2 border-amber-500/30 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl text-white relative text-center">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/20 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Gift className="w-5 h-5 text-amber-400" />
            <h4 className="text-sm font-black text-white">Post-Order Mystery Reward</h4>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-300">
            Congratulations on your order! Scratch the golden card below to reveal your prize.
          </p>

          {/* Card Container */}
          <div className="relative w-full h-48 rounded-2xl bg-gradient-to-br from-amber-950 via-slate-950 to-slate-900 border-2 border-amber-400/40 flex flex-col items-center justify-center p-4 shadow-inner overflow-hidden">
            
            {/* Underlying Prize Content */}
            <div className="space-y-2 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-400 flex items-center justify-center mx-auto shadow-md">
                {reward.rewardType === 'coins' ? (
                  <Coins className="w-7 h-7" />
                ) : (
                  <Sparkles className="w-7 h-7" />
                )}
              </div>

              <h5 className="text-xl font-black text-amber-300">
                {reward.rewardType === 'coins'
                  ? `+${reward.coinsAmount || 35} Bazli Coins`
                  : `₹${reward.couponDiscount || 50} OFF Coupon`}
              </h5>

              {reward.couponCode && (
                <div className="flex items-center justify-center gap-1.5 pt-1">
                  <span className="font-mono font-black text-xs bg-slate-900 px-3 py-1 rounded-lg border border-amber-400/50 text-amber-300">
                    {reward.couponCode}
                  </span>
                  <button
                    onClick={() => handleCopyCoupon(reward.couponCode!)}
                    className="p-1.5 bg-amber-400 text-slate-950 font-bold rounded-lg cursor-pointer hover:bg-amber-300"
                    title="Copy code"
                  >
                    {copiedCoupon ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}

              <p className="text-[11px] text-slate-400">{reward.description}</p>
            </div>

            {/* Scratch Canvas Overlay */}
            {!isRevealed && (
              <canvas
                ref={canvasRef}
                width={280}
                height={180}
                onMouseDown={() => (isDrawing.current = true)}
                onMouseUp={() => (isDrawing.current = false)}
                onMouseMove={e => isDrawing.current && handleScratch(e)}
                onTouchMove={handleScratch}
                onClick={revealCard}
                className="absolute inset-0 w-full h-full cursor-pointer touch-none"
              />
            )}
          </div>

          {/* Instant 1-Click Reveal Button */}
          {!isRevealed ? (
            <button
              onClick={revealCard}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
            >
              Or tap here to reveal instantly ✨
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-2xl text-xs flex items-center justify-center space-x-1.5 shadow-lg cursor-pointer transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Claim & Continue Shopping</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
