import React, { useState } from 'react';
import { GlassCard } from '@/src/components/GlassCard';
import { ImageUploader } from '@/src/components/ImageUploader';
import { CheckCircle2, AlertCircle, ArrowRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function CommissionForm() {
  const [step, setStep] = useState<'terms' | 'form' | 'success'>('terms');
  const [agreed, setAgreed] = useState(false);
  const [formData, setFormData] = useState({
    nickname: '',
    contact: '',
    title: '',
    category: '插畫',
    details: '',
  });
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['插畫', '角色設計', '頭像', '場景', '其他'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageBlob) {
      alert('請上傳參考圖片');
      return;
    }
    setIsSubmitting(true);
    
    // TODO: Firebase Logic
    console.log('Submitting:', formData, imageBlob);
    
    // Simulate delay
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('success');
    }, 2000);
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
                <h2 className="text-4xl font-bold">委託注意事項</h2>
              </div>
              
              <div className="space-y-6 text-[#636E72] leading-relaxed text-xl font-medium">
                <p>1. 本系統僅供委託管理使用，正式委託需經由繪師確認。</p>
                <p>2. 委託內容嚴禁包含任何違反法律或侵權之內容。</p>
                <p>3. 付款方式與時程將在確認委託後另行溝通。</p>
                <p>4. 繪師保有作品之著作權，委託人僅擁有使用權。</p>
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
                  <span className="text-[#2D3436] font-bold text-lg">我已閱讀並同意上述須知</span>
                </label>
              </div>

              <button
                disabled={!agreed}
                onClick={() => setStep('form')}
                className="glass-button w-full flex items-center justify-center gap-3 text-xl"
              >
                開始填單 <ArrowRight className="w-6 h-6" />
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
                <h2 className="text-4xl font-bold text-[#2D3436]">填寫委託單</h2>
                <button onClick={() => setStep('terms')} className="text-[#B2BEC3] hover:text-[#9D50BB] flex items-center gap-2 text-base font-bold transition-colors">
                  <ChevronLeft className="w-5 h-5" /> 返回須知
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
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
                    <label className="text-xs font-black text-[#B2BEC3] uppercase tracking-widest">聯絡方式</label>
                    <input
                      required
                      type="text"
                      placeholder="Discord / Email / Twitter"
                      className="glass-input w-full"
                      value={formData.contact}
                      onChange={(e) => setFormData({...formData, contact: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-[#B2BEC3] uppercase tracking-widest">委託標題</label>
                  <input
                    required
                    type="text"
                    className="glass-input w-full"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-[#B2BEC3] uppercase tracking-widest">內容類別</label>
                  <select
                    className="glass-input w-full appearance-none"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    {categories.map(c => <option key={c} value={c} className="bg-white">{c}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-[#B2BEC3] uppercase tracking-widest">詳細需求</label>
                  <textarea
                    required
                    rows={5}
                    className="glass-input w-full resize-none"
                    value={formData.details}
                    onChange={(e) => setFormData({...formData, details: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-[#B2BEC3] uppercase tracking-widest">參考圖片</label>
                  <ImageUploader onImageProcessed={setImageBlob} />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="glass-button w-full text-xl"
                >
                  {isSubmitting ? '提交中...' : '確認提交委託'}
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
                您的委託已成功送出，請記下您的訂單編號以便查詢進度。<br/>
                <span className="text-[#9D50BB] font-mono text-4xl mt-6 block font-black tracking-tighter">#ORDER-12345</span>
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="glass-button mt-10"
              >
                返回首頁
              </button>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
