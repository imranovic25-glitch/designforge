const SITE_URL = "https://designforge360.in";

export const PUBLIC_ASSET_VERSION = __BUILD_ID__;

export function withAssetVersion(path: string) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}v=${PUBLIC_ASSET_VERSION}`;
}

export function absolutePublicAssetUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${withAssetVersion(normalizedPath)}`;
}