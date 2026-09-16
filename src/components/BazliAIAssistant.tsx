import React, { useState } from 'react';
import { Bot, Send, X, Sparkles, MessageCircle, Phone, ExternalLink, Clock, Headphones } from 'lucide-react';
import { CartItem } from '../types';

interface BazliAIAssistantProps {
  cartItems: CartItem[];
  isAssistantOpen?: boolean;
  onToggleAssistant?: (isOpen: boolean) => void;
  isWhatsAppOpen?: boolean;
  onToggleWhatsApp?: (isOpen: boolean) => void;
}

export const BazliAIAssistant: React.FC<BazliAIAssistantProps> = ({
  cartItems,
  isAssistantOpen = false,
  onToggleAssistant,
  isWhatsAppOpen = false,
  onToggleWhatsApp
}) => {
  const [activeWidget, setActiveWidget] = useState<'none' | 'ai' | 'whatsapp'>('none');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [waMessage, setWaMessage] = useState('Hello Bazli Support, I need assistance with my order.');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    {
      sender: 'bot',
      text: 'Namaste! I am Bazli Assistant 🛒. Ask me for recipe suggestions, bargain tips, or price comparisons on Bazli!'
    }
  ]);

  // Sync external assistant trigger from footer
  React.useEffect(() => {
    if (isAssistantOpen) {
      setActiveWidget('ai');
    }
  }, [isAssistantOpen]);

  // Sync external WhatsApp trigger from footer
  React.useEffect(() => {
    if (isWhatsAppOpen) {
      setActiveWidget('whatsapp');
    }
  }, [isWhatsAppOpen]);

  const handleClose = () => {
    setActiveWidget('none');
    if (onToggleAssistant) {
      onToggleAssistant(false);
    }
    if (onToggleWhatsApp) {
      onToggleWhatsApp(false);
    }
  };

  const whatsappNumber = '919871618126';
  const whatsappFormattedNumber = '+91 9871618126';

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userText, cartItems })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: 'Bazli Tip: Look for items marked with Bargain Eligible to negotiate custom prices in real time with our smart Bazli engine.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWhatsApp = (customMsg?: string) => {
    const textToSend = encodeURIComponent(customMsg || waMessage);
    window.open(`https://wa.me/${whatsappNumber}?text=${textToSend}`, '_blank', 'noopener,noreferrer');
  };

  if (activeWidget === 'none') {
    return null;
  }

  return (
    <div className="fixed bottom-[4.25rem] right-3 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end space-y-2 max-w-[calc(100vw-24px)]">
      {/* BAZLI ASSISTANT WINDOW */}
      {activeWidget === 'ai' && (
        <div className="bg-white w-[calc(100vw-24px)] sm:w-96 max-w-sm rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-96 animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-emerald-900 text-white p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-amber-400" />
              <div>
                <h4 className="font-extrabold text-sm leading-none">Bazli Assistant</h4>
                <span className="text-[10px] text-emerald-200">Smart Grocery, Dining & Bargain Advisor</span>
              </div>
            </div>
            <button onClick={handleClose} className="p-1 text-emerald-100 hover:bg-emerald-800 rounded-full cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-2.5 rounded-2xl ${
                    m.sender === 'user'
                      ? 'bg-emerald-600 text-white font-medium rounded-br-xs'
                      : 'bg-slate-100 text-slate-800 border border-slate-200 rounded-bl-xs'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-slate-400 text-[11px] italic">Bazli Assistant is thinking...</div>
            )}
          </div>

          {/* Quick WhatsApp Escalate Banner in AI Chat */}
          <div className="bg-emerald-50 border-t border-emerald-100 px-3 py-1.5 flex items-center justify-between text-[11px]">
            <span className="text-slate-600 font-semibold flex items-center gap-1">
              <Headphones className="w-3.5 h-3.5 text-emerald-600" /> Need human agent?
            </span>
            <button
              onClick={() => handleOpenWhatsApp('Hi, I need direct human support for my Bazli account.')}
              className="text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" /> Chat WhatsApp
            </button>
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-2 border-t border-slate-200 flex gap-2 bg-slate-50">
            <input
              type="text"
              placeholder="Ask recipe or bargain tip..."
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* WHATSAPP CHAT POPUP WINDOW */}
      {activeWidget === 'whatsapp' && (
        <div className="bg-white w-[calc(100vw-24px)] sm:w-96 max-w-sm rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5">
          {/* WhatsApp Header */}
          <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-white border border-white/30">
                  <MessageCircle className="w-6 h-6 text-white fill-white" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-emerald-600 rounded-full"></span>
              </div>
              <div>
                <h4 className="font-extrabold text-sm leading-tight flex items-center gap-1.5">
                  <span>Bazli WhatsApp</span>
                  <span className="bg-white/20 text-[9px] px-1.5 py-0.2 rounded-md font-mono">OFFICIAL</span>
                </h4>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-300" /> Usually replies in &lt; 2 mins
                </p>
              </div>
            </div>
            <button onClick={handleClose} className="p-1 text-emerald-100 hover:bg-emerald-700 rounded-full cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* WhatsApp Chat Body */}
          <div className="p-4 bg-amber-50/40 space-y-3 text-xs">
            {/* Verified Support Info Box */}
            <div className="bg-white p-3 rounded-2xl border border-emerald-200/80 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-800">
                <span className="font-extrabold flex items-center gap-1 text-emerald-800">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" /> Support Line:
                </span>
                <span className="font-mono font-bold text-emerald-700">{whatsappFormattedNumber}</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Chat directly with our verified support executive for quick order tracking, delivery updates, or custom bargaining quotes.
              </p>
            </div>

            {/* Quick Template Suggestions */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Quick Topics to Send
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  '🛵 Where is my order delivery?',
                  '🤝 I want to bargain on bulk grocery items',
                  '📦 Request custom item or brand addition',
                  '❓ Question regarding Today 30% discount'
                ].map((tpl, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setWaMessage(tpl);
                      handleOpenWhatsApp(tpl);
                    }}
                    className="text-left bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 p-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center justify-between group"
                  >
                    <span>{tpl}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-emerald-600" />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Message Box */}
            <div className="space-y-1 pt-1">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Or Type Custom Message
              </label>
              <textarea
                rows={2}
                value={waMessage}
                onChange={e => setWaMessage(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs outline-none focus:border-emerald-500 font-medium resize-none"
              />
            </div>

            {/* Direct Open WhatsApp Button */}
            <button
              onClick={() => handleOpenWhatsApp()}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 rounded-2xl shadow-lg shadow-emerald-600/30 text-xs flex items-center justify-center space-x-2 cursor-pointer transition-transform hover:scale-102"
            >
              <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
              <span>Start WhatsApp Chat ({whatsappFormattedNumber})</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
