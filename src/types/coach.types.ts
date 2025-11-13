/**
 * AI Coach and analysis type definitions
 */

import type { Action, BettingRound, Card, PlayerPosition } from './poker.types';

export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface DecisionAnalysis {
  round: BettingRound;
  action: Action;
  potOdds: number;
  handOdds: number;
  equity: number;
  outs: number;
  expectedValue: number;
  wasCorrect: boolean;
  feedback: string;
  alternativePlays?: string[];
}

export interface CoachAnalysis {
  grade: Grade;
  overallFeedback: string;
  decisions: DecisionAnalysis[];
  keyTakeaways: string[];
  handStrengthSummary: string;
  opponentAnalysis: {
    player: PlayerPosition;
    style: string;
    criticalActions: string[];
  }[];
}

export interface HandHistory {
  heroCards: Card[];
  communityCards: Card[];
  actions: Action[];
  pot: number;
  playerStacks: Map<PlayerPosition, number>;
  winner: PlayerPosition;
  winningCards: Card[];
}

/**
 * LLM Coach interface - allows swapping between different LLM providers
 */
export interface ICoachLLM {
  /**
   * Analyze a completed poker hand and provide coaching feedback
   */
  analyzeHand(handHistory: HandHistory): Promise<CoachAnalysis>;

  /**
   * Get a brief summary without detailed analysis
   */
  getHandSummary(handHistory: HandHistory): Promise<string>;
}

/**
 * Configuration for LLM providers
 */
export interface LLMConfig {
  provider: 'claude' | 'openai' | 'local';
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}
