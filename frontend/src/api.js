const backendOrigin = (globalThis.__PRERENDER_BACKEND_ORIGIN__ || import.meta.env.VITE_BACKEND_ORIGIN || '').replace(/\/+$/, '');

export function apiUrl(path) {
  return `${backendOrigin}${path.startsWith('/') ? path : `/${path}`}`;
}

export function assetUrl(path) {
  if (path && typeof path === 'object') path = path.url;
  return typeof path === 'string' && path.startsWith('/uploads/')
    ? apiUrl(path)
    : path;
}

export function assetSrcSet(media) {
  return media && typeof media === 'object' && Array.isArray(media.srcSet)
    ? media.srcSet.map(item => `${assetUrl(item.url)} ${item.width}w`).join(', ')
    : undefined;
}
