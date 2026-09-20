import React, { useState, useEffect, useRef } from 'react';
import { Order, OrderStatus, OrderReview } from '../types';
import {
  X,
  MapPin,
  Bike,
  ShieldCheck,
  Phone,
  MessageSquare,
  Clock,
  CheckCircle2,
  Package,
  Store,
  Navigation,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Play,
  Pause,
  FastForward,
  Zap,
  Radio,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  PhoneCall,
  PhoneOff,
  Mic,
  Volume2,
  Star,
  Gift
} from 'lucide-react';
import { OrderReviewModal } from './Customer/OrderReviewModal';
import { RiderChatModal } from './Customer/RiderChatModal';
import { openWhatsAppOrderInvoice } from '../utils/whatsappNotification';
import { useLanguage } from '../utils/translations';

interface LiveOrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onUpdateOrderStatus?: (orderId: string, status: string, otp?: string) => void;
  onSubmitOrderReview?: (orderId: string, review: OrderReview) => void;
}

// 6 Waypoints for the simulated delivery path on the SVG canvas
const ROUTE_WAYPOINTS = [
  { x: 75, y: 75, name: 'Bazli Dark Store #4', label: 'Store Hub' },
  { x: 160, y: 110, name: 'Main Sector 14 Crossing', label: 'Main Road' },
  { x: 260, y: 80, name: 'Metro Flyover Junction', label: 'Flyover' },
  { x: 330, y: 160, name: 'Central Park Avenue', label: 'Parkway' },
  { x: 420, y: 180, name: 'Greenwood Colony Gate', label: 'Colony Entry' },
  { x: 510, y: 220, name: 'Customer Residence (Destination)', label: 'Home' }
];

export const LiveOrderTrackingModal: React.FC<LiveOrderTrackingModalProps> = ({
  isOpen,
  onClose,
  order,
  onUpdateOrderStatus,
  onSubmitOrderReview
}) => {
  // Real-time rider simulation state
  const [progress, setProgress] = useState<number>(0.35); // 0 to 1
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1); // 1x, 2x, 4x
  const [copiedOtp, setCopiedOtp] = useState<boolean>(false);
  const [showItemsList, setShowItemsList] = useState<boolean>(false);

  // Modals & Overlays
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);
  const { language, t } = useLanguage();

  // Real Mobile GPS Telemetry State
  const [realGpsData, setRealGpsData] = useState<{
    lat: number;
    lng: number;
    speed?: number;
    heading?: number;
    accuracy?: number;
    updatedAt: number;
  } | null>(null);
  const [isGpsActive, setIsGpsActive] = useState<boolean>(false);
  const [gpsStatusText, setGpsStatusText] = useState<string>('Connecting to Satellite GPS...');

  // Call simulation overlay state
  const [isCallActive, setIsCallActive] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(true);

  // Poll real GPS location from server
  useEffect(() => {
    if (!isOpen || !order) return;

    const fetchLiveGps = async () => {
      try {
        const res = await fetch(`/api/delivery/live-location/${order.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.location && Date.now() - data.location.updatedAt < 120000) {
            setRealGpsData(data.location);
            setIsGpsActive(true);
            setGpsStatusText(`Live GPS Lat ${data.location.lat.toFixed(4)}, Lng ${data.location.lng.toFixed(4)} (±${data.location.accuracy || 4}m)`);
          }
        }
      } catch (e) {
        // quiet fallback
      }
    };

    fetchLiveGps();
    const gpsInterval = setInterval(fetchLiveGps, 3000);
    return () => clearInterval(gpsInterval);
  }, [isOpen, order?.id]);

  // Function to broadcast live device GPS coordinates or simulate instant GPS ping
  const handleBroadcastCurrentGps = async () => {
    if (!order) return;
    setGpsStatusText('Acquiring Satellite GPS Fix...');

    const sendCoords = async (latitude: number, longitude: number, speed = 32, heading = 45) => {
      try {
        const res = await fetch('/api/delivery/broadcast-location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            partnerId: order.deliveryPartnerName || 'partner-express-1',
            partnerName: order.deliveryPartnerName || 'Bazli Rider',
            lat: latitude,
            lng: longitude,
            speed,
            heading,
            accuracy: 4,
            status: 'Out for Delivery'
          })
        });
        if (res.ok) {
          const result = await res.json();
          setRealGpsData(result.data);
          setIsGpsActive(true);
          setGpsStatusText(`Satellite Lock: ${latitude.toFixed(4)}, ${longitude.toFixed(4)} • Live`);
        }
      } catch (err) {
        console.warn('GPS Broadcast error:', err);
      }
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          sendCoords(pos.coords.latitude, pos.coords.longitude, pos.coords.speed || 30, pos.coords.heading || 0);
        },
        () => {
          // If browser denies permission (common in iframe/dev sandbox), use realistic Delhi-NCR coordinates
          const simLat = 28.5355 + (Math.random() - 0.5) * 0.01;
          const simLng = 77.3910 + (Math.random() - 0.5) * 0.01;
          sendCoords(simLat, simLng, 34, 120);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      const simLat = 28.5355;
      const simLng = 77.3910;
      sendCoords(simLat, simLng, 32, 90);
    }
  };

  // Reset progress when order changes or opens
  useEffect(() => {
    if (isOpen && order) {
      if (order.orderStatus === 'Delivered') {
        setProgress(1);
        setIsSimulating(false);
      } else {
        setProgress(0.35);
        setIsSimulating(true);
      }
    }
  }, [isOpen, order?.id, order?.orderStatus]);

  // Auto-progress animation timer
  useEffect(() => {
    if (!isOpen || !order || !isSimulating) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 1) {
          setIsSimulating(false);
          // Trigger order delivered status update
          if (onUpdateOrderStatus && order.orderStatus !== 'Delivered') {
            onUpdateOrderStatus(order.id, 'Delivered', order.deliveryOtp);
          }
          // Trigger review modal with slight delay
          setTimeout(() => {
            setIsReviewOpen(true);
          }, 800);
          return 1;
        }
        const step = 0.006 * simSpeed;
        return Math.min(1, prev + step);
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isOpen, order, isSimulating, simSpeed, onUpdateOrderStatus]);

  // Call duration counter
  useEffect(() => {
    let callTimer: NodeJS.Timeout;
    if (isCallActive) {
      callTimer = setInterval(() => {
        setCallDuration(d => d + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(callTimer);
  }, [isCallActive]);

  if (!isOpen || !order) return null;

  // Dynamic ETA & Speed calculation
  const totalDistanceKm = 2.4;
  const remainingDistanceKm = Math.max(0, totalDistanceKm * (1 - progress)).toFixed(1);
  const remainingMins = Math.max(1, Math.round(10 * (1 - progress)));
  const currentSpeedKmH = progress >= 1 ? 0 : Math.round(28 + Math.sin(progress * 10) * 8);

  // Current Rider Coordinates calculation along waypoints
  const getCurrentRiderCoords = (prog: number) => {
    const clamped = Math.max(0, Math.min(1, prog));
    const segmentCount = ROUTE_WAYPOINTS.length - 1;
    const scaled = clamped * segmentCount;
    const index = Math.min(Math.floor(scaled), segmentCount - 1);
    const segmentProgress = scaled - index;

    const p1 = ROUTE_WAYPOINTS[index];
    const p2 = ROUTE_WAYPOINTS[index + 1];

    const x = p1.x + (p2.x - p1.x) * segmentProgress;
    const y = p1.y + (p2.y - p1.y) * segmentProgress;

    const angle = (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;

    return { x, y, angle };
  };

  const riderPos = getCurrentRiderCoords(progress);

  // Derive current status text from progress
  const getCurrentStage = () => {
    if (progress >= 1) return { key: 'Delivered', title: 'Partner Arrived at Gate! 🎉', desc: 'Please share OTP with rider' };
    if (progress >= 0.75) return { key: 'Out for Delivery', title: 'Almost at your Doorstep ⚡', desc: 'Entering your colony street' };
    if (progress >= 0.3) return { key: 'Out for Delivery', title: 'Out for Delivery on Bike 🛵', desc: 'Rider moving along Sector 14' };
    if (progress >= 0.1) return { key: 'Picked Up', title: 'Order Picked Up by Rider 🛍️', desc: 'Sealed package leaving dark store' };
    return { key: 'Preparing', title: 'Packing Items at Hub 📦', desc: 'Store is packing fresh items' };
  };

  const currentStage = getCurrentStage();

  const handleCopyOtp = () => {
    navigator.clipboard.writeText(order.deliveryOtp);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  const handleStartCall = () => {
    setIsCallActive(true);
  };

  const handleEndCall = () => {
    setIsCallActive(false);
  };

  // Generate SVG path string
  const pathD = ROUTE_WAYPOINTS.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl text-white overflow-hidden">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-black text-sm sm:text-base text-white">
                  Live Delivery Tracker
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" /> GPS Live
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Order #{order.id} • Assigned: {order.deliveryPartnerName}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Review Button if delivered */}
            {progress >= 1 && (
              <button
                onClick={() => setIsReviewOpen(true)}
                className="px-2.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-sm"
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>Rate Order</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Container */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* ========================================================================= */}
          {/* SECTION 1: INTERACTIVE GPS SVG ROUTE MAP CANVAS */}
          {/* ========================================================================= */}
          <div className="relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-inner">
            
            {/* Live Stats Overlay HUD (Top-Left) */}
            <div className="absolute top-3 left-3 z-10 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/80 shadow-lg text-xs space-y-0.5">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-extrabold">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>ETA: {progress >= 1 ? 'Arrived!' : `${remainingMins} Mins`}</span>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center space-x-2">
                <span>Dist: <strong className="text-white">{remainingDistanceKm} km</strong></span>
                <span>•</span>
                <span>Speed: <strong className="text-white">{currentSpeedKmH} km/h</strong></span>
              </div>
            </div>

            {/* Simulation Controls HUD (Top-Right) */}
            <div className="absolute top-3 right-3 z-10 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 shadow-lg flex items-center space-x-1 text-xs">
              <button
                onClick={() => setIsSimulating(!isSimulating)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                title={isSimulating ? 'Pause GPS' : 'Resume GPS'}
              >
                {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              </button>

              <button
                onClick={() => setSimSpeed(s => (s === 1 ? 2 : s === 2 ? 4 : 1))}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px] font-black text-emerald-400 border border-slate-700 transition-colors cursor-pointer"
                title="Simulation Speed"
              >
                {simSpeed}x
              </button>

              <button
                onClick={() => {
                  setProgress(0.05);
                  setIsSimulating(true);
                }}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Restart Simulation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Real Mobile GPS Telemetry Bar */}
            <div className="absolute bottom-2 left-2 right-2 z-10 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 flex items-center justify-between text-[11px]">
              <div className="flex items-center space-x-2 truncate mr-2">
                <span className={`w-2 h-2 rounded-full shrink-0 ${isGpsActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="text-slate-200 font-mono text-[10px] truncate">
                  {realGpsData ? `🛰️ Live GPS: ${realGpsData.lat.toFixed(4)}, ${realGpsData.lng.toFixed(4)} • ${realGpsData.speed || 32} km/h` : '🛰️ Satellite GPS: Broadcast Active'}
                </span>
              </div>
              <button
                onClick={handleBroadcastCurrentGps}
                className="px-2.5 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-lg font-black text-[10px] flex items-center gap-1 transition-all cursor-pointer shrink-0 shadow-sm active:scale-95"
                title="Broadcast actual device mobile GPS to this live order"
              >
                <Radio className="w-3 h-3" />
                <span>Broadcast Live GPS</span>
              </button>
            </div>

            {/* SVG Visual Map Canvas */}
            <svg
              viewBox="0 0 600 280"
              className="w-full h-56 sm:h-64 bg-radial from-slate-900 to-slate-950 select-none"
            >
              {/* Map Road Grid Background */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="2,2" />
                </pattern>
                <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>

              <rect width="600" height="280" fill="url(#grid)" />

              {/* Road Tracks & Landmarks */}
              <path
                d="M 30 180 Q 200 240 400 120 T 570 160"
                fill="none"
                stroke="#1e293b"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <path
                d="M 200 30 L 200 260"
                fill="none"
                stroke="#1e293b"
                strokeWidth="8"
                strokeDasharray="4,4"
              />

              {/* Delivery Path Base */}
              <path
                d={pathD}
                fill="none"
                stroke="#334155"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Completed Delivery Path Glow */}
              <path
                d={pathD}
                fill="none"
                stroke="url(#routeGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="600"
                strokeDashoffset={600 * (1 - progress)}
              />

              {/* Intermediate Waypoint Dots */}
              {ROUTE_WAYPOINTS.map((wp, idx) => {
                const isStart = idx === 0;
                const isEnd = idx === ROUTE_WAYPOINTS.length - 1;
                if (isStart || isEnd) return null;

                return (
                  <g key={idx}>
                    <circle cx={wp.x} cy={wp.y} r="4" fill="#475569" stroke="#0f172a" strokeWidth="2" />
                    <text x={wp.x} y={wp.y - 8} fill="#64748b" fontSize="8" fontWeight="bold" textAnchor="middle">
                      {wp.label}
                    </text>
                  </g>
                );
              })}

              {/* STORE HUB PIN (Start) */}
              <g transform={`translate(${ROUTE_WAYPOINTS[0].x}, ${ROUTE_WAYPOINTS[0].y})`}>
                <circle r="16" fill="#059669" fillOpacity="0.2" className="animate-ping" />
                <circle r="12" fill="#059669" stroke="#ffffff" strokeWidth="2" />
                <Store className="w-3.5 h-3.5 text-white" x="-7" y="-7" />
                <text y="24" fill="#a7f3d0" fontSize="9" fontWeight="bold" textAnchor="middle">
                  Dark Store #4
                </text>
              </g>

              {/* CUSTOMER HOME PIN (Destination) */}
              <g transform={`translate(${ROUTE_WAYPOINTS[ROUTE_WAYPOINTS.length - 1].x}, ${ROUTE_WAYPOINTS[ROUTE_WAYPOINTS.length - 1].y})`}>
                <circle r="18" fill="#f43f5e" fillOpacity="0.2" className="animate-ping" />
                <circle r="13" fill="#f43f5e" stroke="#ffffff" strokeWidth="2" />
                <MapPin className="w-4 h-4 text-white" x="-8" y="-8" />
                <text y="24" fill="#fda4af" fontSize="9" fontWeight="bold" textAnchor="middle">
                  Your Address
                </text>
              </g>

              {/* MOVING RIDER ON SCOOTER */}
              <g
                transform={`translate(${riderPos.x}, ${riderPos.y})`}
                className="transition-all duration-300 ease-linear"
              >
                <circle r="20" fill="#38bdf8" fillOpacity="0.25" className="animate-pulse" />
                <circle r="14" fill="#0284c7" stroke="#ffffff" strokeWidth="2.5" />
                <g transform={`rotate(${riderPos.angle})`}>
                  <Bike className="w-4 h-4 text-white" x="-8" y="-8" />
                </g>
                {/* Rider Label Tag */}
                <rect x="-35" y="-30" width="70" height="15" rx="7.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
                <text y="-20" fill="#7dd3fc" fontSize="8" fontWeight="bold" textAnchor="middle">
                  🛵 Ather EV
                </text>
              </g>
            </svg>

            {/* Bottom Status bar on Map */}
            <div className="bg-slate-950/90 border-t border-slate-800 p-2.5 px-4 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-black text-emerald-400">{currentStage.title}</span>
              </div>
              <span className="text-slate-400 text-[11px]">{currentStage.desc}</span>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* SECTION 2: DELIVERY OTP & RIDER CONTACT BAR */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* OTP Confirmation Card */}
            <div className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-amber-950/20 border border-amber-500/40 p-4 rounded-2xl flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Delivery OTP</span>
                </span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                  Required at Door
                </span>
              </div>

              <div className="flex items-center justify-between bg-slate-950/80 p-2.5 rounded-xl border border-amber-500/30">
                <span className="text-2xl font-black font-mono tracking-widest text-amber-200">
                  {order.deliveryOtp}
                </span>
                <button
                  onClick={handleCopyOtp}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  {copiedOtp ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedOtp ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <p className="text-[10px] text-amber-200/70">
                Do not share OTP until delivery partner hands over the sealed bag.
              </p>
            </div>

            {/* Rider Profile Card & Direct Action Buttons */}
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-lg">
                    🛵
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-white">
                      {order.deliveryPartnerName || 'Vikram Singh'}
                    </h5>
                    <p className="text-[10px] text-slate-400">
                      ★ 4.9 (1,240 Deliveries) • Ather 450X
                    </p>
                  </div>
                </div>

                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  Vaccinated
                </span>
              </div>

              {/* Action Buttons: Open In-App Chat & Call & WhatsApp */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handleStartCall}
                  className="py-2.5 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white shadow-md"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Rider</span>
                </button>

                <button
                  onClick={() => setIsChatOpen(true)}
                  className="py-2.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer border border-slate-700"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                  <span>Chat</span>
                </button>

                <button
                  onClick={() => openWhatsAppOrderInvoice(order)}
                  className="py-2.5 px-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Send order bill and tracking link on WhatsApp"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* SECTION 3: DELIVERY ADDRESS & ORDER ITEMS ACCORDION */}
          {/* ========================================================================= */}
          <div className="bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden">
            
            {/* Delivery Destination Address Header */}
            <div className="p-3.5 border-b border-slate-800 flex items-start gap-2.5 text-xs text-slate-300">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">
                  Delivering to: {order.deliveryAddress.fullName}
                </span>
                <span className="text-slate-400 text-[11px]">
                  {order.deliveryAddress.street}, {order.deliveryAddress.city} ({order.deliveryAddress.pincode})
                </span>
              </div>
            </div>

            {/* Collapsible Order Items Bar */}
            <button
              onClick={() => setShowItemsList(!showItemsList)}
              className="w-full p-3.5 bg-slate-900/60 hover:bg-slate-900 text-slate-300 flex items-center justify-between text-xs font-bold transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <span>Order Summary ({order.items.length} items) — Total: <strong className="text-emerald-400">₹{order.finalAmount}</strong></span>
              </div>
              {showItemsList ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* Expanded Items List */}
            {showItemsList && (
              <div className="p-3.5 bg-slate-950 space-y-2 border-t border-slate-800 text-xs">
                <div className="divide-y divide-slate-800">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <img src={item.image} alt="" className="w-9 h-9 rounded-lg bg-slate-800 object-cover border border-slate-700" />
                        <div>
                          <span className="font-bold text-white block">{item.productName}</span>
                          <span className="text-[10px] text-slate-400">Qty: {item.quantity} × {item.unitQuantity}</span>
                        </div>
                      </div>
                      <span className="font-black text-emerald-300">₹{item.paidPrice * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-800 pt-2 flex justify-between text-[11px] text-slate-400">
                  <span>Payment Method: <strong className="text-white">{order.paymentMethod}</strong> ({order.paymentStatus})</span>
                  <span>Delivery: <strong className="text-emerald-400">{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</strong></span>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% On-Time 10-Min Delivery Guarantee</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setProgress(1);
                setIsReviewOpen(true);
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors cursor-pointer border border-slate-700"
            >
              Simulate Complete Delivery 📦
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-colors cursor-pointer shadow-md"
            >
              Done
            </button>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* SIMULATED IN-APP VOICE CALL DIALOG */}
      {/* ========================================================================= */}
      {isCallActive && (
        <div className="fixed inset-0 z-60 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl text-white space-y-6">
            <div className="relative mx-auto w-24 h-24">
              <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-400/40 flex items-center justify-center text-4xl animate-pulse">
                🛵
              </div>
              <span className="w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-900 absolute bottom-1 right-1" />
            </div>

            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Bazli Safe In-App Call
              </span>
              <h4 className="text-lg font-black text-white mt-1">
                {order.deliveryPartnerName || 'Vikram Singh (Rider)'}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {callDuration === 0 ? 'Connecting securely...' : `Call Active • ${formatSeconds(callDuration)}`}
              </p>
            </div>

            {/* Audio Controls */}
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3.5 rounded-full transition-colors cursor-pointer ${
                  isMuted ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title="Mute / Unmute"
              >
                <Mic className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={`p-3.5 rounded-full transition-colors cursor-pointer ${
                  isSpeakerOn ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title="Speaker"
              >
                <Volume2 className="w-5 h-5" />
              </button>

              <button
                onClick={handleEndCall}
                className="p-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full transition-colors cursor-pointer shadow-lg shadow-rose-600/30"
                title="End Call"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RIDER IN-APP CHAT MODAL */}
      {/* ========================================================================= */}
      <RiderChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        order={order}
        onStartSimulatedCall={handleStartCall}
      />

      {/* ========================================================================= */}
      {/* POST-DELIVERY REVIEW MODAL */}
      {/* ========================================================================= */}
      <OrderReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        order={order}
        onSubmitReview={review => {
          setIsReviewOpen(false);
          onSubmitOrderReview?.(order.id, review);
        }}
      />

    </div>
  );
};
