/**
 * Hand evaluator for determining poker hand rankings
 */

import type { Card, HandEvaluation, HandRanking, Rank } from '../types';
import { getRankValue, sortCardsByRank } from './deckUtils';

/**
 * Evaluate the best 5-card poker hand from up to 7 cards
 */
export function evaluateHand(cards: Card[]): HandEvaluation {
  if (cards.length < 5) {
    throw new Error('Need at least 5 cards to evaluate a hand');
  }

  // For 7 cards, check all possible 5-card combinations
  // For simplicity, we'll evaluate the best hand from all 7 cards
  const bestHand = findBestHand(cards);
  return bestHand;
}

/**
 * Find the best 5-card hand from available cards
 */
function findBestHand(cards: Card[]): HandEvaluation {
  // Check hands in order from best to worst
  const royalFlush = checkRoyalFlush(cards);
  if (royalFlush) return royalFlush;

  const straightFlush = checkStraightFlush(cards);
  if (straightFlush) return straightFlush;

  const fourOfAKind = checkFourOfAKind(cards);
  if (fourOfAKind) return fourOfAKind;

  const fullHouse = checkFullHouse(cards);
  if (fullHouse) return fullHouse;

  const flush = checkFlush(cards);
  if (flush) return flush;

  const straight = checkStraight(cards);
  if (straight) return straight;

  const threeOfAKind = checkThreeOfAKind(cards);
  if (threeOfAKind) return threeOfAKind;

  const twoPair = checkTwoPair(cards);
  if (twoPair) return twoPair;

  const pair = checkPair(cards);
  if (pair) return pair;

  return checkHighCard(cards);
}

/**
 * Check for Royal Flush (A, K, Q, J, T of same suit)
 */
function checkRoyalFlush(cards: Card[]): HandEvaluation | null {
  const straightFlush = checkStraightFlush(cards);
  if (straightFlush && straightFlush.cards[0].rank === 'A') {
    return {
      ranking: 'royal-flush',
      cards: straightFlush.cards,
      description: 'Royal Flush',
    };
  }
  return null;
}

/**
 * Check for Straight Flush
 */
function checkStraightFlush(cards: Card[]): HandEvaluation | null {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const;

  for (const suit of suits) {
    const suitedCards = cards.filter(c => c.suit === suit);
    if (suitedCards.length >= 5) {
      const straight = checkStraight(suitedCards);
      if (straight) {
        return {
          ranking: 'straight-flush',
          cards: straight.cards,
          description: `Straight Flush, ${straight.cards[0].rank} high`,
        };
      }
    }
  }
  return null;
}

/**
 * Check for Four of a Kind
 */
function checkFourOfAKind(cards: Card[]): HandEvaluation | null {
  const rankCounts = getRankCounts(cards);

  for (const [rank, count] of Object.entries(rankCounts)) {
    if (count === 4) {
      const fourCards = cards.filter(c => c.rank === rank);
      const kicker = sortCardsByRank(cards.filter(c => c.rank !== rank))[0];

      return {
        ranking: 'four-of-a-kind',
        cards: [...fourCards, kicker],
        description: `Four of a Kind, ${rank}s`,
      };
    }
  }
  return null;
}

/**
 * Check for Full House
 */
function checkFullHouse(cards: Card[]): HandEvaluation | null {
  const rankCounts = getRankCounts(cards);
  const ranks = Object.keys(rankCounts);

  let threeRank: string | null = null;
  let pairRank: string | null = null;

  // Find three of a kind
  for (const rank of ranks) {
    if (rankCounts[rank] >= 3) {
      if (!threeRank || getRankValue(rank as Rank) > getRankValue(threeRank as Rank)) {
        threeRank = rank;
      }
    }
  }

  // Find pair (different from three of a kind)
  for (const rank of ranks) {
    if (rank !== threeRank && rankCounts[rank] >= 2) {
      if (!pairRank || getRankValue(rank as Rank) > getRankValue(pairRank as Rank)) {
        pairRank = rank;
      }
    }
  }

  // Also check if we have two sets of three of a kind
  if (threeRank && !pairRank) {
    for (const rank of ranks) {
      if (rank !== threeRank && rankCounts[rank] >= 3) {
        pairRank = rank;
        break;
      }
    }
  }

  if (threeRank && pairRank) {
    const threeCards = cards.filter(c => c.rank === threeRank).slice(0, 3);
    const pairCards = cards.filter(c => c.rank === pairRank).slice(0, 2);

    return {
      ranking: 'full-house',
      cards: [...threeCards, ...pairCards],
      description: `Full House, ${threeRank}s over ${pairRank}s`,
    };
  }

  return null;
}

/**
 * Check for Flush
 */
function checkFlush(cards: Card[]): HandEvaluation | null {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const;

  for (const suit of suits) {
    const suitedCards = cards.filter(c => c.suit === suit);
    if (suitedCards.length >= 5) {
      const sorted = sortCardsByRank(suitedCards);
      const flushCards = sorted.slice(0, 5);

      return {
        ranking: 'flush',
        cards: flushCards,
        description: `Flush, ${flushCards[0].rank} high`,
      };
    }
  }
  return null;
}

/**
 * Check for Straight
 */
function checkStraight(cards: Card[]): HandEvaluation | null {
  const sorted = sortCardsByRank(cards);
  const uniqueRanks = Array.from(new Set(sorted.map(c => c.rank)));

  // Check for wheel (A-2-3-4-5)
  if (uniqueRanks.includes('A') && uniqueRanks.includes('2') &&
      uniqueRanks.includes('3') && uniqueRanks.includes('4') && uniqueRanks.includes('5')) {
    const straightCards = ['5', '4', '3', '2', 'A'].map(rank =>
      sorted.find(c => c.rank === rank)!
    );
    return {
      ranking: 'straight',
      cards: straightCards,
      description: 'Straight, 5 high (Wheel)',
    };
  }

  // Check for regular straights
  for (let i = 0; i <= uniqueRanks.length - 5; i++) {
    const fiveRanks = uniqueRanks.slice(i, i + 5);
    const values = fiveRanks.map(r => getRankValue(r as Rank));

    // Check if consecutive
    let isConsecutive = true;
    for (let j = 0; j < values.length - 1; j++) {
      if (values[j] - values[j + 1] !== 1) {
        isConsecutive = false;
        break;
      }
    }

    if (isConsecutive) {
      const straightCards = fiveRanks.map(rank =>
        sorted.find(c => c.rank === rank)!
      );
      return {
        ranking: 'straight',
        cards: straightCards,
        description: `Straight, ${straightCards[0].rank} high`,
      };
    }
  }

  return null;
}

/**
 * Check for Three of a Kind
 */
function checkThreeOfAKind(cards: Card[]): HandEvaluation | null {
  const rankCounts = getRankCounts(cards);

  for (const [rank, count] of Object.entries(rankCounts)) {
    if (count === 3) {
      const threeCards = cards.filter(c => c.rank === rank);
      const kickers = sortCardsByRank(cards.filter(c => c.rank !== rank)).slice(0, 2);

      return {
        ranking: 'three-of-a-kind',
        cards: [...threeCards, ...kickers],
        description: `Three of a Kind, ${rank}s`,
      };
    }
  }
  return null;
}

/**
 * Check for Two Pair
 */
function checkTwoPair(cards: Card[]): HandEvaluation | null {
  const rankCounts = getRankCounts(cards);
  const pairs: string[] = [];

  for (const [rank, count] of Object.entries(rankCounts)) {
    if (count >= 2) {
      pairs.push(rank);
    }
  }

  if (pairs.length >= 2) {
    // Sort pairs by rank value
    pairs.sort((a, b) => getRankValue(b as Rank) - getRankValue(a as Rank));
    const topTwoPairs = pairs.slice(0, 2);

    const pairCards = topTwoPairs.flatMap(rank =>
      cards.filter(c => c.rank === rank).slice(0, 2)
    );
    const kicker = sortCardsByRank(cards.filter(c => !topTwoPairs.includes(c.rank)))[0];

    return {
      ranking: 'two-pair',
      cards: [...pairCards, kicker],
      description: `Two Pair, ${topTwoPairs[0]}s and ${topTwoPairs[1]}s`,
    };
  }

  return null;
}

/**
 * Check for Pair
 */
function checkPair(cards: Card[]): HandEvaluation | null {
  const rankCounts = getRankCounts(cards);

  for (const [rank, count] of Object.entries(rankCounts)) {
    if (count === 2) {
      const pairCards = cards.filter(c => c.rank === rank);
      const kickers = sortCardsByRank(cards.filter(c => c.rank !== rank)).slice(0, 3);

      return {
        ranking: 'pair',
        cards: [...pairCards, ...kickers],
        description: `Pair of ${rank}s`,
      };
    }
  }
  return null;
}

/**
 * High Card (no other hand made)
 */
function checkHighCard(cards: Card[]): HandEvaluation {
  const sorted = sortCardsByRank(cards);
  const bestFive = sorted.slice(0, 5);

  return {
    ranking: 'high-card',
    cards: bestFive,
    description: `High Card, ${bestFive[0].rank}`,
  };
}

/**
 * Get count of each rank in the cards
 */
function getRankCounts(cards: Card[]): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const card of cards) {
    counts[card.rank] = (counts[card.rank] || 0) + 1;
  }

  return counts;
}

/**
 * Compare two hands to determine winner
 * Returns: 1 if hand1 wins, -1 if hand2 wins, 0 if tie
 */
export function compareHands(hand1: HandEvaluation, hand2: HandEvaluation): number {
  const rankingValues: Record<HandRanking, number> = {
    'royal-flush': 10,
    'straight-flush': 9,
    'four-of-a-kind': 8,
    'full-house': 7,
    'flush': 6,
    'straight': 5,
    'three-of-a-kind': 4,
    'two-pair': 3,
    'pair': 2,
    'high-card': 1,
  };

  const value1 = rankingValues[hand1.ranking];
  const value2 = rankingValues[hand2.ranking];

  if (value1 > value2) return 1;
  if (value1 < value2) return -1;

  // Same ranking, compare high cards
  for (let i = 0; i < 5; i++) {
    const card1Value = getRankValue(hand1.cards[i].rank);
    const card2Value = getRankValue(hand2.cards[i].rank);

    if (card1Value > card2Value) return 1;
    if (card1Value < card2Value) return -1;
  }

  return 0; // Exact tie
}
