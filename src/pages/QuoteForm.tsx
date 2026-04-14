import React, { useState } from 'react';
import { GlassCard } from '@/src/components/GlassCard';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '@/src/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const QUOTE_ITEMS = ['插畫', '客製動態', 'Live2D vtuber角色繪製', '角色設計'];

export default function QuoteForm() {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [generatedQuoteId, setGeneratedQuoteId] = useState('');
  const [formData, setFormData] = useState({
    nickname: '',
    item: QUOTE_ITEMS[0],
    details: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const newQuoteId = `#QUOTE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      await addDoc(collection(db, 'quotes'), {
        ...formData,
        status: '待回覆',
        quoteId: newQuoteId,
        createdAt: serverTimestamp()
      });

      setGeneratedQuoteId(newQuoteId);
      setStep('success');
    } catch (error: any) {
      console.error('Error submitting quote:', error);
      alert(`提交失敗: ${error.message || '請稍後再試'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {step === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <GlassCard className="space-y-10 p-12 border-white/60">
              <div className="flex items-center justify-between">
                <h2 className="text-4xl font-bold text-[#2D3436]">填寫報價單</h2>
                <Link to="/" className="text-[#B2BEC3] hover:text-[#9D50BB] flex items-center gap-2 text-base font-bold transition-colors">
                  <ArrowLeft className="w-5 h-5" /> 返回首頁
                </Link>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-xs font-black text-[#B2BEC3] uppercase tracking-widest">暱稱</label>
                  <input
                    required
                    type="text"
                    className="glass-input w-full"
                    value={formData.nickname}
                    onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-[#B2BEC3] uppercase tracking-widest">詢問項目</label>
                  <select
                    className="glass-input w-full appearance-none"
                    value={formData.item}
                    onChange={(e) => setFormData({...formData, item: e.target.value})}
                  >
                    {QUOTE_ITEMS.map(item => <option key={item} value={item} className="bg-white">{item}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-[#B2BEC3] uppercase tracking-widest">詳細需求</label>
                  <textarea
                    required
                    rows={6}
                    placeholder="請上傳雲端圖片"
                    className="glass-input w-full resize-none"
                    value={formData.details}
                    onChange={(e) => setFormData({...formData, details: e.target.value})}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="glass-button w-full text-xl py-4"
                >
                  {isSubmitting ? '提交中...' : '確認提交報價'}
                </button>
              </form>
            </GlassCard>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <GlassCard className="p-16 space-y-8 border-white/60">
              <div className="w-24 h-24 bg-green-100 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="w-14 h-14 text-green-600" />
              </div>
              <h2 className="text-5xl font-black text-[#2D3436]">提交成功！</h2>
              <p className="text-[#636E72] text-xl font-medium">
                您的報價單已成功送出，請記下您的報價編號以便查詢進度。<br/>
                <span className="text-[#9D50BB] font-mono text-4xl mt-6 block font-black tracking-tighter">{generatedQuoteId}</span>
              </p>
              <button
                onClick={() => window.location.href = '/progress'}
                className="glass-button mt-10"
              >
                前往查詢進度
              </button>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
