import React, { useState } from 'react';
import { GlassCard } from '@/src/components/GlassCard';
import { ImageUploader } from '@/src/components/ImageUploader';
import { CheckCircle2, AlertCircle, ArrowRight, ChevronLeft, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, storage } from '@/src/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { CommissionItem } from '@/src/types';
import { useTranslation } from 'react-i18next';
import { sendNotificationEmail } from '@/src/lib/email';

const CATEGORIES: Record<string, { name: string; price: number; displayPrice?: string }[]> = {
  '塗鴉委託': [
    { name: '大頭貼', price: 1500 }, 
    { name: '半身', price: 2500 }, 
    { name: '全身', price: 5000 },
    { name: '+背景 半身', price: 500 },
    { name: '+背景 全身', price: 1000 },
    { name: '驚喜包', price: 2500 }
  ],
  '黑白頭貼': [{ name: '黑白頭貼', price: 700 }],
  '精緻正比': [
    { name: '精緻頭貼', price: 3000 },
    { name: '半身', price: 5000 },
    { name: '全身立繪', price: 8000 }
  ],
  'Q版': [
    { name: '無背景', price: 600 }, 
    { name: '有背景', price: 1200 }
  ],
  '插畫': [
    { name: '插畫', price: 15000 }
  ],
  'Live2D vtuber角色繪製': [{ name: '標準', price: 20000, displayPrice: '20000-50000' }],
  '動態': [
    { name: '客製表演動畫', price: 0, displayPrice: '請使用報價功能' },
    { name: '純呼吸循環動畫(+客製插畫)', price: 8000 }, 
    { name: '客製動態桌面', price: 8000 },
    { name: '純呼吸循環動畫', price: 1500 },
    { name: '拆圖', price: 1000, displayPrice: '1000-3000' }
  ],
  '其他': [
    { name: '其他', price: 0 },
    { name: '若需要+背景請用報價功能', price: 0 },
    { name: '若需要其他項目請用報價功能', price: 0 }
  ]
};

export default function CommissionForm() {
  const { t } = useTranslation();
  const [step, setStep] = useState<'terms' | 'form' | 'success'>('terms');
  const [agreed, setAgreed] = useState(false);
  const [generatedOrderId, setGeneratedOrderId] = useState('');
  const [formData, setFormData] = useState({
    nickname: '',
    contact: '',
    title: '',
    paymentMethod: '超商代碼',
    details: '',
  });
  const [items, setItems] = useState<CommissionItem[]>([
    { category: '塗鴉委託', subCategory: '大頭貼', price: 1500, characterCount: 1 }
  ]);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentPrice = items.reduce((sum, item) => sum + (item.price * item.characterCount), 0);

  const handleAddItem = () => {
    setItems([...items, { category: '塗鴉委託', subCategory: '大頭貼', price: 1500, characterCount: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'category' | 'subCategory' | 'characterCount', value: string | number) => {
    const newItems = [...items];
    if (field === 'category') {
      newItems[index].category = value as string;
      newItems[index].subCategory = CATEGORIES[value as string][0].name;
      newItems[index].price = CATEGORIES[value as string][0].price;
    } else if (field === 'subCategory') {
      newItems[index].subCategory = value as string;
      newItems[index].price = CATEGORIES[newItems[index].category].find(s => s.name === value)?.price || 0;
    } else if (field === 'characterCount') {
      newItems[index].characterCount = value as number;
    }
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // 1. 產生隨機訂單編號
      const newOrderId = `#ORDER-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      // 2. 上傳圖片到 Firebase Storage (如果有)
      let imageUrl = null;
      if (imageBlob) {
        const imageRef = ref(storage, `commissions/${newOrderId}-${Date.now()}`);
        await uploadBytes(imageRef, imageBlob, { contentType: 'image/webp' });
        imageUrl = await getDownloadURL(imageRef);
      }

      // 3. 將資料寫入 Firestore
      await addDoc(collection(db, 'commissions'), {
        ...formData,
        items,
        price: currentPrice,
        imageUrl,
        status: '已填單',
        orderId: newOrderId,
        createdAt: serverTimestamp()
      });

      // 4. 發送 Email 通知
      await sendNotificationEmail(
        '【新委託通知】您有一筆新的委託單',
        `委託人：${formData.nickname}\n聯絡方式：${formData.contact}\n委託標題：${formData.title}\n訂單編號：${newOrderId}\n總金額：$${currentPrice}`
      );

      setGeneratedOrderId(newOrderId);
      setStep('success');
    } catch (error: any) {
      console.error('Error submitting commission:', error);
      alert(`提交失敗: ${error.message || '請稍後再試'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {step === 'terms' && (
          <motion.div
            key="terms"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <GlassCard className="space-y-10 p-12 border-white/60">
              <div className="flex items-center gap-4 text-[#2D3436]">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-amber-600" />
                </div>
                <h2 className="text-4xl font-bold">{t('commission.termsTitle')}</h2>
              </div>
              
              <div className="space-y-6 text-[#636E72] leading-relaxed text-xl font-medium">
                <p>{t('commission.term1')}</p>
                <p>{t('commission.term2')}</p>
                <p>{t('commission.term3')}</p>
                <p>{t('commission.term4')}</p>
                <p>{t('commission.term5')}</p>
              </div>

              <div className="pt-8 border-t border-black/5">
                <label className="flex items-center gap-4 cursor-pointer group">
                  <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${agreed ? 'bg-[#9D50BB] border-[#9D50BB]' : 'border-[#DFE6E9] group-hover:border-[#9D50BB]'}`}>
                    {agreed && <CheckCircle2 className="w-5 h-5 text-white" />}
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={agreed} 
                    onChange={(e) => setAgreed(e.target.checked)} 
                  />
                  <span className="text-[#2D3436] font-bold text-lg">{t('commission.agreeTerms')}</span>
                </label>
              </div>

              <button
                disabled={!agreed}
                onClick={() => setStep('form')}
                className="glass-button w-full flex items-center justify-center gap-3 text-xl"
              >
                {t('common.next')} <ArrowRight className="w-6 h-6" />
              </button>
            </GlassCard>
          </motion.div>
        )}

        {step === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <GlassCard className="space-y-10 p-12 border-white/60">
              <div className="flex items-center justify-between">
                <h2 className="text-4xl font-bold text-[#2D3436]">{t('commission.formTitle')}</h2>
                <button onClick={() => setStep('terms')} className="text-[#B2BEC3] hover:text-[#9D50BB] flex items-center gap-2 text-base font-bold transition-colors">
                  <ChevronLeft className="w-5 h-5" /> {t('common.backToHome')}
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
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
                      type="email"
                      placeholder={t('commission.contactPlaceholder')}
                      className="glass-input w-full"
                      value={formData.contact}
                      onChange={(e) => setFormData({...formData, contact: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-[#B2BEC3] uppercase tracking-widest">{t('common.title')}</label>
                  <input
                    required
                    type="text"
                    className="glass-input w-full"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-[#B2BEC3] uppercase tracking-widest">{t('commission.items')}</label>
                    <button 
                      type="button" 
                      onClick={handleAddItem}
                      className="text-xs font-bold text-[#9D50BB] flex items-center gap-1 hover:bg-[#9D50BB]/10 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" /> {t('commission.addItem')}
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div key={index} className="flex items-start gap-3 bg-white/40 p-4 rounded-2xl border border-white/60 relative group">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#B2BEC3] uppercase tracking-widest">{t('commission.mainCategory')}</label>
                            <select
                              className="glass-input w-full appearance-none py-2 text-sm"
                              value={item.category}
                              onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                            >
                              {Object.keys(CATEGORIES).map(c => <option key={c} value={c} className="bg-white">{t(`categories.${c}`, c)}</option>)}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#B2BEC3] uppercase tracking-widest">{t('commission.subCategory')}</label>
                            <select
                              className="glass-input w-full appearance-none py-2 text-sm"
                              value={item.subCategory}
                              onChange={(e) => handleItemChange(index, 'subCategory', e.target.value)}
                            >
                              {CATEGORIES[item.category]?.map(sub => (
                                <option key={sub.name} value={sub.name} className="bg-white">
                                  {t(`categories.${sub.name}`, sub.name)} {sub.displayPrice ? `(${sub.displayPrice})` : sub.price > 0 ? `($${sub.price})` : ''}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#B2BEC3] uppercase tracking-widest">{t('commission.characterCount')}</label>
                            <select
                              className="glass-input w-full appearance-none py-2 text-sm"
                              value={item.characterCount}
                              onChange={(e) => handleItemChange(index, 'characterCount', parseInt(e.target.value))}
                            >
                              {[1,2,3,4,5,6,7,8,9,10].map(num => (
                                <option key={num} value={num} className="bg-white">{num}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        {items.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="mt-6 p-2 text-[#B2BEC3] hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-[#B2BEC3] uppercase tracking-widest">{t('common.paymentMethod')}</label>
                  <div className="flex flex-wrap gap-4">
                    {['超商代碼', '信用卡', 'ATM'].map(method => (
                      <label key={method} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          value={method} 
                          checked={formData.paymentMethod === method}
                          onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                          className="w-4 h-4 text-[#9D50BB] focus:ring-[#9D50BB]"
                        />
                        <span className="text-[#2D3436] font-medium">{t(`common.paymentMethods.${method}`, method)}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-[#636E72] mt-1">{t('commission.paymentNote')}</p>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-[#B2BEC3] uppercase tracking-widest">{t('common.details')}</label>
                  <textarea
                    required
                    rows={5}
                    placeholder={t('commission.detailsPlaceholder')}
                    className="glass-input w-full resize-none"
                    value={formData.details}
                    onChange={(e) => setFormData({...formData, details: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-[#B2BEC3] uppercase tracking-widest">{t('common.referenceImage')} (選填)</label>
                  <ImageUploader onImageProcessed={setImageBlob} />
                </div>

                <div className="pt-6 border-t border-black/5 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-xs font-black text-[#B2BEC3] uppercase tracking-widest">{t('common.estimatedTotal')}</div>
                    <div className="text-3xl font-black text-[#9D50BB]">${currentPrice.toLocaleString()}</div>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="glass-button px-10 py-4 text-xl"
                  >
                    {isSubmitting ? t('common.submitting') : t('commission.submit')}
                  </button>
                </div>
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
                {t('commission.successDesc')}<br/>
                <span className="text-[#9D50BB] font-mono text-4xl mt-6 block font-black tracking-tighter">{generatedOrderId}</span>
                <span className="text-sm font-bold text-[#B2BEC3] mt-4 block">
                  {t('common.orderTime')}{new Date().toLocaleString('zh-TW', { hour12: true })}
                </span>
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="glass-button mt-10"
              >
                {t('common.backToHome')}
              </button>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
