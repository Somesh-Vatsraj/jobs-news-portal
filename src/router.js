export function matchRoute(pattern, pathname) {
  const pp = pattern.split('/').filter(Boolean);
  const pa = pathname.split('/').filter(Boolean);
  if (pp.length !== pa.length) return null;
  const params = {};
  for (let i = 0; i < pp.length; i++) {
    if (pp[i].startsWith(':')) params[pp[i].slice(1)] = decodeURIComponent(pa[i]);
    else if (pp[i] !== pa[i]) return null;
  }
  return params;
}

export function pathMatches(pathname, pattern) {
  return matchRoute(pattern, pathname) !== null;
}
