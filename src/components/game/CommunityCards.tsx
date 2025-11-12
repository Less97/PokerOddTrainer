/**
 * Community cards component
 * Displays the community cards (flop, turn, river)
 */

import React from 'react';
import { Card } from '../../types';

interface CommunityCardsProps {
  cards: Card[];
}

const CommunityCards: React.FC<CommunityCardsProps> = ({ cards }) => {
  // Show 5 card slots, empty ones as placeholders
  const cardSlots = Array.from({ length: 5 }, (_, i) => cards[i] || null);

  const getCardColor = (card: Card | null) => {
    if (!card) return 'text-gray-400';
    return card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-600' : 'text-black';
  };

  return (
    <div className="flex gap-2">
      {cardSlots.map((card, index) => (
        <div
          key={index}
          className={`w-16 h-24 rounded-lg border-2 flex items-center justify-center text-xl font-bold ${
            card
              ? 'bg-white border-gray-300 shadow-lg'
              : 'bg-gray-700 border-gray-600 border-dashed'
          }`}
        >
          {card ? (
            <div className={`${getCardColor(card)} flex flex-col items-center`}>
              <span className="text-2xl">{card.rank}</span>
              <span className="text-lg">{getSuitSymbol(card.suit)}</span>
            </div>
          ) : (
            <span className="text-gray-500 text-3xl">?</span>
          )}
        </div>
      ))}
    </div>
  );
};

function getSuitSymbol(suit: string): string {
  switch (suit) {
    case 'hearts':
      return '♥';
    case 'diamonds':
      return '♦';
    case 'clubs':
      return '♣';
    case 'spades':
      return '♠';
    default:
      return '';
  }
}

export default CommunityCards;
