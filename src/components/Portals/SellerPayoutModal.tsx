import React, { useState } from 'react';
import { Seller, SellerPayoutRecord, PayoutAccountDetails } from '../../types';
import {
  X,
  Zap,
  Building2,
  CheckCircle2,
  Smartphone,
  ShieldCheck,
  Building,
  TrendingUp,
  Receipt,
  Download,
  Share2,
  AlertCircle,
  Percent,
  Clock,
  ArrowRight,
  Edit3
} from 'lucide-react';

interface SellerPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  seller: Seller;
  onConfirmPayout: (amount: number, method: 'UPI Instant Settlement' | 'Bank Transfer (IMPS)', destination: string) => void;
  onOpenManageAccount: () => void;
}

export const SellerPayoutModal: React.FC<SellerPayoutModalProps> = ({
  isOpen,
  onClose,
  seller,
  onConfirmPayout,
  onOpenManageAccount
}) => {
  const walletBal = seller.walletBalance !== undefined ? seller.walletBalance : Math.round(seller.totalRevenue * 0.90);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(walletBal > 0 ? walletBal : 0);
  const [payoutMethod, setPayoutMethod] = useState<'UPI' | 'Bank Transfer'>(
    seller.payoutDetails?.payoutMode || (seller.payoutDetails?.accountNumber ? 'Bank Transfer' : 'UPI')
  );
  
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successRecord, setSuccessRecord] = useState<SellerPayoutRecord | null>(null);

  if (!isOpen) return null;

  const getDestinationLabel = () => {
    if (payoutMethod === 'UPI') {
      const fallbackPhone = (seller.phone || '').replace(/\D/g, '').slice(-10);
      return seller.payoutDetails?.upiId || seller.bankAccountOrUpi || (fallbackPhone ? `${fallbackPhone}@upi` : 'merchant@upi');
    } else {
      const bank = seller.payoutDetails?.bankName || 'Connected Bank';
      const acc = seller.payoutDetails?.accountNumber 
        ? `A/C: •••• ${seller.payoutDetails.accountNumber.slice(-4)}` 
        : seller.bankAccountOrUpi || 'A/C: •••• 4819';
      const ifsc = seller.payoutDetails?.ifscCode ? `(${seller.payoutDetails.ifscCode})` : '';
      return `${bank} ${acc} ${ifsc}`;
    }
  };

  const handleWithdraw = () => {
    if (withdrawAmount <= 0 || withdrawAmount > walletBal) return;

    setIsProcessing(true);

    setTimeout(() => {
      const destination = getDestinationLabel();
      const utr = `UPI-NPCI-RZP-${Date.now().toString().slice(-8)}`;
      const razorpayPayoutId = `pout_bazli_${Date.now().toString().slice(-8)}`;

      const newRecord: SellerPayoutRecord = {
        id: `PAY-BZL-VND-${Date.now().toString().slice(-6)}`,
        sellerId: seller.id,
        sellerName: seller.businessName,
        amount: withdrawAmount,
        payoutMethod: payoutMethod === 'UPI' ? 'UPI Instant Settlement' : 'Bank Transfer (IMPS)',
        destination,
        utrNumber: utr,
        razorpayPayoutId,
        status: 'Success',
        grossSalesAmount: Math.round(withdrawAmount / 0.9),
        platformFeeDeducted: Math.round((withdrawAmount / 0.9) * 0.1),
        netSettlementAmount: withdrawAmount,
        ordersCount: Math.max(1, Math.round(withdrawAmount / 250)),
        timestamp: new Date().toISOString(),
        notes: `Settlement disbursed directly to ${seller.businessName} via Bazli FastPay (RazorpayX Connected)`
      };

      onConfirmPayout(
        withdrawAmount,
        payoutMethod === 'UPI' ? 'UPI Instant Settlement' : 'Bank Transfer (IMPS)',
        destination
      );

      setIsProcessing(false);
      setSuccessRecord(newRecord);
    }, 1000);
  };

  const handleResetAndClose = () => {
    setSuccessRecord(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-emerald-900/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 bg-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-black uppercase text-amber-300 border border-amber-400/30">
                <span>Bazli FastPay • RazorpayX Payouts</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Store Settlement & Withdrawal
              </h3>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-800">
          
          {successRecord ? (
            /* SUCCESS CONFIRMATION RECEIPT SCREEN */
            <div className="space-y-5 animate-in zoom-in-95 duration-200 text-center py-2">
              <div className="w-16 h-16 bg-emerald-100 border-2 border-emerald-500 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9 text-emerald-600" />
              </div>

              <div>
                <div className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase mb-1">
                  <span>Transfer Successful</span>
                </div>
                <h4 className="text-2xl font-black text-slate-900">
                  ₹{successRecord.amount.toLocaleString()} Disbursed
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Credited directly to {successRecord.destination}
                </p>
              </div>

              {/* Settlement Voucher Card */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-left space-y-2.5 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 font-mono">
                  <span className="text-slate-400">Transaction ID</span>
                  <span className="font-bold text-slate-800">{successRecord.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Merchant Name</span>
                  <span className="font-bold text-slate-900">{successRecord.sellerName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Bank / UPI Destination</span>
                  <span className="font-mono font-bold text-emerald-700">{successRecord.destination}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">NPCI / IMPS UTR</span>
                  <span className="font-mono font-bold text-slate-800">{successRecord.utrNumber}</span>
                </div>
                {successRecord.razorpayPayoutId && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">RazorpayX Payout ID</span>
                    <span className="font-mono font-bold text-indigo-700">{successRecord.razorpayPayoutId}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Date & Time</span>
                  <span className="font-mono text-slate-700">{new Date(successRecord.timestamp).toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center font-bold">
                  <span className="text-slate-700">Net Settled to Bank</span>
                  <span className="text-base text-emerald-600 font-mono font-black">₹{successRecord.amount.toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-colors"
                >
                  Done & Close
                </button>
              </div>
            </div>
          ) : (
            /* WITHDRAWAL FORM */
            <div className="space-y-5">
              
              {/* Wallet Balance Hero Box */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-5 rounded-2xl shadow-md flex items-center justify-between border border-slate-800">
                <div>
                  <span className="text-[11px] text-emerald-300 font-bold uppercase tracking-wider block">
                    Available Net Settlement Balance (90%)
                  </span>
                  <div className="text-3xl sm:text-4xl font-black font-mono mt-1 text-white flex items-baseline gap-1">
                    <span>₹{walletBal.toLocaleString()}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Zero payout deduction fee • Instant 24x7 Settlement
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center font-mono text-2xl font-black text-emerald-400">
                  ₹
                </div>
              </div>

              {/* Linked Bank / UPI Account Details Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Linked Payout Beneficiary:</span>
                  </span>
                  <button
                    type="button"
                    onClick={onOpenManageAccount}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Change Bank / UPI</span>
                  </button>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-mono font-black text-slate-900">
                      {getDestinationLabel()}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Beneficiary: {seller.payoutDetails?.accountHolderName || seller.ownerName || seller.businessName}
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                    Verified
                  </span>
                </div>
              </div>

              {/* Payout Mode Toggle */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Select Transfer Channel:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPayoutMethod('UPI')}
                    className={`p-3 rounded-xl border-2 flex items-center gap-2.5 transition-all cursor-pointer text-left ${
                      payoutMethod === 'UPI'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="text-xs block font-extrabold">UPI Instant</span>
                      <span className="text-[10px] text-slate-500">0-sec direct credit</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayoutMethod('Bank Transfer')}
                    className={`p-3 rounded-xl border-2 flex items-center gap-2.5 transition-all cursor-pointer text-left ${
                      payoutMethod === 'Bank Transfer'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <Building className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="text-xs block font-extrabold">Bank IMPS</span>
                      <span className="text-[10px] text-slate-500">Direct account credit</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Withdrawal Amount Input & Quick Chips */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 block">
                  Withdrawal Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-black text-sm">₹</span>
                  <input
                    type="number"
                    min={1}
                    max={walletBal}
                    value={withdrawAmount || ''}
                    onChange={(e) => setWithdrawAmount(Math.min(walletBal, Number(e.target.value)))}
                    placeholder="Enter amount to withdraw"
                    className="w-full bg-white border-2 border-slate-300 focus:border-emerald-500 rounded-xl pl-8 pr-4 py-2.5 font-mono font-black text-slate-900 text-sm outline-none transition-colors"
                  />
                </div>

                {/* Quick Percentage Chips */}
                <div className="flex items-center gap-1.5 pt-1">
                  {[
                    { label: '25%', val: Math.round(walletBal * 0.25) },
                    { label: '50%', val: Math.round(walletBal * 0.50) },
                    { label: '75%', val: Math.round(walletBal * 0.75) },
                    { label: '100% Full Balance', val: walletBal }
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => setWithdrawAmount(chip.val)}
                      className="text-[10px] font-bold bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 border border-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      {chip.label} (₹{chip.val.toLocaleString()})
                    </button>
                  ))}
                </div>
              </div>

              {/* Transparent Commission & Net Receipt Breakdown */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1.5 text-xs text-amber-950">
                <div className="flex justify-between items-center font-bold">
                  <span>Gross Order Value Equivalent:</span>
                  <span className="font-mono">₹{Math.round(withdrawAmount / 0.9).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-amber-800">
                  <span>Bazli Admin Platform Fee (10%):</span>
                  <span className="font-mono">-₹{Math.round((withdrawAmount / 0.9) * 0.1).toLocaleString()}</span>
                </div>
                <div className="pt-1.5 border-t border-amber-200/80 flex justify-between items-center font-black text-xs text-slate-900">
                  <span>Net Amount Deposited to your Bank / UPI:</span>
                  <span className="font-mono text-emerald-700 text-sm">₹{withdrawAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Submit Withdrawal Button */}
              <button
                type="button"
                onClick={handleWithdraw}
                disabled={isProcessing || withdrawAmount <= 0 || withdrawAmount > walletBal}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-lg hover:shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Instant Payout via FastPay...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>Withdraw ₹{withdrawAmount.toLocaleString()} to {payoutMethod}</span>
                  </>
                )}
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
