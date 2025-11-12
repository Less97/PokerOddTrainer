/**
 * Hook for tracking hand history and actions
 */

import { useState, useCallback } from 'react';
import type { Action, Card, PlayerPosition, HandHistory } from '../types';

export interface UseHandHistoryReturn {
  actions: Action[];
  addAction: (action: Action) => void;
  clearHistory: () => void;
  buildHandHistory: (
    heroCards: Card[],
    communityCards: Card[],
    pot: number,
    playerStacks: Map<PlayerPosition, number>,
    winner: PlayerPosition,
    winningCards: Card[]
  ) => HandHistory;
}

/**
 * Hook for managing hand history
 */
export function useHandHistory(): UseHandHistoryReturn {
  const [actions, setActions] = useState<Action[]>([]);

  /**
   * Add an action to the history
   */
  const addAction = useCallback((action: Action) => {
    setActions(prev => [...prev, action]);
  }, []);

  /**
   * Clear all action history
   */
  const clearHistory = useCallback(() => {
    setActions([]);
  }, []);

  /**
   * Build complete hand history for AI coach analysis
   */
  const buildHandHistory = useCallback(
    (
      heroCards: Card[],
      communityCards: Card[],
      pot: number,
      playerStacks: Map<PlayerPosition, number>,
      winner: PlayerPosition,
      winningCards: Card[]
    ): HandHistory => {
      return {
        heroCards,
        communityCards,
        actions,
        pot,
        playerStacks,
        winner,
        winningCards,
      };
    },
    [actions]
  );

  return {
    actions,
    addAction,
    clearHistory,
    buildHandHistory,
  };
}
