/** Only non-secret navigation context may cross the identity-provider redirect. */
export function safeAuthReturn(value: unknown): string {
  if (typeof value !== 'string' || value.length > 1600 || !value.startsWith('/') || /[\\\u0000-\u0020]/.test(value) || value.startsWith('//')) return '/trips';
  let url: URL; try { url = new URL(value, 'https://daroub.local'); } catch { return '/trips'; }
  if (url.origin !== 'https://daroub.local') return '/trips';
  const paths = ['/', '/trips', '/globe', '/regions', '/team', '/inventory', '/offline', '/assistant', '/health', '/sources'];
  if (!paths.includes(url.pathname)) return '/trips';
  const keys = url.pathname === '/team' ? ['room'] : ['/trips','/globe','/regions','/assistant'].includes(url.pathname) ? ['trip','destination','terrainId','terrain','lat','lon','group','activity'] : [];
  const query = new URLSearchParams();
  for (const key of keys) { const v = url.searchParams.get(key); if (v && v.length <= 100 && !/[\u0000-\u001f]/.test(v)) query.set(key,v); }
  return url.pathname + (query.size ? '?' + query.toString() : '');
}
export function authEntryHref(returnTo: string, mode: 'login' | 'register' = 'login') {
  return '/' + mode + '?return_to=' + encodeURIComponent(safeAuthReturn(returnTo));
}
