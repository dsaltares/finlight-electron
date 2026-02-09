import { openai } from '@ai-sdk/openai';
import { Experimental_Agent as Agent, Output, stepCountIs, tool } from 'ai';
import { z } from 'zod';
import getWebContent from '../getWebContent';
import { getLogger } from '../logger';
import { ScrapedPaperSchema } from '../trpc/procedures/types';

export const PaperAgentModels = ['gpt-5-mini', 'gpt-5'] as const;

const logger = getLogger('paperAgent');

const paperAgents = PaperAgentModels.map((model) => ({
  model,
  agent: new Agent({
    model: openai(model),
    system: `
      You are an assistant that extracts information from academic paper websites.
      
      GOAL:
      You will receive a URL for the paper and you will need to extract the following information:
      - The title of the paper
      - The summary of the paper
      - The venue of the paper
      - The year of the paper
      - The authors of the paper
      - For each author:
        - The name of the author
        - The institution/company the author is affiliated with.
          * If there are multiple ones, favour the corporate ones. Pick the most representative one.
          * Output ONLY the institution name, no titles, etc.
        - The URL of the author's LinkedIn profile
        - The URL of the author's Google Scholar profile
        - The URL of the author's homepage/personal website

      STRATEGY:
      1. Get the markdown content from the URL
      2. Extract basic information from the markdown content
      3. For each author (you can run the tools in parallel):
        a. Get the markdown content for each author's profile.
        b. Get the author's homepage, website, LinkedIn, and Google Scholar URLs from their profile page if available.
      4. Do not try to fetch the contents of the authors' homepageUrl to gather more information.
    `,
    tools: {
      getMarkdownFromUrl: tool({
        description: 'Get markdown content from a URL',
        inputSchema: z.object({
          url: z.url().describe('The URL to get the markdown content from'),
        }),
        execute: async ({ url }) => {
          const result = await getWebContent(url);
          if (!result) {
            return `Failed to get markdown content from URL: ${url}`;
          }
          if (result.mimeType === 'application/pdf') {
            const message = `The URL ${url} is a PDF file. Cannot get markdown content from PDF files.`;
            logger.warn(message);
            return message;
          }
          return result.markdown;
        },
      }),
    },
    stopWhen: stepCountIs(50),
    experimental_output: Output.object({
      schema: ScrapedPaperSchema,
    }),
  }),
}));

export default paperAgents;
