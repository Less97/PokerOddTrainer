/**
 * Action controls component
 * Displays betting buttons for the hero player
 */

import React, { useState, useEffect } from 'react';
import type { BetAction } from '../../types';

interface ActionControlsProps {
  currentBet: number;
  playerStack: number;
  pot: number;
  minRaise: number;
  canCheck: boolean;
  onAction: (action: BetAction) => void;
  bigBlind: number;
  isPreFlop: boolean;
}

const ActionControls: React.FC<ActionControlsProps> = ({
  currentBet,
  playerStack,
  pot,
  minRaise,
  canCheck,
  onAction,
  bigBlind,
  isPreFlop,
}) => {
  const [customRaise, setCustomRaise] = useState(minRaise);

  // Update custom raise when minRaise changes
  useEffect(() => {
    setCustomRaise(Math.max(minRaise, customRaise));
  }, [minRaise]);

  const calculateBetAmount = (type: string): number => {
    switch (type) {
      case '2.5bb':
        return bigBlind * 2.5;
      case '3bb':
        return bigBlind * 3;
      case '4bb':
        return bigBlind * 4;
      case '1/3':
        return Math.floor(pot * 0.33);
      case '1/2':
        return Math.floor(pot * 0.5);
      case '3/4':
        return Math.floor(pot * 0.75);
      case 'pot':
        return pot;
      default:
        return 0;
    }
  };

  const handleBetClick = (amount: number) => {
    if (amount >= playerStack) {
      onAction({ type: 'all-in', amount: playerStack });
    } else {
      onAction({ type: 'raise', amount: Math.max(amount, minRaise) });
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomRaise(Number(e.target.value));
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700">
      <div className="mb-4 text-center text-gray-300">
        <div className="text-sm">Your Stack: <span className="text-green-400 font-bold">${playerStack}</span></div>
        <div className="text-sm">Current Bet: <span className="text-yellow-400 font-bold">${currentBet}</span></div>
      </div>

      {/* Basic Actions */}
      <div className="grid grid-cols-2 gap-2 mb-4">
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
      </div>

      {/* Raise Slider */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="text-gray-300 text-sm font-semibold">Raise Amount:</label>
          <span className="text-green-400 font-bold text-lg">${customRaise}</span>
        </div>
        <input
          type="range"
          min={minRaise}
          max={playerStack}
          value={customRaise}
          onChange={handleSliderChange}
          className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Min: ${minRaise}</span>
          <span>Max: ${playerStack}</span>
        </div>
        <button
          onClick={() => handleBetClick(customRaise)}
          className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          Raise to ${customRaise}
        </button>
      </div>

      {/* Quick Raise Presets */}
      <div className="mb-4">
        <div className="text-gray-400 text-xs mb-2 text-center">Quick Raise:</div>
        {isPreFlop ? (
          /* Pre-flop: BB-based raises */
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleBetClick(calculateBetAmount('2.5bb'))}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-2 rounded transition-colors"
            >
              2.5 BB
              <div className="text-xs text-gray-400">${calculateBetAmount('2.5bb')}</div>
            </button>
            <button
              onClick={() => handleBetClick(calculateBetAmount('3bb'))}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-2 rounded transition-colors"
            >
              3 BB
              <div className="text-xs text-gray-400">${calculateBetAmount('3bb')}</div>
            </button>
            <button
              onClick={() => handleBetClick(calculateBetAmount('4bb'))}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-2 rounded transition-colors"
            >
              4 BB
              <div className="text-xs text-gray-400">${calculateBetAmount('4bb')}</div>
            </button>
          </div>
        ) : (
          /* Post-flop: Pot-based bets */
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => handleBetClick(calculateBetAmount('1/3'))}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-2 rounded transition-colors"
            >
              1/3
              <div className="text-xs text-gray-400">${calculateBetAmount('1/3')}</div>
            </button>
            <button
              onClick={() => handleBetClick(calculateBetAmount('1/2'))}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-2 rounded transition-colors"
            >
              1/2
              <div className="text-xs text-gray-400">${calculateBetAmount('1/2')}</div>
            </button>
            <button
              onClick={() => handleBetClick(calculateBetAmount('3/4'))}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-2 rounded transition-colors"
            >
              3/4
              <div className="text-xs text-gray-400">${calculateBetAmount('3/4')}</div>
            </button>
            <button
              onClick={() => handleBetClick(calculateBetAmount('pot'))}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-2 rounded transition-colors"
            >
              Pot
              <div className="text-xs text-gray-400">${calculateBetAmount('pot')}</div>
            </button>
          </div>
        )}
      </div>

      {/* All-In */}
      <button
        onClick={() => onAction({ type: 'all-in', amount: playerStack })}
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-4 rounded-lg transition-colors"
      >
        All-In (${playerStack})
      </button>
    </div>
  );
};

export default ActionControls;
