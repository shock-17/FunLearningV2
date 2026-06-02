import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '../lib/utils';
import { motion, HTMLMotionProps } from 'motion/react';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseClass = "inline-flex items-center justify-center rounded-2xl font-bold transition-transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-opacity-50 shadow-sm";
    
    const variants = {
      primary: "bg-gradient-to-r from-[#4276ff] to-[#a259ff] text-white hover:from-[#3560d0] hover:to-[#8d4add] focus:ring-[#4276ff]",
      secondary: "bg-gradient-to-r from-[#39d39f] to-[#10b9af] text-white hover:from-[#2eac82] hover:to-[#0e968f] focus:ring-[#39d39f]",
      outline: "border-2 border-[#e0ddf5] text-[#5c4ce5] hover:bg-[#e0ddf5]/30 focus:ring-[#5c4ce5]",
      ghost: "text-[#5c4ce5] hover:bg-[#e0ddf5]/50 focus:ring-[#5c4ce5] shadow-none",
      danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-400"
    };

    const sizes = {
      sm: "text-sm px-4 py-2",
      md: "text-base px-6 py-3",
      lg: "text-lg px-8 py-4 rounded-3xl",
      icon: "p-3 rounded-full"
    };

    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(baseClass, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
