import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import z from 'zod';
import estimateAgentRunCost, { type Model, ToolCosts } from '../estimateCost';
import googleSearch from '../googleSearch';
import { getLogger } from '../logger';
import { normalizeLinkedInUrl } from './utils';

type GetLinkedInUrlArgs = {
  name: string;
  institution: string;
};

const logger = getLogger('getLinkedInUrl');

const GetLinkedInUrlModel: Model = 'gpt-5-mini';

export default async function getLinkedInUrl({
  name,
  institution,
}: GetLinkedInUrlArgs) {
  const query = `site:linkedin.com/in ${name} ${institution}`;
  const searchResults = await googleSearch({ query });

  logger.info(
    `Search results for ${query}: ${JSON.stringify(searchResults, null, 2)}`,
  );

  const llmResult = await generateObject({
    model: openai(GetLinkedInUrlModel),
    prompt: [
      {
        role: 'system',
        content: `
          You are an expert in finding LinkedIn profiles for research paper authors.
          
          You will be given a JSON object with the following properties:
          - \`name\`: The name of the author
          - \`institution\`: The institution/company the author is affiliated with
          - \`searchResults\`: the google search results after searching -> ${query}
          
          Instructions:
          - Find the LinkedIn profile URL for the author if it exists.
          - Use the author name and the affiliated institution to find the profile.
          - If there are multiple profiles that match the name, use the affiliated institution to disambiguate and pick the best match.
          - If there are no good matches, return null. It's best to return null if there are no good matches.
          - The name may not match exactly with the name in the LinkedIn profile because of abbreviations or middle names. If the name could be a match because of abbreviations or middle name differences, the institution must absolutely match for the profile to be considered.
        `,
      },
      {
        role: 'user',
        content: JSON.stringify({ searchResults, name, institution }, null, 2),
      },
    ],
    schema: z.object({
      linkedInUrl: z
        .string()
        .nullable()
        .describe('The URL of the LinkedIn profile'),
      explanation: z
        .string()
        .describe('Very brief explanation of your choice. Use bullet points.'),
    }),
  });

  logger.info(
    `LinkedIn URL for ${name} ${institution}: ${JSON.stringify(llmResult.object, null, 2)}`,
  );

  const llmCost = estimateAgentRunCost({
    usage: llmResult.usage,
    model: GetLinkedInUrlModel,
  });

  return {
    url: llmResult.object.linkedInUrl
      ? normalizeLinkedInUrl(llmResult.object.linkedInUrl)
      : null,
    query,
    cost: ToolCosts.googleSearch + llmCost,
  };
}
