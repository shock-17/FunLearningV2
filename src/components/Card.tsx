import { cn } from '../lib/utils';
import React, { ReactNode } from 'react';

export const Card: React.FC<{ className?: string; children: ReactNode; onClick?: () => void }> = ({ className, children, onClick }) => {
  const Component = onClick ? 'button' : 'div';
  return (
    <Component
      onClick={onClick}
      className={cn(
        "bg-white rounded-3xl shadow-sm border border-[#e0ddf5] p-6 text-left",
        onClick && "transition-transform hover:shadow-md hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] cursor-pointer",
        className
      )}
    >
      {children}
    </Component>
  );
}
