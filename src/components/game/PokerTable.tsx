/**
 * Main poker table component
 * Displays the poker table with all players and community cards
 */

import React from 'react';
import type { GameState } from '../../types';
import PlayerPosition from './PlayerPosition';
import CommunityCards from './CommunityCards';

interface PokerTableProps {
  gameState: GameState;
}

const PokerTable: React.FC<PokerTableProps> = ({ gameState }) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Poker Table */}
      <div className="relative bg-gradient-to-br from-green-700 to-green-800 rounded-full shadow-2xl border-8 border-amber-900 w-[800px] h-[500px]">
        {/* Community Cards - Center of table */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <CommunityCards cards={gameState.communityCards} />
        </div>

        {/* Pot Display */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-yellow-400 px-6 py-2 rounded-full font-bold text-xl border-2 border-yellow-500">
          Pot: ${gameState.pot}
        </div>

        {/* Player Positions */}
        {gameState.players.map((player, index) => (
          <PlayerPosition
            key={player.position}
            player={player}
            isDealer={index === gameState.dealerButtonIndex}
            isCurrentPlayer={index === gameState.currentPlayerIndex}
            position={player.position}
          />
        ))}
      </div>
    </div>
  );
};

export default PokerTable;
