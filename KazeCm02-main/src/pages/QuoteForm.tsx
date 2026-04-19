import React, { useState } from 'react';
import { GlassCard } from '@/src/components/GlassCard';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '@/src/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { sendNotificationEmail } from '@/src/lib/email';
import { useTranslation } from 'react-i18next';

const QUOTE_ITEMS = ['插畫', '客製動態', 'Live2D vtuber角色繪製', '角色設計'];

export default function QuoteForm() {
  const { t } = useTranslation();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [generatedQuoteId, setGeneratedQuoteId] = useState('');
  const [formData, setFormData] = useState({
    nickname: '',
    contact: '',
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

      await sendNotificationEmail(
        '【新報價單通知】您有一筆新的報價單',
        `委託人：${formData.nickname}\n聯絡方式：${formData.contact}\n詢問項目：${formData.item}\n報價編號：${newQuoteId}`
      );

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
                <h2 className="text-4xl font-bold text-[#2D3436]">{t('quote.formTitle')}</h2>
                <Link to="/" className="text-[#B2BEC3] hover:text-[#9D50BB] flex items-center gap-2 text-base font-bold transition-colors">
                  <ArrowLeft className="w-5 h-5" /> {t('common.backToHome')}
                </Link>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-xs font-black text-[#B2BEC3] uppercase tracking-widest">{t('common.nickname')}</label>
                  <input
                    required
                    type="text"
                    className="glass-input w-full"
                    value={formData.nickname}
                    onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-[#B2BEC3] uppercase tracking-widest">{t('common.contact')}</label>
                  <input
                    required
                    type="text"
                    className="glass-input w-full"
                    value={formData.contact}
                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-[#B2BEC3] uppercase tracking-widest">{t('quote.inquiryItem')}</label>
                  <select
                    className="glass-input w-full appearance-none"
                    value={formData.item}
                    onChange={(e) => setFormData({...formData, item: e.target.value})}
                  >
                    {QUOTE_ITEMS.map(item => <option key={item} value={item} className="bg-white">{t(`quoteItems.${item}`, item)}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-[#B2BEC3] uppercase tracking-widest">{t('common.details')}</label>
                  <textarea
                    required
                    rows={6}
                    placeholder={t('quote.detailsPlaceholder')}
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
                  {isSubmitting ? t('common.submitting') : t('quote.submit')}
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
              <h2 className="text-5xl font-black text-[#2D3436]">{t('common.submitSuccess')}</h2>
              <p className="text-[#636E72] text-xl font-medium">
                {t('quote.successDesc')}<br/>
                <span className="text-[#9D50BB] font-mono text-4xl mt-6 block font-black tracking-tighter">{generatedQuoteId}</span>
                <span className="text-sm font-bold text-[#B2BEC3] mt-4 block">
                  {t('common.orderTime')}{new Date().toLocaleString('zh-TW', { hour12: true })}
                </span>
              </p>
              <button
                onClick={() => window.location.href = '/progress'}
                className="glass-button mt-10"
              >
                {t('quote.goProgress')}
              </button>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
