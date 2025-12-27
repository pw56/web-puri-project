export function resolveBaseUrl(path: string): URL {
  return new URL(path, import.meta.env.BASE_URL);
}