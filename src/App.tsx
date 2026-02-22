import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card as CardComponent } from './components/Card';
import { SuitPicker } from './components/SuitPicker';
import { Card, GameState, Suit, Rank, Turn } from './types';
import { createDeck, shuffleDeck, INITIAL_HAND_SIZE } from './constants';
import { RefreshCw, Trophy, AlertCircle, Info, Star } from 'lucide-react';

const FiveStarLogo = () => (
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none flex flex-col items-center gap-4">
    <div className="flex gap-4">
      <Star size={120} className="fill-blue-500 text-blue-500" />
      <Star size={120} className="fill-blue-500 text-blue-500" />
      <Star size={120} className="fill-blue-500 text-blue-500" />
    </div>
    <div className="flex gap-4">
      <Star size={120} className="fill-blue-500 text-blue-500" />
      <Star size={120} className="fill-blue-500 text-blue-500" />
    </div>
  </div>
);

const SUIT_NAMES: Record<Suit, string> = {
  [Suit.HEARTS]: '红心',
  [Suit.DIAMONDS]: '方块',
  [Suit.CLUBS]: '梅花',
  [Suit.SPADES]: '黑桃',
};

export default function App() {
  const [state, setState] = useState<GameState>({
    deck: [],
    discardPile: [],
    playerHand: [],
    aiHand: [],
    currentTurn: 'player',
    phase: 'dealing',
    activeSuit: null,
    winner: null,
    lastAction: '欢迎来到 Alan的疯狂8点！',
  });

  const [showSuitPicker, setShowSuitPicker] = useState(false);
  const [pendingEightPlay, setPendingEightPlay] = useState<{ card: Card, turn: Turn } | null>(null);

  // Initialize Game
  const initGame = useCallback(() => {
    const fullDeck = shuffleDeck(createDeck());
    const playerHand = fullDeck.splice(0, INITIAL_HAND_SIZE);
    const aiHand = fullDeck.splice(0, INITIAL_HAND_SIZE);
    
    // First card in discard pile cannot be an 8 for simplicity in initial state
    let firstDiscardIndex = 0;
    while (fullDeck[firstDiscardIndex].rank === Rank.EIGHT) {
      firstDiscardIndex++;
    }
    const discardPile = [fullDeck.splice(firstDiscardIndex, 1)[0]];
    
    setState({
      deck: fullDeck,
      discardPile,
      playerHand,
      aiHand,
      currentTurn: 'player',
      phase: 'playing',
      activeSuit: discardPile[0].suit,
      winner: null,
      lastAction: '游戏开始！轮到你了。',
    });
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const topDiscard = state.discardPile[state.discardPile.length - 1];

  const isCardPlayable = (card: Card) => {
    if (!topDiscard) return false;
    if (card.rank === Rank.EIGHT) return true;
    if (state.activeSuit && card.suit === state.activeSuit) return true;
    if (card.rank === topDiscard.rank) return true;
    return false;
  };

  const checkWinner = (newState: GameState) => {
    if (newState.playerHand.length === 0) return 'player';
    if (newState.aiHand.length === 0) return 'ai';
    return null;
  };

  const playCard = (card: Card, turn: Turn, chosenSuit?: Suit) => {
    setState(prev => {
      const isPlayer = turn === 'player';
      const hand = isPlayer ? prev.playerHand : prev.aiHand;
      const newHand = hand.filter(c => c.id !== card.id);
      const newDiscard = [...prev.discardPile, card];
      const nextTurn = isPlayer ? 'ai' : 'player';
      
      const newState = {
        ...prev,
        [isPlayer ? 'playerHand' : 'aiHand']: newHand,
        discardPile: newDiscard,
        currentTurn: nextTurn,
        activeSuit: card.rank === Rank.EIGHT ? (chosenSuit || card.suit) : card.suit,
        lastAction: `${turn === 'player' ? '你' : 'AI'} 打出了 ${SUIT_NAMES[card.suit]} ${card.rank}${card.rank === Rank.EIGHT ? `。新花色: ${SUIT_NAMES[chosenSuit!]}` : ''}`,
      };

      const winner = checkWinner(newState);
      if (winner) {
        newState.winner = winner;
        newState.phase = 'gameOver';
      }

      return newState;
    });
  };

  const handlePlayerCardClick = (card: Card) => {
    if (state.currentTurn !== 'player' || state.phase !== 'playing') return;
    if (!isCardPlayable(card)) return;

    if (card.rank === Rank.EIGHT) {
      setPendingEightPlay({ card, turn: 'player' });
      setShowSuitPicker(true);
    } else {
      playCard(card, 'player');
    }
  };

  const handleSuitSelection = (suit: Suit) => {
    if (pendingEightPlay) {
      playCard(pendingEightPlay.card, pendingEightPlay.turn, suit);
      setPendingEightPlay(null);
      setShowSuitPicker(false);
    }
  };

  const drawCard = (turn: Turn) => {
    if (state.deck.length === 0) {
      setState(prev => ({
        ...prev,
        currentTurn: prev.currentTurn === 'player' ? 'ai' : 'player',
        lastAction: '牌堆已空！跳过回合。',
      }));
      return;
    }

    setState(prev => {
      const isPlayer = turn === 'player';
      const newDeck = [...prev.deck];
      const drawnCard = newDeck.pop()!;
      const hand = isPlayer ? prev.playerHand : prev.aiHand;
      const newHand = [...hand, drawnCard];

      return {
        ...prev,
        deck: newDeck,
        [isPlayer ? 'playerHand' : 'aiHand']: newHand,
        lastAction: `${isPlayer ? '你' : 'AI'} 摸了一张牌。`,
      };
    });
  };

  // AI Logic
  useEffect(() => {
    if (state.currentTurn === 'ai' && state.phase === 'playing' && !state.winner) {
      const playableCards = state.aiHand.filter(isCardPlayable);
      
      if (playableCards.length > 0) {
        const timer = setTimeout(() => {
          // Simple AI: Prefer non-8s first, then 8s
          const nonEight = playableCards.find(c => c.rank !== Rank.EIGHT);
          const cardToPlay = nonEight || playableCards[0];

          if (cardToPlay.rank === Rank.EIGHT) {
            // Pick most frequent suit in hand
            const suitCounts: Record<string, number> = {};
            state.aiHand.forEach(c => {
              suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1;
            });
            const bestSuit = (Object.entries(suitCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as Suit) || Suit.SPADES;
            playCard(cardToPlay, 'ai', bestSuit);
          } else {
            playCard(cardToPlay, 'ai');
          }
        }, 1500);
        return () => clearTimeout(timer);
      } else if (state.deck.length > 0) {
        const timer = setTimeout(() => {
          drawCard('ai');
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [state.currentTurn, state.aiHand, state.phase, state.winner, state.deck.length]);

  // Auto-skip turn if no moves possible and deck is empty
  useEffect(() => {
    if (state.phase === 'playing' && !state.winner) {
      const currentHand = state.currentTurn === 'player' ? state.playerHand : state.aiHand;
      const hasPlayable = currentHand.some(isCardPlayable);
      
      if (!hasPlayable && state.deck.length === 0) {
        const timer = setTimeout(() => {
          setState(prev => ({
            ...prev,
            currentTurn: prev.currentTurn === 'player' ? 'ai' : 'player',
            lastAction: `${prev.currentTurn === 'player' ? '你' : 'AI'} 无牌可出且牌堆已空。跳过回合！`,
          }));
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [state.currentTurn, state.playerHand, state.aiHand, state.deck.length, state.phase, state.winner, isCardPlayable]);

  return (
    <div className="h-screen w-full felt-bg flex flex-col items-center justify-between p-4 overflow-hidden">
      <FiveStarLogo />
      
      <div className="absolute top-4 left-4 z-50">
        <h1 className="text-2xl font-serif italic text-blue-800/40 select-none">Alan的疯狂8点</h1>
      </div>
      
      {/* AI Hand */}
      <div className="w-full flex flex-col items-center gap-2 relative z-10">
        <div className="flex items-center gap-2 text-stone-600 uppercase tracking-widest text-xs font-bold">
          <span>AI 对手</span>
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        </div>
        <div className="flex -space-x-12 md:-space-x-16">
          {state.aiHand.map((card, idx) => (
            <CardComponent key={card.id} card={card} isFaceUp={false} className="scale-75 md:scale-90" />
          ))}
        </div>
      </div>

      {/* Center Area: Deck & Discard */}
      <div className="flex items-center gap-8 md:gap-16">
        {/* Draw Pile */}
        <div className="relative group" onClick={() => state.currentTurn === 'player' && drawCard('player')}>
          <div className="absolute -inset-1 bg-yellow-400/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
          <div className="relative">
            {state.deck.length > 0 ? (
              <div className="relative">
                {/* Visual stack effect */}
                <div className="absolute top-1 left-1 w-24 h-36 md:w-32 md:h-48 bg-stone-800 rounded-xl border border-stone-700" />
                <div className="absolute top-2 left-2 w-24 h-36 md:w-32 md:h-48 bg-stone-800 rounded-xl border border-stone-700" />
                <CardComponent 
                  card={{ id: 'back', suit: Suit.SPADES, rank: Rank.ACE }} 
                  isFaceUp={false} 
                  className="relative z-10"
                />
                <div className="absolute -bottom-6 left-0 right-0 text-center text-stone-600 text-xs font-mono">
                  {state.deck.length} 张牌
                </div>
              </div>
            ) : (
              <div className="w-24 h-36 md:w-32 md:h-48 rounded-xl border-2 border-dashed border-stone-400 flex items-center justify-center">
                <AlertCircle className="text-stone-400" />
              </div>
            )}
          </div>
        </div>

        {/* Discard Pile */}
        <div className="relative">
          <AnimatePresence mode="popLayout">
            {topDiscard && (
              <CardComponent 
                key={topDiscard.id} 
                card={topDiscard} 
                className="relative z-10"
              />
            )}
          </AnimatePresence>
          <div className="absolute -bottom-6 left-0 right-0 text-center text-stone-600 text-xs font-mono uppercase tracking-tighter">
            当前花色: <span className="text-blue-600 font-bold">{state.activeSuit ? SUIT_NAMES[state.activeSuit] : '无'}</span>
          </div>
        </div>
      </div>

      {/* Player Hand */}
      <div className="w-full flex flex-col items-center gap-4 relative z-10">
        <div className="bg-white/40 backdrop-blur-md px-4 py-2 rounded-full border border-blue-200 flex items-center gap-3">
          <Info size={14} className="text-blue-600" />
          <p className="text-stone-800 text-sm font-medium">{state.lastAction}</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 max-w-5xl">
          {state.playerHand.map((card) => (
            <CardComponent
              key={card.id}
              card={card}
              isPlayable={state.currentTurn === 'player' && isCardPlayable(card)}
              onClick={() => handlePlayerCardClick(card)}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showSuitPicker && (
          <SuitPicker onSelect={handleSuitSelection} />
        )}

        {state.phase === 'gameOver' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-stone-900 border border-white/10 rounded-3xl p-12 max-w-md w-full text-center shadow-2xl"
            >
              <div className="mb-6 flex justify-center">
                <div className={`p-6 rounded-full ${state.winner === 'player' ? 'bg-yellow-400/20 text-yellow-400' : 'bg-red-400/20 text-red-400'}`}>
                  {state.winner === 'player' ? <Trophy size={64} /> : <AlertCircle size={64} />}
                </div>
              </div>
              <h2 className="text-4xl font-serif italic mb-2">
                {state.winner === 'player' ? '胜利！' : '失败...'}
              </h2>
              <p className="text-stone-400 mb-8">
                {state.winner === 'player' 
                  ? '你清空了手牌，赢得了比赛！' 
                  : 'AI 先清空了手牌。下次好运！'}
              </p>
              <button
                onClick={initGame}
                className="w-full py-4 bg-stone-100 text-stone-900 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white transition-colors"
              >
                <RefreshCw size={20} />
                再玩一次
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls Overlay */}
      <div className="fixed top-4 right-4 flex gap-2 z-50">
        <button 
          onClick={initGame}
          className="p-3 bg-white/50 hover:bg-white/80 rounded-full border border-blue-200 text-blue-600 shadow-sm transition-all"
          title="重新开始"
        >
          <RefreshCw size={20} />
        </button>
      </div>
    </div>
  );
}
