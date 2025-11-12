/**
 * Interface for LLM Coach implementations
 * Allows easy swapping between different LLM providers
 */

import { CoachAnalysis, HandHistory } from '../../types';

export interface ICoachLLM {
  /**
   * Analyze a completed poker hand and provide detailed coaching feedback
   */
  analyzeHand(handHistory: HandHistory): Promise<CoachAnalysis>;

  /**
   * Get a brief summary of the hand without detailed analysis
   */
  getHandSummary(handHistory: HandHistory): Promise<string>;
}
