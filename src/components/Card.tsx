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
      whileHover={isPlayable ? { y: -20, scale: 1.05 } : {}}
      className={`
        relative w-24 h-36 md:w-32 md:h-48 rounded-xl cursor-pointer select-none
        transition-all duration-200 card-shadow
        ${isPlayable ? 'ring-4 ring-yellow-400/50' : ''}
        ${className}
      `}
    >
      {isFaceUp ? (
        <div className="w-full h-full bg-white rounded-xl p-2 flex flex-col justify-between border border-stone-200">
          <div className={`flex flex-col items-start ${isRed ? 'text-red-500' : 'text-stone-900'}`}>
            <span className="text-xl md:text-2xl font-bold leading-none">{card.rank}</span>
            <SuitIcon suit={card.suit} size={16} />
          </div>
          
          <div className="flex justify-center items-center flex-1">
            <SuitIcon suit={card.suit} size={48} />
          </div>

          <div className={`flex flex-col items-end rotate-180 ${isRed ? 'text-red-500' : 'text-stone-900'}`}>
            <span className="text-xl md:text-2xl font-bold leading-none">{card.rank}</span>
            <SuitIcon suit={card.suit} size={16} />
          </div>
        </div>
      ) : (
        <div className="w-full h-full bg-stone-800 rounded-xl border-4 border-stone-700 flex items-center justify-center overflow-hidden">
           <div className="w-full h-full opacity-20" style={{
             backgroundImage: `repeating-linear-gradient(45deg, #444 0, #444 10px, #333 10px, #333 20px)`
           }} />
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-2 border-stone-600 flex items-center justify-center">
                <span className="text-stone-600 font-serif italic text-xl">8</span>
              </div>
           </div>
        </div>
      )}
    </motion.div>
  );
};
