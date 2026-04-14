import React, { useState } from 'react';
import { GlassCard } from '@/src/components/GlassCard';
import { Commission, STATUS_ORDER, CommissionStatus, Message } from '@/src/types';
import { Settings, LogOut, Edit3, MessageCircle, Check, X, Shield, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatWidget } from '@/src/components/ChatWidget';

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [commissions, setCommissions] = useState<Commission[]>([
    {
      id: '1',
      nickname: '測試用戶',
      contact: 'discord#1234',
      title: '我的夢幻角色',
      category: '角色設計',
      details: '長髮、藍眼、穿著斗篷...',
      imageUrl: 'https://picsum.photos/seed/art/800/600',
      status: '線稿',
      createdAt: new Date(),
      orderId: '#ORDER-12345'
    }
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
  };

  const updateStatus = (id: string, status: CommissionStatus) => {
    setCommissions(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const updateOrderId = (id: string, orderId: string) => {
    setCommissions(prev => prev.map(c => c.id === id ? { ...c, orderId } : c));
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto pt-20">
        <GlassCard className="p-12 space-y-10 border-white/60">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-purple-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-[#9D50BB]" />
            </div>
            <h1 className="text-4xl font-black text-[#2D3436]">管理後台</h1>
            <p className="text-[#636E72] text-lg font-medium">請登入以管理您的委託單</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-[#B2BEC3] uppercase tracking-widest">管理員密碼</label>
              <input type="password" placeholder="••••••••" className="glass-input w-full" required />
            </div>
            <button type="submit" className="glass-button w-full text-lg">登入系統</button>
          </form>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-5xl font-black text-[#2D3436]">委託管理</h1>
          <p className="text-[#636E72] text-xl font-medium">管理所有委託單、更新進度與即時溝通</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "glass-button flex items-center gap-3 px-6 py-3 rounded-xl border-none text-sm", 
              isOpen ? "from-green-500 to-emerald-600" : "from-rose-500 to-red-600"
            )}
          >
            <Settings className="w-5 h-5" /> {isOpen ? '開放填單中' : '已關閉填單'}
          </button>
          <button onClick={() => setIsLoggedIn(false)} className="w-12 h-12 glass flex items-center justify-center rounded-xl text-[#B2BEC3] hover:text-rose-500 transition-colors border-white/60">
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {commissions.map(commission => (
          <GlassCard key={commission.id} className="p-0 overflow-hidden border-white/60 group">
            <div className="p-8 flex flex-col md:flex-row gap-8">
              {/* Image Preview */}
              <div className="w-full md:w-56 h-56 rounded-[2rem] overflow-hidden glass border-2 border-white/60 shrink-0 shadow-sm group-hover:scale-[1.02] transition-transform duration-500">
                <img src={commission.imageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>

              {/* Info */}
              <div className="flex-1 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-3xl font-black text-[#2D3436] tracking-tight">{commission.title}</h3>
                    <p className="text-[#636E72] text-base font-bold mt-1">{commission.nickname} · {commission.contact}</p>
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-purple-50 text-[#9D50BB] text-xs font-black uppercase tracking-widest border border-purple-100">
                    {commission.status}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#B2BEC3] uppercase tracking-widest">訂單編號</label>
                    <input
                      type="text"
                      className="glass-input w-full text-sm py-3"
                      value={commission.orderId}
                      onChange={(e) => updateOrderId(commission.id, e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#B2BEC3] uppercase tracking-widest">進度更新</label>
                    <div className="relative">
                      <select
                        className="glass-input w-full text-sm py-3 appearance-none"
                        value={commission.status}
                        onChange={(e) => updateStatus(commission.id, e.target.value as CommissionStatus)}
                      >
                        {STATUS_ORDER.map(s => <option key={s} value={s} className="bg-white">{s}</option>)}
                      </select>
                      <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B2BEC3] pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setActiveChatId(activeChatId === commission.id ? null : commission.id)}
                    className="flex-1 glass-button py-3 px-6 text-sm flex items-center justify-center gap-3 from-blue-500 to-indigo-600"
                  >
                    <MessageCircle className="w-5 h-5" /> 溝通視窗
                  </button>
                  <button className="flex-1 glass py-3 px-6 text-sm flex items-center justify-center gap-3 text-[#2D3436] font-bold border-white/60 hover:bg-white/80 transition-all rounded-2xl">
                    <Edit3 className="w-5 h-5" /> 詳細需求
                  </button>
                </div>
              </div>
            </div>

            {/* Inline Chat */}
            <AnimatePresence>
              {activeChatId === commission.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-white/10 bg-white/5"
                >
                  <div className="h-80 p-4">
                    <ChatWidget 
                      commissionId={commission.orderId} 
                      isAdmin={true} 
                      messages={[]} // TODO: Fetch messages
                      onSendMessage={(text) => console.log('Admin send:', text)} 
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

import { cn } from '@/src/lib/utils';
