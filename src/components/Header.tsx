import { ReactNode } from 'react';
import { motion } from 'motion/react';

export function Header({ rightAction, leftAction }: { rightAction?: ReactNode, leftAction?: ReactNode }) {
  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md z-50 border-b border-[#e0ddf5] flex items-center px-6 justify-between">
      <div className="flex-1 flex items-center justify-start">
        {leftAction}
      </div>
      
      <div className="flex-none flex items-center justify-center">
         <motion.div 
           initial={{ opacity: 0, y: -10 }}
           animate={{ opacity: 1, y: 0 }}
           className="font-extrabold text-2xl bg-gradient-to-r from-[#4276ff] to-[#a259ff] bg-clip-text text-transparent"
         >
           Adventure
         </motion.div>
      </div>

      <div className="flex-1 flex justify-end items-center space-x-4">
        {rightAction}
      </div>
    </header>
  );
}
