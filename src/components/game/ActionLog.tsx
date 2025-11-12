/**
 * Action log component
 * Displays the history of actions taken during the hand
 */

import React from 'react';
import { Action } from '../../types';

interface ActionLogProps {
  actions: Action[];
}

const ActionLog: React.FC<ActionLogProps> = ({ actions }) => {
  const formatAction = (action: Action): string => {
    const playerName = action.player.replace('opponent', 'Player ');

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
        return `${playerName} goes all-in for $${action.amount}`;
      default:
        return `${playerName} ${action.action}`;
    }
  };

  const getActionColor = (action: Action): string => {
    switch (action.action) {
      case 'fold':
        return 'text-red-400';
      case 'check':
        return 'text-gray-400';
      case 'call':
        return 'text-blue-400';
      case 'raise':
        return 'text-green-400';
      case 'all-in':
        return 'text-yellow-400';
      default:
        return 'text-white';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700 h-full">
      <h3 className="text-white font-bold mb-3 text-lg">Action Log</h3>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {actions.length === 0 ? (
          <p className="text-gray-500 italic">No actions yet...</p>
        ) : (
          actions.map((action, index) => (
            <div
              key={index}
              className={`text-sm ${getActionColor(action)} font-mono`}
            >
              {formatAction(action)}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActionLog;
