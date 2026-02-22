import React from 'react';
import { motion } from 'motion/react';
import { Card as CardType, Suit, Rank } from '../types';
import { Heart, Diamond, Club, Spade } from 'lucide-react';

interface CardProps {
  card: CardType;
  isFaceUp?: boolean;
  onClick?: () => void;
  isPlayable?: boolean;
  className?: string;
}

const SuitIcon = ({ suit, size = 20 }: { suit: Suit; size?: number }) => {
  switch (suit) {
    case Suit.HEARTS: return <Heart size={size} className="fill-red-500 text-red-500" />;
    case Suit.DIAMONDS: return <Diamond size={size} className="fill-red-500 text-red-500" />;
    case Suit.CLUBS: return <Club size={size} className="fill-stone-800 text-stone-800" />;
    case Suit.SPADES: return <Spade size={size} className="fill-stone-800 text-stone-800" />;
  }
};

export const Card: React.FC<CardProps> = ({ card, isFaceUp = true, onClick, isPlayable = false, className = "" }) => {
  const isRed = card.suit === Suit.HEARTS || card.suit === Suit.DIAMONDS;

  return (
    <motion.div
      layoutId={card.id}
      onClick={isPlayable ? onClick : undefined}
      whileHover={isPlayable ? { y: -20, scale: 1.1, rotate: 2 } : {}}
      className={`
        relative w-24 h-36 md:w-32 md:h-48 rounded-2xl cursor-pointer select-none
        transition-all duration-200 card-shadow
        ${isPlayable ? 'ring-8 ring-yellow-400/80' : ''}
        ${className}
      `}
    >
      {isFaceUp ? (
        <div className="w-full h-full bg-white rounded-2xl p-3 flex flex-col justify-between border-4 border-stone-100">
          <div className={`flex flex-col items-start ${isRed ? 'text-red-500' : 'text-stone-900'}`}>
            <span className="text-2xl md:text-3xl font-bold leading-none">{card.rank}</span>
            <SuitIcon suit={card.suit} size={20} />
          </div>
          
          <div className="flex justify-center items-center flex-1">
            <motion.div
              animate={isPlayable ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <SuitIcon suit={card.suit} size={56} />
            </motion.div>
          </div>

          <div className={`flex flex-col items-end rotate-180 ${isRed ? 'text-red-500' : 'text-stone-900'}`}>
            <span className="text-2xl md:text-3xl font-bold leading-none">{card.rank}</span>
            <SuitIcon suit={card.suit} size={20} />
          </div>
        </div>
      ) : (
        <div className="w-full h-full bg-blue-500 rounded-2xl border-4 border-white flex items-center justify-center overflow-hidden shadow-inner">
           <div className="w-full h-full opacity-30" style={{
             backgroundImage: `radial-gradient(circle, #fff 20%, transparent 20%)`,
             backgroundSize: '20px 20px'
           }} />
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border-2 border-white/50">
                <span className="text-white font-bold text-3xl drop-shadow-md">8</span>
              </div>
           </div>
        </div>
      )}
    </motion.div>
  );
};
