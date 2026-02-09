import { load } from 'cheerio';
import type { Element } from 'domhandler';
import makeAbsoluteUrl from './makeAbsoluteUrl';

type GetLinksArgs = {
  url: string;
  html: string;
};

export default function getLinks({ url, html }: GetLinksArgs) {
  const $ = load(html);
  return $('body a')
    .map((_: number, el: Element) => $(el).attr('href'))
    .get()
    .filter(
      (href: string | undefined): href is string =>
        typeof href === 'string' && href.length > 0,
    )
    .map((href: string) => makeAbsoluteUrl(href, url));
}
