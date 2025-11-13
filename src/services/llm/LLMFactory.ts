/**
 * Factory for creating LLM coach instances
 * Allows easy switching between different LLM providers
 */

import type { LLMConfig } from '../../types';
import type { ICoachLLM } from './ICoachLLM';
import { ClaudeCoach } from './ClaudeCoach';
import { OpenAICoach } from './OpenAICoach';

export class LLMFactory {
  /**
   * Create a coach instance based on the configuration
   */
  static createCoach(config: LLMConfig): ICoachLLM {
    if (!config.apiKey) {
      throw new Error(`API key required for ${config.provider} provider`);
    }

    switch (config.provider) {
      case 'claude':
        return new ClaudeCoach(config.apiKey, config.model);

      case 'openai':
        return new OpenAICoach(config.apiKey, config.model);

      case 'local':
        // Future implementation for local models
        throw new Error('Local LLM provider not yet implemented');

      default:
        throw new Error(`Unknown LLM provider: ${config.provider}`);
    }
  }
}
