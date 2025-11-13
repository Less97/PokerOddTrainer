/**
 * Community cards component
 * Displays the community cards (flop, turn, river)
 */

import React from 'react';
import type { Card as CardType } from '../../types';
import Card from './Card';

interface CommunityCardsProps {
  cards: CardType[];
}

const CommunityCards: React.FC<CommunityCardsProps> = ({ cards }) => {
  // Show 5 card slots, empty ones as placeholders
  const cardSlots = Array.from({ length: 5 }, (_, i) => cards[i] || null);

  return (
    <div className="flex gap-3">
      {cardSlots.map((card, index) => (
        <Card key={index} card={card} size="large" />
      ))}
    </div>
  );
};

export default CommunityCards;
