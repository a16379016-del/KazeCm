import React, { useState } from 'react';
import { GlassCard } from '@/src/components/GlassCard';
import { Stepper } from '@/src/components/Stepper';
import { ChatWidget } from '@/src/components/ChatWidget';
import { Search, Package, Calendar, User } from 'lucide-react';
import { Commission, Quote } from '@/src/types';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '@/src/firebase';
import { collection, query, where, getDocs, onSnapshot, doc, limit } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';

export default function Progress() {
  const { t } = useTranslation();
  const [searchMode, setSearchMode] = useState<'id' | 'forgot'>('id');
  const [orderId, setOrderId] = useState('');
  const [forgotContact, setForgotContact] = useState('');
  const [forgotNickname, setForgotNickname] = useState('');
  const [searchResults, setSearchResults] = useState<{type: 'commission'|'quote', id: string, title: string, status: string, displayId: string, date: Date}[] | null>(null);
  
  const [commission, setCommission] = useState<Commission | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const executeSearch = async (idToSearch: string) => {
    if (!idToSearch.trim()) return;
    setIsSearching(true);
    setCommission(null);
    setQuote(null);
    setSearchResults(null);
    
    try {
      // Check commissions first
      const qCommission = query(collection(db, 'commissions'), where('orderId', '==', idToSearch));
      const querySnapshotCommission = await getDocs(qCommission);

      if (!querySnapshotCommission.empty) {
        const docSnap = querySnapshotCommission.docs[0];
        setCommission({ id: docSnap.id, ...docSnap.data() } as Commission);
        
        onSnapshot(doc(db, 'commissions', docSnap.id), (updatedDoc) => {
          if (updatedDoc.exists()) {
            setCommission({ id: updatedDoc.id, ...updatedDoc.data() } as Commission);
          }
        });
        return;
      }

      // Check quotes if not found in commissions
      const qQuote = query(collection(db, 'quotes'), where('quoteId', '==', idToSearch));
      const querySnapshotQuote = await getDocs(qQuote);

      if (!querySnapshotQuote.empty) {
        const docSnap = querySnapshotQuote.docs[0];
        setQuote({ id: docSnap.id, ...docSnap.data() } as Quote);
        
        onSnapshot(doc(db, 'quotes', docSnap.id), (updatedDoc) => {
          if (updatedDoc.exists()) {
            setQuote({ id: updatedDoc.id, ...updatedDoc.data() } as Quote);
          }
        });
        return;
      }

      alert(t('progress.notFoundAlert'));
    } catch (error) {
      console.error("Error searching:", error);
      alert(t('progress.errorAlert'));
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeSearch(orderId);
  };

  const handleForgotSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotContact.trim() || !forgotNickname.trim()) return;
    setIsSearching(true);
    setCommission(null);
    setQuote(null);
    setSearchResults(null);

    try {
      const commQuery = query(collection(db, 'commissions'), where('contact', '==', forgotContact.trim()), limit(20));
      const quoteQuery = query(collection(db, 'quotes'), where('contact', '==', forgotContact.trim()), limit(20));

      const [commSnap, quoteSnap] = await Promise.all([getDocs(commQuery), getDocs(quoteQuery)]);

      const results: {type: 'commission'|'quote', id: string, title: string, status: string, displayId: string, date: Date}[] = [];
      
      commSnap.forEach(doc => {
        const data = doc.data();
        if (data.nickname === forgotNickname.trim()) {
          results.push({ type: 'commission', id: doc.id, displayId: data.orderId, title: data.title, status: data.status, date: data.createdAt?.toDate() });
        }
      });

      quoteSnap.forEach(doc => {
        const data = doc.data();
        if (data.nickname === forgotNickname.trim()) {
          results.push({ type: 'quote', id: doc.id, displayId: data.quoteId, title: data.item, status: data.status, date: data.createdAt?.toDate() });
        }
      });

      results.sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));
      setSearchResults(results);

    } catch (error) {
      console.error(error);
      alert(t('progress.errorAlert'));
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-black text-[#2D3436]">{t('progress.title')}</h1>
        <p className="text-[#636E72] text-xl font-medium">輸入您的訂單編號，即時掌握創作動態</p>
      </div>

      <GlassCard className="p-6 border-white/60">
        {searchMode === 'id' ? (
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-[#A0AEC0]" />
              <input
                type="text"
                placeholder={t('progress.searchPlaceholder')}
                className="glass-input w-full pl-14"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              />
            </div>
            <button type="submit" disabled={isSearching} className="glass-button px-12">
              {isSearching ? t('common.searching') : t('common.search')}
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotSearch} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder={t('progress.contactPlaceholder')}
              className="glass-input flex-1"
              value={forgotContact}
              onChange={(e) => setForgotContact(e.target.value)}
            />
            <input
              type="text"
              placeholder={t('common.nickname')}
              className="glass-input flex-1"
              value={forgotNickname}
              onChange={(e) => setForgotNickname(e.target.value)}
            />
            <button type="submit" disabled={isSearching} className="glass-button px-12">
              {isSearching ? t('common.searching') : t('common.search')}
            </button>
          </form>
        )}
        <div className="mt-4 text-center sm:text-right">
          <button 
            onClick={() => {
              setSearchMode(m => m === 'id' ? 'forgot' : 'id');
              setSearchResults(null);
            }} 
            className="text-sm text-[#9D50BB] font-bold hover:underline"
          >
            {searchMode === 'id' ? t('progress.searchByContact') : t('progress.forgotId')}
          </button>
        </div>
      </GlassCard>

      {/* Search Results List */}
      <AnimatePresence>
        {searchResults !== null && (
          <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="space-y-4">
            <h3 className="text-xl font-bold text-[#2D3436]">查詢結果 ({searchResults.length} 筆)</h3>
            {searchResults.length === 0 ? (
              <p className="text-[#636E72]">{t('progress.noRecords')}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {searchResults.map(res => (
                  <div 
                    key={res.id} 
                    className="glass p-6 rounded-2xl border border-white/60 flex justify-between items-center hover:bg-white/40 transition-colors cursor-pointer" 
                    onClick={() => {
                      setOrderId(res.displayId);
                      setSearchMode('id');
                      executeSearch(res.displayId);
                    }}
                  >
                    <div>
                      <div className="text-xs font-black text-[#B2BEC3] mb-1">{res.type === 'commission' ? t('progress.typeCommission') : t('progress.typeQuote')}</div>
                      <div className="font-bold text-[#2D3436] text-lg">{res.title}</div>
                      <div className="text-sm text-[#636E72] font-mono mt-1">{res.displayId}</div>
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-black/5 text-sm font-bold text-[#2D3436]">
                      {res.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
                {t('progress.currentProgress')}
                <span className="text-sm text-[#B2BEC3] font-medium ml-4">{t('progress.chatHint')}</span>
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
                  {t('progress.info')}
                </h2>
                <div className="space-y-6">
                  <div className="flex justify-between border-b border-black/5 pb-3">
                    <span className="text-[#B2BEC3] text-xs uppercase tracking-widest font-black">{t('common.client')}</span>
                    <span className="text-[#2D3436] font-bold">{commission.nickname}</span>
                  </div>
                  <div className="flex justify-between border-b border-black/5 pb-3">
                    <span className="text-[#B2BEC3] text-xs uppercase tracking-widest font-black">{t('common.orderTimeLabel')}</span>
                    <span className="text-[#2D3436] font-bold">
                      {commission.createdAt?.toDate ? commission.createdAt.toDate().toLocaleString('zh-TW', { hour12: true }) : new Date(commission.createdAt).toLocaleString('zh-TW', { hour12: true })}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-black/5 pb-3">
                    <span className="text-[#B2BEC3] text-xs uppercase tracking-widest font-black">{t('common.title')}</span>
                    <span className="text-[#2D3436] font-bold">{commission.title}</span>
                  </div>
                  <div className="space-y-3">
                    <span className="text-[#B2BEC3] text-xs uppercase tracking-widest font-black">{t('commission.items')}</span>
                    <div className="space-y-2">
                      {commission.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-black/5 px-4 py-2 rounded-xl">
                          <span className="text-[#2D3436] font-bold text-sm">
                            {t(`categories.${item.category}`, item.category)} &gt; {t(`categories.${item.subCategory}`, item.subCategory)}
                            {item.characterCount > 1 && <span className="ml-2 text-[#9D50BB]">x{item.characterCount}</span>}
                          </span>
                          {item.price > 0 && <span className="text-[#9D50BB] font-black text-sm">${(item.price * (item.characterCount || 1)).toLocaleString()}</span>}
                        </div>
                      ))}
                      {/* Fallback for old data */}
                      {!commission.items && commission.category && (
                        <div className="flex justify-between items-center bg-black/5 px-4 py-2 rounded-xl">
                          <span className="text-[#2D3436] font-bold text-sm">{t(`categories.${commission.category}`, commission.category)} {commission.subCategory ? `> ${t(`categories.${commission.subCategory}`, commission.subCategory)}` : ''}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between border-b border-black/5 pb-3">
                    <span className="text-[#B2BEC3] text-xs uppercase tracking-widest font-black">{t('common.paymentMethod')}</span>
                    <span className="text-[#2D3436] font-bold">{commission.paymentMethod ? t(`common.paymentMethods.${commission.paymentMethod}`, commission.paymentMethod) : t('common.notSpecified')}</span>
                  </div>
                  {commission.price !== undefined && (
                    <div className="flex justify-between border-b border-black/5 pb-3">
                      <span className="text-[#B2BEC3] text-xs uppercase tracking-widest font-black">{t('common.estimatedTotal')}</span>
                      <span className="text-[#9D50BB] font-black">${commission.price.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="space-y-3">
                    <span className="text-[#B2BEC3] text-xs uppercase tracking-widest font-black">{t('common.details')}</span>
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
                  {t('common.referenceImage')}
                </h2>
                {commission.imageUrl ? (
                  <a href={commission.imageUrl} target="_blank" rel="noopener noreferrer" className="aspect-video rounded-[2rem] overflow-hidden glass border-2 border-white/60 shadow-sm block hover:scale-[1.02] transition-transform">
                    <img src={commission.imageUrl} alt="Reference" className="w-full h-full object-cover" />
                  </a>
                ) : (
                  <div className="aspect-video rounded-[2rem] glass border-2 border-white/60 shadow-sm flex items-center justify-center text-[#B2BEC3] font-bold">
                    {t('progress.noImage')}
                  </div>
                )}
              </GlassCard>
            </div>

            <ChatWidget 
              commissionDocId={commission.id} 
              orderIdDisplay={commission.orderId}
              collectionName="commissions"
              hasUnread={commission.hasUnreadUser}
            />
          </motion.div>
        )}

        {quote && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <GlassCard className="p-12 border-white/60">
              <h2 className="text-2xl font-bold text-[#2D3436] mb-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
                  <Package className="w-6 h-6 text-[#FF758C]" />
                </div>
                {t('progress.quoteStatus')} <span className="text-[#FF758C]">{quote.status}</span>
                {quote.status === '已回覆' && (
                  <span className="text-sm text-[#B2BEC3] font-medium ml-4">{t('progress.chatHint')}</span>
                )}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="flex justify-between border-b border-black/5 pb-3">
                    <span className="text-[#B2BEC3] text-xs uppercase tracking-widest font-black">{t('quote.quoteId')}</span>
                    <span className="text-[#2D3436] font-bold">{quote.quoteId}</span>
                  </div>
                  <div className="flex justify-between border-b border-black/5 pb-3">
                    <span className="text-[#B2BEC3] text-xs uppercase tracking-widest font-black">{t('common.client')}</span>
                    <span className="text-[#2D3436] font-bold">{quote.nickname}</span>
                  </div>
                  <div className="flex justify-between border-b border-black/5 pb-3">
                    <span className="text-[#B2BEC3] text-xs uppercase tracking-widest font-black">{t('common.orderTimeLabel')}</span>
                    <span className="text-[#2D3436] font-bold">
                      {quote.createdAt?.toDate ? quote.createdAt.toDate().toLocaleString('zh-TW', { hour12: true }) : new Date(quote.createdAt).toLocaleString('zh-TW', { hour12: true })}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-black/5 pb-3">
                    <span className="text-[#B2BEC3] text-xs uppercase tracking-widest font-black">{t('quote.inquiryItem')}</span>
                    <span className="text-[#2D3436] font-bold">{t(`quoteItems.${quote.item}`, quote.item)}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <span className="text-[#B2BEC3] text-xs uppercase tracking-widest font-black">{t('common.details')}</span>
                  <p className="text-[#636E72] text-base leading-relaxed bg-black/5 p-6 rounded-2xl font-medium h-full">
                    {quote.details}
                  </p>
                </div>
              </div>
            </GlassCard>

            <ChatWidget 
              commissionDocId={quote.id} 
              orderIdDisplay={quote.quoteId}
              collectionName="quotes"
              hasUnread={quote.hasUnreadUser}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
