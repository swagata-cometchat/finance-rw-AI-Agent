import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { financePolicyAgent } from './agents/finance-policy-agent';

export const mastra = new Mastra({
  agents: { 'finance-policy': financePolicyAgent },
  logger: new PinoLogger({ 
    name: 'Finance-Policy-FAQ-Mastra', 
    level: 'info' 
  }),
});