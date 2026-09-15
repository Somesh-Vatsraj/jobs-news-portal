import { esc } from '../utils.js';

export function ShareButtons({ url, title }) {
  const eurl = encodeURIComponent(url);
  const etitle = encodeURIComponent(title);
  return `
<div class="share">
  <span class="share-label">Share:</span>
  <a class="share-btn wa" target="_blank" rel="noopener noreferrer" href="https://api.whatsapp.com/send?text=${etitle}%20${eurl}" aria-label="Share on WhatsApp">WhatsApp</a>
  <a class="share-btn fb" target="_blank" rel="noopener noreferrer" href="https://www.facebook.com/sharer/sharer.php?u=${eurl}" aria-label="Share on Facebook">Facebook</a>
  <a class="share-btn tw" target="_blank" rel="noopener noreferrer" href="https://twitter.com/intent/tweet?url=${eurl}&text=${etitle}" aria-label="Share on X">X</a>
  <a class="share-btn tg" target="_blank" rel="noopener noreferrer" href="https://t.me/share/url?url=${eurl}&text=${etitle}" aria-label="Share on Telegram">Telegram</a>
  <button class="share-btn copy" type="button" data-copy="${esc(url)}" aria-label="Copy link">Copy Link</button>
  <button class="share-btn native" type="button" data-native-share data-share-url="${esc(url)}" data-share-title="${esc(title)}" aria-label="Share">More…</button>
</div>`;
}
