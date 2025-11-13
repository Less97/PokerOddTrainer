/**
 * Game state and player type definitions
 */

import type {
  Card,
  PlayerPosition,
  PlayerStyle,
  BettingRound,
  Action,
  HandEvaluation,
} from './poker.types';

export interface Player {
  position: PlayerPosition;
  name: string;
  stack: number;
  holeCards: Card[];
  currentBet: number;
  isFolded: boolean;
  isAllIn: boolean;
  style?: PlayerStyle; // Only for AI players
}

export type GamePhase =
  | 'waiting' // Waiting to start hand
  | 'dealing' // Cards being dealt
  | 'betting' // Active betting round
  | 'showdown' // Revealing cards
  | 'hand-complete' // Hand finished, showing results
  | 'analysis'; // AI coach analysis mode

export interface GameState {
  phase: GamePhase;
  bettingRound: BettingRound;
  pot: number;
  communityCards: Card[];
  players: Player[];
  currentPlayerIndex: number;
  dealerButtonIndex: number;
  smallBlindIndex: number;
  bigBlindIndex: number;
  smallBlind: number;
  bigBlind: number;
  currentBet: number;
  minRaise: number;
  actionHistory: Action[];
}

export interface HandResult {
  winner: PlayerPosition;
  winningHand: HandEvaluation;
  potAmount: number;
  allPlayerHands: Map<PlayerPosition, Card[]>;
}

export interface SessionStats {
  handsPlayed: number;
  handsWon: number;
  totalProfit: number;
  averageGrade?: string;
  gradesReceived: string[];
}

export interface BetAction {
  type: 'fold' | 'check' | 'call' | 'raise' | 'all-in';
  amount?: number;
}
