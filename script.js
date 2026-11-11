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

// ── Legajos: alternar entre el listado y el organigrama ──
document.querySelectorAll('.alternar').forEach(caja => {
  const botones = caja.querySelectorAll('button[data-vista]')
  botones.forEach(b => b.addEventListener('click', () => {
    for (const x of botones) x.setAttribute('aria-pressed', String(x === b))
    for (const img of caja.querySelectorAll('img[data-vista]')) img.hidden = img.dataset.vista !== b.dataset.vista
  }))
})

// ── Modo claro / oscuro ──
// Las capturas tienen su versión oscura en capturas/oscuro/ (la app misma en modo oscuro).
const botonTema = document.getElementById('tema')
const capturas = [...document.querySelectorAll('img[src^="capturas/"]')]
capturas.forEach(img => {
  img.dataset.claro = img.getAttribute('src')
  // Si falta la versión oscura, queda la clara.
  img.addEventListener('error', () => { if (img.src.includes('/oscuro/')) img.src = img.dataset.claro })
})
function aplicarTema(tema, guardar) {
  document.documentElement.dataset.tema = tema
  const oscuro = tema === 'oscuro'
  for (const img of capturas) img.src = oscuro ? img.dataset.claro.replace('capturas/', 'capturas/oscuro/') : img.dataset.claro
  const etiqueta = oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
  botonTema.setAttribute('aria-label', etiqueta)
  botonTema.title = etiqueta
  document.querySelector('meta[name="theme-color"]').content = oscuro ? '#171e1a' : '#14532d'
  if (guardar) try { localStorage.setItem('scuadra-tema', tema) } catch (e) {}
}
aplicarTema(document.documentElement.dataset.tema === 'oscuro' ? 'oscuro' : 'claro', false)
botonTema.addEventListener('click', () => aplicarTema(document.documentElement.dataset.tema === 'oscuro' ? 'claro' : 'oscuro', true))

document.getElementById('anio').textContent = new Date().getFullYear()

// Formulario de contacto: los campos aparecen al elegir el motivo y al enviar se abre
// el correo del visitante con todo precargado (la landing no tiene servidor).
const formContacto = document.getElementById('form-contacto')
if (formContacto) {
  const campos = formContacto.querySelector('.contacto__campos')
  // Volver a tocar la opción elegida la desmarca y oculta los campos.
  let estabaMarcada = null
  formContacto.querySelectorAll('.contacto__motivos label').forEach(label => {
    const radio = label.querySelector('input')
    label.addEventListener('pointerdown', () => { estabaMarcada = radio.checked ? radio : null })
    radio.addEventListener('click', () => {
      if (estabaMarcada === radio) {
        radio.checked = false
        campos.hidden = true
      }
      estabaMarcada = null
    })
  })
  formContacto.addEventListener('change', e => {
    if (e.target.name === 'motivo') campos.hidden = false
    if (e.target.classList) e.target.classList.remove('invalido')
  })
  formContacto.addEventListener('submit', e => {
    e.preventDefault()
    const d = new FormData(formContacto)
    let primero = null
    for (const el of formContacto.querySelectorAll('[required]')) {
      const ok = el.checkValidity() && el.value.trim() !== ''
      el.classList.toggle('invalido', !ok)
      if (!ok && !primero) primero = el
    }
    if (primero) { primero.focus(); return }
    const motivo = d.get('motivo') || 'Consulta'
    const cuerpo = [
      `Motivo: ${motivo}`,
      `Nombre: ${d.get('nombre').trim()}`,
      `Email: ${d.get('email').trim()}`,
      d.get('empresa').trim() && `Empresa: ${d.get('empresa').trim()}`,
      d.get('mensaje').trim() && `\n${d.get('mensaje').trim()}`,
    ].filter(Boolean).join('\n')
    const asunto = `${motivo} · Scuadra${d.get('empresa').trim() ? ` · ${d.get('empresa').trim()}` : ''}`
    location.href = `mailto:info@grupolpa.com?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`
  })
}
