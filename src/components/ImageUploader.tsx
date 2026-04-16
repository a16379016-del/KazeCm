import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ImageUploaderProps {
  onImageProcessed: (blob: Blob) => void;
  previewUrl?: string;
}

export function ImageUploader({ onImageProcessed, previewUrl: initialPreview }: ImageUploaderProps) {
  const { t } = useTranslation();
  const [preview, setPreview] = useState<string | null>(initialPreview || null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processImage = async (file: File) => {
    setIsProcessing(true);
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    await new Promise((resolve) => (img.onload = resolve));

    const canvas = document.createElement('canvas');
    let width = img.width;
    let height = img.height;

    // Max width 1200px
    if (width > 1200) {
      height = (1200 / width) * height;
      width = 1200;
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          onImageProcessed(blob);
          setPreview(URL.createObjectURL(blob));
        }
        setIsProcessing(false);
      },
      'image/webp',
      0.8
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        {preview ? (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden glass border-2 border-white/50">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <button
              onClick={() => setPreview(null)}
              className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/30 rounded-2xl cursor-pointer hover:bg-white/10 transition-all">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 text-white/60 mb-3" />
              <p className="mb-2 text-sm text-white/80">
                {t('common.uploadImage')}
              </p>
              <p className="text-xs text-white/40">{t('common.uploadFormat')}</p>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleChange} />
          </label>
        )}
      </div>
      {isProcessing && (
        <div className="flex items-center gap-2 text-sm text-white/60 animate-pulse">
          <ImageIcon className="w-4 h-4" />
          <span>{t('common.processingImage')}</span>
        </div>
      )}
    </div>
  );
}
