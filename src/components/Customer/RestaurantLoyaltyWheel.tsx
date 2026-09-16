import React, { useState } from 'react';
import {
  Utensils,
  Award,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Gift,
  Flame,
  ChevronRight,
  Info,
  History,
  PartyPopper,
  Zap,
  Plus
} from 'lucide-react';
import { Order } from '../../types';
import { getRestaurantLoyaltyProgress, RestaurantLoyaltyProgress } from '../../utils/restaurantLoyalty';

interface RestaurantLoyaltyWheelProps {
  sellerId: string;
  restaurantName: string;
  orders: Order[];
  onApplyFreeReward?: (maxDiscount: number) => void;
  onSimulateOrder?: (sellerId: string, restaurantName: string) => void;
  isCompact?: boolean;
}

export const RestaurantLoyaltyWheel: React.FC<RestaurantLoyaltyWheelProps> = ({
  sellerId,
  restaurantName,
  orders,
  onApplyFreeReward,
  onSimulateOrder,
  isCompact = false
}) => {
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showInfoPopover, setShowInfoPopover] = useState(false);

  // Compute live progress from orders
  const loyaltyProgress: RestaurantLoyaltyProgress = getRestaurantLoyaltyProgress(
    orders,
    sellerId,
    restaurantName
  );

  const {
    currentCycleStamps,
    cycleNumber,
    isRewardUnlocked,
    freeFeastMaxAmount,
    ordersNeeded,
    qualifyingOrders
  } = loyaltyProgress;

  // Circular calculations: 7 stamp nodes placed at angles around 360 degrees
  // Angle starting from top (-90deg)
  const totalStamps = 7;
  const radius = 88; // radius for circular nodes
  const centerCoord = 110; // center X, Y

  const stampNodes = Array.from({ length: totalStamps }, (_, idx) => {
    const stampIndex = idx + 1; // 1 to 7
    // Calculate angle in radians. Start at top (-90 deg = -PI/2)
    const angle = (idx * (360 / totalStamps) - 90) * (Math.PI / 180);
    const x = centerCoord + radius * Math.cos(angle);
    const y = centerCoord + radius * Math.sin(angle);

    const isCompleted = stampIndex <= currentCycleStamps;
    const isNext = stampIndex === currentCycleStamps + 1 && !isRewardUnlocked;

    return {
      stampIndex,
      x,
      y,
      isCompleted,
      isNext
    };
  });

  // Calculate SVG circular progress arc
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentCycleStamps / totalStamps) * circumference;

  // COMPACT VIEW (For Restaurant Directory Card)
  if (isCompact) {
    return (
      <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50/80 border border-amber-200/80 rounded-2xl px-3 py-1.5 shadow-2xs">
        <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
          <svg className="w-8 h-8 -rotate-90 transform" viewBox="0 0 36 36">
            <path
              className="text-amber-200"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={isRewardUnlocked ? 'text-emerald-500' : 'text-orange-500'}
              strokeDasharray="100, 100"
              strokeDashoffset={100 - (currentCycleStamps / 7) * 100}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="absolute font-black text-[10px] text-stone-900">
            {isRewardUnlocked ? '🎁' : `${currentCycleStamps}/7`}
          </span>
        </div>

        <div className="min-w-0 text-left">
          {isRewardUnlocked ? (
            <p className="text-[11px] font-black text-emerald-700 leading-tight">
              🎉 8th Order FREE (₹499)!
            </p>
          ) : (
            <p className="text-[11px] font-bold text-stone-800 leading-tight truncate">
              {currentCycleStamps}/7 Orders Done{' '}
              <span className="text-orange-600 font-extrabold">(8th FREE ₹499)</span>
            </p>
          )}
          <p className="text-[9px] text-stone-500 font-medium">
            {isRewardUnlocked ? 'Claim on this order' : `Order ≥ ₹200 to earn stamps • Cycle ${cycleNumber}`}
          </p>
        </div>
      </div>
    );
  }

  // FULL CIRCULAR WIDGET (For Restaurant Menu & Customer Dashboard)
  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#1c140d] via-[#2a1a0f] to-[#120b06] border-2 border-amber-500/50 p-4 sm:p-6 text-white shadow-xl relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-amber-500/20 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-stone-950 font-black shadow-md shadow-amber-500/20 shrink-0">
            <Flame className="w-5 h-5 fill-stone-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                {restaurantName} Loyalty Wheel
              </h3>
              <span className="bg-amber-400/20 text-amber-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-amber-400/30">
                Cycle #{cycleNumber}
              </span>
            </div>
            <p className="text-xs text-amber-200/80 font-medium mt-0.5">
              7 Orders of ₹200+ = <strong className="text-emerald-400">8th Order FREE up to ₹499</strong>!
            </p>
          </div>
        </div>

        {/* Quick Badges & Controls */}
        <div className="flex items-center gap-2">
          {qualifyingOrders.length > 0 && (
            <button
              type="button"
              onClick={() => setShowHistoryModal(true)}
              className="text-[11px] bg-white/10 hover:bg-white/20 text-stone-200 font-bold px-3 py-1.5 rounded-xl border border-white/15 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>{qualifyingOrders.length} Orders Log</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowInfoPopover(!showInfoPopover)}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 flex items-center justify-center border border-white/15 transition-all cursor-pointer"
            title="How it works"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info Popover Drawer / Helper */}
      {showInfoPopover && (
        <div className="mt-3 p-3.5 rounded-2xl bg-black/60 border border-amber-400/30 text-xs text-stone-200 space-y-2 relative z-10 animate-in fade-in">
          <div className="flex items-center justify-between font-bold text-amber-300">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Circular 7-Order Loyalty Rules:
            </span>
            <button
              type="button"
              onClick={() => setShowInfoPopover(false)}
              className="text-stone-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>
          <ul className="space-y-1 text-[11px] text-stone-300 list-disc list-inside">
            <li>Place an order of <strong>₹200 or above</strong> from <strong>{restaurantName}</strong> to light up 1 circular stamp.</li>
            <li>Complete <strong>7 stamps</strong> around the circular wheel.</li>
            <li>Your <strong>8th order</strong> from this restaurant will be <strong>100% FREE up to ₹499</strong>!</li>
            <li>Once completed, the circle automatically <strong>renews back to 0/7</strong> for the next round of 7 orders!</li>
          </ul>
        </div>
      )}

      {/* Main Content Area: Circular Wheel + Status Panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-5 relative z-10">
        
        {/* Left / Center: Interactive SVG Circular Stamp Wheel */}
        <div className="md:col-span-6 flex flex-col items-center justify-center">
          <div className="relative w-[220px] h-[220px] sm:w-[240px] sm:h-[240px] flex items-center justify-center select-none">
            
            {/* SVG Progress Ring */}
            <svg
              className="w-full h-full -rotate-90 transform overflow-visible"
              viewBox="0 0 220 220"
            >
              {/* Background Track Circle */}
              <circle
                cx={centerCoord}
                cy={centerCoord}
                r={radius}
                className="text-stone-800"
                strokeWidth="6"
                stroke="currentColor"
                strokeDasharray="4 6"
                fill="none"
              />

              {/* Active Progress Arc */}
              <circle
                cx={centerCoord}
                cy={centerCoord}
                r={radius}
                className={isRewardUnlocked ? 'text-emerald-500' : 'text-amber-500'}
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>

            {/* 7 Radial Stamp Nodes placed in circular formation */}
            {stampNodes.map(node => {
              const isRewardStamp = node.stampIndex === 7;

              return (
                <div
                  key={node.stampIndex}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
                  style={{
                    left: `${(node.x / 220) * 100}%`,
                    top: `${(node.y / 220) * 100}%`
                  }}
                >
                  <div
                    className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                      node.isCompleted
                        ? isRewardStamp
                          ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-stone-950 shadow-lg shadow-emerald-500/50 ring-2 ring-emerald-300 scale-110'
                          : 'bg-gradient-to-tr from-amber-400 to-orange-500 text-stone-950 shadow-md shadow-amber-500/40 ring-2 ring-amber-300'
                        : node.isNext
                        ? 'bg-stone-800 text-amber-300 border-2 border-amber-400 animate-pulse shadow-sm shadow-amber-400/30 ring-2 ring-amber-400/40 scale-105'
                        : 'bg-stone-900/90 text-stone-500 border border-stone-700'
                    }`}
                  >
                    {node.isCompleted ? (
                      isRewardStamp ? (
                        <Gift className="w-4 h-4 fill-stone-950" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 fill-stone-950 text-amber-400" />
                      )
                    ) : (
                      <span>{node.stampIndex}</span>
                    )}

                    {/* Mini Stamp Label */}
                    <span
                      className={`absolute -bottom-4 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-[8px] font-black uppercase tracking-wider ${
                        node.isCompleted
                          ? 'text-amber-300'
                          : node.isNext
                          ? 'text-orange-400 font-extrabold'
                          : 'text-stone-600'
                      }`}
                    >
                      {node.isCompleted ? 'Done' : node.isNext ? 'Next' : `#${node.stampIndex}`}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Central Wheel Hub Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-stone-950/90 border-2 border-amber-400/40 flex flex-col items-center justify-center shadow-inner p-2">
                {isRewardUnlocked ? (
                  <div className="flex flex-col items-center text-emerald-400 animate-bounce">
                    <PartyPopper className="w-6 h-6 text-amber-300" />
                    <span className="font-black text-xs sm:text-sm text-white mt-0.5">8th Order</span>
                    <span className="text-[10px] font-extrabold text-emerald-400 uppercase">100% FREE</span>
                  </div>
                ) : (
                  <>
                    <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono leading-none">
                      {currentCycleStamps}<span className="text-xs sm:text-sm text-stone-400">/7</span>
                    </span>
                    <span className="text-[9px] font-bold text-stone-300 uppercase tracking-wider mt-1">
                      Orders Done
                    </span>
                    <span className="text-[8px] text-amber-300/80 font-medium">
                      (≥ ₹200 each)
                    </span>
                  </>
                )}
              </div>
            </div>

          </div>

          <div className="mt-4 text-center">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-stone-400 bg-black/40 px-3 py-1 rounded-full border border-white/10">
              <RefreshCw className="w-3 h-3 text-amber-400 animate-spin-slow" />
              Circle automatically renews after 7 orders
            </span>
          </div>
        </div>

        {/* Right Side: Status, Rewards & Action Panel */}
        <div className="md:col-span-6 space-y-4">
          
          {/* Main Status Callout */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isRewardUnlocked
              ? 'bg-gradient-to-r from-emerald-950/80 via-teal-950/60 to-stone-900 border-emerald-400 shadow-lg shadow-emerald-500/20'
              : 'bg-stone-900/80 border-amber-500/30'
          }`}>
            {isRewardUnlocked ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500 text-stone-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                    🎉 Reward Unlocked!
                  </span>
                  <span className="text-xs font-bold text-emerald-300">
                    8th Order From {restaurantName}
                  </span>
                </div>

                <h4 className="font-black text-lg sm:text-xl text-white">
                  Get ₹499 FREE Food Feast!
                </h4>

                <p className="text-xs text-stone-300 leading-relaxed">
                  Congratulations! You placed 7 orders of ₹200+ from {restaurantName}. Your 8th order receives up to <strong>₹499 discount (100% FREE)</strong>!
                </p>

                {onApplyFreeReward && (
                  <button
                    type="button"
                    onClick={() => onApplyFreeReward(freeFeastMaxAmount)}
                    className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300 hover:from-emerald-300 hover:to-teal-300 text-stone-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Gift className="w-4 h-4 fill-stone-950" />
                    <span>Apply ₹499 Free Feast to Cart</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Target: {ordersNeeded} More Orders to Unlock
                  </span>
                  <span className="text-[11px] font-mono text-stone-400 font-bold">
                    {Math.round((currentCycleStamps / 7) * 100)}% Complete
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-stone-950 h-2.5 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(currentCycleStamps / 7) * 100}%` }}
                  />
                </div>

                <div className="flex items-start gap-2 pt-1 text-xs text-stone-300">
                  <Award className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p>
                    Every order above <strong>₹200</strong> from {restaurantName} adds 1 stamp. Reach 7 stamps to unlock <strong>₹499 FREE food</strong>!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Test / Simulation Helper Controls */}
          {onSimulateOrder && (
            <div className="p-3 bg-stone-950/60 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-stone-400 font-medium">
                ⚡ Testing & Demo Simulator:
              </span>
              <button
                type="button"
                onClick={() => onSimulateOrder(sellerId, restaurantName)}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Simulate ₹200+ Order (+1 Stamp)</span>
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Qualifying Orders History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#fcfaf6] border border-[#ded2bc] text-stone-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            
            <div className="p-4 sm:p-5 bg-[#521308] text-white flex items-center justify-between border-b border-[#6e190b]">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-amber-400" />
                <div>
                  <h4 className="font-black text-base">
                    {restaurantName} — Qualifying Orders
                  </h4>
                  <p className="text-xs text-orange-200">
                    {qualifyingOrders.length} orders of ₹200+ logged (Cycle #{cycleNumber})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-2.5">
              {qualifyingOrders.map((order, idx) => (
                <div
                  key={order.id || idx}
                  className="p-3 bg-white rounded-2xl border border-stone-200 flex items-center justify-between shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center">
                      #{idx + 1}
                    </div>
                    <div>
                      <h5 className="font-bold text-xs sm:text-sm text-stone-900">
                        Order #{order.id}
                      </h5>
                      <p className="text-[11px] text-stone-500">
                        {order.items?.length || 1} items • Status: {order.orderStatus}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-sm text-stone-900 font-mono">
                      ₹{order.finalAmount || order.subtotal}
                    </span>
                    <span className="block text-[10px] text-emerald-600 font-bold">
                      ✅ Stamp Counted
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs">
              <span className="text-stone-600 font-medium">
                Rule: 7 Orders of ₹200+ → 8th Order FREE (₹499)
              </span>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 font-bold rounded-xl text-stone-800 cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
