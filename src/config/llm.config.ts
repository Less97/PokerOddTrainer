/**
 * LLM configuration
 * Set your API keys and preferred provider here
 */

import { LLMConfig } from '../types';

export const llmConfig: LLMConfig = {
  // Default provider - can be changed to 'openai' or 'local'
  provider: 'claude',

  // API keys - should be set via environment variables in production
  apiKey: import.meta.env.VITE_LLM_API_KEY || '',

  // Model selection
  model: import.meta.env.VITE_LLM_MODEL || undefined,

  // Generation parameters
  temperature: 0.7,
  maxTokens: 2000,
};

/**
 * Get the active LLM configuration
 * Can be modified to support runtime provider switching
 */
export function getActiveLLMConfig(): LLMConfig {
  return { ...llmConfig };
}
