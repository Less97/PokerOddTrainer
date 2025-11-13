/**
 * Hook for managing deck state and dealing cards
 */

import { useState, useCallback } from 'react';
import type { Card } from '../types';
import { createShuffledDeck, dealCards } from '../utils/deckUtils';

export interface UseDeckReturn {
  deck: Card[];
  shuffleNewDeck: () => void;
  deal: (count: number) => Card[];
  remainingCards: number;
}

/**
 * Hook for deck management
 */
export function useDeck(): UseDeckReturn {
  const [deck, setDeck] = useState<Card[]>(createShuffledDeck());

  /**
   * Shuffle a new deck
   */
  const shuffleNewDeck = useCallback(() => {
    setDeck(createShuffledDeck());
  }, []);

  /**
   * Deal cards from the deck
   */
  const deal = useCallback((count: number): Card[] => {
    const { cards, remainingDeck } = dealCards(deck, count);
    setDeck(remainingDeck);
    return cards;
  }, [deck]);

  return {
    deck,
    shuffleNewDeck,
    deal,
    remainingCards: deck.length,
  };
}
