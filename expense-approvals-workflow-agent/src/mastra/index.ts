import { Mastra } from '@mastra/core';
import { apiRoutes } from './server/routes';

export const mastra = new Mastra({
  server: {
    build: { swaggerUI: true },
    apiRoutes,
  },
});