/**
 * AI Opponent decision-making engine
 */

import type { Player, BetAction, Card, GameState, PlayerStyleConfig } from '../../types';
import { evaluateHand } from '../../utils/handEvaluator';
import { calculatePotOdds } from '../../utils/oddsCalculator';
import {
  evaluatePreFlopHand,
  getPositionCategory,
  shouldPlayHand,
  shouldRaiseHand,
} from './handStrength';

export class AIOpponent {
  private styleConfig: PlayerStyleConfig;

  constructor(styleConfig: PlayerStyleConfig) {
    this.styleConfig = styleConfig;
  }

  /**
   * Main decision method - determines what action the AI should take
   */
  public decide(player: Player, gameState: GameState): BetAction {
    const { bettingRound, currentBet, pot, communityCards, players } = gameState;

    // Get player index
    const playerIndex = players.findIndex(p => p.position === player.position);
    const dealerIndex = gameState.dealerButtonIndex;

    // Pre-flop decisions
    if (bettingRound === 'preflop') {
      return this.decidePreFlop(player, currentBet, pot, playerIndex, dealerIndex);
    }

    // Post-flop decisions
    return this.decidePostFlop(player, currentBet, pot, communityCards);
  }

  /**
   * Pre-flop decision making
   */
  private decidePreFlop(
    player: Player,
    currentBet: number,
    pot: number,
    playerIndex: number,
    dealerIndex: number
  ): BetAction {
    const [card1, card2] = player.holeCards;

    // Evaluate hand strength
    const { score } = evaluatePreFlopHand(card1, card2);

    // Adjust for position
    const position = getPositionCategory(playerIndex, dealerIndex, 4);
    const positionMultiplier = this.getPositionMultiplier(position);
    const adjustedScore = score * positionMultiplier;

    // Check if we should play this hand
    const shouldPlay = shouldPlayHand(score, this.styleConfig.vpip, positionMultiplier);

    if (!shouldPlay) {
      return { type: 'fold' };
    }

    // Determine if we should raise
    const shouldRaise = shouldRaiseHand(score, this.styleConfig.pfr, positionMultiplier);
    const callAmount = currentBet - player.currentBet;

    // No bet yet - check or raise
    if (currentBet === player.currentBet) {
      if (shouldRaise && this.shouldBeAggressive()) {
        return this.determineRaiseSize(player, pot, adjustedScore);
      }
      return { type: 'check' };
    }

    // Facing a bet/raise
    if (shouldRaise && adjustedScore >= 75) {
      // Re-raise with strong hands
      return this.determineRaiseSize(player, pot, adjustedScore);
    } else if (adjustedScore >= 50 || this.shouldCall(callAmount, pot, adjustedScore)) {
      // Call with medium hands or good pot odds
      return { type: 'call', amount: callAmount };
    } else {
      return { type: 'fold' };
    }
  }

  /**
   * Post-flop decision making
   */
  private decidePostFlop(
    player: Player,
    currentBet: number,
    pot: number,
    communityCards: Card[]
  ): BetAction {
    const allCards = [...player.holeCards, ...communityCards];
    const myHand = evaluateHand(allCards);

    // Estimate equity (simplified - just use hand strength)
    const handStrength = this.estimateHandStrength(myHand.ranking);
    const callAmount = currentBet - player.currentBet;

    // Calculate pot odds
    const potOdds = calculatePotOdds(pot, callAmount);
    const estimatedEquity = handStrength;

    // Bluff check
    const shouldBluff = this.shouldBluff(communityCards);

    // No bet yet
    if (currentBet === player.currentBet) {
      // Check if we should bet
      if (handStrength >= 60 && this.shouldBeAggressive()) {
        return this.determineRaiseSize(player, pot, handStrength);
      } else if (shouldBluff && this.styleConfig.aggression >= 6) {
        // Bluff with weak hand
        return { type: 'raise', amount: Math.floor(pot * 0.5) };
      }
      return { type: 'check' };
    }

    // Facing a bet
    if (handStrength >= 75) {
      // Strong hand - raise
      if (this.shouldBeAggressive()) {
        return this.determineRaiseSize(player, pot, handStrength);
      }
      return { type: 'call', amount: callAmount };
    } else if (handStrength >= 50) {
      // Medium hand - call or raise occasionally
      if (this.shouldBeAggressive() && Math.random() < 0.3) {
        return this.determineRaiseSize(player, pot, handStrength);
      }
      return { type: 'call', amount: callAmount };
    } else if (estimatedEquity > potOdds || shouldBluff) {
      // Drawing hand with good odds or bluffing
      if (shouldBluff && Math.random() < this.styleConfig.bluffFrequency) {
        return this.determineRaiseSize(player, pot, 40);
      }
      return { type: 'call', amount: callAmount };
    } else {
      return { type: 'fold' };
    }
  }

  /**
   * Determine raise size based on hand strength and style
   */
  private determineRaiseSize(player: Player, pot: number, handStrength: number): BetAction {
    const aggression = this.styleConfig.aggression;

    let raiseMultiplier: number;
    if (handStrength >= 85) {
      raiseMultiplier = 0.75 + (aggression / 10) * 1.5; // 0.75 to 2.25 pot
    } else if (handStrength >= 70) {
      raiseMultiplier = 0.5 + (aggression / 10) * 1.0;  // 0.5 to 1.5 pot
    } else {
      raiseMultiplier = 0.33 + (aggression / 10) * 0.67; // 0.33 to 1.0 pot
    }

    const raiseAmount = Math.floor(pot * raiseMultiplier);
    const cappedRaise = Math.min(raiseAmount, player.stack);

    return { type: 'raise', amount: cappedRaise };
  }

  /**
   * Should the AI be aggressive?
   */
  private shouldBeAggressive(): boolean {
    const aggressionThreshold = (10 - this.styleConfig.aggression) / 10;
    return Math.random() > aggressionThreshold;
  }

  /**
   * Should the AI call this bet?
   */
  private shouldCall(callAmount: number, pot: number, handStrength: number): boolean {
    const potOdds = calculatePotOdds(pot, callAmount);

    // Loose players call more often
    const callThreshold = 100 - this.styleConfig.vpip;

    return handStrength >= callThreshold || handStrength > potOdds;
  }

  /**
   * Should the AI bluff?
   */
  private shouldBluff(communityCards: Card[]): boolean {
    // More likely to bluff on scary boards
    const hasThreeToFlush = this.hasThreeToFlush(communityCards);
    const hasThreeToStraight = this.hasThreeToStraight(communityCards);

    const bluffBonus = (hasThreeToFlush || hasThreeToStraight) ? 0.2 : 0;

    return Math.random() < (this.styleConfig.bluffFrequency + bluffBonus);
  }

  /**
   * Estimate hand strength as percentage
   */
  private estimateHandStrength(ranking: string): number {
    const strengthMap: Record<string, number> = {
      'royal-flush': 100,
      'straight-flush': 95,
      'four-of-a-kind': 90,
      'full-house': 85,
      'flush': 75,
      'straight': 70,
      'three-of-a-kind': 60,
      'two-pair': 50,
      'pair': 35,
      'high-card': 20,
    };

    return strengthMap[ranking] || 20;
  }

  /**
   * Check if board has three cards to a flush
   */
  private hasThreeToFlush(cards: Card[]): boolean {
    const suitCounts = cards.reduce((acc, card) => {
      acc[card.suit] = (acc[card.suit] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.values(suitCounts).some(count => count >= 3);
  }

  /**
   * Check if board has three cards to a straight
   */
  private hasThreeToStraight(cards: Card[]): boolean {
    if (cards.length < 3) return false;

    // Simplified: just check if we have 3+ cards within 5 rank range
    const ranks = cards.map(c => {
      const rankMap: Record<string, number> = {
        '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
        'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
      };
      return rankMap[c.rank] || 0;
    }).sort((a, b) => a - b);

    for (let i = 0; i <= ranks.length - 3; i++) {
      if (ranks[i + 2] - ranks[i] <= 4) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get position multiplier for hand strength adjustment
   */
  private getPositionMultiplier(position: 'early' | 'middle' | 'late' | 'button'): number {
    switch (position) {
      case 'early': return 0.8;
      case 'middle': return 0.9;
      case 'late': return 1.1;
      case 'button': return 1.2;
      default: return 1.0;
    }
  }
}
