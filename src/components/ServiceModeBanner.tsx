import React from 'react';
import { Camera } from 'lucide-react';

interface ServiceModeBannerProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  groceryCount?: number;
  restaurantCount?: number;
  stationeryCount?: number;
  onOpenParchhiScanner?: () => void;
  onOpenPrintoutModal?: () => void;
}

export const ServiceModeBanner: React.FC<ServiceModeBannerProps> = ({
  activeTab,
  onOpenParchhiScanner,
}) => {
  const isRestaurant = activeTab === 'restaurants';
  const isStationery = activeTab === 'stationery';
  const isGrocery = !isRestaurant && !isStationery;

  // Render only on grocery tab
  if (!isGrocery || !onOpenParchhiScanner) {
    return null;
  }

  return (
    <div className="w-full flex items-center justify-start py-1">
      {/* Clean Camera Icon with 'Scan' text underneath (Flips in place every 10s) */}
      <button
        type="button"
        onClick={onOpenParchhiScanner}
        className="flex flex-col items-center justify-center p-2 rounded-2xl bg-white hover:bg-[#ede5d8]/40 border border-[#ded2bc] shadow-xs hover:shadow-md transition-all cursor-pointer group active:scale-95 text-slate-800 scan-button-flip-10s"
        title="Scan"
      >
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform border border-emerald-300/50">
          <Camera className="w-5 h-5" />
        </div>
        <span className="text-[11px] font-bold text-slate-800 mt-1">Scan</span>
      </button>
    </div>
  );
};

