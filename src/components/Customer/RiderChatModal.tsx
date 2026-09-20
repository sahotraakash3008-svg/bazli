import React, { useState, useEffect, useRef } from 'react';
import { Order } from '../../types';
import {
  X,
  Send,
  Phone,
  Bike,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  Mic,
  Smile
} from 'lucide-react';

interface RiderChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onStartSimulatedCall?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'customer' | 'rider';
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  'I am waiting at the main society gate.',
  'Flat 402, 4th Floor (Lift is working).',
  'Please do not ring the bell, leave at door.',
  'Call me when you reach outside building.',
  'Please leave the bag with security guard.'
];

export const RiderChatModal: React.FC<RiderChatModalProps> = ({
  isOpen,
  onClose,
  order,
  onStartSimulatedCall
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'rider',
      text: `Hello ${order?.customerName?.split(' ')[0] || 'Customer'}! I've picked up your order #${order?.id || ''}. On my way on Ather EV scooter 🛵`,
      timestamp: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isRiderTyping, setIsRiderTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, isRiderTyping]);

  if (!isOpen) return null;

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'customer',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    if (!textToSend) setInputText('');

    // Simulate smart Rider Response
    setIsRiderTyping(true);
    setTimeout(() => {
      setIsRiderTyping(false);
      let reply = 'Got it! Reaching your doorstep in 3-4 mins. Thank you!';
      const lower = text.toLowerCase();
      if (lower.includes('gate') || lower.includes('security')) {
        reply = 'Understood! I will hand over the sealed bag to the security guard and inform you.';
      } else if (lower.includes('bell')) {
        reply = 'Noted! I will not ring the bell and place it carefully near the door.';
      } else if (lower.includes('lift') || lower.includes('floor')) {
        reply = 'Perfect, coming straight up to 4th floor Flat 402 via lift.';
      } else if (lower.includes('call')) {
        reply = 'Sure, will give you a missed call as soon as I arrive at your location!';
      }

      setMessages(prev => [
        ...prev,
        {
          id: `m-reply-${Date.now()}`,
          sender: 'rider',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md h-[600px] max-h-[90vh] flex flex-col shadow-2xl text-white overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-b border-emerald-800/40 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-lg">
                🛵
              </div>
              <span className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900 absolute -bottom-0.5 -right-0.5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                <span>{order.deliveryPartnerName || 'Vikram Singh (Rider)'}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded border border-emerald-500/30">
                  Live
                </span>
              </h4>
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-rose-400" />
                <span>0.8 km away • ETA: 4 Mins</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {onStartSimulatedCall && (
              <button
                onClick={onStartSimulatedCall}
                className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors cursor-pointer"
                title="Call Rider"
              >
                <Phone className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Masking notice */}
        <div className="px-4 py-1.5 bg-slate-950/80 border-b border-slate-800/60 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Bazli In-App Safe Communication (Number Protected)</span>
        </div>

        {/* Message Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/50">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'customer' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs font-medium shadow-sm ${
                  msg.sender === 'customer'
                    ? 'bg-emerald-600 text-white rounded-tr-xs'
                    : 'bg-slate-800 text-slate-100 rounded-tl-xs border border-slate-700'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))}

          {isRiderTyping && (
            <div className="flex items-center space-x-1.5 bg-slate-800/60 text-slate-400 px-3 py-1.5 rounded-2xl w-fit text-xs border border-slate-700">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              <span className="text-[10px] ml-1 text-slate-300">Rider is replying...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 py-2 bg-slate-900 border-t border-slate-800 overflow-x-auto flex space-x-2 no-scrollbar shrink-0">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium whitespace-nowrap shrink-0 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2 shrink-0">
          <input
            type="text"
            placeholder="Type a message to your rider..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim()}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white rounded-2xl transition-colors cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
