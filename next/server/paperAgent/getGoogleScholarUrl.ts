import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import z from 'zod';
import estimateAgentRunCost, { type Model, ToolCosts } from '../estimateCost';
import googleSearch from '../googleSearch';
import { normalizeGoogleScholarUrl } from './utils';

type GetGoogleScholarUrlArgs = {
  name: string;
  institution: string;
};

const GetGoogleScholarUrlModel: Model = 'gpt-5-mini';

export default async function getGoogleScholarUrl({
  name,
  institution,
}: GetGoogleScholarUrlArgs) {
  const query = `site:scholar.google.com ${name} ${institution}`;
  const searchResults = await googleSearch({ query });
  const llmResult = await generateObject({
    model: openai(GetGoogleScholarUrlModel),
    prompt: [
      {
        role: 'system',
        content: `
          You are an expert in finding Google Scholar profiles for research paper authors.
          
          You will be given a JSON object with the following properties:
          - \`name\`: The name of the author
          - \`institution\`: The institution/company the author is affiliated with
          - \`searchResults\`: the google search results after searching -> ${query}
          
          Instructions:
          - Find the Google Scholar profile URL for the author if it exists.
          - Use the author name and the affiliated institution to find the profile.
          - If there are multiple profiles that match the name, use the affiliated institution to disambiguate and pick the best match.
          - If there are no good matches, return null. It's best to return null if there are no good matches.
        `,
      },
      {
        role: 'user',
        content: JSON.stringify({ searchResults, name, institution }, null, 2),
      },
    ],
    schema: z.object({
      googleScholarUrl: z
        .string()
        .nullable()
        .describe('The URL of the Google Scholar profile'),
    }),
  });

  const llmCost = estimateAgentRunCost({
    usage: llmResult.usage,
    model: GetGoogleScholarUrlModel,
  });

  return {
    url: llmResult.object.googleScholarUrl
      ? normalizeGoogleScholarUrl(llmResult.object.googleScholarUrl)
      : null,
    query,
    cost: ToolCosts.googleSearch + llmCost,
  };
}
