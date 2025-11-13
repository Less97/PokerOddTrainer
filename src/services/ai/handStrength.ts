/**
 * Pre-flop hand strength evaluation for AI decision making
 */

import type { Card } from '../../types';
import { getRankValue } from '../../utils/deckUtils';

export type HandStrength = 'premium' | 'strong' | 'playable' | 'weak' | 'trash';

/**
 * Evaluate pre-flop hand strength
 * Returns a strength category and numeric score (0-100)
 */
export function evaluatePreFlopHand(card1: Card, card2: Card): {
  strength: HandStrength;
  score: number;
} {
  const rank1 = getRankValue(card1.rank);
  const rank2 = getRankValue(card2.rank);
  const suited = card1.suit === card2.suit;
  const isPair = rank1 === rank2;
  const highCard = Math.max(rank1, rank2);
  const lowCard = Math.min(rank1, rank2);
  const gap = highCard - lowCard;

  let score = 0;

  // Pocket pairs
  if (isPair) {
    if (rank1 >= 14) score = 95;      // AA
    else if (rank1 >= 13) score = 90; // KK
    else if (rank1 >= 12) score = 85; // QQ
    else if (rank1 >= 11) score = 80; // JJ
    else if (rank1 >= 10) score = 75; // TT
    else if (rank1 >= 7) score = 65;  // 77-99
    else score = 50 + rank1 * 2;      // 22-66
  }
  // High cards (AK, AQ, etc.)
  else if (highCard === 14) { // Ace
    if (lowCard >= 13) score = suited ? 88 : 82;      // AKs/AKo
    else if (lowCard >= 12) score = suited ? 78 : 72; // AQs/AQo
    else if (lowCard >= 11) score = suited ? 73 : 67; // AJs/AJo
    else if (lowCard >= 10) score = suited ? 68 : 62; // ATs/ATo
    else if (lowCard >= 7) score = suited ? 55 : 45;  // A7s-A9s/A7o-A9o
    else score = suited ? 45 : 30;                    // A2s-A6s/A2o-A6o
  }
  // King high cards
  else if (highCard === 13) { // King
    if (lowCard >= 12) score = suited ? 76 : 70;      // KQs/KQo
    else if (lowCard >= 11) score = suited ? 71 : 65; // KJs/KJo
    else if (lowCard >= 10) score = suited ? 66 : 58; // KTs/KTo
    else if (lowCard >= 9) score = suited ? 58 : 48;  // K9s/K9o
    else score = suited ? 48 : 35;                    // K2s-K8s/K2o-K8o
  }
  // Queen high cards
  else if (highCard === 12) { // Queen
    if (lowCard >= 11) score = suited ? 69 : 63;      // QJs/QJo
    else if (lowCard >= 10) score = suited ? 64 : 56; // QTs/QTo
    else if (lowCard >= 9) score = suited ? 56 : 46;  // Q9s/Q9o
    else score = suited ? 46 : 33;                    // Q2s-Q8s/Q2o-Q8o
  }
  // Jack high cards
  else if (highCard === 11) { // Jack
    if (lowCard >= 10) score = suited ? 62 : 54;      // JTs/JTo
    else if (lowCard >= 9) score = suited ? 54 : 44;  // J9s/J9o
    else score = suited ? 44 : 31;                    // J2s-J8s/J2o-J8o
  }
  // Connected/suited cards
  else if (gap === 0) { // Connected
    score = suited ? 40 + highCard * 2 : 30 + highCard * 2;
  }
  else if (gap === 1) { // One gap
    score = suited ? 35 + highCard : 25 + highCard;
  }
  else if (suited) { // Just suited
    score = 30 + highCard;
  }
  else { // Weak offsuit
    score = 15 + highCard;
  }

  // Determine strength category
  let strength: HandStrength;
  if (score >= 80) strength = 'premium';
  else if (score >= 65) strength = 'strong';
  else if (score >= 45) strength = 'playable';
  else if (score >= 30) strength = 'weak';
  else strength = 'trash';

  return { strength, score };
}

/**
 * Adjust hand strength based on position
 * Early position = tighter, Late position = looser
 */
export function adjustForPosition(
  baseScore: number,
  position: 'early' | 'middle' | 'late' | 'button'
): number {
  switch (position) {
    case 'early':
      return baseScore * 0.92;  // Slightly tighter in early position
    case 'middle':
      return baseScore * 0.96;  // A bit tighter
    case 'late':
      return baseScore * 1.04;  // A bit looser
    case 'button':
      return baseScore * 1.08;  // Looser on button
    default:
      return baseScore;
  }
}

/**
 * Determine position category based on player index
 * @param playerIndex - Current player index
 * @param dealerIndex - Dealer button index
 * @param totalPlayers - Total number of players
 */
export function getPositionCategory(
  playerIndex: number,
  dealerIndex: number,
  totalPlayers: number
): 'early' | 'middle' | 'late' | 'button' {
  // Calculate seats after dealer
  const seatsAfterDealer = (playerIndex - dealerIndex + totalPlayers) % totalPlayers;

  if (seatsAfterDealer === 0) return 'button';
  if (seatsAfterDealer === 1 || seatsAfterDealer === 2) return 'early';  // SB, BB
  if (totalPlayers === 4) {
    // In 4-player, only have early/late/button
    return seatsAfterDealer === 3 ? 'late' : 'middle';
  }

  return seatsAfterDealer <= 3 ? 'early' : seatsAfterDealer <= 5 ? 'middle' : 'late';
}

/**
 * Should play this hand based on style and hand strength?
 */
export function shouldPlayHand(
  handScore: number,
  vpip: number,
  positionAdjustment: number = 1.0
): boolean {
  const adjustedScore = handScore * positionAdjustment;

  // VPIP represents % of hands played
  // Convert to threshold with slight adjustment for better gameplay
  // If VPIP is 20%, threshold is ~78 (slightly more liberal)
  const threshold = (100 - vpip) * 0.95;

  return adjustedScore >= threshold;
}

/**
 * Should raise this hand based on style and hand strength?
 */
export function shouldRaiseHand(
  handScore: number,
  pfr: number,
  positionAdjustment: number = 1.0
): boolean {
  const adjustedScore = handScore * positionAdjustment;

  // PFR represents % of hands raised pre-flop
  const threshold = (100 - pfr) * 0.95;

  return adjustedScore >= threshold;
}
