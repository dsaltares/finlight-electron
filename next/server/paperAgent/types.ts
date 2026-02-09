import type { ScrapedPaper } from '../trpc/procedures/types';

export type PaperAgentResult = {
  scrapedPaper: ScrapedPaper;
  sources: string[];
  cost: number;
};
