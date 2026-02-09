import estimateAgentRunCost from '../estimateCost';
import { getLogger } from '../logger';
import paperAgents from './agent';
import getGoogleScholarUrl from './getGoogleScholarUrl';
import getLinkedInUrl from './getLinkedInUrl';
import type { PaperAgentResult } from './types';
import {
  normalizeGoogleScholarUrl,
  normalizeLinkedInUrl,
  normalizeUrl,
} from './utils';

const logger = getLogger('paperAgent');

export default async function runPaperAgent(
  url: string,
): Promise<PaperAgentResult> {
  logger.info(`Running paper agent for ${url}`);
  const { model, result } = await (async () => {
    for (const agent of paperAgents) {
      try {
        const result = await agent.agent.generate({
          messages: [{ role: 'user', content: url }],
        });
        return { result, model: agent.model };
      } catch (error) {
        logger.error(
          `Error running paper agent for ${url} with model ${agent.model}: ${error}`,
        );
      }
    }
    throw new Error(`Failed to run paper agent for ${url}`);
  })();

  logger.info(
    `Basic paper agent for ${url} completed: ${JSON.stringify(result.experimental_output, null, 2)}`,
  );

  const sources = new Set<string>();
  result.steps?.forEach((step) => {
    step.toolCalls?.forEach((tc) => {
      if (tc.toolName === 'getMarkdownFromUrl' && 'input' in tc) {
        const input = tc.input as { url: string };
        sources.add(input.url);
      }
    });
  });

  let cost = estimateAgentRunCost({
    usage: result.usage,
    model,
    toolCalls:
      result.steps?.flatMap(
        (step) =>
          step.toolCalls?.map((tc) => ({ toolName: tc.toolName })) ?? [],
      ) ?? [],
  });

  const scrapedPaper = result.experimental_output;
  scrapedPaper.authors = await Promise.all(
    scrapedPaper.authors.map(async (author) => {
      let linkedInUrl = author.linkedInUrl
        ? normalizeLinkedInUrl(author.linkedInUrl)
        : null;
      let googleScholarUrl = author.googleScholarUrl
        ? normalizeGoogleScholarUrl(author.googleScholarUrl)
        : null;

      if (!linkedInUrl) {
        const linkedInSearchResult = await getLinkedInUrl({
          name: author.name,
          institution: author.institution,
        });
        linkedInUrl = linkedInSearchResult.url;
        cost += linkedInSearchResult.cost;
        sources.add(`search: ${linkedInSearchResult.query}`);
      }
      if (!googleScholarUrl) {
        const googleScholarSearchResult = await getGoogleScholarUrl({
          name: author.name,
          institution: author.institution,
        });
        googleScholarUrl = googleScholarSearchResult.url;
        cost += googleScholarSearchResult.cost;
        sources.add(`search: ${googleScholarSearchResult.query}`);
      }
      return {
        ...author,
        linkedInUrl,
        googleScholarUrl,
        homepageUrl: author.homepageUrl
          ? normalizeUrl(author.homepageUrl)
          : null,
      };
    }),
  );

  const fullResult = {
    scrapedPaper,
    sources: Array.from(sources),
    cost,
  };

  logger.info(
    `Full paper agent run for ${url}: ${JSON.stringify(fullResult, null, 2)}`,
  );

  return fullResult;
}
