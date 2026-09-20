import React from 'react';
import { DeliveryPartner } from '../../types';
import {
  X,
  ShieldCheck,
  IdCard,
  Truck,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText
} from 'lucide-react';

interface AdminPartnerKycModalProps {
  isOpen: boolean;
  partner: DeliveryPartner | null;
  onClose: () => void;
  onVerify: (partnerId: string, status: 'Verified' | 'Rejected') => Promise<void>;
  onTriggerPayout?: (partnerId: string, amount: number, method: string, destination: string) => void;
}

export const AdminPartnerKycModal: React.FC<AdminPartnerKycModalProps> = ({
  isOpen,
  partner,
  onClose,
  onVerify,
  onTriggerPayout
}) => {
  if (!isOpen || !partner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <IdCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base">{partner.name}</h3>
                <span className="font-mono text-xs text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded-full border border-sky-800">
                  {partner.id.toUpperCase()}
                </span>
              </div>
              <p className="text-slate-400 text-xs">KYC Dossier & Fleet Compliance Audit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status & Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Status</span>
              <span className={`text-xs font-black px-2 py-0.5 rounded mt-1 inline-block ${
                partner.verificationStatus === 'Verified'
                  ? 'bg-emerald-100 text-emerald-800'
                  : partner.verificationStatus === 'Rejected'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-amber-100 text-amber-900'
              }`}>
                {partner.verificationStatus}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Duty State</span>
              <span className="text-xs font-black text-slate-800 mt-1 block">{partner.currentStatus}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Deliveries</span>
              <span className="text-xs font-black text-emerald-700 mt-1 block">{partner.completedOrdersCount} completed</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Wallet Bal.</span>
              <span className="text-xs font-black text-slate-900 mt-1 block">₹{partner.walletBalance || 0}</span>
            </div>
          </div>

          {/* KYC Documents Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" /> Government & ID Documents
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Driving License (DL)</span>
                <span className="font-mono text-sm font-black text-slate-800">
                  {partner.drivingLicenseNumber || 'MH-02-20210048192'}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold block flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Valid for LMV / Two-Wheeler
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Aadhaar Card UID</span>
                <span className="font-mono text-sm font-black text-slate-800">
                  {partner.aadhaarNumber || 'XXXX-XXXX-8912'}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold block flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Biometrics Verified
                </span>
              </div>
            </div>
          </div>

          {/* Vehicle & Operational Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-sky-600" /> Vehicle & Shift Operations
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Vehicle</span>
                <span className="text-xs font-bold text-slate-900">{partner.vehicleType}</span>
                <span className="text-[10px] font-mono text-slate-500 block">{partner.vehicleNumber}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Operating Zone</span>
                <span className="text-xs font-bold text-slate-900">{partner.operatingZoneName || 'Zone A - Central'}</span>
                <span className="text-[10px] text-slate-500 block">Radius: 6 km</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Preferred Shift</span>
                <span className="text-xs font-bold text-slate-900">{partner.preferredShift || 'Morning (6 AM - 2 PM)'}</span>
                <span className="text-[10px] text-slate-500 block">8h Slot</span>
              </div>
            </div>
          </div>

          {/* Payout & Bank Settlement */}
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-700" /> Bank & Instant UPI Settlement
              </h4>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                NPCI Auto-Payout Enabled
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <span className="text-[10px] text-slate-500 block font-bold uppercase">UPI VPA ID</span>
                <span className="font-mono font-black text-emerald-900">{partner.upiId || `${partner.phone}@upi`}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block font-bold uppercase">Bank Account</span>
                <span className="font-bold text-slate-800">{partner.bankName || 'HDFC Bank Ltd'}</span>
                <span className="text-[10px] font-mono text-slate-500 block">IFSC: {partner.ifscCode || 'HDFC0001245'}</span>
              </div>
            </div>

            {/* Instant Settlement Trigger if balance > 0 */}
            {partner.walletBalance > 0 && onTriggerPayout && (
              <div className="pt-2 flex items-center justify-between border-t border-emerald-200/60 mt-2">
                <span className="text-xs text-emerald-900 font-bold">
                  Pending Unpaid Earnings: <span className="font-black">₹{partner.walletBalance}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onTriggerPayout(
                      partner.id,
                      partner.walletBalance,
                      'UPI Instant Cashout',
                      partner.upiId || `${partner.phone}@upi`
                    );
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-[10px] rounded-xl cursor-pointer shadow-xs"
                >
                  Trigger Instant Payout (₹{partner.walletBalance})
                </button>
              </div>
            )}
          </div>

          {/* Emergency Contact */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Emergency Contact</span>
              <span className="font-bold text-slate-800">{partner.emergencyContactName || 'Family Contact'}</span>
              <span className="text-[10px] text-slate-500 font-mono block">{partner.emergencyContactPhone || partner.phone}</span>
            </div>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
              Verified Next of Kin
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Close Dossier
          </button>

          <div className="flex items-center space-x-2">
            {partner.verificationStatus !== 'Rejected' && (
              <button
                onClick={async () => {
                  await onVerify(partner.id, 'Rejected');
                  onClose();
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject / Suspend Partner</span>
              </button>
            )}

            {partner.verificationStatus !== 'Verified' && (
              <button
                onClick={async () => {
                  await onVerify(partner.id, 'Verified');
                  onClose();
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve & Grant Active Delivery License</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
