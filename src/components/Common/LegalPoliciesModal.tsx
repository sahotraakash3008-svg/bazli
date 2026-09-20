import React, { useState } from 'react';
import {
  X,
  FileText,
  ShieldCheck,
  RotateCcw,
  Truck,
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Printer,
  Copy,
  Check,
  Building2,
  Lock,
  CreditCard
} from 'lucide-react';

export type LegalPolicyTab = 'terms' | 'privacy' | 'refund' | 'shipping' | 'contact';

interface LegalPoliciesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalPolicyTab;
}

export const LegalPoliciesModal: React.FC<LegalPoliciesModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'terms'
}) => {
  const [activeTab, setActiveTab] = useState<LegalPolicyTab>(initialTab);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Sync tab if initialTab changes while open
  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleCopyLink = (tab: LegalPolicyTab) => {
    const url = `${window.location.origin}/#${tab}`;
    navigator.clipboard.writeText(url);
    setCopiedSection(tab);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const navItems = [
    { id: 'terms' as LegalPolicyTab, label: 'Terms & Conditions', icon: FileText, tag: 'Legal Agreement' },
    { id: 'privacy' as LegalPolicyTab, label: 'Privacy Policy', icon: ShieldCheck, tag: 'Data & Security' },
    { id: 'refund' as LegalPolicyTab, label: 'Refund & Cancellation', icon: RotateCcw, tag: '2-Hr Window' },
    { id: 'shipping' as LegalPolicyTab, label: 'Shipping & Delivery', icon: Truck, tag: '10-15 Min SLA' },
    { id: 'contact' as LegalPolicyTab, label: 'Contact & Grievance', icon: PhoneCall, tag: 'Govt Compliant' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh]">
        
        {/* Header */}
        <div className="px-5 sm:px-8 py-4 sm:py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center space-x-3">
            <img
              src="/bazli-logo.jpg?v=2"
              alt="Bazli Logo"
              className="w-10 h-10 rounded-2xl object-cover border-2 border-yellow-400 p-0.5 shadow-xs shrink-0"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900">Legal, Privacy & Compliance</h2>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 mr-1" /> Verified Compliant
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Bazli Express Marketplace • Consumer Protection (E-Commerce) Rules, 2020
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Print document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 rounded-full transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="bg-white border-b border-slate-100 px-4 sm:px-6 py-2.5 overflow-x-auto flex items-center gap-1.5 scrollbar-none shrink-0">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-800'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {isActive && (
                  <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded-md font-bold">
                    {item.tag}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Body / Scrollable Content */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-6 text-slate-700 leading-relaxed text-xs sm:text-sm">
          
          {/* ========================================================= */}
          {/* TAB 1: TERMS & CONDITIONS */}
          {/* ========================================================= */}
          {activeTab === 'terms' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-black text-slate-950">Terms and Conditions of Use</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Last updated: September 2026 • Governed under the Information Technology Act, 2000</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyLink('terms')}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  {copiedSection === 'terms' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'terms' ? 'Link Copied!' : 'Copy Link'}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-950 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Notice to Users:</strong> By accessing, browsing, or creating an account on Bazli Express (web, mobile, or Progressive Web App), you unconditionally accept and agree to be bound by these Terms and Conditions and our associated operational policies.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                  Platform Operator & Service Model
                </h4>
                <p className="text-slate-600 pl-7">
                  Bazli Express ("Platform", "we", "us") operates as a technology marketplace connecting local neighborhood merchants, kirana stores, restaurants, dark stores, and stationery outlets with retail consumers for hyperlocal on-demand delivery (typically within 10 to 15 minutes).
                </p>

                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                  User Eligibility & Account Security
                </h4>
                <p className="text-slate-600 pl-7">
                  Services are available only to persons who can form legally binding contracts under the Indian Contract Act, 1872 (typically 18 years or older). You are solely responsible for maintaining the confidentiality of your mobile number, OTP (One-Time Password), and access credentials.
                </p>

                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">3</span>
                  Pricing, Taxes & Dynamic Bargaining
                </h4>
                <p className="text-slate-600 pl-7">
                  All prices listed on Bazli Express are denominated in Indian Rupees (INR) and include applicable Goods and Services Tax (GST). For grocery items where the proprietary "Bargain & Save" engine is enabled by the vendor/admin, any accepted discount is time-locked for your current checkout session. The store admin reserves the right to set discount caps, minimum order floors, and maximum bargaining attempts.
                </p>

                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">4</span>
                  Order Fulfillment & Delivery OTP
                </h4>
                <p className="text-slate-600 pl-7">
                  Every order is assigned a unique, confidential 4-digit Delivery OTP generated on our secure server. The delivery partner will release the order package only after you verify the OTP at your doorstep. Sharing this OTP with unauthorized persons is at the customer's sole risk.
                </p>

                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">5</span>
                  Limitation of Liability & Jurisdiction
                </h4>
                <p className="text-slate-600 pl-7">
                  To the maximum extent permitted by law, Bazli Express shall not be liable for indirect, incidental, or consequential damages resulting from network outages, third-party vendor stockouts, or delivery delays due to severe weather, public unrest, or road blockages. Any dispute arising out of or related to these Terms shall be subject to the exclusive jurisdiction of the courts of Mumbai/New Delhi, India.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: PRIVACY POLICY */}
          {/* ========================================================= */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-black text-slate-950">Privacy & Data Protection Policy</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Compliant with the Digital Personal Data Protection (DPDP) Act, 2023</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyLink('privacy')}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  {copiedSection === 'privacy' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'privacy' ? 'Link Copied!' : 'Copy Link'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <Lock className="w-5 h-5 text-emerald-600 mb-1.5" />
                  <span className="font-bold text-slate-900 block text-xs">No Card Storage</span>
                  <span className="text-[11px] text-slate-500">We never store your credit/debit card numbers or CVV on our servers.</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <ShieldCheck className="w-5 h-5 text-sky-600 mb-1.5" />
                  <span className="font-bold text-slate-900 block text-xs">256-bit SSL Encryption</span>
                  <span className="text-[11px] text-slate-500">All data in transit is encrypted using HTTPS and TLS 1.3 cryptographic protocols.</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 mb-1.5" />
                  <span className="font-bold text-slate-900 block text-xs">Zero Spam Guarantee</span>
                  <span className="text-[11px] text-slate-500">Your phone number is used strictly for order tracking and delivery coordination.</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-extrabold text-slate-900 text-sm">1. Information We Collect</h4>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li><strong>Contact Details:</strong> Full name, 10-digit mobile number, and optional email address.</li>
                  <li><strong>Delivery Addresses:</strong> Street address, apartment/flat number, postal code, landmark, and device GPS location (with explicit permission) for rider dispatch.</li>
                  <li><strong>Transaction Records:</strong> Razorpay payment identifiers, order items, timestamps, and delivery verification status.</li>
                </ul>

                <h4 className="font-extrabold text-slate-900 text-sm">2. How We Use Your Information</h4>
                <p className="text-slate-600">
                  We use your personal data exclusively to process and deliver orders, generate electronic tax invoices, provide live GPS tracking, notify you via WhatsApp or SMS, and prevent fraudulent transactions.
                </p>

                <h4 className="font-extrabold text-slate-900 text-sm">3. Payment Gateway Security (Razorpay)</h4>
                <p className="text-slate-600">
                  Payments are processed directly through <strong>Razorpay Software Private Limited</strong>, an RBI-licensed payment aggregator certified under PCI-DSS Level 1 (the highest standard of cardholder security). Our backend communicates with Razorpay via encrypted server-to-server APIs and verifies every payment using cryptographic HMAC-SHA256 signatures.
                </p>

                <h4 className="font-extrabold text-slate-900 text-sm">4. Data Deletion & Customer Rights</h4>
                <p className="text-slate-600">
                  You have the right to review, update, or request the permanent deletion of your saved delivery addresses and account profile at any time by emailing our Grievance Officer at <a href="mailto:sahotraakash3008@gmail.com" className="text-emerald-700 font-bold hover:underline">sahotraakash3008@gmail.com</a>.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: REFUND & CANCELLATION POLICY */}
          {/* ========================================================= */}
          {activeTab === 'refund' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-black text-slate-950">Refund, Return and Cancellation Policy</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Mandatory disclosure for Hyperlocal Grocery & Prepared Food Delivery</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyLink('refund')}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  {copiedSection === 'refund' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'refund' ? 'Link Copied!' : 'Copy Link'}</span>
                </button>
              </div>

              {/* Policy Quick Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80">
                  <div className="flex items-center gap-2 mb-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-extrabold text-emerald-950 text-xs">Eligible for 100% Instant Refund</span>
                  </div>
                  <ul className="text-[11px] text-emerald-900 space-y-1 pl-5 list-disc">
                    <li>Damaged, crushed, leaked, or stale grocery / dairy goods.</li>
                    <li>Expired packaged goods or broken seals upon arrival.</li>
                    <li>Missing items from your paid order.</li>
                    <li>Incorrect dish or wrong item delivered.</li>
                    <li>Delays exceeding 60 minutes due to platform outage.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80">
                  <div className="flex items-center gap-2 mb-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span className="font-extrabold text-rose-950 text-xs">Non-Refundable Scenarios</span>
                  </div>
                  <ul className="text-[11px] text-rose-900 space-y-1 pl-5 list-disc">
                    <li>Cancellation requested after rider has picked up the order.</li>
                    <li>Customer unavailable at delivery address during OTP prompt.</li>
                    <li>Incorrect delivery address provided by customer.</li>
                    <li>Fresh cooked restaurant food requested for return after 2 hours.</li>
                    <li>Custom printed xerox / document orders already printed.</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-extrabold text-slate-900 text-sm">1. Order Cancellation Windows</h4>
                <p className="text-slate-600">
                  Because our delivery partners are dispatched immediately and orders are packed in under 3 minutes, customers can cancel an order free of charge within <strong>60 seconds</strong> of placement, or anytime before the store vendor marks the order as "Dispatched". Once the delivery partner is on the way, cancellations are not permitted.
                </p>

                <h4 className="font-extrabold text-slate-900 text-sm">2. 2-Hour Issue Reporting Window</h4>
                <p className="text-slate-600">
                  For fresh perishable goods (fruits, vegetables, milk, bread, and cooked meals), any quality issue or discrepancy must be reported within <strong>2 hours of delivery</strong> with a photo of the item via WhatsApp (+91 9871618126) or customer support email.
                </p>

                <h4 className="font-extrabold text-slate-900 text-sm">3. Refund Processing Timelines & Modes</h4>
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Payment Method</th>
                        <th className="p-3">Refund Destination</th>
                        <th className="p-3">Turnaround Time (TAT)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      <tr>
                        <td className="p-3 font-semibold text-slate-900">UPI (GPay / PhonePe / Paytm)</td>
                        <td className="p-3">Original Bank Account (via VPA)</td>
                        <td className="p-3 text-emerald-700 font-bold">Instant to 2 Hours</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-900">Credit / Debit Card</td>
                        <td className="p-3">Card Issuing Bank Account</td>
                        <td className="p-3 font-medium">5 to 7 Business Days</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-900">NetBanking</td>
                        <td className="p-3">Originating Bank Account</td>
                        <td className="p-3 font-medium">3 to 5 Business Days</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-900">Cash on Delivery (COD)</td>
                        <td className="p-3">Customer UPI ID or Bazli Coins</td>
                        <td className="p-3 text-emerald-700 font-bold">Within 4 Hours</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: SHIPPING & DELIVERY POLICY */}
          {/* ========================================================= */}
          {activeTab === 'shipping' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-black text-slate-950">Shipping and Delivery Policy</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Hyperlocal 10 to 15 Minute Ultra-Fast Fulfillment Standards</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyLink('shipping')}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  {copiedSection === 'shipping' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'shipping' ? 'Link Copied!' : 'Copy Link'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200">
                  <Clock className="w-5 h-5 text-amber-700 mb-1" />
                  <span className="font-bold text-slate-900 block text-xs">10 - 15 Mins Delivery</span>
                  <span className="text-[11px] text-slate-600">Standard delivery SLA for Zone A (0 to 5 km radius from dark store).</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200">
                  <Truck className="w-5 h-5 text-emerald-700 mb-1" />
                  <span className="font-bold text-slate-900 block text-xs">Free Delivery &gt; ₹79</span>
                  <span className="text-[11px] text-slate-600">Orders exceeding ₹79 or placed with Bazli VIP pass enjoy ₹0 delivery fee.</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-200">
                  <ShieldCheck className="w-5 h-5 text-sky-700 mb-1" />
                  <span className="font-bold text-slate-900 block text-xs">Safe Handoff OTP</span>
                  <span className="text-[11px] text-slate-600">Every delivery is sealed and verified using your 4-digit secret OTP.</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-extrabold text-slate-900 text-sm">1. Delivery Zones & Timelines</h4>
                <p className="text-slate-600">
                  Bazli operates hyperlocal distribution pods. Service zones are defined based on driving distance and live traffic conditions:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li><strong>Zone A (0 - 5 km):</strong> 10 to 15 minutes delivery. Standard fee: ₹19 (FREE on orders above ₹129 & first 2 orders).</li>
                  <li><strong>Zone B (5 - 12 km):</strong> 25 to 40 minutes delivery. Standard fee: ₹29 (FREE on orders above ₹129).</li>
                  <li><strong>Zone C (Extended Ring):</strong> 30 to 45 minutes delivery. Standard fee: ₹39.</li>
                </ul>

                <h4 className="font-extrabold text-slate-900 text-sm">2. Weather & Monsoon Surge Disclosure</h4>
                <p className="text-slate-600">
                  During severe rainstorms, flooding, or late-night operations (post 11:00 PM), an emergency rain/night surcharge (₹15 - ₹25) may be enabled by the admin. 100% of this surge fee is transferred directly to our on-duty delivery partners as hazard incentive.
                </p>

                <h4 className="font-extrabold text-slate-900 text-sm">3. Order Tracking & Contactless Delivery</h4>
                <p className="text-slate-600">
                  Customers can track their rider in real-time via the in-app GPS radar. You can also request Contactless Delivery by checking the delivery instruction box during checkout.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: CONTACT & GRIEVANCE REDRESSAL */}
          {/* ========================================================= */}
          {activeTab === 'contact' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-black text-slate-950">Contact Us & Grievance Redressal</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Mandated under Rule 5(9) of Consumer Protection (E-Commerce) Rules, 2020</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyLink('contact')}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  {copiedSection === 'contact' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'contact' ? 'Link Copied!' : 'Copy Link'}</span>
                </button>
              </div>

              {/* Direct Contact Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider block">Customer Helpline & WhatsApp</span>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <PhoneCall className="w-5 h-5" />
                    </div>
                    <div>
                      <a href="tel:9871618126" className="font-black text-slate-900 text-base hover:underline block">
                        +91 9871618126
                      </a>
                      <span className="text-[11px] text-slate-500">6:00 AM – 11:30 PM (7 Days a week)</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider block">Support & Billing Inquiries</span>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <a href="mailto:sahotraakash3008@gmail.com" className="font-bold text-slate-900 text-xs sm:text-sm hover:underline truncate block">
                        sahotraakash3008@gmail.com
                      </a>
                      <span className="text-[11px] text-slate-500">Response turnaround: Within 4 hours</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statutory Grievance Redressal Officer */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-4 border border-slate-700 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                    <h4 className="font-black text-sm text-white">Designated Grievance Officer</h4>
                  </div>
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                    Statutory IT Compliance
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Officer Name & Designation:</span>
                    <span className="font-bold text-white text-sm">Akash Sahotra</span>
                    <span className="text-slate-300 block text-[11px]">Nodal Grievance & Compliance Head</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Email for Legal & Disputes:</span>
                    <a href="mailto:sahotraakash3008@gmail.com" className="text-amber-300 font-bold hover:underline">
                      sahotraakash3008@gmail.com
                    </a>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Direct Contact Phone:</span>
                    <a href="tel:9871618126" className="text-white font-bold hover:underline">
                      +91 9871618126
                    </a>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Redressal SLA:</span>
                    <span className="text-emerald-400 font-bold">Acknowledgment: &lt; 48 hours</span>
                    <span className="text-slate-400 block text-[10px]">Final resolution within 15 business days</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-700/80 text-[11px] text-slate-300 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Operating / Registered Address:</strong> Bazli Express Marketplace, Sunshine Heights, Linking Road, Bandra West, Mumbai, Maharashtra 400050, India.
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-8 py-3.5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 text-xs text-slate-500">
          <div className="flex items-center gap-2 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secure 256-Bit SSL • Razorpay Certified PCI-DSS Level 1 Gateway</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors cursor-pointer text-xs"
          >
            I Understand & Accept
          </button>
        </div>

      </div>
    </div>
  );
};
