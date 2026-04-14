import React from 'react';
import { Link } from 'react-router-dom';
import { GlassCard } from '@/src/components/GlassCard';
import { Paintbrush, Search, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  const buttons = [
    {
      title: '我要委託',
      icon: Paintbrush,
      path: '/commission',
      description: '填寫詳細需求，開啟您的專屬創作',
      color: 'from-[#9D50BB]/10 to-[#6E48AA]/10',
      iconBg: 'bg-[#9D50BB]/20',
      iconColor: 'text-[#9D50BB]'
    },
    {
      title: '進度查詢',
      icon: Search,
      path: '/progress',
      description: '輸入訂單編號，即時追蹤創作進度',
      color: 'from-[#6E8EFB]/10 to-[#a777e3]/10',
      iconBg: 'bg-[#6E8EFB]/20',
      iconColor: 'text-[#6E8EFB]'
    },
    {
      title: '作品集',
      icon: ExternalLink,
      href: 'https://kaze2001.mystrikingly.com/',
      description: '查看繪師作品集',
      color: 'from-[#89f7fe]/10 to-[#66a6ff]/10',
      iconBg: 'bg-[#89f7fe]/30',
      iconColor: 'text-[#00b894]'
    }
  ];

  return (
    <div className="space-y-16">
      <div className="text-center space-y-6">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl sm:text-8xl font-black text-[#2D3436] tracking-tight"
        >
          Art<span className="text-[#9D50BB]">Commish</span>
        </motion.h1>
        <p className="text-[#636E72] text-xl sm:text-2xl font-medium max-w-2xl mx-auto">
          透明、即時、流暢的創作溝通體驗
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
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

// Helper for cn in this file
import { cn } from '@/src/lib/utils';
