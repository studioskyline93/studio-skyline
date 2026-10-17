/* Studio Skyline - anonymous visit counter.
   Add <script src="visit-tracker.js"></script> AFTER shared.js on any public page.
   - Counts one visit per browser session (refreshing / browsing around does not re-count).
   - Stores only a random anonymous id, the landing page, the referring site and mobile/desktop.
   - Skips bots and the site owner's own browser (the admin pages set the "ss_notrack" flag). */
(function () {
  try {
    if (localStorage.getItem('ss_notrack') === '1') return;
    if (navigator.webdriver || /bot|crawl|spider|headless|lighthouse|preview|facebookexternalhit/i.test(navigator.userAgent)) return;
    if (sessionStorage.getItem('ss_counted')) return;
    if (typeof getSupabase !== 'function') return;
    var sb = getSupabase();
    if (!sb) return;

    var vid = localStorage.getItem('ss_vid');
    if (!vid) {
      vid = (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
          : 'v' + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
      localStorage.setItem('ss_vid', vid);
    }

    var ref = '';
    try {
      if (document.referrer) {
        var h = new URL(document.referrer).hostname.replace(/^www\./, '');
        if (h && h !== location.hostname.replace(/^www\./, '')) ref = h;
      }
    } catch (e) {}

    sessionStorage.setItem('ss_counted', '1');
    Promise.resolve(
      sb.from('site_visits').insert({
        visitor_id: vid,
        page: (location.pathname || '/').slice(0, 200),
        referrer: ref ? ref.slice(0, 200) : null,
        device: /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
      })
    ).catch(function () {});
  } catch (e) { /* tracking must never break the site */ }
})();
