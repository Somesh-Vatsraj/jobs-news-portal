import { esc } from '../utils.js';
import { header } from '../components/header.js';
import { footer } from '../components/footer.js';
import { buildMeta } from '../seo.js';

export function layout({
  settings,
  title,
  description,
  canonical,
  image,
  type = 'website',
  jsonLd = '',
  active = '',
  body = '',
  noindex = false,
  bodyClass = ''
}) {
  const siteName = settings.site_name || 'Jobs & News India';
  const fullTitle = title ? `${title} | ${siteName}` : (settings.default_seo_title || siteName);
  const desc = description || settings.default_seo_description || '';
  const meta = buildMeta({
    title: fullTitle,
    description: desc,
    canonical,
    image,
    type,
    siteName
  });
  const ga = settings.google_analytics_id;
  const adsEnabled = String(settings.adsense_enabled || 'false') === 'true' && settings.adsense_publisher_id;
  const adsScript = adsEnabled
    ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${esc(settings.adsense_publisher_id)}" crossorigin="anonymous"></script>`
    : '';
  const gaScript = ga
    ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(ga)}"></script>
       <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${esc(ga)}');</script>`
    : '';
  const robots = noindex ? `<meta name="robots" content="noindex, nofollow">` : '';
  const bodyAttr = bodyClass ? ` class="${esc(bodyClass)}"` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#7c3aed">
${meta}
${robots}
${jsonLd}
<link rel="icon" href="${esc(settings.favicon_url || '/favicon.ico')}">
<link rel="stylesheet" href="/css/style.css">
${adsScript}
${gaScript}
</head>
<body${bodyAttr}>
<a class="skip-link" href="#main">Skip to content</a>
${header({ settings, active })}
<main id="main">${body}</main>
${footer({ settings })}
<script src="/js/app.js" defer></script>
<script src="/js/share.js" defer></script>
<script src="/js/search.js" defer></script>
</body>
</html>`;
}
