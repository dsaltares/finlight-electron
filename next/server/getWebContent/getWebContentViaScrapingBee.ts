import pLimit from 'p-limit';
import type { GetWebContentStrategy } from './types';

// ScrapingBee API has a rate limit of 5 concurrent requests.
// We set the limit to 2 to allow local + remote.
const scrapingBeeLimit = pLimit(2);

type GetWebScrapingBeeOptions = {
  premiumProxy: boolean;
  renderJs: boolean;
};

const getWebContentViaScrapingBee =
  ({
    premiumProxy,
    renderJs,
  }: GetWebScrapingBeeOptions): GetWebContentStrategy =>
  (url) =>
    scrapingBeeLimit(async () => {
      const scrapingBeeApiUrl = new URL('https://app.scrapingbee.com/api/v1');
      scrapingBeeApiUrl.searchParams.set(
        'api_key',
        process.env.SCRAPING_BEE_API_KEY as string,
      );
      scrapingBeeApiUrl.searchParams.set('url', url);
      scrapingBeeApiUrl.searchParams.set('forward_headers', 'true');
      if (premiumProxy) {
        scrapingBeeApiUrl.searchParams.set('premium_proxy', 'true');
      }
      if (renderJs) {
        scrapingBeeApiUrl.searchParams.set('render_js', 'true');
      }
      const response = await fetch(scrapingBeeApiUrl.toString());
      const headerMap: Record<string, string | string[]> = {};
      response.headers.forEach((value, key) => {
        headerMap[key] = value;
      });

      const targetStatusHeader = response.headers.get(
        'x-scrapingbee-status-code',
      );
      const status = targetStatusHeader
        ? Number(targetStatusHeader)
        : response.status;

      return {
        html: await response.text(),
        status,
        headers: headerMap,
      };
    });

export default getWebContentViaScrapingBee;
