/**
 * Playing card component with improved readability
 */

import React from 'react';
import type { Card as CardType } from '../../types';

interface CardProps {
  card: CardType | null;
  size?: 'small' | 'medium' | 'large';
  faceDown?: boolean;
}

const Card: React.FC<CardProps> = ({ card, size = 'medium', faceDown = false }) => {
  const getSuitSymbol = (suit: string): string => {
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
  };

  const getSuitColor = (suit: string): string => {
    return suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-black';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'w-12 h-16',
          rank: 'text-xl',
          suit: 'text-xl',
        };
      case 'medium':
        return {
          container: 'w-16 h-22',
          rank: 'text-2xl',
          suit: 'text-2xl',
        };
      case 'large':
        return {
          container: 'w-18 h-26',
          rank: 'text-3xl',
          suit: 'text-3xl',
        };
    }
  };

  const sizeClasses = getSizeClasses();

  // Empty card slot
  if (!card) {
    return (
      <div
        className={`${sizeClasses.container} rounded-lg border-2 border-dashed border-gray-600 bg-gray-700 flex items-center justify-center`}
      >
        <span className="text-gray-500 text-3xl">?</span>
      </div>
    );
  }

  // Face-down card
  if (faceDown) {
    return (
      <div
        className={`${sizeClasses.container} rounded-lg border-2 border-blue-800 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg`}
      >
        <span className="text-4xl text-blue-300">🂠</span>
      </div>
    );
  }

  // Face-up card
  const suitColor = getSuitColor(card.suit);
  const suitSymbol = getSuitSymbol(card.suit);

  return (
    <div
      className={`${sizeClasses.container} rounded-lg border-2 border-gray-300 bg-white shadow-lg flex items-center justify-center`}
    >
      {/* Center display only - clear and simple */}
      <div className={`${suitColor} flex flex-col items-center gap-0.5`}>
        <span className={`${sizeClasses.rank} font-bold leading-none`}>{card.rank}</span>
        <span className={`${sizeClasses.suit} leading-none`}>{suitSymbol}</span>
      </div>
    </div>
  );
};

export default Card;
