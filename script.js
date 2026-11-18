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
    for (const el of caja.querySelectorAll('[data-vista]:not(button)')) el.hidden = el.dataset.vista !== b.dataset.vista
  }))
})

// ── Pantallas animadas ──
// Cada [data-escena] avanza un paso por tic. Desde el paso N, los elementos con data-en="N"
// reciben .on; data-valores="a,b,c" cambia el texto y data-anchos="a,b,c" (0 a 1) el ancho de
// una barra según el paso. Al terminar espera un poco y vuelve a empezar. Solo corre a la vista.
const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches
function prepararEscena(raiz) {
  const marcados = [...raiz.querySelectorAll('[data-en]')]
  const valores = [...raiz.querySelectorAll('[data-valores]')].map(el => [el, el.dataset.valores.split(',')])
  const anchos = [...raiz.querySelectorAll('[data-anchos]')].map(el => [el, el.dataset.anchos.split(',')])
  const ultimo = Math.max(0, ...marcados.map(el => +el.dataset.en), ...valores.map(([, v]) => v.length - 1), ...anchos.map(([, v]) => v.length - 1))
  const ritmo = +raiz.dataset.ritmo || 1300
  const pantallas = raiz.matches('.ui, .ui-tel') ? [raiz] : [...raiz.querySelectorAll('.ui, .ui-tel')]
  let paso = 0, timer = null
  const pintar = p => {
    for (const el of marcados) el.classList.toggle('on', +el.dataset.en <= p)
    for (const [el, v] of valores) el.textContent = v[Math.min(p, v.length - 1)]
    for (const [el, v] of anchos) el.style.setProperty('--p', v[Math.min(p, v.length - 1)])
  }
  const tic = () => {
    paso++
    if (paso <= ultimo) { pintar(paso); timer = setTimeout(tic, ritmo); return }
    // Fin: pausa, fundido y de nuevo desde cero.
    timer = setTimeout(() => {
      pantallas.forEach(p => p.classList.add('reinicio'))
      timer = setTimeout(() => {
        paso = 0; pintar(0)
        requestAnimationFrame(() => pantallas.forEach(p => p.classList.remove('reinicio')))
        timer = setTimeout(tic, ritmo)
      }, 400)
    }, ritmo * 2.5)
  }
  return {
    iniciar() { if (timer) return; paso = 0; pintar(0); timer = setTimeout(tic, ritmo * .6) },
    parar() { clearTimeout(timer); timer = null; pantallas.forEach(p => p.classList.remove('reinicio')) },
    final() { pintar(ultimo) },
  }
}
const escenas = [...document.querySelectorAll('[data-escena]')].map(raiz => [raiz, prepararEscena(raiz)])
if (sinMovimiento || !('IntersectionObserver' in window)) {
  escenas.forEach(([, e]) => e.final())
} else {
  const porRaiz = new Map(escenas)
  const obsEscenas = new IntersectionObserver(entradas => {
    for (const e of entradas) e.isIntersecting ? porRaiz.get(e.target).iniciar() : porRaiz.get(e.target).parar()
  }, { threshold: 0.35 })
  escenas.forEach(([raiz]) => obsEscenas.observe(raiz))
}

// ── Botones de demo: llevan al formulario con "Quiero una demo" ya elegido ──
document.querySelectorAll('a[data-demo]').forEach(a => a.addEventListener('click', () => {
  const radio = document.querySelector('#form-contacto input[name="motivo"][value="Quiero una demo"]')
  if (!radio) return
  radio.checked = true
  radio.dispatchEvent(new Event('change', { bubbles: true }))
}))

// ── Modo claro / oscuro ──
const botonTema = document.getElementById('tema')
function aplicarTema(tema, guardar) {
  document.documentElement.dataset.tema = tema
  const oscuro = tema === 'oscuro'
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
