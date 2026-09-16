import React, { useState } from 'react';
import { Order, DeliveryPartner, DispatchPingPayload } from '../../types';
import { rankRidersForOrder, createDispatchPing } from '../../utils/dispatchEngine';
import {
  Bike,
  Zap,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Radio,
  BatteryCharging,
  TrendingUp,
  Clock,
  Send,
  Navigation,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  Sparkles,
  Users
} from 'lucide-react';

interface AdminFleetRadarMatrixProps {
  orders: Order[];
  partners: DeliveryPartner[];
  onAssignOrder: (orderId: string, partnerId: string, partnerName: string) => void;
  onSendDispatchPing?: (ping: DispatchPingPayload) => void;
}

export const AdminFleetRadarMatrix: React.FC<AdminFleetRadarMatrixProps> = ({
  orders,
  partners,
  onAssignOrder,
  onSendDispatchPing
}) => {
  const [selectedZone, setSelectedZone] = useState<string>('All');
  const [activeDispatchOrder, setActiveDispatchOrder] = useState<Order | null>(null);
  const [dispatchStatusMsg, setDispatchStatusMsg] = useState<string | null>(null);

  const pendingOrders = orders.filter(
    o => (!o.deliveryPartnerId || o.orderStatus === 'Confirmed' || o.orderStatus === 'Preparing') &&
      o.orderStatus !== 'Delivered' &&
      o.orderStatus !== 'Cancelled'
  );

  const onlinePartners = partners.filter(
    p => p.currentStatus !== 'Offline' && p.verificationStatus === 'Verified'
  );

  const filteredPartners = selectedZone === 'All'
    ? partners
    : partners.filter(p => p.operatingZoneId === selectedZone || (p.operatingZoneName && p.operatingZoneName.includes(selectedZone)));

  const handleAutoDispatch = (order: Order) => {
    const rankings = rankRidersForOrder(order, partners);
    if (rankings.length === 0) {
      setDispatchStatusMsg(`⚠️ No online delivery partners found in duty zones for Order #${order.id}`);
      setTimeout(() => setDispatchStatusMsg(null), 4000);
      return;
    }

    const topCandidate = rankings[0];
    const ping = createDispatchPing(order, topCandidate.partner, 1, topCandidate.matchScore);

    if (onSendDispatchPing) {
      onSendDispatchPing(ping);
      setDispatchStatusMsg(`📡 Radar Ping dispatched to Top Match: ${topCandidate.partner.name} (${topCandidate.matchScore}% algorithm score)`);
    } else {
      onAssignOrder(order.id, topCandidate.partner.id, `${topCandidate.partner.name} (${topCandidate.partner.vehicleType})`);
      setDispatchStatusMsg(`✅ Order #${order.id} auto-assigned to ${topCandidate.partner.name} (${topCandidate.distanceKm} km away)`);
    }

    setTimeout(() => setDispatchStatusMsg(null), 4500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Fleet KPI Stats */}
      <div className="bg-gradient-to-r from-slate-950 via-sky-950 to-slate-900 text-white p-6 rounded-3xl border border-sky-800/40 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                Live Hyperlocal Radar Active
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
              <Radio className="w-6 h-6 text-sky-400" /> Multi-Rider Priority Dispatch Engine
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl mt-0.5">
              Real-time distance ranking, dark store proximity scoring, and automated 30-second radar escalation.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="bg-slate-900/80 border border-sky-500/30 px-4 py-2.5 rounded-2xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-black block">Active Fleet</span>
              <span className="text-xl font-black text-emerald-400">{onlinePartners.length} / {partners.length} Online</span>
            </div>

            <div className="bg-slate-900/80 border border-amber-500/30 px-4 py-2.5 rounded-2xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-black block">Pending Queue</span>
              <span className="text-xl font-black text-amber-300">{pendingOrders.length} Orders</span>
            </div>
          </div>
        </div>
      </div>

      {dispatchStatusMsg && (
        <div className="bg-emerald-950/90 text-emerald-200 border border-emerald-500/50 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg animate-in fade-in">
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          <span>{dispatchStatusMsg}</span>
        </div>
      )}

      {/* Grid: Left Column: Visual Zone Fleet Radar, Right Column: Priority Dispatch Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Visual Radar & Zone Fleet (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-sky-600" /> Active Fleet Live Radar Coordinates
              </h4>
              <p className="text-[11px] text-slate-400">
                GPS proximity to Central Dark Store & Merchant Kitchens
              </p>
            </div>

            {/* Zone Selector */}
            <div className="flex items-center space-x-1 text-xs">
              {['All', 'zone-a', 'zone-b'].map(zone => (
                <button
                  key={zone}
                  onClick={() => setSelectedZone(zone)}
                  className={`px-3 py-1 rounded-xl font-bold cursor-pointer transition-all ${
                    selectedZone === zone
                      ? 'bg-sky-900 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {zone === 'All' ? 'All Zones' : zone === 'zone-a' ? 'Central Zone A' : 'Suburbs Zone B'}
                </button>
              ))}
            </div>
          </div>

          {/* Visual Radar Mock Canvas Display */}
          <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 rounded-2xl p-6 border border-slate-800 text-white overflow-hidden min-h-[260px] flex items-center justify-center">
            {/* Radar concentric circles */}
            <div className="absolute w-72 h-72 rounded-full border border-sky-500/20 pointer-events-none" />
            <div className="absolute w-52 h-52 rounded-full border border-sky-500/30 pointer-events-none" />
            <div className="absolute w-32 h-32 rounded-full border border-sky-500/40 pointer-events-none" />
            <div className="absolute w-12 h-12 rounded-full border border-sky-500/60 bg-sky-500/10 pointer-events-none" />

            {/* Center Dark Store Hub Pin */}
            <div className="absolute flex flex-col items-center pointer-events-none z-10">
              <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs shadow-lg shadow-amber-400/50 animate-pulse">
                🏪
              </div>
              <span className="text-[9px] font-black text-amber-300 bg-slate-950/80 px-1.5 py-0.2 rounded mt-1 border border-amber-400/30">
                BAZLI HUB
              </span>
            </div>

            {/* Render Partner Radar Pins based on distance */}
            {filteredPartners.map((p, idx) => {
              const dist = p.currentDistanceToHubKm ?? (0.5 + idx * 0.8);
              // Scatter positions based on index
              const positions = [
                { top: '22%', left: '28%' },
                { top: '35%', left: '72%' },
                { top: '70%', left: '30%' },
                { top: '78%', left: '75%' }
              ];
              const pos = positions[idx % positions.length];
              const isOnline = p.currentStatus !== 'Offline';

              return (
                <div
                  key={p.id}
                  style={{ top: pos.top, left: pos.left }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-20"
                >
                  <div className={`relative p-2 rounded-2xl border transition-all ${
                    isOnline
                      ? 'bg-slate-900/90 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/30 group-hover:scale-110'
                      : 'bg-slate-900/50 border-slate-700 text-slate-500'
                  }`}>
                    <Bike className="w-4 h-4" />
                    {isOnline && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    )}
                  </div>

                  <div className="bg-slate-950/90 border border-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md mt-1 shadow-lg text-center whitespace-nowrap">
                    <span className="text-white">{p.name.split(' ')[0]}</span>
                    <span className="text-amber-300 font-mono ml-1">({dist} km)</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Partner Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {filteredPartners.map(p => (
              <div
                key={p.id}
                className="bg-slate-50 hover:bg-slate-100/80 p-3.5 rounded-2xl border border-slate-200 text-xs transition-colors space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                      <Bike className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-900">{p.name}</div>
                      <div className="text-[10px] text-slate-500">{p.vehicleType} • {p.phone}</div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    p.currentStatus === 'On Duty'
                      ? 'bg-emerald-100 text-emerald-800'
                      : p.currentStatus === 'Available'
                      ? 'bg-sky-100 text-sky-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {p.currentStatus}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] bg-white p-2 rounded-xl border border-slate-200/70 font-medium">
                  <div>
                    <span className="text-slate-400 block">Proximity</span>
                    <strong className="text-slate-900">{p.currentDistanceToHubKm ?? 1.2} km</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Active Bag</span>
                    <strong className="text-slate-900">{p.activeLoadCount ?? 0} Orders</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Rating</span>
                    <strong className="text-amber-600">⭐ {p.rating || 4.9}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Priority Dispatch Queue & Auto-Assign (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500 fill-current" /> Live Priority Dispatch Queue
              </h4>
              <p className="text-[11px] text-slate-400">
                Algorithm-ranked candidate matching for incoming orders
              </p>
            </div>

            <span className="bg-amber-100 text-amber-900 text-xs font-black px-2.5 py-0.5 rounded-full">
              {pendingOrders.length} Pending
            </span>
          </div>

          {pendingOrders.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h5 className="font-bold text-slate-800 text-xs">All Orders Dispatched</h5>
              <p className="text-[11px] text-slate-400">
                No unassigned orders in the priority queue. New orders will trigger automatic radar matching!
              </p>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto max-h-[600px] pr-1">
              {pendingOrders.map(order => {
                const candidates = rankRidersForOrder(order, partners);
                const topCandidate = candidates[0];

                return (
                  <div
                    key={order.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-sky-300 transition-colors shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-black text-slate-900 text-xs">Order #{order.id}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.2 rounded font-bold">
                            ₹{order.finalAmount}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate max-w-[200px]">
                          {order.deliveryAddress.street}, {order.deliveryAddress.city}
                        </p>
                      </div>

                      <span className="text-[10px] font-extrabold bg-sky-50 text-sky-800 px-2 py-0.5 rounded-full border border-sky-200">
                        {order.orderStatus}
                      </span>
                    </div>

                    {/* Top Algorithm Recommendation */}
                    {topCandidate && (
                      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/50 p-3 rounded-xl border border-emerald-200 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-emerald-800 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-500" /> Top Match ({topCandidate.matchScore}% Score)
                          </span>
                          <span className="text-[10px] font-bold text-slate-600">
                            {topCandidate.distanceKm} km away
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <strong className="text-slate-900 text-xs">
                            {topCandidate.partner.name} ({topCandidate.partner.vehicleType})
                          </strong>
                          <span className="text-[10px] text-emerald-700 font-bold">
                            {topCandidate.activeLoad === 0 ? '0 active (Idle)' : `${topCandidate.activeLoad} order load`}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-500 italic">
                          Reason: {topCandidate.reason}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleAutoDispatch(order)}
                        className="flex-1 px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>Radar Auto-Dispatch</span>
                      </button>

                      {/* Manual Assignment dropdown */}
                      <select
                        onChange={e => {
                          const p = partners.find(part => part.id === e.target.value);
                          if (p) {
                            onAssignOrder(order.id, p.id, `${p.name} (${p.vehicleType})`);
                            setDispatchStatusMsg(`✅ Order #${order.id} manually assigned to ${p.name}`);
                            setTimeout(() => setDispatchStatusMsg(null), 4000);
                          }
                        }}
                        defaultValue=""
                        className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-xl border border-slate-200 cursor-pointer focus:outline-none"
                      >
                        <option value="" disabled>Manual ▾</option>
                        {partners.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.currentDistanceToHubKm ?? 1.2} km)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
