import React, { useState, useEffect } from 'react';
import { Order, Seller } from '../../types';
import {
  ChefHat,
  Timer,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Volume2,
  VolumeX,
  Bell,
  Printer,
  Sparkles,
  ShoppingBag,
  Bike,
  ShieldCheck,
  CheckSquare,
  Square,
  ArrowRight,
  RefreshCw,
  Coffee
} from 'lucide-react';

interface KitchenDisplaySystemProps {
  orders: Order[];
  seller: Seller;
  onUpdateOrderStatus?: (orderId: string, status: string) => void;
  onVerifySellerPickup?: (orderId: string, code: string) => Promise<{ error?: string; success?: boolean }>;
}

export const KitchenDisplaySystem: React.FC<KitchenDisplaySystemProps> = ({
  orders,
  seller,
  onUpdateOrderStatus,
  onVerifySellerPickup
}) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [kitchenMode, setKitchenMode] = useState<'Normal' | 'Rush (+15m)' | 'Paused'>('Normal');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [filterStage, setFilterStage] = useState<'all' | 'new' | 'cooking' | 'ready'>('all');
  const [printedOrders, setPrintedOrders] = useState<Record<string, boolean>>({});

  // Filter orders relevant to this seller
  const sellerOrders = orders.filter(
    o =>
      o.sellerId === seller.id ||
      o.items.some(i => i.sellerId === seller.id || i.productName.toLowerCase().includes(seller.businessName.toLowerCase()))
  );

  // Play polite synthesized chime using Web Audio API
  const playKitchenChime = () => {
    try {
      const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime + 0.1);
      osc1.stop(ctx.currentTime + 0.6);
      osc2.stop(ctx.currentTime + 0.6);
    } catch {
      // Audio context might be restricted before user interaction
    }
  };

  const toggleItemCheck = (orderId: string, itemIdx: number) => {
    const key = `${orderId}-${itemIdx}`;
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrintKOT = (orderId: string) => {
    setPrintedOrders(prev => ({ ...prev, [orderId]: true }));
    // Simulate window print
    window.print();
  };

  // Classify order kitchen stage
  const getOrderStage = (order: Order): 'new' | 'cooking' | 'ready' | 'collected' => {
    if (order.sellerPickupConfirmed && order.deliveryPickupConfirmed) return 'collected';
    if (order.orderStatus === 'Delivered') return 'collected';
    if (order.orderStatus === 'Out for Delivery' || order.orderStatus === 'Picked Up') return 'ready';
    if (order.orderStatus === 'Preparing') return 'cooking';
    return 'new';
  };

  const filteredOrders = sellerOrders.filter(order => {
    if (filterStage === 'all') return true;
    const stage = getOrderStage(order);
    return stage === filterStage;
  });

  const activeKitchenCount = sellerOrders.filter(
    o => o.orderStatus !== 'Delivered' && !o.sellerPickupConfirmed
  ).length;

  return (
    <div className="space-y-4 font-sans">
      
      {/* Top KDS Control Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center text-xl shadow-inner">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base sm:text-lg text-white">
                Live Kitchen Display System (KDS)
              </h3>
              <span className="bg-orange-500/20 text-orange-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-orange-500/30 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" /> Real-time
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {seller.businessName} • Digital Ticket Queue for Chefs & Packaging Staff
            </p>
          </div>
        </div>

        {/* Action Controls & Throttle Mode */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Audio Chime Notification Toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playKitchenChime();
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              soundEnabled
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Toggle Order Sound Chime"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? 'Kitchen Bell: ON' : 'Bell: OFF'}</span>
          </button>

          {/* Test Sound Button */}
          <button
            onClick={playKitchenChime}
            className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 cursor-pointer"
            title="Test Chime Sound"
          >
            <Bell className="w-3.5 h-3.5" />
          </button>

          {/* Rush Hour Throttle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <span className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Pacing:
            </span>
            {(['Normal', 'Rush (+15m)', 'Paused'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setKitchenMode(mode)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  kitchenMode === mode
                    ? mode === 'Paused'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : mode.includes('Rush')
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Stage Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterStage('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
            filterStage === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          All Tickets ({sellerOrders.length})
        </button>

        <button
          onClick={() => setFilterStage('new')}
          className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
            filterStage === 'new'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>New Orders</span>
        </button>

        <button
          onClick={() => setFilterStage('cooking')}
          className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
            filterStage === 'cooking'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span>In Preparation / Oven</span>
        </button>

        <button
          onClick={() => setFilterStage('ready')}
          className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
            filterStage === 'ready'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Ready for Dispatch</span>
        </button>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Coffee className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-slate-800">Kitchen Counter Clear!</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No pending tickets in this stage. New orders placed by customers will automatically ring the kitchen bell and pop up here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOrders.map((order, idx) => {
            const stage = getOrderStage(order);
            const isReady = stage === 'ready' || stage === 'collected';
            const isCooking = stage === 'cooking';
            const allItemsChecked = order.items.every((_, i) => checkedItems[`${order.id}-${i}`]);

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl border transition-all shadow-sm overflow-hidden flex flex-col justify-between ${
                  isReady
                    ? 'border-emerald-300 ring-2 ring-emerald-400/20'
                    : isCooking
                    ? 'border-orange-300 ring-2 ring-orange-400/20'
                    : 'border-amber-300 ring-2 ring-amber-400/30'
                }`}
              >
                {/* Header Ticket Bar */}
                <div className={`p-3.5 px-4 text-xs font-bold flex items-center justify-between border-b ${
                  isReady
                    ? 'bg-emerald-50 text-emerald-950 border-emerald-100'
                    : isCooking
                    ? 'bg-orange-50 text-orange-950 border-orange-100'
                    : 'bg-amber-50 text-amber-950 border-amber-100'
                }`}>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-black">
                      #{order.id.slice(-6).toUpperCase()}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-white/80 border">
                      {stage === 'ready' ? 'Ready for Rider' : stage === 'cooking' ? 'Cooking' : 'New Order'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 text-[11px] font-mono">
                    <Timer className="w-3.5 h-3.5 text-slate-500" />
                    <span>Est. 12m</span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-3 flex-1">
                  
                  {/* Customer and Delivery Instructions */}
                  <div className="flex items-center justify-between text-xs text-slate-600 border-b border-slate-100 pb-2">
                    <div>
                      <span className="font-bold text-slate-900 block">{order.deliveryAddress?.fullName || 'Customer'}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{order.paymentMethod} • ₹{order.finalAmount}</span>
                    </div>
                    {order.deliveryInstructions && (
                      <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded-md border border-rose-200">
                        {order.deliveryInstructions}
                      </span>
                    )}
                  </div>

                  {/* Dish Checklist */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                      Kitchen Items ({order.items.length})
                    </span>

                    <div className="space-y-1.5">
                      {order.items.map((item, itemIdx) => {
                        const isChecked = !!checkedItems[`${order.id}-${itemIdx}`];

                        return (
                          <div
                            key={itemIdx}
                            onClick={() => toggleItemCheck(order.id, itemIdx)}
                            className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer select-none text-xs ${
                              isChecked
                                ? 'bg-emerald-50/70 border-emerald-300 text-slate-400 line-through'
                                : 'bg-slate-50 border-slate-200 text-slate-900 hover:bg-slate-100/80 font-medium'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5">
                              {isChecked ? (
                                <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-400 shrink-0" />
                              )}
                              <div>
                                <span className="font-bold block">{item.productName}</span>
                                <span className="text-[10px] text-slate-500">{item.unitQuantity}</span>
                              </div>
                            </div>

                            <span className="font-black text-xs font-mono bg-white px-2 py-0.5 rounded-md border border-slate-200 shrink-0 text-slate-800">
                              QTY: {item.quantity}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Rider Handover OTP Banner if assigned */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-center justify-between text-xs text-amber-950">
                    <div className="flex items-center space-x-2">
                      <Bike className="w-4 h-4 text-amber-700 shrink-0" />
                      <div>
                        <span className="font-bold block">Assigned Rider: {order.deliveryPartnerName}</span>
                        <span className="text-[10px] text-amber-700">Verify 4-digit code on arrival</span>
                      </div>
                    </div>
                    <span className="font-black font-mono text-sm bg-white px-2 py-0.5 rounded-md border border-amber-300">
                      {order.sellerHandoverCode || order.deliveryOtp || '8492'}
                    </span>
                  </div>

                </div>

                {/* Footer Action Buttons */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handlePrintKOT(order.id)}
                    className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    title="Print Kitchen Order Ticket (KOT)"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{printedOrders[order.id] ? 'KOT Printed' : 'Print KOT'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {stage === 'new' && (
                      <>
                        <button
                          onClick={() => {
                            if (onUpdateOrderStatus && confirm(`Decline Order #${order.id}?`)) {
                              onUpdateOrderStatus(order.id, 'Cancelled');
                            }
                          }}
                          className="px-2.5 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => {
                            if (onUpdateOrderStatus) onUpdateOrderStatus(order.id, 'Preparing');
                          }}
                          className="px-3.5 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer shadow-sm transition-all"
                        >
                          <Flame className="w-3.5 h-3.5" />
                          <span>Accept & Cook</span>
                        </button>
                      </>
                    )}

                    {stage === 'cooking' && (
                      <button
                        onClick={() => {
                          if (onUpdateOrderStatus) onUpdateOrderStatus(order.id, 'Picked Up');
                        }}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer shadow-sm transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Food Ready 📦</span>
                      </button>
                    )}

                    {isReady && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                        Ready for Pickup
                      </span>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
