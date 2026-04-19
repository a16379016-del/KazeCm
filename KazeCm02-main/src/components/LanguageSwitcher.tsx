import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className="flex items-center gap-2 bg-white/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/60 shadow-sm">
      <Globe className="w-4 h-4 text-[#636E72]" />
      <select 
        className="bg-transparent text-sm font-bold text-[#2D3436] outline-none cursor-pointer appearance-none pr-4"
        value={i18n.language}
        onChange={changeLanguage}
      >
        <option value="zh-TW">中文</option>
        <option value="en">English</option>
        <option value="ja">日本語</option>
      </select>
    </div>
  );
}
