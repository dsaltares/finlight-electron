import { caller } from '../trpc/caller';

type EventResult = {
  // biome-ignore lint/suspicious/noExplicitAny: result type varies by event
  result: any;
  cost: number;
};

export const eventRegistry: Record<
  string,
  // biome-ignore lint/suspicious/noExplicitAny: input type varies by event
  (input: any) => Promise<EventResult>
> = {
  scrapePaper: caller.papers.scrape,
};
