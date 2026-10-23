// ══════════════════════════════════════════════════════════════════════════
// MODE CHOICE  (mode-choice.js)
// ══════════════════════════════════════════════════════════════════════════
// First-visit "How would you like to play?" screen, shown just before a song opens.
//   • Own Pace  → opens Perform mode (notes wait for you; engine "hold" clock)
//   • Practice  → just closes the screen (the normal Practice page)
// Shown once per browser. To show it before EVERY song instead, set
//   SHOW_EVERY_SONG = true   (or remove the SEEN_KEY check below).
// Loaded by engine.js after Perform initialises. Never throws into the page.
// ══════════════════════════════════════════════════════════════════════════

const SEEN_KEY = 'pj_mode_choice_seen';
const SHOW_EVERY_SONG = false;

export function initModeChoice(E) {
  try {
    if (window.__modeChoiceInit) return;
    window.__modeChoiceInit = true;

    const store = {
      get() { try { return localStorage.getItem(SEEN_KEY) === '1'; } catch (_) { return false; } },
      set() { try { localStorage.setItem(SEEN_KEY, '1'); } catch (_) {} },
    };
    if (!SHOW_EVERY_SONG && store.get()) return;

    const accent = (window.ENGINE_THEME && window.ENGINE_THEME.trebleNote) || '#3B82F6';

    function build() {
      if (document.getElementById('mcRoot')) return;

      const css = document.createElement('style');
      css.textContent = `
#mcRoot{position:fixed;inset:0;z-index:100002;display:flex;align-items:center;justify-content:center;padding:16px;
  background:rgba(15,17,23,.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);
  font-family:Inter,system-ui,sans-serif;opacity:0;transition:opacity .25s ease}
#mcRoot.mc-show{opacity:1}
#mcCard{background:#fff;color:#1a1a24;border-radius:24px;padding:28px 24px 22px;width:min(560px,100%);max-height:94vh;overflow:auto;
  box-shadow:0 24px 70px rgba(0,0,0,.35);text-align:center}
body.dark-mode #mcCard{background:#181c25;color:#f1f1f6}
#mcCard h2{margin:0 0 6px;font-size:26px;font-weight:800;letter-spacing:-.01em}
#mcCard .mc-sub{margin:0 0 20px;font-size:15px;opacity:.7}
.mc-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.mc-opt{all:unset;box-sizing:border-box;cursor:pointer;text-align:left;display:flex;flex-direction:column;gap:6px;
  padding:18px 16px;border-radius:18px;border:2px solid rgba(120,120,140,.28);background:rgba(120,120,140,.06);
  transition:transform .15s ease,border-color .15s ease,box-shadow .15s ease}
.mc-opt:hover,.mc-opt:focus-visible{transform:translateY(-2px);border-color:${accent};box-shadow:0 10px 26px rgba(0,0,0,.14)}
.mc-opt:focus-visible{outline:3px solid ${accent};outline-offset:2px}
.mc-opt .mc-name{font-size:20px;font-weight:800}
.mc-opt .mc-desc{font-size:14px;line-height:1.45;opacity:.8}
.mc-opt .mc-tag{margin-top:auto;padding-top:6px;font-size:12px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:${accent}}
#mcCard .mc-foot{margin:18px 0 0;font-size:13px;opacity:.65;line-height:1.5}
@media (max-width:520px){.mc-grid{grid-template-columns:1fr}#mcCard{padding:22px 16px 18px}#mcCard h2{font-size:22px}}
@media (prefers-reduced-motion:reduce){#mcRoot,.mc-opt{transition:none}}
`;
      document.head.appendChild(css);

      const root = document.createElement('div');
      root.id = 'mcRoot';
      root.setAttribute('role', 'dialog');
      root.setAttribute('aria-modal', 'true');
      root.setAttribute('aria-labelledby', 'mcTitle');
      root.innerHTML = `
        <div id="mcCard">
          <h2 id="mcTitle">How would you like to play?</h2>
          <p class="mc-sub">Choose your playing style. You can switch modes anytime.</p>
          <div class="mc-grid">
            <button type="button" class="mc-opt" data-mode="own">
              <span class="mc-name">Own Pace</span>
              <span class="mc-desc">Take your time. Play each note when you're ready. No rushing.</span>
              <span class="mc-tag">Relaxed &amp; flexible</span>
            </button>
            <button type="button" class="mc-opt" data-mode="practice">
              <span class="mc-name">Practice</span>
              <span class="mc-desc">Adjust the speed, repeat tricky sections and track your accuracy.</span>
              <span class="mc-tag">More control</span>
            </button>
          </div>
          <p class="mc-foot">Both modes help you learn and play songs. Choose whichever feels right.</p>
        </div>`;
      document.body.appendChild(root);
      requestAnimationFrame(() => root.classList.add('mc-show'));

      const previouslyFocused = document.activeElement;
      const first = root.querySelector('.mc-opt');
      try { first.focus({ preventScroll: true }); } catch (_) {}

      function close() {
        store.set();
        document.removeEventListener('keydown', onKey, true);
        root.classList.remove('mc-show');
        setTimeout(() => { root.remove(); css.remove(); }, 260);
        try { previouslyFocused && previouslyFocused.focus && previouslyFocused.focus(); } catch (_) {}
      }

      // Own Pace = Perform mode. Wait (briefly) for the song file to finish loading, then open it.
      function openOwnPace() {
        let tries = 0;
        const go = () => {
          if (window.PerformMode && E && E.ready) { try { window.PerformMode.enter(); } catch (e) { console.warn('[mode-choice]', e); } return; }
          if (++tries < 60) setTimeout(go, 250);   // up to ~15 s
        };
        go();
      }

      function choose(mode) {
        close();
        if (mode === 'own') openOwnPace();
      }

      root.addEventListener('click', (e) => {
        const b = e.target.closest('.mc-opt');
        if (b) choose(b.dataset.mode);
      });

      function onKey(e) {
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); choose('practice'); }
        else if (e.key === 'Tab') {                 // keep focus inside the dialog
          const opts = [...root.querySelectorAll('.mc-opt')];
          const i = opts.indexOf(document.activeElement);
          e.preventDefault();
          opts[(i + (e.shiftKey ? opts.length - 1 : 1)) % opts.length].focus();
        }
      }
      document.addEventListener('keydown', onKey, true);
    }

    // Show only once the player is logged in and the song is unlocked.
    if (window.paywallPassed) build();
    else window.addEventListener('paywallPassed', build, { once: true });
  } catch (err) {
    console.warn('[mode-choice] unavailable (page unaffected):', err);
  }
}
