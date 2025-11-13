/**
 * Player style configurations for AI opponents
 */

import type { PlayerStyle, PlayerStyleConfig } from '../../types';

/**
 * All available player styles with their characteristics
 */
export const PLAYER_STYLES: Record<PlayerStyle, PlayerStyleConfig> = {
  'tight-aggressive': {
    name: 'Sharky',
    style: 'tight-aggressive',
    vpip: 20,           // Plays ~20% of hands
    pfr: 18,            // Raises ~18% of hands pre-flop
    aggression: 7,      // High aggression (0-10 scale)
    bluffFrequency: 0.25, // Bluffs 25% of the time when opportunity arises
  },
  'loose-passive': {
    name: 'Fishy',
    style: 'loose-passive',
    vpip: 45,           // Plays ~45% of hands (calling station)
    pfr: 10,            // Rarely raises pre-flop
    aggression: 2,      // Low aggression
    bluffFrequency: 0.05, // Almost never bluffs
  },
  'loose-aggressive': {
    name: 'Donkey',
    style: 'loose-aggressive',
    vpip: 50,           // Plays ~50% of hands
    pfr: 35,            // Raises frequently
    aggression: 8,      // Very aggressive
    bluffFrequency: 0.4, // Bluffs often
  },
  'tight-passive': {
    name: 'Grinder',
    style: 'tight-passive',
    vpip: 15,           // Plays very few hands
    pfr: 8,             // Rarely raises
    aggression: 3,      // Low aggression (calls more than raises)
    bluffFrequency: 0.1, // Rarely bluffs
  },
  'ultra-aggressive': {
    name: 'Maniac',
    style: 'ultra-aggressive',
    vpip: 65,           // Plays most hands
    pfr: 50,            // Raises very frequently
    aggression: 10,     // Maximum aggression
    bluffFrequency: 0.5, // Bluffs half the time
  },
};

/**
 * Get a random player style (excluding duplicates if needed)
 */
export function getRandomPlayerStyle(excludeStyles: PlayerStyle[] = []): PlayerStyleConfig {
  const availableStyles = Object.values(PLAYER_STYLES).filter(
    style => !excludeStyles.includes(style.style)
  );

  if (availableStyles.length === 0) {
    // If all excluded, return a random one anyway
    const allStyles = Object.values(PLAYER_STYLES);
    return allStyles[Math.floor(Math.random() * allStyles.length)];
  }

  return availableStyles[Math.floor(Math.random() * availableStyles.length)];
}

/**
 * Get player style by name
 */
export function getPlayerStyleByName(name: string): PlayerStyleConfig | undefined {
  return Object.values(PLAYER_STYLES).find(style => style.name === name);
}

/**
 * Get player style configuration
 */
export function getPlayerStyle(style: PlayerStyle): PlayerStyleConfig {
  return PLAYER_STYLES[style];
}

/**
 * Assign unique styles to 3 opponents
 */
export function assignOpponentStyles(): PlayerStyleConfig[] {
  const styles = Object.keys(PLAYER_STYLES) as PlayerStyle[];
  const shuffled = [...styles].sort(() => Math.random() - 0.5);

  // Pick 3 random unique styles
  return shuffled.slice(0, 3).map(style => PLAYER_STYLES[style]);
}
