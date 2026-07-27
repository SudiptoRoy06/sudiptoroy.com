const backendOrigin = (import.meta.env.VITE_BACKEND_ORIGIN || '').replace(/\/+$/, '');

export function apiUrl(path) {
  return `${backendOrigin}${path.startsWith('/') ? path : `/${path}`}`;
}

export function assetUrl(path) {
  return typeof path === 'string' && path.startsWith('/uploads/')
    ? apiUrl(path)
    : path;
}
