export type AiResult = {
  short: string;
  long: string;
  bullets: string[];
  seoTitle: string;
  metaDescription: string;
  keywords: string[];
  instagram: string;
  ads: string[];
};

export type GenerateInput = {
  productName: string;
  features: string;
  tone: string;
  audience: string;
  language: string;
  projectId: string | null;
};
