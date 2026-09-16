import React, { useState } from 'react';
import { CustomDeal, Coupon, Product } from '../../types';
import {
  Flame,
  Plus,
  Sparkles,
  Ticket,
  Zap,
  Tag,
  Percent,
  Calendar,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Clock,
  Eye,
  Megaphone,
  IndianRupee,
  Layers,
  Search,
  Filter,
  Check,
  ArrowRight
} from 'lucide-react';

interface AdminDealsAndOffersTabProps {
  deals: CustomDeal[];
  coupons: Coupon[];
  products: Product[];
  activeDealCategory?: string;
  onOpenAddDeal: () => void;
  onOpenEditDeal: (deal: CustomDeal) => void;
  onDeleteDeal: (dealId: string) => void;
  onToggleDealActive: (dealId: string) => void;
  onSetAsActiveTodayDeal: (deal: CustomDeal) => void;
  onOpenAddCoupon: () => void;
  onOpenEditCoupon: (coupon: Coupon) => void;
  onDeleteCoupon: (couponCode: string) => void;
  onToggleCouponActive: (couponCode: string) => void;
  onBroadcastCoupon: (coupon: Coupon) => void;
  onUpdateProduct?: (productId: string, updates: Partial<Product>) => Promise<void>;
}

export const AdminDealsAndOffersTab: React.FC<AdminDealsAndOffersTabProps> = ({
  deals,
  coupons,
  products,
  activeDealCategory,
  onOpenAddDeal,
  onOpenEditDeal,
  onDeleteDeal,
  onToggleDealActive,
  onSetAsActiveTodayDeal,
  onOpenAddCoupon,
  onOpenEditCoupon,
  onDeleteCoupon,
  onToggleCouponActive,
  onBroadcastCoupon,
  onUpdateProduct
}) => {
  const [subTab, setSubTab] = useState<'deals' | 'coupons' | 'product_tags'>('deals');
  const [dealSearch, setDealSearch] = useState('');
  const [couponSearch, setCouponSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductCategory, setSelectedProductCategory] = useState('All');

  // Filtered Deals
  const filteredDeals = deals.filter(d =>
    d.title.toLowerCase().includes(dealSearch.toLowerCase()) ||
    d.category.toLowerCase().includes(dealSearch.toLowerCase()) ||
    d.badge.toLowerCase().includes(dealSearch.toLowerCase())
  );

  // Filtered Coupons
  const filteredCoupons = coupons.filter(c =>
    c.code.toLowerCase().includes(couponSearch.toLowerCase()) ||
    c.description.toLowerCase().includes(couponSearch.toLowerCase())
  );

  // Filtered Products for Deal Tagging
  const productCategories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const filteredProducts = products.filter(p => {
    const matchesQuery = p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat = selectedProductCategory === 'All' || p.category === selectedProductCategory;
    return matchesQuery && matchesCat;
  });

  const activeDeal = deals.find(d => d.isActive && (activeDealCategory ? d.category === activeDealCategory : true)) || deals[0];

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar & Live Quick Stats */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-2xl bg-amber-500/20 text-amber-600">
              <Flame className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-black text-slate-900">
              Deals, Flash Sales & Coupons Studio
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Create, schedule, and launch daily promotional discounts, festival mega-deals, and promo codes directly.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="admin-add-deal-btn"
            onClick={onOpenAddDeal}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create New Deal / Flash Sale</span>
          </button>

          <button
            id="admin-add-coupon-btn"
            onClick={onOpenAddCoupon}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Ticket className="w-4 h-4" />
            <span>+ Create Promo Coupon</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setSubTab('deals')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            subTab === 'deals'
              ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Active Daily Deals & Flash Sales ({deals.length})</span>
        </button>

        <button
          onClick={() => setSubTab('coupons')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            subTab === 'coupons'
              ? 'bg-emerald-600 text-white font-black shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>Discount Promo Codes ({coupons.length})</span>
        </button>

        <button
          onClick={() => setSubTab('product_tags')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            subTab === 'product_tags'
              ? 'bg-slate-900 text-white font-black shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Product Deal Badging ({products.filter(p => p.isTodayDeal).length} Active)</span>
        </button>
      </div>

      {/* =========================================================
          SUB-TAB 1: DEALS & FLASH SALES
         ========================================================= */}
      {subTab === 'deals' && (
        <div className="space-y-6">
          
          {/* Active Live Deal Hero Display */}
          {activeDeal && (
            <div className="bg-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-xl overflow-hidden relative">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 bg-amber-500 text-slate-950 text-[11px] font-black rounded-full flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" />
                      <span>CURRENTLY ACTIVE STORE DEAL</span>
                    </span>
                    <span className="text-xs text-amber-400 font-bold">
                      Category: {activeDeal.category}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    {activeDeal.icon} {activeDeal.title}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {activeDeal.description}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="text-center p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                    <span className="text-[10px] text-slate-400 block font-bold">DISCOUNT APPLIED</span>
                    <span className="text-2xl font-black text-amber-400">{activeDeal.discountPercent}% OFF</span>
                  </div>

                  <button
                    onClick={() => onOpenEditDeal(activeDeal)}
                    className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit Active Banner</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Deals Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search deals by title, category, or badge..."
                value={dealSearch}
                onChange={e => setDealSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredDeals.length} of {deals.length} deals
            </span>
          </div>

          {/* Deals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDeals.map(deal => {
              const isCurrentlyHero = activeDealCategory ? deal.category === activeDealCategory : deal.isActive;
              return (
                <div
                  key={deal.id}
                  className={`bg-white rounded-3xl border transition-all overflow-hidden flex flex-col shadow-xs hover:shadow-md ${
                    deal.isActive ? 'border-slate-200' : 'border-slate-200 opacity-60'
                  }`}
                >
                  {/* Card Banner Header */}
                  <div className={`p-4 bg-gradient-to-r ${deal.gradient || 'from-emerald-600 to-teal-600'} text-white relative`}>
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-black/40 text-amber-300 border border-amber-300/30">
                        {deal.icon} {deal.badge}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                        deal.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {deal.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-white mt-2 line-clamp-1">
                      {deal.title}
                    </h4>
                    <p className="text-[11px] text-white/90 line-clamp-2 mt-0.5">
                      {deal.description}
                    </p>
                  </div>

                  {/* Card Content & Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-bold">CATEGORY</span>
                        <span className="font-bold text-slate-800 truncate block">{deal.category}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-100">
                        <span className="text-[10px] text-amber-800 block font-bold">DISCOUNT</span>
                        <span className="font-black text-amber-900">{deal.discountPercent}% OFF</span>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => onSetAsActiveTodayDeal(deal)}
                        className={`flex-1 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          isCurrentlyHero
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : 'bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{isCurrentlyHero ? 'Live on Store' : 'Set as Today Deal'}</span>
                      </button>

                      <button
                        onClick={() => onOpenEditDeal(deal)}
                        className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                        title="Edit Deal"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onToggleDealActive(deal.id)}
                        className={`p-2 rounded-xl transition-all cursor-pointer ${
                          deal.isActive
                            ? 'text-emerald-600 hover:bg-emerald-50'
                            : 'text-slate-400 hover:bg-slate-100'
                        }`}
                        title={deal.isActive ? 'Deactivate Deal' : 'Activate Deal'}
                      >
                        {deal.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => onDeleteDeal(deal.id)}
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                        title="Delete Deal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {filteredDeals.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 space-y-3">
              <Flame className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">No deals matched your search</h4>
              <p className="text-xs text-slate-400">Click "+ Create New Deal / Flash Sale" above to add your first deal campaign.</p>
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          SUB-TAB 2: PROMO DISCOUNT COUPONS
         ========================================================= */}
      {subTab === 'coupons' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search promo coupons by code or description..."
                value={couponSearch}
                onChange={e => setCouponSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {filteredCoupons.length} Coupons Configured
            </span>
          </div>

          {/* Coupons Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Coupon Code</th>
                    <th className="px-4 py-3.5">Discount Offer</th>
                    <th className="px-4 py-3.5">Min Order & Cap</th>
                    <th className="px-4 py-3.5">Audience & Category</th>
                    <th className="px-4 py-3.5">Expiry Date</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCoupons.map(coupon => {
                    const isPercent = Boolean(coupon.discountPercent);
                    const discountLabel = isPercent ? `${coupon.discountPercent}% OFF` : `₹${coupon.discountAmount} FLAT OFF`;
                    return (
                      <tr key={coupon.code} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-black tracking-wider text-xs">
                              🏷️ {coupon.code}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 max-w-xs truncate">
                            {coupon.description}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-extrabold text-emerald-700 text-xs">
                            {discountLabel}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-700">
                          <div>Min: <span className="font-bold">₹{coupon.minOrder}</span></div>
                          <div className="text-[11px] text-slate-400">Max Cap: ₹{coupon.maxDiscount}</div>
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          <div>{coupon.applicableCategory || 'All Categories'}</div>
                          {coupon.newCustomersOnly && (
                            <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[9px] font-black">
                              NEW CUSTOMERS ONLY
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-slate-500 font-medium">
                          {coupon.expiryDate}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                            coupon.isActive !== false
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {coupon.isActive !== false ? '● ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onBroadcastCoupon(coupon)}
                              className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                              title="Broadcast code to customer top header banner"
                            >
                              <Megaphone className="w-3 h-3" />
                              <span>Broadcast</span>
                            </button>

                            <button
                              onClick={() => onOpenEditCoupon(coupon)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                              title="Edit Coupon"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => onToggleCouponActive(coupon.code)}
                              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                              title={coupon.isActive !== false ? 'Deactivate' : 'Activate'}
                            >
                              {coupon.isActive !== false ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                            </button>

                            <button
                              onClick={() => onDeleteCoupon(coupon.code)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                              title="Delete Coupon"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          SUB-TAB 3: PRODUCT DEAL BADGING & DISCOUNT ADJUSTER
         ========================================================= */}
      {subTab === 'product_tags' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-extrabold text-amber-950 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-amber-600" />
                <span>1-Click SKU Deal Badging</span>
              </h4>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Toggle "Today's Deal", "Popular / Bestseller", or adjust Bazli Bargaining discounts directly per item.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products by title or category..."
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            <select
              value={selectedProductCategory}
              onChange={e => setSelectedProductCategory(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {productCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredProducts.slice(0, 30).map(p => (
              <div key={p.id} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
                <div className="flex items-center space-x-3 min-w-0">
                  <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-100" />
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-slate-900 truncate">{p.name}</h5>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span className="font-extrabold text-slate-800">₹{p.sellingPrice}</span>
                      <span className="line-through text-slate-400">₹{p.mrp}</span>
                      <span className="text-emerald-600 font-bold">{p.discountPercentage}% OFF</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={async () => {
                      if (onUpdateProduct) {
                        await onUpdateProduct(p.id, { isTodayDeal: !p.isTodayDeal });
                      }
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition-all cursor-pointer flex items-center gap-1 ${
                      p.isTodayDeal
                        ? 'bg-amber-500 text-slate-950 shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    <Flame className="w-3 h-3" />
                    <span>{p.isTodayDeal ? "Today's Deal ✓" : "+ Today Deal"}</span>
                  </button>

                  <button
                    onClick={async () => {
                      if (onUpdateProduct) {
                        await onUpdateProduct(p.id, { isPopular: !p.isPopular });
                      }
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition-all cursor-pointer flex items-center gap-1 ${
                      p.isPopular
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{p.isPopular ? 'Popular ✓' : '+ Popular'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length > 30 && (
            <p className="text-center text-xs text-slate-400 pt-2">
              Showing top 30 matching products. Narrow your search for specific items.
            </p>
          )}
        </div>
      )}

    </div>
  );
};
