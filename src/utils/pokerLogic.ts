/**
 * General poker game logic and validation utilities
 */

import type { Player, GameState, BetAction, PlayerPosition } from '../types';

/**
 * Calculate minimum raise amount
 * @param currentBet - Current bet to match
 * @param lastRaise - Amount of last raise
 * @param bigBlind - Big blind amount
 * @returns Minimum raise amount
 */
export function calculateMinRaise(currentBet: number, lastRaise: number, bigBlind: number): number {
  // Minimum raise is the current bet plus the last raise amount
  // If no raise yet, minimum is current bet + big blind
  return currentBet + Math.max(lastRaise, bigBlind);
}

/**
 * Validate if a bet amount is legal
 * @param amount - Bet amount
 * @param player - Player making the bet
 * @param currentBet - Current bet to match
 * @param minRaise - Minimum raise amount
 * @returns Validation result with error message if invalid
 */
export function validateBetAmount(
  amount: number,
  player: Player,
  currentBet: number,
  minRaise: number
): { valid: boolean; error?: string } {
  // Can't bet more than you have
  if (amount > player.stack) {
    return { valid: false, error: 'Bet exceeds stack size' };
  }

  // If raising, must meet minimum raise
  if (amount > currentBet && amount < minRaise && amount < player.stack) {
    return { valid: false, error: `Minimum raise is ${minRaise}` };
  }

  return { valid: true };
}

/**
 * Check if player can check (no bet to call)
 * @param player - Player attempting to check
 * @param currentBet - Current bet amount
 * @returns true if player can check
 */
export function canCheck(player: Player, currentBet: number): boolean {
  return player.currentBet === currentBet;
}

/**
 * Get amount needed to call
 * @param player - Player making the call
 * @param currentBet - Current bet to match
 * @returns Amount needed to call
 */
export function getCallAmount(player: Player, currentBet: number): number {
  return Math.min(currentBet - player.currentBet, player.stack);
}

/**
 * Check if betting round is complete
 * @param players - All players in the hand
 * @param currentBet - Current bet amount
 * @returns true if betting round is complete
 */
export function isBettingRoundComplete(players: Player[], currentBet: number): boolean {
  const activePlayers = players.filter(p => !p.isFolded && !p.isAllIn);

  if (activePlayers.length === 0) return true;
  if (activePlayers.length === 1) return true;

  // All active players must have matched the current bet
  return activePlayers.every(p => p.currentBet === currentBet);
}

/**
 * Get next active player index
 * @param players - All players
 * @param currentIndex - Current player index
 * @returns Next active player index
 */
export function getNextPlayerIndex(players: Player[], currentIndex: number): number {
  let nextIndex = (currentIndex + 1) % players.length;
  let attempts = 0;

  // Find next player who hasn't folded and isn't all-in
  while ((players[nextIndex].isFolded || players[nextIndex].isAllIn) && attempts < players.length) {
    nextIndex = (nextIndex + 1) % players.length;
    attempts++;
  }

  return nextIndex;
}

/**
 * Get active players (not folded)
 * @param players - All players
 * @returns Active players
 */
export function getActivePlayers(players: Player[]): Player[] {
  return players.filter(p => !p.isFolded);
}

/**
 * Calculate total pot size including all player bets
 * @param players - All players
 * @param currentPot - Current pot amount
 * @returns Total pot size
 */
export function calculatePot(players: Player[], currentPot: number = 0): number {
  const playerBets = players.reduce((sum, p) => sum + p.currentBet, 0);
  return currentPot + playerBets;
}

/**
 * Collect bets from all players into the pot
 * @param players - All players
 * @returns Updated players and pot amount
 */
export function collectBets(players: Player[]): { players: Player[]; pot: number } {
  let pot = 0;

  const updatedPlayers = players.map(player => {
    pot += player.currentBet;
    return {
      ...player,
      currentBet: 0,
    };
  });

  return { players: updatedPlayers, pot };
}

/**
 * Determine dealer, small blind, and big blind positions
 * @param playerCount - Number of players
 * @param dealerIndex - Current dealer button index
 * @returns Indices for dealer, SB, and BB
 */
export function getBlindPositions(playerCount: number, dealerIndex: number): {
  dealer: number;
  smallBlind: number;
  bigBlind: number;
} {
  if (playerCount === 2) {
    // Heads up: dealer is small blind
    return {
      dealer: dealerIndex,
      smallBlind: dealerIndex,
      bigBlind: (dealerIndex + 1) % playerCount,
    };
  }

  return {
    dealer: dealerIndex,
    smallBlind: (dealerIndex + 1) % playerCount,
    bigBlind: (dealerIndex + 2) % playerCount,
  };
}

/**
 * Get first player to act pre-flop (after big blind)
 * @param playerCount - Number of players
 * @param bigBlindIndex - Big blind index
 * @returns Index of first player to act
 */
export function getFirstPreFlopPlayer(playerCount: number, bigBlindIndex: number): number {
  return (bigBlindIndex + 1) % playerCount;
}

/**
 * Get first player to act post-flop (after dealer)
 * @param playerCount - Number of players
 * @param dealerIndex - Dealer button index
 * @returns Index of first player to act
 */
export function getFirstPostFlopPlayer(playerCount: number, dealerIndex: number): number {
  if (playerCount === 2) {
    // Heads up: dealer acts first post-flop
    return dealerIndex;
  }

  return (dealerIndex + 1) % playerCount;
}

/**
 * Generate random stack size in big blinds
 * @param minBB - Minimum big blinds (default: 30)
 * @param maxBB - Maximum big blinds (default: 200)
 * @param bigBlind - Big blind amount
 * @returns Random stack size
 */
export function generateRandomStack(
  minBB: number = 30,
  maxBB: number = 200,
  bigBlind: number = 1
): number {
  const bbCount = Math.floor(Math.random() * (maxBB - minBB + 1)) + minBB;
  return bbCount * bigBlind;
}

/**
 * Check if hand is over (only one player remaining or showdown reached)
 * @param players - All players
 * @returns true if hand is over
 */
export function isHandOver(players: Player[]): boolean {
  const activePlayers = getActivePlayers(players);
  return activePlayers.length <= 1;
}

/**
 * Determine winner(s) from active players
 * @param players - All players
 * @param evaluations - Hand evaluations for each player
 * @returns Winner position(s)
 */
export function determineWinner(
  players: Player[],
  evaluations: Map<PlayerPosition, any>
): PlayerPosition[] {
  const activePlayers = getActivePlayers(players);

  if (activePlayers.length === 1) {
    return [activePlayers[0].position];
  }

  // Compare hand evaluations
  // This is simplified - actual implementation would use compareHands from handEvaluator
  const activeWithEvals = activePlayers.map(p => ({
    position: p.position,
    evaluation: evaluations.get(p.position),
  }));

  // Find best hand (simplified - actual implementation would be more complex)
  return [activeWithEvals[0].position];
}

/**
 * Format stack size in big blinds for display
 * @param stack - Stack amount
 * @param bigBlind - Big blind amount
 * @returns Formatted string (e.g., "100BB")
 */
export function formatStackInBB(stack: number, bigBlind: number): string {
  const bb = Math.round(stack / bigBlind);
  return `${bb}BB`;
}

/**
 * Check if player has enough chips for action
 * @param player - Player
 * @param amount - Amount needed
 * @returns true if player has enough
 */
export function hasEnoughChips(player: Player, amount: number): boolean {
  return player.stack >= amount;
}

/**
 * Process a player action and update game state
 * @param action - Player action
 * @param player - Player making action
 * @param gameState - Current game state
 * @returns Updated player and game state changes
 */
export function processPlayerAction(
  action: BetAction,
  player: Player,
  gameState: GameState
): { updatedPlayer: Player; potIncrease: number; newCurrentBet: number } {
  let updatedPlayer = { ...player };
  let potIncrease = 0;
  let newCurrentBet = gameState.currentBet;

  switch (action.type) {
    case 'fold':
      updatedPlayer.isFolded = true;
      break;

    case 'check':
      // No changes needed
      break;

    case 'call': {
      const callAmount = Math.min(
        gameState.currentBet - player.currentBet,
        player.stack
      );
      updatedPlayer.stack -= callAmount;
      updatedPlayer.currentBet += callAmount;
      potIncrease = callAmount;

      if (updatedPlayer.stack === 0) {
        updatedPlayer.isAllIn = true;
      }
      break;
    }

    case 'raise': {
      const raiseAmount = Math.min(action.amount || 0, player.stack);
      const totalBet = raiseAmount;
      const additionalAmount = totalBet - player.currentBet;

      updatedPlayer.stack -= additionalAmount;
      updatedPlayer.currentBet = totalBet;
      potIncrease = additionalAmount;
      newCurrentBet = totalBet;

      if (updatedPlayer.stack === 0) {
        updatedPlayer.isAllIn = true;
      }
      break;
    }

    case 'all-in': {
      const allInAmount = player.stack;
      updatedPlayer.stack = 0;
      updatedPlayer.currentBet += allInAmount;
      updatedPlayer.isAllIn = true;
      potIncrease = allInAmount;

      if (updatedPlayer.currentBet > gameState.currentBet) {
        newCurrentBet = updatedPlayer.currentBet;
      }
      break;
    }
  }

  return { updatedPlayer, potIncrease, newCurrentBet };
}

/**
 * Create a new hand with fresh player states
 * @param players - Current players
 * @returns Players reset for new hand
 */
export function resetPlayersForNewHand(players: Player[]): Player[] {
  return players.map(player => ({
    ...player,
    holeCards: [],
    currentBet: 0,
    isFolded: false,
    isAllIn: false,
  }));
}
