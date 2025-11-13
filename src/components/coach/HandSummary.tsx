/**
 * Hand summary component
 * Displays a brief summary after a hand without detailed analysis
 */

import React from 'react';
import type { HandResult } from '../../types';

interface HandSummaryProps {
  result: HandResult;
  summary: string;
  onGetCoachInsights: () => void;
  onNextHand: () => void;
}

const HandSummary: React.FC<HandSummaryProps> = ({
  result,
  summary,
  onGetCoachInsights,
  onNextHand,
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border-2 border-gray-700 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Hand Complete</h2>

        {/* Winner Info */}
        <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-lg p-4 mb-4">
          <div className="text-2xl font-bold text-black">
            {result.winner === 'hero' ? '🎉 You Won!' : `${result.winner} Wins`}
          </div>
          <div className="text-xl text-black mt-2">
            Pot: ${result.potAmount}
          </div>
          <div className="text-sm text-black mt-1">
            {result.winningHand.description}
          </div>
        </div>

        {/* Quick Summary */}
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <p className="text-white text-lg">{summary}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={onGetCoachInsights}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors"
        >
          🎓 Get AI Coach Insights
        </button>
        <button
          onClick={onNextHand}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors"
        >
          Next Hand →
        </button>
      </div>
    </div>
  );
};

export default HandSummary;
