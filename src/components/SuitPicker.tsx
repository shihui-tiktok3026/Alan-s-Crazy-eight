import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Suit } from '../types';
import { Heart, Diamond, Club, Spade } from 'lucide-react';

interface SuitPickerProps {
  onSelect: (suit: Suit) => void;
}

export const SuitPicker: React.FC<SuitPickerProps> = ({ onSelect }) => {
  const suits = [
    { type: Suit.HEARTS, icon: Heart, color: 'text-red-500', bg: 'bg-red-50', label: '红心' },
    { type: Suit.DIAMONDS, icon: Diamond, color: 'text-red-500', bg: 'bg-red-50', label: '方块' },
    { type: Suit.CLUBS, icon: Club, color: 'text-stone-900', bg: 'bg-stone-100', label: '梅花' },
    { type: Suit.SPADES, icon: Spade, color: 'text-stone-900', bg: 'bg-stone-100', label: '黑桃' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <h2 className="text-2xl font-serif italic text-stone-900 mb-6 text-center">选择一个新花色</h2>
        <div className="grid grid-cols-2 gap-4">
          {suits.map(({ type, icon: Icon, color, bg, label }) => (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className={`
                flex flex-col items-center justify-center p-6 rounded-2xl
                ${bg} ${color} transition-all hover:scale-105 active:scale-95
                border-2 border-transparent hover:border-stone-200
              `}
            >
              <Icon size={48} className="mb-2 fill-current" />
              <span className="font-bold uppercase tracking-wider text-sm">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
