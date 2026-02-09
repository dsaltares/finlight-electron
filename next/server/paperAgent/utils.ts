export function normalizeLinkedInUrl(url: string | null): string | null {
  if (!url) {
    return null;
  }

  const cleanUrl = url.startsWith('@') ? url.slice(1) : url;

  const match = cleanUrl.match(/\/in\/([^/?#]+)/);
  if (!match) return null;

  const slug = match[1];
  return `https://linkedin.com/in/${slug}`;
}

export function normalizeGoogleScholarUrl(url: string | null): string | null {
  if (!url) {
    return null;
  }

  try {
    const parsedUrl = new URL(url);

    if (!parsedUrl.hostname.startsWith('scholar.google.')) {
      return null;
    }

    parsedUrl.hostname = 'scholar.google.com';

    return parsedUrl.toString();
  } catch {
    return null;
  }
}

export function normalizeUrl(url: string | null): string | null {
  if (!url) {
    return null;
  }

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.toString();
  } catch {
    return null;
  }
}
