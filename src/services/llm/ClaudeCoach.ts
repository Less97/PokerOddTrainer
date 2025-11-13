/**
 * Claude AI implementation of the poker coach
 */

import type { CoachAnalysis, HandHistory, Grade } from '../../types';
import type { ICoachLLM } from './ICoachLLM';

export class ClaudeCoach implements ICoachLLM {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'claude-3-5-sonnet-20241022') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async analyzeHand(handHistory: HandHistory): Promise<CoachAnalysis> {
    const prompt = this.buildAnalysisPrompt(handHistory);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 2000,
          temperature: 0.7,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`);
      }

      const data = await response.json();
      const analysisText = data.content[0].text;

      // Parse the LLM response into structured CoachAnalysis
      return this.parseAnalysis(analysisText);
    } catch (error) {
      console.error('Error calling Claude API:', error);
      throw error;
    }
  }

  async getHandSummary(handHistory: HandHistory): Promise<string> {
    const prompt = this.buildSummaryPrompt(handHistory);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 200,
          temperature: 0.7,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.error('Error calling Claude API:', error);
      throw error;
    }
  }

  private buildAnalysisPrompt(handHistory: HandHistory): string {
    return `You are an experienced poker coach providing friendly, constructive feedback to a student.

Analyze this Texas Hold'em hand and provide detailed coaching:

Hero's Cards: ${this.formatCards(handHistory.heroCards)}
Community Cards: ${this.formatCards(handHistory.communityCards)}
Pot: $${handHistory.pot}

Action History:
${this.formatActions(handHistory.actions)}

Winner: ${handHistory.winner}
Winning Hand: ${this.formatCards(handHistory.winningCards)}

Please provide your analysis in the following JSON format:
{
  "grade": "A|B|C|D|F",
  "overallFeedback": "2-3 sentences of friendly feedback",
  "decisions": [
    {
      "round": "preflop|flop|turn|river",
      "action": "the action taken",
      "potOdds": number,
      "handOdds": number,
      "equity": number,
      "outs": number,
      "expectedValue": number,
      "wasCorrect": boolean,
      "feedback": "explanation of this decision",
      "alternativePlays": ["alternative1", "alternative2"]
    }
  ],
  "keyTakeaways": ["takeaway1", "takeaway2", "takeaway3"],
  "handStrengthSummary": "brief summary of hand strength progression",
  "opponentAnalysis": [
    {
      "player": "opponent1|opponent2|opponent3",
      "style": "their playing style",
      "criticalActions": ["action1", "action2"]
    }
  ]
}

Be encouraging, celebrate good plays, and gently explain mistakes. Focus on pot odds, equity, and strategic thinking.`;
  }

  private buildSummaryPrompt(handHistory: HandHistory): string {
    return `You are a friendly poker coach. Provide a brief 1-2 sentence summary of this hand.

Hero's Cards: ${this.formatCards(handHistory.heroCards)}
Community Cards: ${this.formatCards(handHistory.communityCards)}
Winner: ${handHistory.winner}
Pot: $${handHistory.pot}

Just say whether the hero played well or not, and if they won or lost. Be encouraging and friendly.`;
  }

  private formatCards(cards: any[]): string {
    return cards.map(c => `${c.rank}${c.suit[0]}`).join(' ');
  }

  private formatActions(actions: any[]): string {
    return actions.map(a => `${a.player} ${a.action} $${a.amount || 0}`).join('\n');
  }

  private parseAnalysis(analysisText: string): CoachAnalysis {
    try {
      // Try to extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error parsing Claude response:', error);
    }

    // Fallback: create a basic analysis if parsing fails
    return {
      grade: 'C' as Grade,
      overallFeedback: analysisText.slice(0, 200),
      decisions: [],
      keyTakeaways: ['Review the hand carefully', 'Focus on pot odds', 'Consider position'],
      handStrengthSummary: 'Analysis unavailable',
      opponentAnalysis: [],
    };
  }
}
