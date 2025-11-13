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
          container: 'w-14 h-20',
          rank: 'text-xl',
          suit: 'text-2xl',
          corner: 'text-xs',
        };
      case 'medium':
        return {
          container: 'w-20 h-28',
          rank: 'text-3xl',
          suit: 'text-4xl',
          corner: 'text-sm',
        };
      case 'large':
        return {
          container: 'w-24 h-36',
          rank: 'text-4xl',
          suit: 'text-5xl',
          corner: 'text-base',
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
      className={`${sizeClasses.container} rounded-lg border-2 border-gray-300 bg-white shadow-lg flex flex-col justify-between p-1.5 relative`}
    >
      {/* Top-left corner */}
      <div className={`${suitColor} font-bold leading-none flex flex-col items-center`}>
        <div className={sizeClasses.corner}>{card.rank}</div>
        <div className={sizeClasses.corner}>{suitSymbol}</div>
      </div>

      {/* Center suit symbol */}
      <div className={`${suitColor} flex items-center justify-center flex-1`}>
        <div className="flex flex-col items-center">
          <span className={`${sizeClasses.rank} font-bold leading-none`}>{card.rank}</span>
          <span className={`${sizeClasses.suit} leading-none mt-1`}>{suitSymbol}</span>
        </div>
      </div>

      {/* Bottom-right corner (rotated) */}
      <div className={`${suitColor} font-bold leading-none flex flex-col items-center rotate-180`}>
        <div className={sizeClasses.corner}>{card.rank}</div>
        <div className={sizeClasses.corner}>{suitSymbol}</div>
      </div>
    </div>
  );
};

export default Card;
