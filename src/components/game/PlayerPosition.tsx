/**
 * Player position component
 * Displays a single player's information and cards
 */

import React from 'react';
import { Player, PlayerPosition as Position } from '../../types';

interface PlayerPositionProps {
  player: Player;
  isDealer: boolean;
  isCurrentPlayer: boolean;
  position: Position;
}

const PlayerPosition: React.FC<PlayerPositionProps> = ({
  player,
  isDealer,
  isCurrentPlayer,
  position,
}) => {
  // Position styling based on seat
  const getPositionStyle = () => {
    switch (position) {
      case 'hero':
        return 'bottom-[-80px] left-1/2 transform -translate-x-1/2';
      case 'opponent1':
        return 'top-[-80px] left-1/2 transform -translate-x-1/2';
      case 'opponent2':
        return 'left-[-120px] top-1/2 transform -translate-y-1/2';
      case 'opponent3':
        return 'right-[-120px] top-1/2 transform -translate-y-1/2';
      default:
        return '';
    }
  };

  return (
    <div className={`absolute ${getPositionStyle()}`}>
      <div
        className={`bg-gray-800 rounded-lg p-3 min-w-[140px] border-2 ${
          isCurrentPlayer ? 'border-yellow-400 shadow-lg shadow-yellow-400/50' : 'border-gray-600'
        }`}
      >
        {/* Player Name */}
        <div className="text-center font-bold text-white mb-1">{player.name}</div>

        {/* Stack Size */}
        <div className="text-center text-green-400 font-semibold mb-2">
          ${player.stack}
        </div>

        {/* Hole Cards */}
        <div className="flex gap-1 justify-center mb-2">
          {player.holeCards.map((card, index) => (
            <div
              key={index}
              className="w-10 h-14 bg-white rounded border border-gray-300 flex items-center justify-center text-xs font-bold"
            >
              {position === 'hero' || player.isFolded ? (
                <span className={card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-600' : 'text-black'}>
                  {card.rank}
                  {card.suit[0].toUpperCase()}
                </span>
              ) : (
                <span className="text-blue-600">🂠</span>
              )}
            </div>
          ))}
        </div>

        {/* Current Bet */}
        {player.currentBet > 0 && (
          <div className="text-center text-yellow-300 text-sm">
            Bet: ${player.currentBet}
          </div>
        )}

        {/* Status Indicators */}
        <div className="flex gap-2 justify-center mt-1">
          {isDealer && (
            <span className="bg-white text-black px-2 py-1 rounded-full text-xs font-bold">
              D
            </span>
          )}
          {player.isFolded && (
            <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs">
              FOLD
            </span>
          )}
          {player.isAllIn && (
            <span className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold">
              ALL-IN
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerPosition;
