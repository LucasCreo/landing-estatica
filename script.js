// Scuadra · landing: aparición al hacer scroll, pestañas de módulos y menú del celular.
document.documentElement.classList.add('js')

// ── Aparición al hacer scroll ──
const aparecen = document.querySelectorAll('.aparecer')
if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
  aparecen.forEach(el => el.classList.add('visible'))
} else {
  const obs = new IntersectionObserver(entradas => {
    for (const e of entradas) if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target) }
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
  aparecen.forEach(el => obs.observe(el))
}

// ── Borde de la barra al bajar ──
const nav = document.getElementById('nav')
const marcarNav = () => nav.classList.toggle('con-borde', scrollY > 8)
addEventListener('scroll', marcarNav, { passive: true })
marcarNav()

// ── Menú del celular ──
const menu = document.getElementById('menu')
const links = document.querySelector('.nav__links')
menu.addEventListener('click', () => {
  const abierto = links.classList.toggle('abierto')
  menu.setAttribute('aria-expanded', String(abierto))
})
links.addEventListener('click', e => {
  if (e.target.closest('a')) { links.classList.remove('abierto'); menu.setAttribute('aria-expanded', 'false') }
})

// ── Pestañas de módulos (con flechas del teclado) ──
const pestanas = [...document.querySelectorAll('[role="tab"]')]
function elegir(tab, foco) {
  for (const t of pestanas) {
    const sel = t === tab
    t.setAttribute('aria-selected', String(sel))
    t.tabIndex = sel ? 0 : -1
    const panel = document.getElementById(t.getAttribute('aria-controls'))
    panel.hidden = !sel
    if (sel) {
      panel.classList.add('visible')
      panel.classList.remove('entra'); void panel.offsetWidth; panel.classList.add('entra')
    }
  }
  if (foco) tab.focus()
}
pestanas.forEach((t, i) => {
  t.addEventListener('click', () => elegir(t, false))
  t.addEventListener('keydown', e => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (d) { e.preventDefault(); elegir(pestanas[(i + d + pestanas.length) % pestanas.length], true) }
  })
})

document.getElementById('anio').textContent = new Date().getFullYear()
