/**
 * Main game state management hook
 */

import { useState, useCallback, useEffect } from 'react';
import type { GameState, Player, BetAction } from '../types';
import { useDeck } from './useDeck';
import { useHandHistory } from './useHandHistory';
import {
  generateRandomStack,
  getBlindPositions,
  processPlayerAction,
  isBettingRoundComplete,
  getNextPlayerIndex,
  collectBets,
  isHandOver,
  getFirstPreFlopPlayer,
  getFirstPostFlopPlayer,
  calculateMinRaise,
} from '../utils/pokerLogic';
import { AIOpponent, assignOpponentStyles } from '../services/ai';

const SMALL_BLIND = 0.5;
const BIG_BLIND = 1;

export interface UseGameStateReturn {
  gameState: GameState;
  startNewHand: () => void;
  handlePlayerAction: (action: BetAction) => void;
  isHeroTurn: boolean;
}

/**
 * Main hook for game state management
 */
export function useGameState(): UseGameStateReturn {
  const { deal, shuffleNewDeck } = useDeck();
  const { addAction, clearHistory } = useHandHistory();

  // Initialize AI opponents map outside of any closure
  const [aiOpponentsMap] = useState(() => new Map<string, AIOpponent>());

  const [gameState, setGameState] = useState<GameState>(() => initializeGame());

  /**
   * Initialize a new game with 4 players
   */
  function initializeGame(): GameState {
    const players: Player[] = [
      {
        position: 'hero',
        name: 'Hero',
        stack: generateRandomStack(30, 200, BIG_BLIND),
        holeCards: [],
        currentBet: 0,
        isFolded: false,
        isAllIn: false,
      },
      {
        position: 'opponent1',
        name: 'Opponent 1',
        stack: generateRandomStack(30, 200, BIG_BLIND),
        holeCards: [],
        currentBet: 0,
        isFolded: false,
        isAllIn: false,
      },
      {
        position: 'opponent2',
        name: 'Opponent 2',
        stack: generateRandomStack(30, 200, BIG_BLIND),
        holeCards: [],
        currentBet: 0,
        isFolded: false,
        isAllIn: false,
      },
      {
        position: 'opponent3',
        name: 'Opponent 3',
        stack: generateRandomStack(30, 200, BIG_BLIND),
        holeCards: [],
        currentBet: 0,
        isFolded: false,
        isAllIn: false,
      },
    ];

    const blinds = getBlindPositions(players.length, 0);

    return {
      phase: 'waiting',
      bettingRound: 'preflop',
      pot: 0,
      communityCards: [],
      players,
      currentPlayerIndex: 0,
      dealerButtonIndex: blinds.dealer,
      smallBlindIndex: blinds.smallBlind,
      bigBlindIndex: blinds.bigBlind,
      smallBlind: SMALL_BLIND,
      bigBlind: BIG_BLIND,
      currentBet: 0,
      minRaise: BIG_BLIND * 2,
      actionHistory: [],
    };
  }

  /**
   * Start a new hand
   */
  const startNewHand = useCallback(() => {
    clearHistory();
    shuffleNewDeck();

    // Initialize AI opponents if not already done
    if (aiOpponentsMap.size === 0) {
      const opponentStyles = assignOpponentStyles();
      opponentStyles.forEach((styleConfig, index) => {
        const position = `opponent${index + 1}`;
        aiOpponentsMap.set(position, new AIOpponent(styleConfig));
      });
    }

    setGameState(prev => {
      // Move dealer button
      const newDealerIndex = (prev.dealerButtonIndex + 1) % prev.players.length;
      const blinds = getBlindPositions(prev.players.length, newDealerIndex);

      // Update player names with styles on first hand
      let resetPlayers = prev.players.map(p => ({
        ...p,
        holeCards: [],
        currentBet: 0,
        isFolded: false,
        isAllIn: false,
      }));

      // Set AI opponent names and styles from their configs
      if (prev.phase === 'waiting') {
        const opponentPositions = ['opponent1', 'opponent2', 'opponent3'];
        resetPlayers = resetPlayers.map(player => {
          if (opponentPositions.includes(player.position)) {
            const aiOpponent = aiOpponentsMap.get(player.position);
            if (aiOpponent) {
              const styleConfig = (aiOpponent as any).styleConfig;
              return {
                ...player,
                name: styleConfig.name,
                style: styleConfig.style,
              };
            }
          }
          return player;
        });
      }

      // Deal hole cards
      const playersWithCards = resetPlayers.map(player => ({
        ...player,
        holeCards: deal(2),
      }));

      // Post blinds
      const updatedPlayers = playersWithCards.map((player, index) => {
        if (index === blinds.smallBlind) {
          const sbAmount = Math.min(SMALL_BLIND, player.stack);
          return {
            ...player,
            stack: player.stack - sbAmount,
            currentBet: sbAmount,
            isAllIn: player.stack === sbAmount,
          };
        }
        if (index === blinds.bigBlind) {
          const bbAmount = Math.min(BIG_BLIND, player.stack);
          return {
            ...player,
            stack: player.stack - bbAmount,
            currentBet: bbAmount,
            isAllIn: player.stack === bbAmount,
          };
        }
        return player;
      });

      // First player to act is after big blind (pre-flop)
      const firstPlayer = getFirstPreFlopPlayer(updatedPlayers.length, blinds.bigBlind);

      return {
        ...prev,
        phase: 'betting',
        bettingRound: 'preflop',
        pot: 0,
        communityCards: [],
        players: updatedPlayers,
        currentPlayerIndex: firstPlayer,
        dealerButtonIndex: newDealerIndex,
        smallBlindIndex: blinds.smallBlind,
        bigBlindIndex: blinds.bigBlind,
        currentBet: BIG_BLIND,
        minRaise: BIG_BLIND * 2,
        actionHistory: [],
      };
    });
  }, [deal, shuffleNewDeck, clearHistory, aiOpponentsMap]);

  /**
   * Handle a player action
   */
  const handlePlayerAction = useCallback((action: BetAction) => {
    setGameState(prev => {
      const currentPlayer = prev.players[prev.currentPlayerIndex];

      // Process the action
      const { updatedPlayer, potIncrease, newCurrentBet } = processPlayerAction(
        action,
        currentPlayer,
        prev
      );

      // Update players array
      const updatedPlayers = prev.players.map((p, index) =>
        index === prev.currentPlayerIndex ? updatedPlayer : p
      );

      // Record action
      const actionRecord = {
        player: currentPlayer.position,
        playerName: currentPlayer.name,
        action: action.type,
        amount: action.amount || 0,
        timestamp: Date.now(),
        bettingRound: prev.bettingRound,
      };
      addAction(actionRecord);

      const newPot = prev.pot + potIncrease;
      const newMinRaise = calculateMinRaise(newCurrentBet, newCurrentBet - prev.currentBet, BIG_BLIND);

      // Check if hand is over (only one player left)
      if (isHandOver(updatedPlayers)) {
        return {
          ...prev,
          phase: 'showdown',
          players: updatedPlayers,
          pot: newPot,
          currentBet: newCurrentBet,
          minRaise: newMinRaise,
          actionHistory: [...prev.actionHistory, actionRecord],
        };
      }

      // Check if betting round is complete
      if (isBettingRoundComplete(updatedPlayers, newCurrentBet)) {
        // Collect bets into pot
        const { players: playersAfterCollection, pot: collectedPot } = collectBets(updatedPlayers);
        const totalPot = newPot + collectedPot;

        // Move to next betting round
        const nextRound = getNextBettingRound(prev.bettingRound);

        if (nextRound === 'complete') {
          // Showdown
          return {
            ...prev,
            phase: 'showdown',
            players: playersAfterCollection,
            pot: totalPot,
            currentBet: 0,
            actionHistory: [...prev.actionHistory, actionRecord],
          };
        }

        // Deal community cards for next round
        let newCommunityCards = [...prev.communityCards];
        if (nextRound === 'flop') {
          newCommunityCards = deal(3);
        } else if (nextRound === 'turn' || nextRound === 'river') {
          newCommunityCards = [...prev.communityCards, ...deal(1)];
        }

        // First to act post-flop is after dealer
        const firstPlayer = getFirstPostFlopPlayer(
          playersAfterCollection.length,
          prev.dealerButtonIndex
        );

        return {
          ...prev,
          bettingRound: nextRound,
          communityCards: newCommunityCards,
          players: playersAfterCollection,
          pot: totalPot,
          currentBet: 0,
          minRaise: BIG_BLIND,
          currentPlayerIndex: firstPlayer,
          actionHistory: [...prev.actionHistory, actionRecord],
        };
      }

      // Move to next player
      const nextPlayerIndex = getNextPlayerIndex(updatedPlayers, prev.currentPlayerIndex);

      return {
        ...prev,
        players: updatedPlayers,
        pot: newPot,
        currentBet: newCurrentBet,
        minRaise: newMinRaise,
        currentPlayerIndex: nextPlayerIndex,
        actionHistory: [...prev.actionHistory, actionRecord],
      };
    });
  }, [addAction, deal]);

  /**
   * Process AI opponent turn
   */
  useEffect(() => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    // Only process if game is in betting phase and it's an AI opponent's turn
    if (
      gameState.phase === 'betting' &&
      currentPlayer &&
      currentPlayer.position !== 'hero' &&
      !currentPlayer.isFolded &&
      !currentPlayer.isAllIn
    ) {
      // Add small delay for better UX
      const timeoutId = setTimeout(() => {
        const aiOpponent = aiOpponentsMap.get(currentPlayer.position);
        if (aiOpponent) {
          const action = aiOpponent.decide(currentPlayer, gameState);
          handlePlayerAction(action);
        }
      }, 1000); // 1 second delay

      return () => clearTimeout(timeoutId);
    }
  }, [gameState, handlePlayerAction, aiOpponentsMap]);

  /**
   * Check if it's hero's turn
   */
  const isHeroTurn = gameState.players[gameState.currentPlayerIndex]?.position === 'hero';

  return {
    gameState,
    startNewHand,
    handlePlayerAction,
    isHeroTurn,
  };
}

/**
 * Get next betting round
 */
function getNextBettingRound(current: string): 'flop' | 'turn' | 'river' | 'complete' {
  switch (current) {
    case 'preflop':
      return 'flop';
    case 'flop':
      return 'turn';
    case 'turn':
      return 'river';
    case 'river':
      return 'complete';
    default:
      return 'complete';
  }
}
