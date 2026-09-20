import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Printer,
  Upload,
  FileText,
  CheckCircle2,
  Sparkles,
  Zap,
  Clock,
  ShieldCheck,
  Plus,
  Minus,
  ShoppingCart,
  Copy,
  Layers,
  HelpCircle,
  FileCheck2,
  Scissors,
  Check
} from 'lucide-react';
import { Product, PrintoutConfig } from '../types';

interface DocumentPrintoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPrintoutToCart: (product: Product, quantity: number, printConfig: PrintoutConfig) => void;
}

export const DocumentPrintoutModal: React.FC<DocumentPrintoutModalProps> = ({
  isOpen,
  onClose,
  onAddPrintoutToCart
}) => {
  const [file, setFile] = useState<{ name: string; size: string; type: string } | null>(null);
  const [pageCount, setPageCount] = useState<number>(4);
  const [copies, setCopies] = useState<number>(1);
  const [colorMode, setColorMode] = useState<'bw' | 'color' | 'photo_hd'>('bw');
  const [paperType, setPaperType] = useState<'standard_75gsm' | 'bond_100gsm' | 'glossy_photo' | 'stamp_legal'>('standard_75gsm');
  const [printSide, setPrintSide] = useState<'single' | 'duplex'>('duplex');
  const [binding, setBinding] = useState<'none' | 'staple' | 'spiral_coil' | 'transparent_folder' | 'hardcover_gold'>('spiral_coil');
  const [instructions, setInstructions] = useState('');
  const [urgentExpress, setUrgentExpress] = useState(true);
  const [priceData, setPriceData] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preset sample files for 1-click test
  const sampleDocs = [
    {
      name: 'College_Major_Project_Report.pdf',
      size: '2.4 MB',
      type: 'pdf',
      pageCount: 18,
      defaultColor: 'bw',
      defaultBinding: 'spiral_coil',
      defaultPaper: 'bond_100gsm'
    },
    {
      name: 'UPSC_Admit_Card_&_Instructions.pdf',
      size: '640 KB',
      type: 'pdf',
      pageCount: 2,
      defaultColor: 'color',
      defaultBinding: 'none',
      defaultPaper: 'standard_75gsm'
    },
    {
      name: 'Legal_Rental_Agreement_Stamp.pdf',
      size: '1.2 MB',
      type: 'pdf',
      pageCount: 4,
      defaultColor: 'bw',
      defaultBinding: 'transparent_folder',
      defaultPaper: 'stamp_legal'
    },
    {
      name: 'Professional_Portfolio_Resume.pdf',
      size: '3.1 MB',
      type: 'pdf',
      pageCount: 3,
      defaultColor: 'color',
      defaultBinding: 'staple',
      defaultPaper: 'bond_100gsm'
    }
  ];

  const handleFileUpload = (uploadedFile: File) => {
    if (!uploadedFile) return;
    const sizeStr = `${(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB`;
    const name = uploadedFile.name;
    setFile({
      name,
      size: sizeStr,
      type: name.endsWith('.pdf') ? 'pdf' : name.endsWith('.docx') ? 'docx' : 'image'
    });
    // Default estimated pages if not already chosen
    if (pageCount <= 1) setPageCount(5);
  };

  const calculatePrice = async () => {
    setIsCalculating(true);
    try {
      const response = await fetch('/api/printout/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageCount,
          copies,
          colorMode,
          paperType,
          printSide,
          binding,
          urgentExpress
        })
      });
      if (response.ok) {
        const data = await response.json();
        setPriceData(data);
      }
    } catch (err) {
      console.warn('Client fallback printout pricing:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      calculatePrice();
    }
  }, [isOpen, pageCount, copies, colorMode, paperType, printSide, binding, urgentExpress]);

  if (!isOpen) return null;

  // Pricing calculations fallback
  const baseRate = colorMode === 'bw' ? 2 : colorMode === 'color' ? 7 : 15;
  const paperExtra = paperType === 'bond_100gsm' ? 1.5 : paperType === 'glossy_photo' ? 8 : paperType === 'stamp_legal' ? 12 : 0;
  const duplexMultiplier = printSide === 'duplex' ? 0.85 : 1.0;
  const effectivePageRate = Number(((baseRate + paperExtra) * duplexMultiplier).toFixed(2));
  const totalSheets = pageCount * copies;
  const basePrintCost = Math.round(totalSheets * effectivePageRate);
  
  let bindCost = 0;
  if (binding === 'staple') bindCost = 2 * copies;
  if (binding === 'transparent_folder') bindCost = 15 * copies;
  if (binding === 'spiral_coil') bindCost = 30 * copies;
  if (binding === 'hardcover_gold') bindCost = 120 * copies;

  const totalCalculated = (priceData?.finalPrice || (basePrintCost + bindCost));
  const estimatedMrp = Math.round(totalCalculated * 1.35);
  const discountSaved = Math.max(0, estimatedMrp - totalCalculated);

  const handleAddToCart = () => {
    const fileName = file?.name || 'Urgent_Document_Printout.pdf';
    
    const printConfig: PrintoutConfig = {
      id: 'print-' + Date.now(),
      fileName,
      fileSize: file?.size || '1.5 MB',
      fileType: (file?.type as any) || 'pdf',
      pageCount,
      copies,
      colorMode,
      paperType,
      printSide,
      binding,
      orientation: 'portrait',
      urgentExpress,
      specialInstructions: instructions,
      pricePerPage: effectivePageRate,
      totalPagesToPrint: totalSheets,
      bindingCost: bindCost,
      paperUpgradeCost: paperExtra * totalSheets,
      basePrintingCost: basePrintCost,
      subtotal: basePrintCost + bindCost,
      discount: discountSaved,
      finalPrice: totalCalculated
    };

    const bindingLabel =
      binding === 'spiral_coil'
        ? 'Spiral Bound'
        : binding === 'staple'
        ? 'Stapled'
        : binding === 'transparent_folder'
        ? 'Folder Packed'
        : binding === 'hardcover_gold'
        ? 'Hardcover Gold'
        : 'Loose Sheets';

    const customProduct: Product = {
      id: 'p-print-' + Date.now(),
      name: `🖨️ Document Printout (${pageCount} Pages x ${copies} Copy • ${colorMode.toUpperCase()} • ${bindingLabel})`,
      quantity: `${pageCount * copies} Pages`,
      category: 'Stationery',
      subcategory: 'Print & Xerox',
      mrp: estimatedMrp,
      sellingPrice: totalCalculated,
      discountPercentage: Math.round(((estimatedMrp - totalCalculated) / estimatedMrp) * 100),
      bargainingAllowed: false,
      stock: 100,
      sellerId: 's-stationery-1',
      sellerName: 'Bazli Instant Xerox & Print Hub',
      sellerType: 'stationery',
      image:
        binding === 'spiral_coil'
          ? 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60'
          : 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=500&auto=format&fit=crop&q=60',
      description: `Document: ${fileName} | ${pageCount} pages | ${colorMode.toUpperCase()} | ${paperType} | ${printSide} | Binding: ${bindingLabel} | Note: ${instructions || 'None'}`,
      rating: 4.9,
      reviewCount: 384,
      isPopular: true
    };

    onAddPrintoutToCart(customProduct, 1, printConfig);
    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="relative w-full max-w-4xl bg-stone-900 border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
      >
        {/* Header */}
        <div className="relative px-5 py-4 sm:px-6 sm:py-5 bg-gradient-to-r from-purple-950 via-indigo-950 to-pink-950 border-b border-purple-800/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-yellow-300 via-pink-400 to-purple-500 flex items-center justify-center text-slate-950 shadow-md">
              <Printer className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  10-Min Document Printout & Xerox
                </h2>
                <span className="bg-yellow-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  ⚡ 10M EXPRESS
                </span>
              </div>
              <p className="text-xs text-pink-200">
                Upload PDF / Word documents • Choose Color, B&W & Spiral Binding • Express 10-minute doorstep delivery!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* File Upload / Selected File Bar */}
          <div className="space-y-3">
            {!file ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-purple-500/40 hover:border-pink-400 bg-stone-950/60 hover:bg-stone-950 rounded-3xl p-6 text-center cursor-pointer transition-all group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                  }}
                />
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-pink-500/20 text-pink-300 border border-purple-500/30 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-7 h-7" />
                </div>
                <h3 className="text-base font-black text-white">
                  Drop your PDF, Word (.docx) or Image here
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  Supports Admit cards, Thesis, Court Stamp, Resumes & Exam Notes.
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-200 text-xs font-bold mt-3">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>100% Private & Encrypted Printing (Auto-deleted after print)</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-stone-950 border border-purple-500/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-900/50 text-pink-300 border border-purple-500/30 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-white truncate max-w-xs sm:max-w-md">
                      {file.name}
                    </div>
                    <div className="text-xs text-stone-400">
                      {file.size} • Ready for high-speed print
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-xs text-stone-400 hover:text-rose-400 underline font-bold cursor-pointer"
                >
                  Change File
                </button>
              </div>
            )}

            {/* Quick Demo Templates */}
            {!file && (
              <div className="pt-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-stone-400 mb-2 block">
                  ⚡ Or select a demo document to test live pricing:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {sampleDocs.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setFile({ name: sample.name, size: sample.size, type: sample.type });
                        setPageCount(sample.pageCount);
                        setColorMode(sample.defaultColor as any);
                        setBinding(sample.defaultBinding as any);
                        setPaperType(sample.defaultPaper as any);
                      }}
                      className="p-2.5 rounded-2xl bg-stone-950/70 hover:bg-stone-900 border border-stone-800 hover:border-purple-500/40 text-left transition-all flex items-center gap-2.5 group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl bg-purple-950/60 text-purple-300 border border-purple-800/60 flex items-center justify-center shrink-0">
                        <FileCheck2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-stone-200 group-hover:text-pink-300 truncate">
                          {sample.name}
                        </div>
                        <div className="text-[10px] text-stone-500">
                          {sample.pageCount} Pages • {sample.size}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            {/* 1. Page Count & Copies */}
            <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-stone-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span>Pages & Copies</span>
                </span>
                <span className="text-xs text-pink-400 font-bold">
                  Total {pageCount * copies} printed sides
                </span>
              </div>

              {/* Page count adjuster */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Document Total Pages</div>
                  <div className="text-[11px] text-stone-400">Kitne page print karne hain?</div>
                </div>
                <div className="flex items-center bg-stone-900 border border-stone-700 rounded-xl p-0.5">
                  <button
                    onClick={() => setPageCount((p) => Math.max(1, p - 1))}
                    className="w-8 h-8 rounded-lg hover:bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={pageCount}
                    onChange={(e) => setPageCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-12 text-center text-xs font-black text-white bg-transparent focus:outline-none"
                  />
                  <button
                    onClick={() => setPageCount((p) => p + 1)}
                    className="w-8 h-8 rounded-lg hover:bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Number of Copies */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Number of Sets / Copies</div>
                  <div className="text-[11px] text-stone-400">Total document copies</div>
                </div>
                <div className="flex items-center bg-stone-900 border border-stone-700 rounded-xl p-0.5">
                  <button
                    onClick={() => setCopies((c) => Math.max(1, c - 1))}
                    className="w-8 h-8 rounded-lg hover:bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-12 text-center text-xs font-black text-white">{copies}</span>
                  <button
                    onClick={() => setCopies((c) => c + 1)}
                    className="w-8 h-8 rounded-lg hover:bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Print Side (Single vs Duplex) */}
              <div className="space-y-1.5 pt-1">
                <div className="text-xs font-bold text-stone-300">Printing Sides:</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPrintSide('duplex')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                      printSide === 'duplex'
                        ? 'bg-purple-950/80 border-pink-400 text-white shadow-sm'
                        : 'bg-stone-900/70 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <span>Back-to-Back (Duplex)</span>
                    <span className="text-[10px] text-emerald-400 font-bold">Save 15% + Eco 🌱</span>
                  </button>
                  <button
                    onClick={() => setPrintSide('single')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                      printSide === 'single'
                        ? 'bg-purple-950/80 border-pink-400 text-white shadow-sm'
                        : 'bg-stone-900/70 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <span>Single Sided</span>
                    <span className="text-[10px] text-stone-500">Standard single page</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Color Mode & Quality */}
            <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-stone-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                  <span>Color Mode</span>
                </span>
                <span className="text-xs text-yellow-300 font-bold">
                  ₹{effectivePageRate} / side
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setColorMode('bw')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    colorMode === 'bw'
                      ? 'bg-stone-800 border-white text-white shadow-md'
                      : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <div className="font-black text-xs text-white">Black & White</div>
                  <div className="text-[10px] text-stone-400 mt-0.5">₹2 / page</div>
                </button>

                <button
                  onClick={() => setColorMode('color')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    colorMode === 'color'
                      ? 'bg-gradient-to-br from-pink-900 to-purple-900 border-pink-400 text-white shadow-md'
                      : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <div className="font-black text-xs text-pink-200">Rich Color</div>
                  <div className="text-[10px] text-pink-300 mt-0.5">₹7 / page</div>
                </button>

                <button
                  onClick={() => setColorMode('photo_hd')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    colorMode === 'photo_hd'
                      ? 'bg-gradient-to-br from-yellow-900 to-amber-900 border-yellow-400 text-white shadow-md'
                      : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <div className="font-black text-xs text-yellow-200">Photo HD</div>
                  <div className="text-[10px] text-yellow-300 mt-0.5">₹15 / page</div>
                </button>
              </div>

              {/* Paper Quality Selector */}
              <div className="space-y-1.5 pt-1">
                <div className="text-xs font-bold text-stone-300">Paper Type:</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaperType('standard_75gsm')}
                    className={`p-2 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      paperType === 'standard_75gsm'
                        ? 'bg-purple-950/80 border-pink-400 text-white'
                        : 'bg-stone-900 border-stone-800 text-stone-400'
                    }`}
                  >
                    <div className="font-bold">75 GSM Standard</div>
                    <div className="text-[10px] text-stone-500">JK Copier Normal (₹0)</div>
                  </button>

                  <button
                    onClick={() => setPaperType('bond_100gsm')}
                    className={`p-2 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      paperType === 'bond_100gsm'
                        ? 'bg-purple-950/80 border-pink-400 text-white'
                        : 'bg-stone-900 border-stone-800 text-stone-400'
                    }`}
                  >
                    <div className="font-bold">100 GSM Bond</div>
                    <div className="text-[10px] text-yellow-300">+₹1.5/page (Executive)</div>
                  </button>

                  <button
                    onClick={() => setPaperType('glossy_photo')}
                    className={`p-2 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      paperType === 'glossy_photo'
                        ? 'bg-purple-950/80 border-pink-400 text-white'
                        : 'bg-stone-900 border-stone-800 text-stone-400'
                    }`}
                  >
                    <div className="font-bold">220 GSM Glossy</div>
                    <div className="text-[10px] text-yellow-300">+₹8/page (Photos)</div>
                  </button>

                  <button
                    onClick={() => setPaperType('stamp_legal')}
                    className={`p-2 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      paperType === 'stamp_legal'
                        ? 'bg-purple-950/80 border-pink-400 text-white'
                        : 'bg-stone-900 border-stone-800 text-stone-400'
                    }`}
                  >
                    <div className="font-bold">Legal / Stamp</div>
                    <div className="text-[10px] text-yellow-300">+₹12/page (Agreements)</div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Binding Options */}
          <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-stone-300 flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-yellow-400" />
                <span>Binding & Finishing</span>
              </span>
              <span className="text-xs text-stone-400">Delivered ready to submit / file</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                onClick={() => setBinding('none')}
                className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                  binding === 'none'
                    ? 'bg-purple-950 border-pink-400 text-white shadow-sm'
                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <div className="font-bold text-xs">Loose Sheets</div>
                <div className="text-[10px] text-emerald-400 mt-0.5">Free (₹0)</div>
              </button>

              <button
                onClick={() => setBinding('staple')}
                className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                  binding === 'staple'
                    ? 'bg-purple-950 border-pink-400 text-white shadow-sm'
                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <div className="font-bold text-xs">Corner Staple</div>
                <div className="text-[10px] text-yellow-300 mt-0.5">+₹2 / set</div>
              </button>

              <button
                onClick={() => setBinding('spiral_coil')}
                className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                  binding === 'spiral_coil'
                    ? 'bg-gradient-to-br from-pink-900 to-purple-900 border-pink-400 text-white shadow-md'
                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <div className="font-bold text-xs text-pink-200">Spiral Binding</div>
                <div className="text-[10px] text-yellow-300 mt-0.5">+₹30 (Clear Sheet)</div>
              </button>

              <button
                onClick={() => setBinding('transparent_folder')}
                className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                  binding === 'transparent_folder'
                    ? 'bg-purple-950 border-pink-400 text-white shadow-sm'
                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <div className="font-bold text-xs">Slide Folder</div>
                <div className="text-[10px] text-yellow-300 mt-0.5">+₹15 / file</div>
              </button>

              <button
                onClick={() => setBinding('hardcover_gold')}
                className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                  binding === 'hardcover_gold'
                    ? 'bg-gradient-to-br from-amber-900 to-yellow-900 border-yellow-400 text-white shadow-md'
                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <div className="font-bold text-xs text-amber-200">Hardcover Gold</div>
                <div className="text-[10px] text-yellow-300 mt-0.5">+₹120 (Thesis)</div>
              </button>
            </div>
          </div>

          {/* Special Instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-300">
              Special Printing Instructions (Optional):
            </label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Print first page color and rest B&W, or staple on top-left..."
              className="w-full bg-stone-950 border border-stone-800 focus:border-pink-500 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-stone-600 focus:outline-none"
            />
          </div>

          {/* Delivery & Security Promise */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-pink-950/40 border border-pink-500/20 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-pink-200">
              <Clock className="w-4 h-4 text-yellow-300 shrink-0" />
              <span>
                Dispatched from nearest <strong>Bazli Certified Xerox Station</strong> within 10 Minutes!
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-emerald-400 font-bold shrink-0">
              <ShieldCheck className="w-4 h-4" />
              <span>No data stored</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-stone-950 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <div className="text-xs text-stone-400">
              {pageCount} Pages • {copies} Copy ({totalSheets} printed sides)
            </div>
            <div className="text-lg font-black text-white flex items-center gap-2">
              <span>Total: ₹{totalCalculated}</span>
              {discountSaved > 0 && (
                <span className="text-xs text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  Saved ₹{discountSaved}!
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs sm:text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleAddToCart}
              className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 hover:from-yellow-300 hover:to-purple-500 text-slate-950 font-black text-sm shadow-xl shadow-pink-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all transform active:scale-95"
            >
              <Printer className="w-4 h-4 stroke-[2.5]" />
              <span>Add Printout to Cart (₹{totalCalculated})</span>
            </button>
          </div>
        </div>

        {/* Added Toast */}
        <AnimatePresence>
          {addedToast && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute inset-x-4 bottom-20 sm:bottom-6 mx-auto max-w-sm p-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-sm shadow-2xl flex items-center justify-center gap-2 z-50"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Printout added to Cart! Dispatched in 10 Min 🖨️</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
