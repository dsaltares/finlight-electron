import type { GetWebContentStrategy } from './types';

export const getWebContentViaFetch: GetWebContentStrategy = async (url) => {
  const response = await fetch(url);
  const headerMap: Record<string, string | string[]> = {};
  response.headers.forEach((value, key) => {
    headerMap[key] = value;
  });
  return {
    html: await response.text(),
    status: response.status,
    headers: headerMap,
  };
};
