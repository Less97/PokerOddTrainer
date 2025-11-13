/**
 * Core poker type definitions
 */

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
}

export type HandRanking =
  | 'high-card'
  | 'pair'
  | 'two-pair'
  | 'three-of-a-kind'
  | 'straight'
  | 'flush'
  | 'full-house'
  | 'four-of-a-kind'
  | 'straight-flush'
  | 'royal-flush';

export interface HandEvaluation {
  ranking: HandRanking;
  cards: Card[];
  description: string;
}

export type PlayerPosition = 'hero' | 'opponent1' | 'opponent2' | 'opponent3';

export type PlayerStyle =
  | 'tight-aggressive'
  | 'loose-passive'
  | 'loose-aggressive'
  | 'tight-passive'
  | 'ultra-aggressive';

export interface PlayerStyleConfig {
  name: string; // e.g., "Sharky", "Fishy", "Donkey"
  style: PlayerStyle;
  vpip: number; // Voluntarily Put money In Pot percentage (0-100)
  pfr: number; // Pre-Flop Raise percentage (0-100)
  aggression: number; // Aggression factor (0-10)
  bluffFrequency: number; // How often they bluff (0-1)
}

export type BettingRound = 'preflop' | 'flop' | 'turn' | 'river';

export type PlayerAction =
  | 'fold'
  | 'check'
  | 'call'
  | 'raise'
  | 'all-in';

export interface Action {
  player: PlayerPosition;
  action: PlayerAction;
  amount: number;
  timestamp: number;
  bettingRound?: BettingRound;
}

export interface Pot {
  total: number;
  contributions: Map<PlayerPosition, number>;
}
