# Claude.md - Poker Trainer Project

## Project Overview

A Texas Hold'em poker training application where users play against AI opponents and receive detailed coaching feedback from an AI coach after each hand.

## Requirements Discussion Summary

### Core Decisions Made

**Game Configuration:**
- **Variant:** Texas Hold'em No Limit
- **Players:** 1 Hero (user) + 3 AI opponents (4 total)
- **Stack Sizes:** Random 30-200 big blinds (creates varied scenarios: short stack, medium stack, deep stack)
- **Blinds:** Standard structure (0.5/1 or similar ratio)

**Betting Controls:**
- 8 standard buttons: Fold, Check/Call, Min Raise, 1/3 Pot, 1/2 Pot, Pot, 2x Pot, All-In
- All bet amounts auto-calculated based on current pot

**AI Opponents:**
- **Playing Styles:** Randomly assigned from pool with appropriate names
  - Sharky (Tight-Aggressive)
  - Fishy (Loose-Passive)
  - Donkey (Loose-Aggressive)
  - Grinder (Tight-Passive)
  - Maniac (Ultra-Aggressive)
- Must play strategically and realistically
- Each style has distinct VPIP, PFR, aggression, and bluff frequency

**Coaching System:**
- **During Hand:** Small non-AI flavor comments only ("Bold move!", "Playing tight")
- **Post-Hand:** Two options
  1. "Get AI Coach Insights" → Full detailed analysis
  2. "Hand Summary & Next" → Quick summary, move on
- **AI Coach Persona:** Friendly mentor (encouraging, constructive)
- **Analysis Includes:**
  - Decision-by-decision breakdown
  - Pot odds, equity, outs calculations
  - Overall grade (A-F)
  - Key takeaways (2-3 bullet points)
  - Opponent analysis

**UI/UX:**
- Clean, ordered layout (no overlapping)
- 4-player arrangement: Hero (bottom), 3 opponents (top/sides)
- Standard poker table aesthetic
- Action log showing all bets/raises/folds
- Pot size and stack displays visible
- Desktop-focused

**Technical Stack:**
- React + TypeScript
- Vite.js for build tooling
- Tailwind CSS for styling
- **LLM Abstraction Layer** (replaceable: Claude, OpenAI, or custom)
- Firestore ready for future save/persistence (not implemented yet)

**Session Stats:**
- Hands played
- Hands won
- Profit/Loss
- Average grade (if using coach)
- Current session only (historical tracking deferred)

---

## Current Status

### ✅ Completed (Initial Setup)

**Project Infrastructure:**
- [x] Vite + React + TypeScript initialized
- [x] Tailwind CSS configured
- [x] Project folder structure created
- [x] All dependencies installed

**TypeScript Type System:**
- [x] `poker.types.ts` - Cards, suits, ranks, hand rankings, positions, player styles, actions
- [x] `game.types.ts` - Game state, players, phases, hand results, session stats
- [x] `coach.types.ts` - Coach analysis, decision analysis, hand history, LLM interface

**LLM Abstraction Layer:** ⭐ Key Feature
- [x] `ICoachLLM` interface - Allows swapping LLM providers
- [x] `ClaudeCoach.ts` - Full Anthropic Claude implementation
- [x] `OpenAICoach.ts` - Full OpenAI GPT implementation
- [x] `LLMFactory.ts` - Provider factory pattern
- [x] `llm.config.ts` - Centralized config with env variables

**UI Components - Game:**
- [x] `PokerTable.tsx` - Main table with 4-player layout
- [x] `PlayerPosition.tsx` - Player display (cards, stack, status indicators)
- [x] `CommunityCards.tsx` - Flop/turn/river display
- [x] `ActionControls.tsx` - 8 betting buttons with calculated amounts
- [x] `ActionLog.tsx` - Scrollable action history

**UI Components - Coach:**
- [x] `CoachAnalysis.tsx` - Detailed AI feedback display
- [x] `HandSummary.tsx` - Quick summary with coach option

**Documentation:**
- [x] README.md with setup instructions and feature overview
- [x] Code committed and pushed to branch

---

## Next Steps

### Phase 1: Core Game Logic (Priority)

**Utilities (`src/utils/`):**
- [ ] `deckUtils.ts` - Deck creation, shuffling, dealing
- [ ] `handEvaluator.ts` - Evaluate poker hand strength (rankings)
- [ ] `oddsCalculator.ts` - Calculate pot odds, equity, outs
- [ ] `pokerLogic.ts` - General poker rules and validations

**Hooks (`src/hooks/`):**
- [ ] `useGameState.ts` - Main game state management
- [ ] `useHandHistory.ts` - Track actions and build hand history
- [ ] `useDeck.ts` - Deck management hook

### Phase 2: AI Opponent Logic

**AI Services (`src/services/ai/`):**
- [ ] `playerStyles.ts` - Define all playing style configurations
- [ ] `AIOpponent.ts` - AI decision-making engine
  - Pre-flop strategy by position and hand strength
  - Post-flop strategy based on board texture
  - Betting/raising logic based on style
  - Bluffing logic

### Phase 3: Game Integration

**Main Application:**
- [ ] Integrate all components into `App.tsx`
- [ ] Implement full game flow:
  - Start hand → Deal cards → Betting rounds → Showdown → Analysis
- [ ] Connect UI components to game state
- [ ] Handle user actions and AI responses
- [ ] Implement hand progression logic

### Phase 4: Testing & Polish

- [ ] Test LLM integration with real API calls
- [ ] Test all player styles and betting scenarios
- [ ] UI/UX refinements
- [ ] Add loading states and error handling
- [ ] Add animations (optional)
- [ ] Performance optimization

### Phase 5: Future Enhancements (Deferred)

- [ ] Firestore integration for session persistence
- [ ] Historical statistics across sessions
- [ ] Replay feature
- [ ] Mobile responsive design
- [ ] Difficulty levels for AI
- [ ] Hints/assistance during play

---

## Key Architectural Decisions

1. **LLM Abstraction Layer**
   - Interface-based design allows easy provider switching
   - Config-driven selection (environment variables)
   - No vendor lock-in

2. **TypeScript First**
   - Full type coverage for safety
   - Clear contracts between components
   - Better IDE support

3. **Component-Based UI**
   - Each component is self-contained
   - Props-driven for flexibility
   - Easy to test and modify

4. **Separated Concerns**
   - `/components` - Pure UI
   - `/services` - Business logic (AI, LLM)
   - `/utils` - Pure functions
   - `/hooks` - React state management

---

## Environment Setup

Users need to create `.env` file:

```env
VITE_LLM_API_KEY=your_api_key_here
VITE_LLM_PROVIDER=claude  # or 'openai'
```

---

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run linter
```

---

## Questions/Decisions Pending

None at this time. All major requirements have been defined.

---

**Last Updated:** 2025-11-12
**Current Phase:** Phase 1 - Core Game Logic (Ready to start)
