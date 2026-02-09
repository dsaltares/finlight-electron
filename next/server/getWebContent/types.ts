export type GetWebContentResponse = {
  html: string;
  status: number;
  headers: Record<string, string | string[]>;
  markdown?: string;
  links?: string[];
  mimeType?: string;
};

export type GetWebContentStrategy = (
  url: string,
) => Promise<GetWebContentResponse>;
