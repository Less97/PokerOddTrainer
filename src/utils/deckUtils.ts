/**
 * Deck utilities for creating, shuffling, and dealing cards
 */

import type { Card, Rank, Suit } from '../types';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

/**
 * Create a standard 52-card deck
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];

  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank });
    }
  }

  return deck;
}

/**
 * Shuffle a deck using Fisher-Yates algorithm
 */
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

/**
 * Deal cards from the deck
 * @param deck - The deck to deal from
 * @param count - Number of cards to deal
 * @returns Object with dealt cards and remaining deck
 */
export function dealCards(deck: Card[], count: number): { cards: Card[]; remainingDeck: Card[] } {
  if (count > deck.length) {
    throw new Error(`Cannot deal ${count} cards from deck with ${deck.length} cards`);
  }

  const cards = deck.slice(0, count);
  const remainingDeck = deck.slice(count);

  return { cards, remainingDeck };
}

/**
 * Create and shuffle a new deck
 */
export function createShuffledDeck(): Card[] {
  return shuffleDeck(createDeck());
}

/**
 * Format a card for display (e.g., "Ah" for Ace of Hearts)
 */
export function formatCard(card: Card): string {
  const suitSymbols: Record<Suit, string> = {
    hearts: 'h',
    diamonds: 'd',
    clubs: 'c',
    spades: 's',
  };

  return `${card.rank}${suitSymbols[card.suit]}`;
}

/**
 * Get the numeric value of a rank (for comparisons)
 */
export function getRankValue(rank: Rank): number {
  const values: Record<Rank, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
  };

  return values[rank];
}

/**
 * Sort cards by rank (descending)
 */
export function sortCardsByRank(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => getRankValue(b.rank) - getRankValue(a.rank));
}
