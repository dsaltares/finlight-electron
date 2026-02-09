import TurndownService from 'turndown';
import makeAbsoluteUrl from './makeAbsoluteUrl';

type GetMarkdownArgs = {
  url: string;
  html: string;
};

export default function getMarkdown({ url, html }: GetMarkdownArgs) {
  const turndown = new TurndownService();

  // Automatically drop noisy elements via Turndown's removal API
  turndown.remove([
    'script',
    'style',
    'noscript',
    'template',
    'nav',
    'footer',
    'header',
    'link',
  ]);

  // Strip common Next.js Flight text fragments that can leak outside elements
  const cleanedHtml = html
    .replace(/self\.__next_f\s*=\s*self\.__next_f\s*\|\|\s*\[\];?/g, '')
    .replace(/self\.__next_f\.push\([\s\S]*?\);?/g, '');

  turndown.addRule('absoluteLinks', {
    filter: 'a',
    replacement: (content, node) => {
      const href = (node as unknown as HTMLAnchorElement).getAttribute('href');
      if (!href) return content;
      const absolute = makeAbsoluteUrl(href, url);
      return `[${content}](${absolute})`;
    },
  });

  return turndown.turndown(cleanedHtml);
}
