import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/src/components/GlassCard';
import { Commission, STATUS_ORDER, CommissionStatus, Message } from '@/src/types';
import { Settings, LogOut, Edit3, MessageCircle, Check, X, Shield, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatWidget } from '@/src/components/ChatWidget';
import { cn } from '@/src/lib/utils';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, db } from '@/src/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeDetailsId, setActiveDetailsId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        setIsLoggedIn(true);
      } else {
        setUserEmail(null);
        setIsLoggedIn(false);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    const q = query(collection(db, 'commissions'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Commission[];
      setCommissions(data);
    });

    return () => unsubscribe();
  }, [isLoggedIn]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
      alert("登入失敗，請重試。");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const updateStatus = async (id: string, status: CommissionStatus) => {
    try {
      await updateDoc(doc(db, 'commissions', id), { status });
    } catch (error) {
      console.error("Error updating status:", error);
      alert("更新狀態失敗");
    }
  };

  const updateOrderId = async (id: string, orderId: string) => {
    try {
      await updateDoc(doc(db, 'commissions', id), { orderId });
    } catch (error) {
      console.error("Error updating order ID:", error);
      alert("更新訂單編號失敗");
    }
  };

  if (!isAuthReady) {
    return (
      <div className="max-w-md mx-auto pt-20 text-center">
        <p className="text-[#636E72] font-bold">載入中...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto pt-20">
        <GlassCard className="p-12 space-y-10 border-white/60">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-purple-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-[#9D50BB]" />
            </div>
            <h1 className="text-4xl font-black text-[#2D3436]">管理後台</h1>
            <p className="text-[#636E72] text-lg font-medium">請使用管理員 Google 帳號登入</p>
          </div>
          <button onClick={handleLogin} className="glass-button w-full text-lg flex items-center justify-center gap-3">
            <svg className="w-6 h-6 bg-white rounded-full p-1" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            使用 Google 登入
          </button>
        </GlassCard>
      </div>
    );
  }

  if (userEmail?.toLowerCase().trim() !== 'a16379016@gmail.com') {
    return (
      <div className="max-w-md mx-auto pt-20">
        <GlassCard className="p-12 space-y-10 border-white/60 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <X className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-black text-[#2D3436]">權限不足</h1>
          <p className="text-[#636E72] text-lg font-medium">
            目前的帳號 ({userEmail}) 沒有管理員權限。
          </p>
          <p className="text-sm text-gray-500">
            (系統設定的管理員為: a16379016@gmail.com)
          </p>
          <button onClick={handleLogout} className="glass-button w-full text-lg">
            登出並切換帳號
          </button>
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
          <button onClick={handleLogout} className="w-12 h-12 glass flex items-center justify-center rounded-xl text-[#B2BEC3] hover:text-rose-500 transition-colors border-white/60">
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
                    onClick={() => {
                      setActiveChatId(activeChatId === commission.id ? null : commission.id);
                      if (activeDetailsId === commission.id) setActiveDetailsId(null);
                    }}
                    className="flex-1 glass-button py-3 px-6 text-sm flex items-center justify-center gap-3 from-blue-500 to-indigo-600"
                  >
                    <MessageCircle className="w-5 h-5" /> 溝通視窗
                  </button>
                  <button 
                    onClick={() => {
                      setActiveDetailsId(activeDetailsId === commission.id ? null : commission.id);
                      if (activeChatId === commission.id) setActiveChatId(null);
                    }}
                    className="flex-1 glass py-3 px-6 text-sm flex items-center justify-center gap-3 text-[#2D3436] font-bold border-white/60 hover:bg-white/80 transition-all rounded-2xl"
                  >
                    <Edit3 className="w-5 h-5" /> 詳細需求
                  </button>
                </div>
              </div>
            </div>

            {/* Inline Details */}
            <AnimatePresence>
              {activeDetailsId === commission.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-white/10 bg-white/5"
                >
                  <div className="p-8 space-y-4">
                    <h4 className="text-xs font-black text-[#B2BEC3] uppercase tracking-widest">詳細需求內容</h4>
                    <div className="bg-white/40 p-6 rounded-2xl border border-white/60 shadow-sm">
                      <p className="text-[#2D3436] whitespace-pre-wrap leading-relaxed text-sm font-medium">
                        {commission.details}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
                      commissionDocId={commission.id} 
                      orderIdDisplay={commission.orderId}
                      isAdmin={true} 
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
