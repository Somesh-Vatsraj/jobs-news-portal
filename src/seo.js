import { esc } from './utils.js';

export function buildMeta({ title, description, canonical, image, type = 'website', siteName }) {
  const t = esc(title || siteName || '');
  const d = esc(description || '');
  const c = esc(canonical || '');
  const i = esc(image || '');
  return `
<title>${t}</title>
<meta name="description" content="${d}">
<link rel="canonical" href="${c}">
<meta property="og:type" content="${esc(type)}">
<meta property="og:title" content="${t}">
<meta property="og:description" content="${d}">
<meta property="og:url" content="${c}">
${i ? `<meta property="og:image" content="${i}">` : ''}
<meta property="og:site_name" content="${esc(siteName || '')}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${t}">
<meta name="twitter:description" content="${d}">
${i ? `<meta name="twitter:image" content="${i}">` : ''}
<meta name="robots" content="index, follow, max-image-preview:large">
`;
}

export function jobPostingJsonLd(job, baseUrl) {
  const data = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: job.title,
    description: job.content || job.requirements || '',
    datePosted: job.published_at || job.created_at,
    employmentType: (job.job_type || 'FULL_TIME').toUpperCase().replace(/\s+/g, '_'),
    hiringOrganization: { '@type': 'Organization', name: job.company },
    jobLocation: {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressLocality: job.location || 'India', addressCountry: 'IN' }
    },
    url: `${baseUrl}/jobs/${job.slug}`
  };
  if (job.salary) {
    data.baseSalary = { '@type': 'MonetaryAmount', currency: 'INR', value: { '@type': 'QuantitativeValue', value: job.salary } };
  }
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

export function articleJsonLd(article, baseUrl) {
  const data = {
    '@context': 'https://schema.org/',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt || article.seo_description || '',
    datePublished: article.published_at || article.created_at,
    dateModified: article.updated_at || article.published_at || article.created_at,
    author: { '@type': 'Person', name: article.author || 'Editorial Team' },
    publisher: { '@type': 'Organization', name: 'Jobs & News India' },
    mainEntityOfPage: `${baseUrl}/news/${article.slug}`
  };
  if (article.featured_image) data.image = [article.featured_image];
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

export function breadcrumbJsonLd(items) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url
    }))
  };
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}
