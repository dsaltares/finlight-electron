export default function makeAbsoluteUrl(targetUrl: string, baseUrl: string) {
  try {
    return new URL(targetUrl, baseUrl).href;
  } catch {
    return targetUrl;
  }
}
