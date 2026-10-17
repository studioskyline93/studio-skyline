/* Studio Skyline - visitor stats card for admin pages.
   Usage: put <div id="visitorStats"></div> on the page, include this file after shared.js,
   and call loadVisitorStats() once the admin is logged in (e.g. inside onAdminReady). */
(function () {
  var css = '' +
    '.vs-head{display:flex;align-items:center;gap:12px;flex-wrap:wrap}' +
    '.vs-title{font-size:16px;font-weight:600}' +
    '.vs-toggle{display:flex;align-items:flex-start;gap:8px;cursor:pointer;user-select:none;flex:1;min-width:0}' +
    '.vs-caret{display:inline-block;font-size:12px;margin-top:5px;color:var(--zinc-500,#71717a);transition:transform .15s}' +
    '.vs-collapsed .vs-caret{transform:rotate(-90deg)}' +
    '.vs-sub{font-size:12px;color:var(--zinc-500,#71717a)}' +
    '.vs-refresh{margin-left:auto;font-size:13px;background:none;border:none;text-decoration:underline;cursor:pointer;color:inherit}' +
    '.vs-tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-top:16px}' +
    '.vs-tile{border:1px solid rgba(228,228,231,.7);border-radius:12px;padding:12px 14px;background:#fff}' +
    '.vs-num{font-size:26px;font-weight:600;letter-spacing:-.02em;color:#800D1B;line-height:1.1}' +
    '.vs-lbl{font-size:12px;color:var(--zinc-500,#71717a);margin-top:4px}' +
    '.vs-chart{display:flex;align-items:flex-end;gap:3px;height:96px;margin-top:20px}' +
    '.vs-bar{flex:1;min-width:0;background:#800D1B;border-radius:3px 3px 0 0;opacity:.85}' +
    '.vs-bar.zero{background:rgba(228,228,231,.9);opacity:1}' +
    '.vs-bar:hover{opacity:1}' +
    '.vs-axis{display:flex;justify-content:space-between;font-size:11px;color:var(--zinc-500,#71717a);margin-top:4px}' +
    '.vs-cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;margin-top:20px}' +
    '.vs-cols h4{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:var(--zinc-500,#71717a);margin-bottom:6px}' +
    '.vs-row{display:flex;justify-content:space-between;gap:12px;font-size:14px;padding:5px 0;border-bottom:1px solid rgba(228,228,231,.6)}' +
    '.vs-row span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.vs-msg{font-size:14px;color:var(--zinc-500,#71717a);margin-top:12px}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function n(v) { return Number(v || 0).toLocaleString('en-IN'); }
  function dayLabel(iso) {
    var p = String(iso).split('-'); if (p.length < 3) return iso;
    return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  var COLLAPSE_KEY = 'ss_vs_collapsed';
  function isCollapsed() { try { return localStorage.getItem(COLLAPSE_KEY) === '1'; } catch (e) { return false; } }

  window.toggleVisitorStats = function () {
    var el = document.getElementById('visitorStats');
    if (!el) return;
    var now = !el.classList.contains('vs-collapsed');
    el.classList.toggle('vs-collapsed', now);
    var body = el.querySelector('.vs-body');
    if (body) body.style.display = now ? 'none' : '';
    try { localStorage.setItem(COLLAPSE_KEY, now ? '1' : '0'); } catch (e) {}
  };

  function shell(inner) {
    var el = document.getElementById('visitorStats');
    if (el) el.classList.toggle('vs-collapsed', isCollapsed());
    return '<div class="vs-head">' +
      '<div class="vs-toggle" onclick="toggleVisitorStats()" title="Click to show / hide">' +
        '<span class="vs-caret">&#9660;</span>' +
        '<div><div class="vs-title">Website visitors</div></div>' +
      '</div>' +
      '<button class="vs-refresh" onclick="loadVisitorStats()">Refresh</button></div>' +
      '<div class="vs-body"' + (isCollapsed() ? ' style="display:none"' : '') + '>' +
      '<div class="vs-sub" style="margin-top:2px">One visit = one browser session. Your own visits from this browser are not counted.</div>' +
      inner + '</div>';
  }

  window.loadVisitorStats = async function () {
    var el = document.getElementById('visitorStats');
    if (!el) return;
    // mark this browser as the owner so its visits to the public site are skipped
    try { localStorage.setItem('ss_notrack', '1'); } catch (e) {}
    el.innerHTML = shell('<div class="vs-msg">Loading...</div>');
    try {
      var sb = (typeof getSupabase === 'function') ? getSupabase() : null;
      if (!sb) throw new Error('Supabase is not configured.');
      var res = await sb.rpc('get_visit_stats');
      if (res.error) throw res.error;
      var d = res.data || {};
      var daily = d.daily || [];
      var max = Math.max.apply(null, daily.map(function (x) { return x.visits; }).concat([1]));

      var tiles = [['Total visits', d.total_visits], ['Unique visitors', d.unique_visitors],
                   ['Today', d.today], ['Last 7 days', d.last_7], ['Last 30 days', d.last_30]]
        .map(function (t) { return '<div class="vs-tile"><div class="vs-num">' + n(t[1]) + '</div><div class="vs-lbl">' + t[0] + '</div></div>'; }).join('');

      var bars = daily.map(function (x) {
        var h = x.visits ? Math.max(4, Math.round(x.visits / max * 96)) : 2;
        return '<div class="vs-bar' + (x.visits ? '' : ' zero') + '" style="height:' + h + 'px" title="' +
          esc(dayLabel(x.day)) + ': ' + x.visits + ' visit' + (x.visits === 1 ? '' : 's') + ', ' + x.visitors + ' unique"></div>';
      }).join('');

      function rows(list, key) {
        if (!list || !list.length) return '<div class="vs-msg" style="margin-top:4px">No data yet.</div>';
        return list.map(function (r) { return '<div class="vs-row"><span>' + esc(r[key]) + '</span><span>' + n(r.visits) + '</span></div>'; }).join('');
      }

      var since = d.since ? '<div class="vs-sub" style="margin-top:12px">Counting since ' +
        new Date(d.since).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + '</div>' : '';

      el.innerHTML = shell(
        '<div class="vs-tiles">' + tiles + '</div>' +
        (daily.length ? '<div class="vs-chart">' + bars + '</div><div class="vs-axis"><span>' +
          esc(dayLabel(daily[0].day)) + '</span><span>Visits per day, last 30 days</span><span>' +
          esc(dayLabel(daily[daily.length - 1].day)) + '</span></div>' : '') +
        '<div class="vs-cols"><div><h4>Where visitors come from</h4>' + rows(d.sources, 'source') +
        '</div><div><h4>Devices</h4>' + rows(d.devices, 'device') + '</div></div>' + since);
    } catch (e) {
      var m = (e && e.message) ? e.message : String(e);
      el.innerHTML = shell('<div class="vs-msg">Could not load visitor stats (' + esc(m) +
        '). Make sure visitor-tracking.sql has been run in Supabase, with your admin email filled in, and that you are logged in.</div>');
    }
  };
})();
