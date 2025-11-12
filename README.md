# Poker Trainer

A Texas Hold'em poker training application with AI-powered coaching feedback.

## Features

- **Live Poker Play**: Play Texas Hold'em against 3 AI opponents
- **Strategic AI Opponents**: Each opponent has a distinct playing style (Tight-Aggressive, Loose-Passive, etc.)
- **AI Coach Analysis**: Get detailed post-hand analysis from an AI coach
- **Replaceable LLM Backend**: Easily switch between Claude, OpenAI, or custom LLM providers

## Project Structure

```
src/
├── components/
│   ├── game/          # Poker game UI components
│   │   ├── PokerTable.tsx
│   │   ├── PlayerPosition.tsx
│   │   ├── CommunityCards.tsx
│   │   ├── ActionControls.tsx
│   │   └── ActionLog.tsx
│   └── coach/         # AI coach components
│       ├── CoachAnalysis.tsx
│       └── HandSummary.tsx
├── services/
│   ├── ai/            # AI opponent logic
│   └── llm/           # LLM abstraction layer
│       ├── ICoachLLM.ts
│       ├── ClaudeCoach.ts
│       ├── OpenAICoach.ts
│       └── LLMFactory.ts
├── hooks/             # React hooks
├── utils/             # Utility functions
├── types/             # TypeScript type definitions
└── config/            # Configuration files
    └── llm.config.ts
```

## Tech Stack

- **React** with **TypeScript**
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **LLM Integration** (Claude/OpenAI)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file in the root directory:

```env
VITE_LLM_API_KEY=your_api_key_here
VITE_LLM_PROVIDER=claude  # or 'openai'
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Game Rules

- **Texas Hold'em No Limit**
- 4 players (you + 3 AI opponents)
- Random stack sizes (30-200 big blinds)
- Standard betting actions: Fold, Check/Call, Min Raise, 1/3 Pot, 1/2 Pot, Pot, 2x Pot, All-In

## AI Coach Features

After each hand, you can choose to:
1. **Get AI Coach Insights** - Detailed analysis including:
   - Decision-by-decision breakdown
   - Pot odds and equity calculations
   - Outs counting
   - Overall grade (A-F)
   - Key takeaways
2. **Hand Summary & Next** - Quick summary and move to next hand

## LLM Provider Setup

The application supports multiple LLM providers through an abstraction layer:

### Claude (Anthropic)
```typescript
provider: 'claude'
apiKey: 'your_claude_api_key'
```

### OpenAI
```typescript
provider: 'openai'
apiKey: 'your_openai_api_key'
```

Switch providers in `src/config/llm.config.ts`

## License

MIT
