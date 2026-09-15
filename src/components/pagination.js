import { esc } from '../utils.js';

export function Pagination({ page, totalPages, baseUrl }) {
  if (totalPages <= 1) return '';
  const url = (p) => {
    const u = new URL(baseUrl, 'http://x');
    u.searchParams.set('page', String(p));
    return u.pathname + (u.search ? u.search : '');
  };
  const pages = [];
  const push = (p, label, cls = '') => pages.push(
    `<a class="page-link ${cls}" href="${esc(url(p))}">${esc(label)}</a>`
  );
  if (page > 1) push(page - 1, '‹ Prev');
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  if (start > 1) push(1, '1');
  if (start > 2) pages.push('<span class="page-ellipsis">…</span>');
  for (let i = start; i <= end; i++) {
    if (i === page) pages.push(`<span class="page-link current">${i}</span>`);
    else push(i, String(i));
  }
  if (end < totalPages - 1) pages.push('<span class="page-ellipsis">…</span>');
  if (end < totalPages) push(totalPages, String(totalPages));
  if (page < totalPages) push(page + 1, 'Next ›');
  return `<nav class="pagination" aria-label="Pagination">${pages.join('')}</nav>`;
}
