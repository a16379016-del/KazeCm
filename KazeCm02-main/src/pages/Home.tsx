import React from 'react';
import { Link } from 'react-router-dom';
import { GlassCard } from '@/src/components/GlassCard';
import { Paintbrush, Search, ExternalLink, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/src/lib/utils';

export default function Home() {
  const { t } = useTranslation();

  const buttons = [
    {
      title: t('home.commissionForm'),
      icon: Paintbrush,
      path: '/commission',
      description: t('home.commissionDesc'),
      color: 'from-[#9D50BB]/10 to-[#6E48AA]/10',
      iconBg: 'bg-[#9D50BB]/20',
      iconColor: 'text-[#9D50BB]'
    },
    {
      title: t('home.quoteForm'),
      icon: MessageCircle,
      path: '/quote',
      description: t('home.quoteDesc'),
      color: 'from-[#FF9A9E]/10 to-[#FECFEF]/10',
      iconBg: 'bg-[#FF9A9E]/20',
      iconColor: 'text-[#FF758C]'
    },
    {
      title: t('home.checkProgress'),
      icon: Search,
      path: '/progress',
      description: t('home.progressDesc'),
      color: 'from-[#6E8EFB]/10 to-[#a777e3]/10',
      iconBg: 'bg-[#6E8EFB]/20',
      iconColor: 'text-[#6E8EFB]'
    },
    {
      title: t('home.priceList'),
      icon: ExternalLink,
      href: 'https://kaze2001.mystrikingly.com/',
      description: t('home.priceListDesc'),
      color: 'from-[#89f7fe]/10 to-[#66a6ff]/10',
      iconBg: 'bg-[#89f7fe]/30',
      iconColor: 'text-[#00b894]'
    }
  ];

  return (
    <div className="space-y-16 relative">
      <div className="text-center space-y-6 pt-12">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl sm:text-8xl font-black text-[#2D3436] tracking-tight"
        >
          Kaze's <span className="text-[#9D50BB]">Commission</span>
        </motion.h1>
        <p className="text-[#636E72] text-xl sm:text-2xl font-medium max-w-2xl mx-auto">
          {t('home.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {buttons.map((btn, index) => {
          const Content = (
            <GlassCard className={cn(
              "h-full flex flex-col items-center text-center p-10 hover:bg-white/80 group cursor-pointer border-white/60",
              `bg-gradient-to-br ${btn.color}`
            )}>
              <div className={cn(
                "w-20 h-20 rounded-[2rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-all duration-500 shadow-sm",
                btn.iconBg
              )}>
                <btn.icon className={cn("w-10 h-10", btn.iconColor)} />
              </div>
              <h2 className="text-3xl font-bold text-[#2D3436] mb-4">{btn.title}</h2>
              <p className="text-[#636E72] text-base leading-relaxed font-medium">{btn.description}</p>
            </GlassCard>
          );

          return (
            <motion.div
              key={btn.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {btn.path ? (
                <Link to={btn.path}>{Content}</Link>
              ) : (
                <a href={btn.href} target="_blank" rel="noopener noreferrer">{Content}</a>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
