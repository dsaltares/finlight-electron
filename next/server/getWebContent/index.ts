import retry from 'async-retry';
import { getLogger } from '../logger';
import getLinks from './getLinks';
import getMarkdown from './getMarkdown';
import { getWebContentViaFetch } from './getWebContentViaFetch';
import getWebContentViaScrapingBee from './getWebContentViaScrapingBee';

const logger = getLogger('getWebContent');

const Strategies = [
  {
    name: 'fetch',
    fn: getWebContentViaFetch,
  },
  {
    name: 'scrapingbee',
    fn: getWebContentViaScrapingBee({ premiumProxy: false, renderJs: false }),
  },
  {
    name: 'scrapingbee-js',
    fn: getWebContentViaScrapingBee({ premiumProxy: false, renderJs: true }),
  },
  {
    name: 'scrapingbee-premium',
    fn: getWebContentViaScrapingBee({ premiumProxy: true, renderJs: false }),
  },
  {
    name: 'scrapingbee-premium-js',
    fn: getWebContentViaScrapingBee({ premiumProxy: true, renderJs: true }),
  },
];

export default async function getWebContent(url: string) {
  for (const strategy of Strategies) {
    try {
      logger.info(
        `Getting web content for ${url} using strategy: ${strategy.name}`,
      );
      const response = await retry(
        async (bail) => {
          try {
            const tryResponse = await strategy.fn(url);

            if (isSuccess(tryResponse.status)) {
              if (containsRateLimitContent(tryResponse.html)) {
                throw new Error('Error: 429');
              }

              return tryResponse;
            }
            throw new Error(`Error: ${tryResponse.status}`);
          } catch (error) {
            if (isRateLimitError(error)) {
              logger.warn(
                `Rate limit detected for ${url} using strategy: ${strategy.name}, retrying...`,
              );
              throw error;
            }
            bail(error as Error);
            return null as never;
          }
        },
        {
          onRetry: (_error, attempt) => {
            logger.info(
              `Retry attempt ${attempt} for ${url} using strategy: ${strategy.name}`,
            );
          },
        },
      );
      if (isSuccess(response.status)) {
        const contentType = response.headers['content-type'];
        const mimeType =
          typeof contentType === 'string'
            ? contentType.split(';')[0].trim()
            : Array.isArray(contentType)
              ? contentType[0].split(';')[0].trim()
              : undefined;

        // Deal with JSON responses (e.g. API responses)
        if (mimeType === 'application/json') {
          try {
            logger.info(`Successfully parsed JSON response for ${url}`);
            const jsonData = JSON.parse(response.html);
            return {
              ...response,
              markdown: `\`\`\`json\n${JSON.stringify(jsonData, null, 2)}\n\`\`\``,
              links: [],
              mimeType,
            };
          } catch (error) {
            logger.warn(
              `Failed to parse JSON response for ${url}: ${error} - ${response.html}`,
            );
          }
        }

        // Deal with client-side rendered pages
        if (hasContent(response.html)) {
          logger.info(
            `Successfully got web content for ${url} using strategy: ${strategy.name}`,
          );

          return {
            ...response,
            markdown: getMarkdown({ url, html: response.html }),
            links: getLinks({ url, html: response.html }),
            mimeType,
          };
        }
      }
      if (!shouldFallback(response.status)) {
        logger.error(
          `Strategy: ${strategy.name} failed for ${url} with status: ${response.status}`,
        );
        return response;
      }
    } catch (error) {
      logger.error(
        `Error using strategy: ${strategy.name} for ${url}: ${error}`,
      );
    }
  }
  logger.error(`Failed to get web content for ${url}`);
  return null;
}

function isSuccess(status: number) {
  return status >= 200 && status < 300;
}

function shouldFallback(status: number) {
  const nonFallbackStatuses = new Set([500, 404]);
  return !nonFallbackStatuses.has(status);
}

function hasContent(html: string) {
  return html.trim().length > 100;
}

function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('rate limit') ||
      message.includes('too many requests') ||
      message.includes('429')
    );
  }
  return false;
}

function containsRateLimitContent(html: string): boolean {
  const lowerHtml = html.toLowerCase();

  // This works for openreview.net, but may need a more sophisticated approach for other sites.
  const rateLimitPatterns = ['too many requests'];

  return rateLimitPatterns.some((pattern) => lowerHtml.includes(pattern));
}
