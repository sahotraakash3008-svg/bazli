import React, { useState } from 'react';
import { Zap, Clock, ShieldCheck, MapPin, Sparkles, Flame, Scale, Utensils, CheckCircle2 } from 'lucide-react';
import { DeliveryZone } from '../types';

interface HyperlocalLiveTrackerBarProps {
  selectedZone?: DeliveryZone | string;
  onSelectCategory?: (category: string) => void;
  onStartBargaining?: () => void;
  onSwitchToRestaurants?: () => void;
  onShowSpeedTestToast?: (msg: string) => void;
}

export const HyperlocalLiveTrackerBar: React.FC<HyperlocalLiveTrackerBarProps> = ({
  selectedZone,
  onSelectCategory,
  onStartBargaining,
  onSwitchToRestaurants,
  onShowSpeedTestToast
}) => {
  const [isTestingSpeed, setIsTestingSpeed] = useState(false);
  const [speedResult, setSpeedResult] = useState<string | null>(null);

  const zoneLabel = typeof selectedZone === 'string'
    ? selectedZone.toUpperCase()
    : selectedZone?.name
      ? selectedZone.name.split('-')[0].trim().toUpperCase()
      : 'CENTRAL CITY';

  const handleSpeedTest = () => {
    setIsTestingSpeed(true);
    setSpeedResult(null);
    setTimeout(() => {
      setIsTestingSpeed(false);
      setSpeedResult('9m 12s ETA');
      onShowSpeedTestToast?.('⚡ Darkstore Hub #04 confirmed: 14 riders active, estimated dispatch: 2.1 mins!');
    }, 900);
  };

  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#0a192f] via-[#10243e] to-[#0a192f] border border-[#1e3a5f] px-3 py-2 shadow-md text-slate-200">
        
        {/* Glow ambient */}
        <div className="absolute top-0 right-1/4 w-36 h-8 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between gap-2.5 relative z-10 flex-wrap sm:flex-nowrap">
          
          {/* Left: Live Darkstore Status */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative shrink-0">
              <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                <Zap className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 border border-[#0a192f] animate-ping" />
            </div>

            <div className="min-w-0 text-left flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                HUB #04 LIVE
              </span>
              <p className="text-[11px] text-slate-300 font-medium truncate flex items-center gap-1">
                <span className="text-slate-400 hidden sm:inline">Dispatch:</span>
                <span className="font-mono font-black text-amber-400 text-xs">
                  {speedResult || '8-11 Mins'}
                </span>
                <span className="text-slate-500 hidden md:inline">•</span>
                <span className="text-emerald-400 text-[10px] font-semibold hidden md:inline">⚡ 14 Riders Active in {zoneLabel}</span>
              </p>
            </div>
          </div>

          {/* Right: Compact Action Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0 scrollbar-none ml-auto">
            
            {/* Speed Test Ping Button */}
            <button
              onClick={handleSpeedTest}
              disabled={isTestingSpeed}
              className="shrink-0 px-2 py-1 rounded-lg bg-[#0a192f] hover:bg-[#132f54] text-amber-300 border border-[#1e3a5f] text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-2xs"
              title="Test Darkstore Latency"
            >
              <Clock className={`w-3 h-3 ${isTestingSpeed ? 'animate-spin text-amber-400' : 'text-amber-400'}`} />
              <span>{isTestingSpeed ? 'Pinging...' : 'Speed Test'}</span>
            </button>

            {/* AI Bargain Quick Filter */}
            <button
              onClick={onStartBargaining}
              className="shrink-0 px-2 py-1 rounded-lg bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-400/50 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              <Scale className="w-3 h-3 text-amber-400" />
              <span>Bargain Deals</span>
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};
