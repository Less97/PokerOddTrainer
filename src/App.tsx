/**
 * Main App component - Poker Trainer Game
 */

import { useGameState } from './hooks';
import { PokerTable, ActionControls, ActionLog, ActionNotification } from './components/game';
import type { BetAction } from './types';
import { canCheck } from './utils/pokerLogic';

function App() {
  const { gameState, startNewHand, handlePlayerAction, isHeroTurn } = useGameState();

  const heroPlayer = gameState.players.find(p => p.position === 'hero');

  // Game flow handlers
  const handleStartHand = () => {
    startNewHand();
  };

  const handleAction = (action: BetAction) => {
    handlePlayerAction(action);
  };

  // Check if game is in a phase where we can start a new hand
  const canStartNewHand = gameState.phase === 'waiting' || gameState.phase === 'showdown';

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2">Poker Trainer</h1>
          <p className="text-gray-400">Practice your Texas Hold'em skills</p>
        </header>

        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Left Sidebar - Session Stats */}
          <aside className="lg:col-span-1 bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-bold mb-4">Session Stats</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Game Phase:</span>
                <span className="font-semibold capitalize">{gameState.phase}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Betting Round:</span>
                <span className="font-semibold capitalize">{gameState.bettingRound}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Current Bet:</span>
                <span className="font-semibold text-yellow-400">${gameState.currentBet}</span>
              </div>
            </div>

            {/* Player Info */}
            {heroPlayer && (
              <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                <h3 className="font-bold mb-2 text-green-400">Your Stack</h3>
                <div className="text-2xl font-bold">${heroPlayer.stack}</div>
                {heroPlayer.currentBet > 0 && (
                  <div className="text-sm text-gray-400 mt-1">
                    Current bet: ${heroPlayer.currentBet}
                  </div>
                )}
              </div>
            )}

            {/* Game Controls */}
            <div className="mt-6">
              {canStartNewHand && (
                <button
                  onClick={handleStartHand}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  {gameState.phase === 'waiting' ? 'Start Hand' : 'Next Hand'}
                </button>
              )}
            </div>
          </aside>

          {/* Center - Poker Table */}
          <main className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6 min-h-[600px] flex items-center justify-center">
              {gameState.phase === 'waiting' ? (
                <div className="text-center">
                  <p className="text-gray-400 text-lg mb-4">
                    Ready to play?
                  </p>
                  <button
                    onClick={handleStartHand}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors"
                  >
                    Deal Cards
                  </button>
                </div>
              ) : (
                <PokerTable gameState={gameState} />
              )}
            </div>

            {/* Action Controls - Show when it's hero's turn */}
            {isHeroTurn && heroPlayer && gameState.phase === 'betting' && (
              <div className="mt-4">
                <ActionControls
                  currentBet={gameState.currentBet}
                  playerStack={heroPlayer.stack}
                  pot={gameState.pot}
                  minRaise={gameState.minRaise}
                  canCheck={canCheck(heroPlayer, gameState.currentBet)}
                  onAction={handleAction}
                />
              </div>
            )}

            {/* Waiting for AI message */}
            {!isHeroTurn && gameState.phase === 'betting' && (
              <div className="mt-4 text-center">
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-300">
                    Waiting for {gameState.players[gameState.currentPlayerIndex]?.name}...
                  </p>
                  <div className="mt-2">
                    <div className="inline-block animate-pulse">●</div>
                    <div className="inline-block animate-pulse animation-delay-200">●</div>
                    <div className="inline-block animate-pulse animation-delay-400">●</div>
                  </div>
                </div>
              </div>
            )}

            {/* Showdown message */}
            {gameState.phase === 'showdown' && (
              <div className="mt-4">
                <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-lg p-6 text-center">
                  <h2 className="text-2xl font-bold text-black mb-2">Hand Complete!</h2>
                  <p className="text-black mb-4">Pot: ${gameState.pot}</p>
                  <button
                    onClick={handleStartHand}
                    className="bg-black hover:bg-gray-800 text-yellow-400 font-bold py-3 px-8 rounded-lg transition-colors"
                  >
                    Next Hand →
                  </button>
                </div>
              </div>
            )}
          </main>

          {/* Right Sidebar - Action Notification & Log */}
          <aside className="lg:col-span-1 space-y-4">
            {/* Visual notification of current action */}
            {gameState.phase !== 'waiting' && (
              <ActionNotification
                latestAction={gameState.actionHistory[gameState.actionHistory.length - 1] || null}
                currentPlayerName={
                  gameState.phase === 'betting'
                    ? gameState.players[gameState.currentPlayerIndex]?.name || null
                    : null
                }
                bettingRound={gameState.bettingRound}
                pot={gameState.pot}
              />
            )}

            {/* Full action history */}
            <ActionLog actions={gameState.actionHistory} />
          </aside>
        </div>
      </div>
    </div>
  );
}

export default App;
