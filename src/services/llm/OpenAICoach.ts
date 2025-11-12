/**
 * OpenAI implementation of the poker coach
 */

import { CoachAnalysis, HandHistory, Grade } from '../../types';
import { ICoachLLM } from './ICoachLLM';

export class OpenAICoach implements ICoachLLM {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-4o') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async analyzeHand(handHistory: HandHistory): Promise<CoachAnalysis> {
    const prompt = this.buildAnalysisPrompt(handHistory);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are an experienced poker coach providing friendly, constructive feedback.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const analysisText = data.choices[0].message.content;

      // Parse the LLM response into structured CoachAnalysis
      return this.parseAnalysis(analysisText, handHistory);
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw error;
    }
  }

  async getHandSummary(handHistory: HandHistory): Promise<string> {
    const prompt = this.buildSummaryPrompt(handHistory);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a friendly poker coach.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 200,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw error;
    }
  }

  private buildAnalysisPrompt(handHistory: HandHistory): string {
    return `Analyze this Texas Hold'em hand and provide detailed coaching:

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

Be encouraging, celebrate good plays, and gently explain mistakes.`;
  }

  private buildSummaryPrompt(handHistory: HandHistory): string {
    return `Provide a brief 1-2 sentence summary of this poker hand.

Hero's Cards: ${this.formatCards(handHistory.heroCards)}
Community Cards: ${this.formatCards(handHistory.communityCards)}
Winner: ${handHistory.winner}
Pot: $${handHistory.pot}

Just say whether the hero played well or not. Be encouraging and friendly.`;
  }

  private formatCards(cards: any[]): string {
    return cards.map(c => `${c.rank}${c.suit[0]}`).join(' ');
  }

  private formatActions(actions: any[]): string {
    return actions.map(a => `${a.player} ${a.action} $${a.amount || 0}`).join('\n');
  }

  private parseAnalysis(analysisText: string, handHistory: HandHistory): CoachAnalysis {
    try {
      // Try to extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
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
