import React, { useState } from 'react';
import {
  Bike,
  Award,
  Zap,
  TrendingUp,
  CloudRain,
  Flame,
  CheckCircle2,
  Gift,
  DollarSign,
  Heart,
  ShieldCheck,
  ArrowRight,
  Clock
} from 'lucide-react';
import { DeliveryPartner, Order } from '../../types';

interface RiderMilestoneHubProps {
  partner: DeliveryPartner;
  orders: Order[];
}

export const RiderMilestoneHub: React.FC<RiderMilestoneHubProps> = ({
  partner,
  orders
}) => {
  // Count today's delivered orders by this partner
  const todayDeliveredCount = orders.filter(
    o => o.deliveryPartnerId === partner.id && o.orderStatus === 'Delivered'
  ).length;

  const MILESTONES = [
    { level: 1, target: 5, bonus: 60, title: 'Starter Booster', rewardTag: '⚡ +₹60 Bonus' },
    { level: 2, target: 10, bonus: 180, title: 'Pro Rider Quest', rewardTag: '🔥 +₹180 Bonus' },
    { level: 3, target: 15, bonus: 350, title: 'Fleet Champion', rewardTag: '👑 +₹350 + Fuel Pass' },
  ];

  const currentLevel = MILESTONES.find(m => todayDeliveredCount < m.target) || MILESTONES[2];
  const nextTarget = currentLevel.target;
  const progressPercent = Math.min(100, Math.round((todayDeliveredCount / nextTarget) * 100));

  return (
    <div className="space-y-5 my-6">
      
      {/* 1. Rider Milestone & Daily Target Quest Card */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-950 via-[#161233] to-[#0d1c2e] border-2 border-indigo-500/70 p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                <Award className="w-3.5 h-3.5 fill-current" />
                DAILY MILESTONE QUEST
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {todayDeliveredCount} / {nextTarget} Orders Completed Today
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-white">
              Deliver {Math.max(0, nextTarget - todayDeliveredCount)} more orders to unlock <span className="text-amber-400">{currentLevel.rewardTag}</span>!
            </h3>
            <p className="text-xs text-stone-300">
              Complete daily order milestones to boost your daily earnings up to <strong>₹1,200 - ₹1,800/day</strong>.
            </p>
          </div>

          <div className="shrink-0 bg-black/40 border border-white/10 p-3 rounded-2xl text-center min-w-[140px]">
            <span className="text-[10px] uppercase text-stone-400 font-bold block">Today's Milestone Pay</span>
            <span className="text-xl font-black text-emerald-400 font-mono">
              +₹{MILESTONES.filter(m => todayDeliveredCount >= m.target).reduce((acc, m) => acc + m.bonus, 0)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-stone-300">
            <span>Progress: {todayDeliveredCount} Deliveries</span>
            <span>{progressPercent}% towards Level {currentLevel.level}</span>
          </div>
          <div className="w-full h-3 bg-stone-900 rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Milestones Steps */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {MILESTONES.map(m => {
            const isCompleted = todayDeliveredCount >= m.target;
            return (
              <div
                key={m.level}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  isCompleted
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                    : 'bg-black/30 border-white/10 text-stone-400'
                }`}
              >
                <div className="text-[10px] font-bold uppercase">{m.title}</div>
                <div className="text-xs font-black text-white mt-0.5">{m.target} Orders</div>
                <div className={`text-[10px] font-bold mt-0.5 ${isCompleted ? 'text-emerald-400 font-black' : 'text-amber-400'}`}>
                  {isCompleted ? '✅ Claimed' : m.rewardTag}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Three Rider Benefits Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* Rain Surge Booster */}
        <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-amber-950 space-y-1">
          <div className="flex items-center space-x-2">
            <CloudRain className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-black uppercase text-amber-800">Rain & Peak Surge</span>
          </div>
          <p className="text-xs font-bold text-amber-900">
            +₹35 Extra per delivery during rain & rush hours automatically added to your wallet.
          </p>
        </div>

        {/* 100% Tips */}
        <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl text-rose-950 space-y-1">
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4 text-rose-600 fill-current" />
            <span className="text-xs font-black uppercase text-rose-800">100% Direct Tips</span>
          </div>
          <p className="text-xs font-bold text-rose-900">
            Zero company commission on tips. 100% of customer tips are credited directly to your passbook.
          </p>
        </div>

        {/* Weekly Petrol / EV Allowance */}
        <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-emerald-950 space-y-1">
          <div className="flex items-center space-x-2">
            <Bike className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-black uppercase text-emerald-800">Fuel / EV Reward</span>
          </div>
          <p className="text-xs font-bold text-emerald-900">
            Complete 70 deliveries/week to earn a flat ₹600 Petrol / EV charging fuel allowance.
          </p>
        </div>

      </div>

    </div>
  );
};
