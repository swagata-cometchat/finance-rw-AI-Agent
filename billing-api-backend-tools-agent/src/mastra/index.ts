import { Mastra } from '@mastra/core/mastra';
import { billingApiAgent } from './agents/billing-api-agent';

export const mastra = new Mastra({
  agents: { billingApiAgent },
});