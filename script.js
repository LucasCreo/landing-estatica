// ── Theme toggle ─────────────────────────────────────────────
const THEME_KEY = 'scuadra-landing-theme'

function aplicarTheme(t) {
  const root = document.documentElement
  if (t === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
  root.style.colorScheme = t
  // toggle icon visibility
  document.querySelectorAll('.icon-moon').forEach(el => el.classList.toggle('hidden', t === 'dark'))
  document.querySelectorAll('.icon-sun').forEach(el => el.classList.toggle('hidden', t !== 'dark'))
}

function currentTheme() {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

const toggleBtn = document.getElementById('theme-toggle')
if (toggleBtn) {
  aplicarTheme(currentTheme())
  toggleBtn.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark'
    aplicarTheme(next)
    try { localStorage.setItem(THEME_KEY, next) } catch {}
  })
}

// ── Logo inject ──────────────────────────────────────────────
// Reemplaza cada .logo-slot con el logo (img) del template #tpl-logo.
// El tamaño se toma del estilo del slot (width/height inline).
const logoTpl = document.getElementById('tpl-logo')
if (logoTpl) {
  document.querySelectorAll('.logo-slot').forEach(slot => {
    slot.appendChild(logoTpl.content.cloneNode(true))
  })
}

// ── Reveal on scroll ─────────────────────────────────────────
const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
if (reducedMotion) {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('in-view'))
} else {
  const obs = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('in-view')
        obs.unobserve(e.target)
      }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el))
}
