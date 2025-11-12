/**
 * Poker odds calculator for pot odds, equity, and outs
 */

import type { Card, Rank } from '../types';
import { evaluateHand, compareHands } from './handEvaluator';
import { createDeck } from './deckUtils';

/**
 * Calculate pot odds (ratio of pot size to call amount)
 * @param potSize - Current pot size
 * @param callAmount - Amount to call
 * @returns Pot odds as a percentage (0-100)
 */
export function calculatePotOdds(potSize: number, callAmount: number): number {
  if (callAmount === 0) return 100;
  const odds = (callAmount / (potSize + callAmount)) * 100;
  return Math.round(odds * 10) / 10;
}

/**
 * Calculate hand equity using Monte Carlo simulation
 * @param heroCards - Hero's hole cards
 * @param communityCards - Current community cards
 * @param numOpponents - Number of opponents
 * @param iterations - Number of simulations (default: 1000)
 * @returns Equity as a percentage (0-100)
 */
export function calculateEquity(
  heroCards: Card[],
  communityCards: Card[],
  numOpponents: number = 1,
  iterations: number = 1000
): number {
  let wins = 0;
  let ties = 0;

  // Get all known cards
  const knownCards = [...heroCards, ...communityCards];

  // Create deck without known cards
  const fullDeck = createDeck();
  const availableCards = fullDeck.filter(
    card => !knownCards.some(
      known => known.rank === card.rank && known.suit === card.suit
    )
  );

  for (let i = 0; i < iterations; i++) {
    // Shuffle available cards
    const shuffled = [...availableCards].sort(() => Math.random() - 0.5);

    // Deal remaining community cards
    const remainingCommunityCount = 5 - communityCards.length;
    const simulatedCommunity = [
      ...communityCards,
      ...shuffled.slice(0, remainingCommunityCount)
    ];

    // Deal opponent cards
    let deckIndex = remainingCommunityCount;
    const opponentHands: Card[][] = [];

    for (let j = 0; j < numOpponents; j++) {
      opponentHands.push(shuffled.slice(deckIndex, deckIndex + 2));
      deckIndex += 2;
    }

    // Evaluate all hands
    const heroHand = evaluateHand([...heroCards, ...simulatedCommunity]);
    const opponentEvals = opponentHands.map(oppCards =>
      evaluateHand([...oppCards, ...simulatedCommunity])
    );

    // Determine winner
    let heroWins = true;
    let isTie = false;

    for (const oppHand of opponentEvals) {
      const result = compareHands(heroHand, oppHand);
      if (result < 0) {
        heroWins = false;
        break;
      } else if (result === 0) {
        isTie = true;
      }
    }

    if (heroWins && !isTie) {
      wins++;
    } else if (heroWins && isTie) {
      ties++;
    }
  }

  const equity = ((wins + ties * 0.5) / iterations) * 100;
  return Math.round(equity * 10) / 10;
}

/**
 * Count outs (cards that improve your hand)
 * @param heroCards - Hero's hole cards
 * @param communityCards - Current community cards
 * @returns Number of outs
 */
export function countOuts(heroCards: Card[], communityCards: Card[]): number {
  if (communityCards.length >= 5) return 0;

  const knownCards = [...heroCards, ...communityCards];
  const fullDeck = createDeck();

  // Get available cards
  const availableCards = fullDeck.filter(
    card => !knownCards.some(
      known => known.rank === card.rank && known.suit === card.suit
    )
  );

  // Current hand evaluation
  const currentHand = evaluateHand(knownCards.length >= 5 ? knownCards : [...knownCards, ...createDummyCards(5 - knownCards.length)]);

  let outs = 0;

  // Check each available card
  for (const card of availableCards) {
    const newCommunity = [...communityCards, card];
    const newHand = evaluateHand([...heroCards, ...newCommunity, ...createDummyCards(Math.max(0, 5 - newCommunity.length))]);

    // If hand improved, count as an out
    if (compareHands(newHand, currentHand) > 0) {
      outs++;
    }
  }

  return outs;
}

/**
 * Create dummy cards for hand evaluation (used when fewer than 5 community cards)
 */
function createDummyCards(count: number): Card[] {
  const dummyRanks: Rank[] = ['2', '3', '4', '5', '6'];
  return Array.from({ length: count }, (_, i) => ({
    rank: dummyRanks[i % 5],
    suit: 'clubs' as const
  }));
}

/**
 * Calculate expected value (EV) of a call
 * @param potSize - Current pot size
 * @param callAmount - Amount to call
 * @param equity - Hero's equity (0-100)
 * @returns Expected value
 */
export function calculateEV(potSize: number, callAmount: number, equity: number): number {
  const equityDecimal = equity / 100;
  const ev = (equityDecimal * (potSize + callAmount)) - callAmount;
  return Math.round(ev * 100) / 100;
}

/**
 * Convert odds to percentage
 * @param odds - Odds in X:Y format (e.g., "2:1" means 2 to 1)
 * @returns Percentage (0-100)
 */
export function oddsToPercentage(odds: string): number {
  const [numerator, denominator] = odds.split(':').map(Number);
  if (!denominator) return 0;

  const percentage = (denominator / (numerator + denominator)) * 100;
  return Math.round(percentage * 10) / 10;
}

/**
 * Convert percentage to odds
 * @param percentage - Percentage (0-100)
 * @returns Odds in "X:Y" format
 */
export function percentageToOdds(percentage: number): string {
  if (percentage === 0) return '∞:1';
  if (percentage === 100) return '1:0';

  const decimal = percentage / 100;
  const denominator = decimal;
  const numerator = 1 - decimal;

  // Simplify the ratio
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(Math.round(numerator * 100), Math.round(denominator * 100));

  const simplifiedNum = Math.round((numerator * 100) / divisor);
  const simplifiedDen = Math.round((denominator * 100) / divisor);

  return `${simplifiedNum}:${simplifiedDen}`;
}

/**
 * Check if a call is profitable based on pot odds vs equity
 * @param potOdds - Pot odds as percentage
 * @param equity - Hero's equity as percentage
 * @returns true if call is profitable
 */
export function isProfitableCall(potOdds: number, equity: number): boolean {
  return equity > potOdds;
}

/**
 * Calculate implied odds (estimates future bets)
 * @param potSize - Current pot
 * @param callAmount - Amount to call
 * @param estimatedFutureBets - Estimated additional bets if you hit
 * @returns Implied odds as percentage
 */
export function calculateImpliedOdds(
  potSize: number,
  callAmount: number,
  estimatedFutureBets: number
): number {
  const totalPot = potSize + estimatedFutureBets;
  return calculatePotOdds(totalPot, callAmount);
}

/**
 * Get common drawing hand outs
 */
export const COMMON_OUTS = {
  gutshot: 4,              // Inside straight draw (e.g., 5-6-8-9, need 7)
  openEnded: 8,            // Open-ended straight draw (e.g., 5-6-7-8, need 4 or 9)
  flushDraw: 9,            // Need one more card of suit
  straightAndFlushDraw: 15, // Combo draw
  overcard: 6,             // Two overcards (e.g., AK on 872)
  pairToPips: 2,          // Pair trying to hit trips
  pairToSet: 2,           // Pocket pair to set
  twoOvercards: 6,        // Both hole cards higher than board
};

/**
 * Estimate outs for common situations
 * @param situation - Type of drawing hand
 * @returns Estimated number of outs
 */
export function getEstimatedOuts(situation: keyof typeof COMMON_OUTS): number {
  return COMMON_OUTS[situation];
}

/**
 * Calculate probability of hitting by the river
 * @param outs - Number of outs
 * @param cardsTocome - Number of cards to come (1 for turn or river, 2 for both)
 * @returns Probability as percentage
 */
export function calculateHitProbability(outs: number, cardsToCome: number): number {
  if (cardsToCome === 1) {
    // Rule of 2: outs * 2 ≈ percentage
    return Math.min(outs * 2, 100);
  } else if (cardsToCome === 2) {
    // Rule of 4: outs * 4 ≈ percentage (more accurate: 1 - ((47-outs)/47 * (46-outs)/46))
    const exactProb = 1 - ((47 - outs) / 47) * ((46 - outs) / 46);
    return Math.round(exactProb * 100 * 10) / 10;
  }

  return 0;
}
