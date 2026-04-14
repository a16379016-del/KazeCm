import React, { useState } from 'react';
import { GlassCard } from '@/src/components/GlassCard';
import { Stepper } from '@/src/components/Stepper';
import { ChatWidget } from '@/src/components/ChatWidget';
import { Search, Package, Calendar, User } from 'lucide-react';
import { Commission, Message } from '@/src/types';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '@/src/firebase';
import { collection, query, where, getDocs, onSnapshot, doc } from 'firebase/firestore';

export default function Progress() {
  const [orderId, setOrderId] = useState('');
  const [commission, setCommission] = useState<Commission | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setIsSearching(true);
    
    try {
      const q = query(collection(db, 'commissions'), where('orderId', '==', orderId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert('找不到此訂單編號，請確認後再試。');
        setCommission(null);
      } else {
        const docSnap = querySnapshot.docs[0];
        setCommission({ id: docSnap.id, ...docSnap.data() } as Commission);
        
        // 監聽狀態更新
        onSnapshot(doc(db, 'commissions', docSnap.id), (updatedDoc) => {
          if (updatedDoc.exists()) {
            setCommission({ id: updatedDoc.id, ...updatedDoc.data() } as Commission);
          }
        });
      }
    } catch (error) {
      console.error("Error searching:", error);
      alert('查詢發生錯誤');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-black text-[#2D3436]">進度查詢</h1>
        <p className="text-[#636E72] text-xl font-medium">輸入您的訂單編號，即時掌握創作動態</p>
      </div>

      <GlassCard className="p-6 border-white/60">
        <form onSubmit={handleSearch} className="flex gap-6">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-[#A0AEC0]" />
            <input
              type="text"
              placeholder="輸入訂單編號 (例如: #ORDER-12345)"
              className="glass-input w-full pl-14"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
          </div>
          <button type="submit" disabled={isSearching} className="glass-button px-12">
            {isSearching ? '查詢中...' : '查詢'}
          </button>
        </form>
      </GlassCard>

      <AnimatePresence>
        {commission && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            {/* Stepper */}
            <GlassCard className="p-12 border-white/60">
              <h2 className="text-2xl font-bold text-[#2D3436] mb-12 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Package className="w-6 h-6 text-[#9D50BB]" />
                </div>
                當前進度
              </h2>
              <Stepper currentStatus={commission.status} />
            </GlassCard>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <GlassCard className="space-y-8 border-white/60">
                <h2 className="text-2xl font-bold text-[#2D3436] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-[#6E8EFB]" />
                  </div>
                  委託資訊
                </h2>
                <div className="space-y-6">
                  <div className="flex justify-between border-b border-black/5 pb-3">
                    <span className="text-[#B2BEC3] text-xs uppercase tracking-widest font-black">委託人</span>
                    <span className="text-[#2D3436] font-bold">{commission.nickname}</span>
                  </div>
                  <div className="flex justify-between border-b border-black/5 pb-3">
                    <span className="text-[#B2BEC3] text-xs uppercase tracking-widest font-black">標題</span>
                    <span className="text-[#2D3436] font-bold">{commission.title}</span>
                  </div>
                  <div className="flex justify-between border-b border-black/5 pb-3">
                    <span className="text-[#B2BEC3] text-xs uppercase tracking-widest font-black">類別</span>
                    <span className="text-[#2D3436] font-bold">{commission.category} {commission.subCategory ? `> ${commission.subCategory}` : ''}</span>
                  </div>
                  <div className="flex justify-between border-b border-black/5 pb-3">
                    <span className="text-[#B2BEC3] text-xs uppercase tracking-widest font-black">付款方式</span>
                    <span className="text-[#2D3436] font-bold">{commission.paymentMethod || '未指定'}</span>
                  </div>
                  {commission.price !== undefined && (
                    <div className="flex justify-between border-b border-black/5 pb-3">
                      <span className="text-[#B2BEC3] text-xs uppercase tracking-widest font-black">預估總金額</span>
                      <span className="text-[#9D50BB] font-black">${commission.price.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="space-y-3">
                    <span className="text-[#B2BEC3] text-xs uppercase tracking-widest font-black">詳細需求</span>
                    <p className="text-[#636E72] text-base leading-relaxed bg-black/5 p-6 rounded-2xl font-medium">
                      {commission.details}
                    </p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="space-y-8 border-white/60">
                <h2 className="text-2xl font-bold text-[#2D3436] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-[#00b894]" />
                  </div>
                  參考圖片
                </h2>
                {commission.imageUrl ? (
                  <a href={commission.imageUrl} target="_blank" rel="noopener noreferrer" className="aspect-video rounded-[2rem] overflow-hidden glass border-2 border-white/60 shadow-sm block hover:scale-[1.02] transition-transform">
                    <img src={commission.imageUrl} alt="Reference" className="w-full h-full object-cover" />
                  </a>
                ) : (
                  <div className="aspect-video rounded-[2rem] glass border-2 border-white/60 shadow-sm flex items-center justify-center text-[#B2BEC3] font-bold">
                    無上傳參考圖片
                  </div>
                )}
              </GlassCard>
            </div>

            <ChatWidget 
              commissionDocId={commission.id} 
              orderIdDisplay={commission.orderId}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
