/**
 * Action notification component
 * Shows the latest action prominently for better visual feedback
 */

import React, { useEffect, useState } from 'react';
import type { Action } from '../../types';

interface ActionNotificationProps {
  latestAction: Action | null;
  currentPlayerName: string | null;
  bettingRound: string;
  pot: number;
}

const ActionNotification: React.FC<ActionNotificationProps> = ({
  latestAction,
  currentPlayerName,
  bettingRound,
  pot,
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (latestAction) {
      setShow(true);
      // Keep showing for a bit longer
      const timer = setTimeout(() => setShow(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [latestAction]);

  const formatAction = (action: Action): string => {
    const playerName = action.playerName;

    switch (action.action) {
      case 'fold':
        return `${playerName} folds`;
      case 'check':
        return `${playerName} checks`;
      case 'call':
        return `${playerName} calls $${action.amount}`;
      case 'raise':
        return `${playerName} raises to $${action.amount}`;
      case 'all-in':
        return `${playerName} goes ALL-IN for $${action.amount}`;
      default:
        return `${playerName} ${action.action}`;
    }
  };

  const getActionColor = (action: Action): string => {
    switch (action.action) {
      case 'fold':
        return 'bg-red-600';
      case 'check':
        return 'bg-gray-600';
      case 'call':
        return 'bg-blue-600';
      case 'raise':
        return 'bg-green-600';
      case 'all-in':
        return 'bg-yellow-600';
      default:
        return 'bg-gray-700';
    }
  };

  const getBettingRoundDisplay = (): string => {
    switch (bettingRound) {
      case 'preflop':
        return 'Pre-Flop';
      case 'flop':
        return 'Flop';
      case 'turn':
        return 'Turn';
      case 'river':
        return 'River';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-2">
      {/* Betting round and pot info */}
      <div className="bg-gray-800 rounded-lg p-3 border-2 border-gray-700">
        <div className="flex justify-between items-center">
          <div className="text-white font-bold text-lg">
            {getBettingRoundDisplay()}
          </div>
          <div className="text-green-400 font-bold text-xl">
            Pot: ${pot}
          </div>
        </div>
      </div>

      {/* Latest action notification */}
      {latestAction && show && (
        <div
          className={`${getActionColor(latestAction)} rounded-lg p-4 border-2 border-white shadow-lg transform transition-all duration-300 ${
            show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          <div className="text-white font-bold text-lg text-center">
            {formatAction(latestAction)}
          </div>
        </div>
      )}

      {/* Current player turn indicator */}
      {currentPlayerName && (
        <div className="bg-yellow-600 rounded-lg p-3 border-2 border-yellow-400 shadow-lg animate-pulse">
          <div className="text-black font-bold text-center">
            {currentPlayerName}'s Turn
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionNotification;
