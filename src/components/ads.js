import { esc } from '../utils.js';

// AdSlot component. Renders a labelled placeholder unless AdSense is
// configured AND enabled by the admin. Never injects fake ad code.
export function AdSlot({ position = 'in-content', settings = {} }) {
  const enabled = String(settings.adsense_enabled || 'false') === 'true';
  const pid = settings.adsense_publisher_id || '';
  if (enabled && pid) {
    return `
<div class="ad-slot ad-${esc(position)}" data-ad-position="${esc(position)}">
  <!-- AdSense unit for position "${esc(position)}" is loaded by /js/app.js once
       the publisher has created ad units in the AdSense dashboard. -->
  <ins class="adsbygoogle" style="display:block"
       data-ad-client="${esc(pid)}"
       data-ad-slot=""
       data-ad-format="auto"
       data-full-width-responsive="true"></ins>
</div>`;
  }
  return `
<div class="ad-slot ad-placeholder ad-${esc(position)}" aria-label="Advertisement placeholder">
  <span>Ad space — ${esc(position)}</span>
</div>`;
}
