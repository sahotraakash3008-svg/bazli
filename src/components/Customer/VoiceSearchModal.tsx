import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  ShoppingBag,
  Plus,
  CheckCircle,
  X,
  Languages,
  Zap,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { Product, CartItem } from '../../types';

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddToCart: (product: Product, quantity?: number, weightOption?: string) => void;
  onSelectProduct?: (product: Product) => void;
  onDirectSearchSubmit?: (query: string) => void;
}

interface ParsedVoiceItem {
  id: string;
  matchedProduct: Product;
  requestedQty: number;
  extractedUnit?: string;
  confidence: number;
  matchedPhrase: string;
}

export const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onAddToCart,
  onSelectProduct,
  onDirectSearchSubmit
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'hi-IN' | 'en-IN'>('hi-IN');
  const [detectedItems, setDetectedItems] = useState<ParsedVoiceItem[]>([]);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [addedSuccessIds, setAddedSuccessIds] = useState<string[]>([]);
  const [hasAddedAll, setHasAddedAll] = useState(false);

  const recognitionRef = React.useRef<any>(null);

  // Quick preset voice prompts for testing / demo
  const samplePrompts = [
    { label: '🥛 2 packets Milk & 1 Butter', text: 'Do packet milk aur ek Amul butter daal do', lang: 'hi-IN' },
    { label: '🍞 Brown Bread & 6 Eggs', text: 'One brown bread and half dozen farm eggs', lang: 'en-IN' },
    { label: '🌾 5kg Aashirvaad Atta', text: 'Paanch kilo Aashirvaad atta aur 1 liter refined oil', lang: 'hi-IN' },
    { label: '🍅 1kg Tamatar & 2kg Aloo', text: 'Ek kilo tamatar, do kilo aloo aur dahi', lang: 'hi-IN' },
    { label: '☕ Tata Tea & Maggi', text: 'Tata Tea Gold and four packets Maggi noodles', lang: 'en-IN' }
  ];

  // Helper dictionary for Hindi numbers and colloquial terms
  const parseQuantity = (text: string): number => {
    const lower = text.toLowerCase();
    if (lower.includes('half') || lower.includes('aadha') || lower.includes('adho')) return 1;
    if (lower.includes('ek') || lower.includes('one') || lower.includes('1') || lower.includes('single')) return 1;
    if (lower.includes('do') || lower.includes('two') || lower.includes('2') || lower.includes('dono')) return 2;
    if (lower.includes('teen') || lower.includes('three') || lower.includes('3')) return 3;
    if (lower.includes('chaar') || lower.includes('char') || lower.includes('four') || lower.includes('4')) return 4;
    if (lower.includes('paanch') || lower.includes('panch') || lower.includes('five') || lower.includes('5')) return 5;
    if (lower.includes('chhah') || lower.includes('six') || lower.includes('6')) return 6;
    if (lower.includes('dozen') || lower.includes('darjan') || lower.includes('12')) return 1;
    return 1;
  };

  // Natural Language Voice Parser for grocery catalog
  const parseVoiceInput = (rawText: string) => {
    if (!rawText || rawText.trim().length === 0) {
      setDetectedItems([]);
      return;
    }

    const segments = rawText
      .split(/(?:,|\s+aur\s+|\s+and\s+|\s+plus\s+|\s+or\s+|\s+daal\s+do|\s+chahiye|\s+add\s+)/i)
      .map(s => s.trim())
      .filter(s => s.length > 1);

    const results: ParsedVoiceItem[] = [];
    const matchedProductIds = new Set<string>();

    segments.forEach(segment => {
      const qty = parseQuantity(segment);
      const cleanSegment = segment
        .replace(/\b(ek|do|teen|chaar|paanch|chhah|one|two|three|four|five|six|1|2|3|4|5|6|kilo|kg|packet|pack|darjan|dozen|liter|litre|gm|g|daal|do|chahiye|add|please|mujhe|aur|and)\b/gi, '')
        .trim()
        .toLowerCase();

      if (cleanSegment.length < 2) return;

      // Find best matching product
      let bestMatch: Product | null = null;
      let highestScore = 0;

      products.forEach(p => {
        const pName = p.name.toLowerCase();
        const pCat = p.category.toLowerCase();
        const pDesc = (p.description || '').toLowerCase();
        let score = 0;

        // Exact substring
        if (pName.includes(cleanSegment)) score += 10;
        if (pCat.includes(cleanSegment)) score += 5;
        if (pDesc.includes(cleanSegment)) score += 3;

        // Token match
        const tokens = cleanSegment.split(/\s+/);
        tokens.forEach(tok => {
          if (tok.length > 2) {
            if (pName.includes(tok)) score += 4;
            if (pCat.includes(tok)) score += 2;
          }
        });

        // Hindi colloquial mapping
        if (cleanSegment.includes('doodh') && (pName.includes('milk') || pCat.includes('dairy'))) score += 8;
        if (cleanSegment.includes('tamatar') && pName.includes('tomato')) score += 8;
        if (cleanSegment.includes('aloo') && (pName.includes('potato') || pName.includes('aloo'))) score += 8;
        if (cleanSegment.includes('pyaz') && (pName.includes('onion') || pName.includes('pyaz'))) score += 8;
        if (cleanSegment.includes('dahi') && (pName.includes('curd') || pName.includes('dahi') || pName.includes('yogurt'))) score += 8;
        if (cleanSegment.includes('makkhan') && (pName.includes('butter') || pName.includes('amul'))) score += 8;
        if (cleanSegment.includes('anda') && (pName.includes('egg') || pCat.includes('eggs'))) score += 8;
        if (cleanSegment.includes('chai') && (pName.includes('tea') || pCat.includes('beverage'))) score += 8;
        if (cleanSegment.includes('cheeni') && pName.includes('sugar')) score += 8;
        if (cleanSegment.includes('tel') && (pName.includes('oil') || pCat.includes('oil'))) score += 8;
        if (cleanSegment.includes('atta') && (pName.includes('atta') || pName.includes('flour'))) score += 8;
        if (cleanSegment.includes('chawal') && (pName.includes('rice') || pCat.includes('rice'))) score += 8;
        if (cleanSegment.includes('namak') && pName.includes('salt')) score += 8;
        if (cleanSegment.includes('biscuit') && (pName.includes('biscuit') || pName.includes('cookie'))) score += 8;

        if (score > highestScore && !matchedProductIds.has(p.id)) {
          highestScore = score;
          bestMatch = p;
        }
      });

      if (bestMatch && highestScore >= 3) {
        matchedProductIds.add(bestMatch.id);
        results.push({
          id: `${bestMatch.id}-${Date.now()}-${Math.random()}`,
          matchedProduct: bestMatch,
          requestedQty: qty,
          extractedUnit: segment.includes('kilo') || segment.includes('kg') ? 'kg' : segment.includes('packet') ? 'pack' : undefined,
          confidence: Math.min(100, highestScore * 10),
          matchedPhrase: segment
        });
      }
    });

    setDetectedItems(results);
  };

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setSpeechSupported(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLanguage;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            currentFinal += event.results[i][0].transcript + ' ';
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        const combined = (transcript + ' ' + currentFinal).trim();
        if (currentFinal) {
          setTranscript(combined);
          parseVoiceInput(combined);
        }
        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech Recognition Error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone permission was denied. Please allow microphone access.');
        } else if (event.error === 'no-speech') {
          // Soft timeout, ignore
        } else {
          setErrorMessage(`Microphone notice: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [selectedLanguage]);

  // Handle Start / Stop
  const toggleListening = async () => {
    if (!speechSupported) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setErrorMessage(null);
      // Explicitly request audio device permission if available in browser
      if (navigator.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          // Stop media tracks once permission granted so speech recognition can bind
          stream.getTracks().forEach(track => track.stop());
        } catch (err: any) {
          console.warn('Microphone access check notice:', err);
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setErrorMessage('Microphone access was denied. Please allow microphone permission in browser settings.');
            return;
          }
        }
      }
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.warn('Error starting speech recognition:', err);
      }
    }
  };

  // Trigger Sample Prompt
  const handleSelectSample = (sample: typeof samplePrompts[0]) => {
    setSelectedLanguage(sample.lang as any);
    setTranscript(sample.text);
    setInterimTranscript('');
    parseVoiceInput(sample.text);
  };

  // Add individual item to cart
  const handleAddIndividual = (item: ParsedVoiceItem) => {
    onAddToCart(item.matchedProduct, item.requestedQty);
    setAddedSuccessIds(prev => [...prev, item.id]);
  };

  // Add all detected items to cart
  const handleAddAllDetected = () => {
    detectedItems.forEach(item => {
      onAddToCart(item.matchedProduct, item.requestedQty);
    });
    setHasAddedAll(true);
    setAddedSuccessIds(detectedItems.map(d => d.id));
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#fcfaf6] rounded-3xl max-w-lg w-full max-h-[92vh] overflow-hidden shadow-2xl border border-rose-300/60 flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-br from-[#2b0c16] via-[#3b121f] to-[#1a050c] text-white relative border-b border-rose-800/40">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-stone-300 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-400 text-stone-950 flex items-center justify-center shadow-lg font-black shrink-0">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-xl tracking-tight text-white">
                  Bazli <span className="text-rose-400">Voice Assistant</span>
                </h3>
                <span className="bg-rose-500/20 text-rose-300 border border-rose-400/40 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Languages className="w-3 h-3" /> HINDI & EN
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                Speak your grocery list in Hindi, Hinglish or English!
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Language Selector */}
          <div className="flex items-center justify-between bg-white p-2.5 rounded-2xl border border-[#ded2bc]">
            <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-rose-600" />
              <span>Preferred Spoken Language:</span>
            </span>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setSelectedLanguage('hi-IN')}
                className={`px-3 py-1 text-xs font-black rounded-xl transition-all cursor-pointer ${
                  selectedLanguage === 'hi-IN'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                🇮🇳 Hindi / Hinglish
              </button>
              <button
                onClick={() => setSelectedLanguage('en-IN')}
                className={`px-3 py-1 text-xs font-black rounded-xl transition-all cursor-pointer ${
                  selectedLanguage === 'en-IN'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                🇬🇧 English
              </button>
            </div>
          </div>

          {/* Microphone Central Recording Button */}
          <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-stone-50 to-white rounded-3xl border border-[#ded2bc] text-center space-y-3 relative overflow-hidden">
            {isListening && (
              <div className="absolute inset-0 bg-rose-500/5 animate-pulse pointer-events-none" />
            )}

            <div className="relative">
              {isListening && (
                <div className="absolute -inset-3 rounded-full bg-rose-500/30 animate-ping" />
              )}
              <button
                onClick={toggleListening}
                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all cursor-pointer transform hover:scale-105 active:scale-95 ${
                  isListening
                    ? 'bg-rose-600 text-white ring-4 ring-rose-300'
                    : 'bg-gradient-to-tr from-rose-500 to-amber-500 text-white ring-4 ring-rose-100'
                }`}
              >
                {isListening ? (
                  <MicOff className="w-8 h-8 animate-pulse" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </button>
            </div>

            <div>
              <h5 className="font-black text-sm text-stone-900">
                {isListening ? 'Listening... Speak now 🎙️' : 'Tap Microphone to Speak'}
              </h5>
              <p className="text-xs text-stone-500 mt-0.5">
                {isListening
                  ? 'Say: "2 packet doodh, 1 butter aur 6 ande daal do"'
                  : 'Say products with quantities or tap sample prompts below'}
              </p>
            </div>

            {/* Live Transcript Display */}
            {(transcript || interimTranscript) && (
              <div className="w-full bg-[#fbf9f5] border border-rose-200 p-3.5 rounded-2xl text-left space-y-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                    Live Spoken Text:
                  </span>
                  {transcript && (
                    <button
                      onClick={() => {
                        const searchQueryText = detectedItems.length > 0 
                          ? detectedItems.map(d => d.matchedProduct.name.split(' ')[0]).join(' ') 
                          : transcript;
                        if (onDirectSearchSubmit) onDirectSearchSubmit(searchQueryText);
                        onClose();
                      }}
                      className="text-[11px] font-black text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                      title="Directly search this in search bar and show suggestions"
                    >
                      <span>🔍 Auto-Search</span>
                    </button>
                  )}
                </div>
                <p className="text-xs text-stone-900 font-medium italic">
                  "{transcript}" <span className="text-rose-500 font-semibold">{interimTranscript}</span>
                </p>

                {transcript && (
                  <button
                    onClick={() => {
                      if (onDirectSearchSubmit) {
                        onDirectSearchSubmit(transcript);
                      }
                      onClose();
                    }}
                    className="w-full mt-1 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white text-xs font-black py-2 px-3 rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <span>Search "{transcript}" in Search Bar & View Suggestions</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {errorMessage && (
              <div className="w-full bg-red-50 border border-red-200 text-red-700 p-2.5 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Quick Demo Voice Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-stone-800 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Try Instant Sample Voice Orders</span>
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {samplePrompts.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSample(s)}
                  className="p-2.5 text-left bg-white hover:bg-rose-50/50 rounded-2xl border border-[#ded2bc] hover:border-rose-300 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <span className="font-bold text-xs text-stone-900 group-hover:text-rose-950">
                    {s.label}
                  </span>
                  <span className="text-[10px] text-stone-500 italic mt-0.5 truncate">
                    "{s.text}"
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Parsed & Matched Items Cart Preview */}
          {detectedItems.length > 0 && (
            <div className="space-y-2.5 bg-emerald-50/70 border border-emerald-300 p-4 rounded-3xl animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Detected {detectedItems.length} Products</span>
                </span>
                <span className="text-[11px] font-bold text-emerald-800 font-mono">
                  Total: ₹
                  {detectedItems.reduce(
                    (acc, d) => acc + (d.matchedProduct.sellingPrice || d.matchedProduct.price) * d.requestedQty,
                    0
                  )}
                </span>
              </div>

              <div className="space-y-2">
                {detectedItems.map(item => {
                  const isAdded = addedSuccessIds.includes(item.id);
                  const price = item.matchedProduct.sellingPrice || item.matchedProduct.price;
                  return (
                    <div
                      key={item.id}
                      className="bg-white p-2.5 rounded-2xl border border-emerald-200 flex items-center justify-between shadow-2xs"
                    >
                      <div 
                        className="flex items-center space-x-2.5 cursor-pointer flex-1"
                        onClick={() => {
                          if (onDirectSearchSubmit) onDirectSearchSubmit(item.matchedProduct.name);
                          onClose();
                        }}
                        title="Click to search this product in search bar"
                      >
                        <img
                          src={item.matchedProduct.image}
                          alt={item.matchedProduct.name}
                          className="w-10 h-10 object-cover rounded-xl border border-stone-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h6 className="font-bold text-xs text-stone-900 leading-tight hover:text-amber-600 transition-colors">
                            {item.matchedProduct.name}
                          </h6>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-stone-500">
                              Qty: <strong className="text-stone-900">{item.requestedQty}</strong> ({item.matchedProduct.quantity})
                            </span>
                            <span className="text-xs font-black text-emerald-700 font-mono">
                              ₹{price * item.requestedQty}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => {
                            if (onDirectSearchSubmit) onDirectSearchSubmit(item.matchedProduct.name);
                            onClose();
                          }}
                          className="p-1.5 rounded-xl text-[11px] font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer"
                          title="Search in Search Bar"
                        >
                          🔍
                        </button>
                        <button
                          onClick={() => handleAddIndividual(item)}
                          disabled={isAdded}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center space-x-1 cursor-pointer transition-all ${
                            isAdded
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-[#ded2bc] space-y-2">
          {detectedItems.length > 0 ? (
            hasAddedAll ? (
              <div className="w-full py-3 bg-emerald-600 text-white font-black text-center rounded-2xl flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>All {detectedItems.length} Items Added to Cart! 🛒</span>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={handleAddAllDetected}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black py-3 rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2 text-sm cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add All {detectedItems.length} Voice Items to Cart</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    const queryText = detectedItems.map(d => d.matchedProduct.name.split(' ')[0]).join(' ') || transcript;
                    if (onDirectSearchSubmit) onDirectSearchSubmit(queryText);
                    onClose();
                  }}
                  className="w-full bg-[#1e070f] hover:bg-[#2e0b17] text-amber-300 font-bold py-2.5 rounded-xl border border-rose-900/60 transition-all flex items-center justify-center space-x-1.5 text-xs cursor-pointer"
                >
                  <span>🔍 View All Suggestions in Search Bar</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                </button>
              </div>
            )
          ) : (
            transcript && (
              <button
                onClick={() => {
                  if (onDirectSearchSubmit) {
                    onDirectSearchSubmit(transcript);
                  }
                  onClose();
                }}
                className="w-full bg-[#0a192f] hover:bg-[#132f54] text-amber-300 font-black py-3 rounded-2xl transition-all flex items-center justify-center space-x-2 text-xs cursor-pointer border border-[#1e3a5f]"
              >
                <span>Search catalogue for "{transcript}"</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
