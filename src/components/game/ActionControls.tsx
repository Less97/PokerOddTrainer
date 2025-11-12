/**
 * Action controls component
 * Displays betting buttons for the hero player
 */

import React from 'react';
import type { BetAction } from '../../types';

interface ActionControlsProps {
  currentBet: number;
  playerStack: number;
  pot: number;
  minRaise: number;
  canCheck: boolean;
  onAction: (action: BetAction) => void;
}

const ActionControls: React.FC<ActionControlsProps> = ({
  currentBet,
  playerStack,
  pot,
  minRaise,
  canCheck,
  onAction,
}) => {
  const calculateBetAmount = (type: string): number => {
    switch (type) {
      case 'min':
        return minRaise;
      case '1/3':
        return Math.floor(pot * 0.33);
      case '1/2':
        return Math.floor(pot * 0.5);
      case 'pot':
        return pot;
      case '2x':
        return pot * 2;
      default:
        return 0;
    }
  };

  const handleBetClick = (type: string) => {
    const amount = calculateBetAmount(type);
    if (amount >= playerStack) {
      onAction({ type: 'all-in', amount: playerStack });
    } else {
      onAction({ type: 'raise', amount });
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700">
      <div className="mb-4 text-center text-gray-300">
        <div className="text-sm">Your Stack: <span className="text-green-400 font-bold">${playerStack}</span></div>
        <div className="text-sm">Current Bet: <span className="text-yellow-400 font-bold">${currentBet}</span></div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {/* Fold Button */}
        <button
          onClick={() => onAction({ type: 'fold' })}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          Fold
        </button>

        {/* Check/Call Button */}
        <button
          onClick={() => onAction({ type: canCheck ? 'check' : 'call', amount: canCheck ? 0 : currentBet })}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          {canCheck ? 'Check' : `Call $${currentBet}`}
        </button>

        {/* Min Raise */}
        <button
          onClick={() => handleBetClick('min')}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          Min
          <div className="text-xs">${minRaise}</div>
        </button>

        {/* 1/3 Pot */}
        <button
          onClick={() => handleBetClick('1/3')}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          1/3 Pot
          <div className="text-xs">${calculateBetAmount('1/3')}</div>
        </button>

        {/* 1/2 Pot */}
        <button
          onClick={() => handleBetClick('1/2')}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          1/2 Pot
          <div className="text-xs">${calculateBetAmount('1/2')}</div>
        </button>

        {/* Pot */}
        <button
          onClick={() => handleBetClick('pot')}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          Pot
          <div className="text-xs">${calculateBetAmount('pot')}</div>
        </button>

        {/* 2x Pot */}
        <button
          onClick={() => handleBetClick('2x')}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          2x Pot
          <div className="text-xs">${calculateBetAmount('2x')}</div>
        </button>

        {/* All-In */}
        <button
          onClick={() => onAction({ type: 'all-in', amount: playerStack })}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-4 rounded-lg transition-colors"
        >
          All-In
          <div className="text-xs">${playerStack}</div>
        </button>
      </div>
    </div>
  );
};

export default ActionControls;
