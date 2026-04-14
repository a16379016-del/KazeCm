import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, User, ShieldCheck } from 'lucide-react';
import { Message } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '@/src/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

interface ChatWidgetProps {
  commissionDocId: string;
  orderIdDisplay: string;
  isAdmin?: boolean;
}

export function ChatWidget({ commissionDocId, orderIdDisplay, isAdmin = false }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !commissionDocId) return;

    const q = query(
      collection(db, 'commissions', commissionDocId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [isOpen, commissionDocId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputText.trim() || !commissionDocId) return;
    const text = inputText;
    setInputText('');
    
    try {
      await addDoc(collection(db, 'commissions', commissionDocId, 'messages'), {
        sender: isAdmin ? 'admin' : 'user',
        text,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Error sending message:", error);
      alert("發送失敗");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="glass w-80 sm:w-96 h-[550px] rounded-[2.5rem] overflow-hidden flex flex-col mb-6 shadow-2xl border-white/60"
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-[#9D50BB] to-[#6E48AA] flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">即時溝通</h3>
                  <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest">ID: {orderIdDisplay}</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-white/30">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-3">
                  <MessageCircle className="w-16 h-16 text-[#9D50BB]" />
                  <p className="text-base font-black text-[#2D3436]">尚無對話記錄</p>
                </div>
              )}
              {messages.map((msg) => {
                const isMe = (isAdmin && msg.sender === 'admin') || (!isAdmin && msg.sender === 'user');
                return (
                  <div key={msg.id} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                    <div className={cn(
                      "max-w-[85%] p-4 rounded-2xl text-sm font-bold shadow-sm",
                      isMe ? "bg-[#9D50BB] text-white rounded-tr-none" : "bg-white text-[#2D3436] rounded-tl-none border border-black/5"
                    )}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-[#B2BEC3] mt-2 px-1 font-black uppercase tracking-widest">
                      {msg.sender === 'admin' ? '繪師' : '委託人'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <div className="p-6 bg-white/50 border-t border-black/5 flex gap-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="輸入訊息..."
                className="flex-1 glass-input py-3 text-sm"
              />
              <button 
                onClick={handleSend}
                className="w-12 h-12 bg-[#9D50BB] text-white rounded-xl flex items-center justify-center hover:shadow-lg transition-all active:scale-90"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-90",
          isOpen ? "bg-white text-[#9D50BB] rotate-90" : "bg-gradient-to-r from-[#9D50BB] to-[#6E48AA] text-white"
        )}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!isOpen && messages.length > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
            !
          </div>
        )}
      </button>
    </div>
  );
}
