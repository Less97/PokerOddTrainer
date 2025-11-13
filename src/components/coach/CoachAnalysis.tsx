/**
 * Coach analysis component
 * Displays detailed AI coaching feedback after a hand
 */

import React from 'react';
import type { CoachAnalysis as Analysis } from '../../types';

interface CoachAnalysisProps {
  analysis: Analysis;
  onNextHand: () => void;
}

const CoachAnalysis: React.FC<CoachAnalysisProps> = ({ analysis, onNextHand }) => {
  const getGradeColor = (grade: string): string => {
    switch (grade) {
      case 'A':
        return 'text-green-400';
      case 'B':
        return 'text-blue-400';
      case 'C':
        return 'text-yellow-400';
      case 'D':
        return 'text-orange-400';
      case 'F':
        return 'text-red-400';
      default:
        return 'text-white';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border-2 border-blue-500 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold text-white mb-2">AI Coach Analysis</h2>
        <div className={`text-6xl font-bold ${getGradeColor(analysis.grade)}`}>
          Grade: {analysis.grade}
        </div>
      </div>

      {/* Overall Feedback */}
      <div className="mb-6 bg-gray-700 rounded-lg p-4">
        <h3 className="text-xl font-bold text-blue-400 mb-2">Overall Feedback</h3>
        <p className="text-white">{analysis.overallFeedback}</p>
      </div>

      {/* Hand Strength Summary */}
      <div className="mb-6 bg-gray-700 rounded-lg p-4">
        <h3 className="text-xl font-bold text-green-400 mb-2">Hand Strength</h3>
        <p className="text-white">{analysis.handStrengthSummary}</p>
      </div>

      {/* Decision Analysis */}
      {analysis.decisions.length > 0 && (
        <div className="mb-6 bg-gray-700 rounded-lg p-4">
          <h3 className="text-xl font-bold text-yellow-400 mb-3">Decision Breakdown</h3>
          <div className="space-y-4">
            {analysis.decisions.map((decision, index) => (
              <div
                key={index}
                className={`p-3 rounded border-l-4 ${
                  decision.wasCorrect ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-white capitalize">{decision.round}</span>
                  <span className={`font-bold ${decision.wasCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {decision.wasCorrect ? '✓ Good Play' : '✗ Mistake'}
                  </span>
                </div>
                <p className="text-gray-300 mb-2">{decision.feedback}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-400">Pot Odds: {decision.potOdds.toFixed(1)}%</div>
                  <div className="text-gray-400">Equity: {decision.equity.toFixed(1)}%</div>
                  <div className="text-gray-400">Outs: {decision.outs}</div>
                  <div className="text-gray-400">EV: ${decision.expectedValue.toFixed(2)}</div>
                </div>
                {decision.alternativePlays && decision.alternativePlays.length > 0 && (
                  <div className="mt-2 text-sm text-blue-300">
                    Alternative: {decision.alternativePlays.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Takeaways */}
      <div className="mb-6 bg-gray-700 rounded-lg p-4">
        <h3 className="text-xl font-bold text-purple-400 mb-3">Key Takeaways</h3>
        <ul className="list-disc list-inside space-y-2">
          {analysis.keyTakeaways.map((takeaway, index) => (
            <li key={index} className="text-white">
              {takeaway}
            </li>
          ))}
        </ul>
      </div>

      {/* Opponent Analysis */}
      {analysis.opponentAnalysis.length > 0 && (
        <div className="mb-6 bg-gray-700 rounded-lg p-4">
          <h3 className="text-xl font-bold text-orange-400 mb-3">Opponent Analysis</h3>
          <div className="space-y-3">
            {analysis.opponentAnalysis.map((opponent, index) => (
              <div key={index} className="border-l-4 border-orange-500 pl-3">
                <div className="font-bold text-white mb-1">
                  {opponent.player} - {opponent.style}
                </div>
                <ul className="list-disc list-inside text-gray-300 text-sm">
                  {opponent.criticalActions.map((action, idx) => (
                    <li key={idx}>{action}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Hand Button */}
      <div className="text-center">
        <button
          onClick={onNextHand}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors"
        >
          Next Hand →
        </button>
      </div>
    </div>
  );
};

export default CoachAnalysis;
