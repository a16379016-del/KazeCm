import React from 'react';
import { CommissionStatus, STATUS_ORDER } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { Check } from 'lucide-react';

interface StepperProps {
  currentStatus: CommissionStatus;
}

export function Stepper({ currentStatus }: StepperProps) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  return (
    <div className="w-full py-10">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-black/5 -translate-y-1/2 z-0" />
        <div 
          className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-[#9D50BB] to-[#6E48AA] -translate-y-1/2 z-0 transition-all duration-700 ease-out" 
          style={{ width: `${(currentIndex / (STATUS_ORDER.length - 1)) * 100}%` }}
        />

        {STATUS_ORDER.map((status, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={status} className="flex flex-col items-center relative z-10">
              <div 
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500",
                  isCompleted ? "bg-[#9D50BB] text-white shadow-lg" : 
                  isCurrent ? "bg-white scale-125 shadow-xl border-2 border-[#9D50BB] text-[#9D50BB]" : 
                  "bg-white border border-black/5 text-[#B2BEC3]"
                )}
              >
                {isCompleted ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <span className="text-sm font-black">{index + 1}</span>
                )}
                
                {isCurrent && (
                  <div className="absolute inset-0 rounded-xl bg-[#9D50BB]/20 animate-breathe -z-10" />
                )}
              </div>
              <span className={cn(
                "absolute top-14 text-xs font-black whitespace-nowrap transition-all duration-500",
                isCurrent ? "text-[#9D50BB] scale-110" : "text-[#B2BEC3]"
              )}>
                {status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
