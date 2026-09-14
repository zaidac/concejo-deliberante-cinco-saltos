/* ==========================================================
 * ui.js — Interacciones de interfaz (sin dependencias)
 * Responsabilidades: header, menú móvil, links activos,
 * volver-arriba, acordeón, toasts y año dinámico.
 * ========================================================== */

/**
 * Muestra una notificación flotante (toast).
 * @param {string} message - Texto a mostrar
 * @param {'success'|'error'|'info'} [type='info']
 * @param {number} [duration=4500] - ms antes de ocultarse
 */
export function showToast(message, type = 'info', duration = 4500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast alert alert--' + type;
  toast.setAttribute('role', type === 'error' ? 'alert' : 'status');

  const icon = document.createElement('span');
  icon.className = 'alert__icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';

  const content = document.createElement('div');
  content.className = 'alert__content';

  const text = document.createElement('p');
  text.className = 'alert__message';
  text.textContent = message;

  content.appendChild(text);
  toast.append(icon, content);
  container.appendChild(toast);

  window.setTimeout(() => {
    toast.classList.add('removing');
    window.setTimeout(() => toast.remove(), 350);
  }, duration);
}

/** Encoge el header y muestra sombra al hacer scroll. */
function initHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/** Menú hamburguesa: abrir/cerrar, Escape, cerrar al navegar o redimensionar. */
function initMobileMenu() {
  const toggle = document.querySelector('.nav-toggle');
  const panel = document.getElementById('nav-panel');
  if (!toggle || !panel) return;

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
    panel.classList.toggle('is-open', open);
    document.body.classList.toggle('overflow-hidden', open);
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  panel.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && panel.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });

  window.matchMedia('(min-width: 768px)').addEventListener('change', (event) => {
    if (event.matches) setOpen(false);
  });
}

/** Resalta en el nav la sección visible (desktop + mobile). */
function initActiveLinks() {
  const links = Array.from(
    document.querySelectorAll('.nav__link[href^="#"], .nav-panel__link[href^="#"]'),
  );
  if (!links.length || !('IntersectionObserver' in window)) return;

  const byHash = new Map();
  links.forEach((link) => {
    const hash = link.getAttribute('href');
    if (!byHash.has(hash)) byHash.set(hash, []);
    byHash.get(hash).push(link);
  });

  const setActive = (hash) => {
    links.forEach((link) => {
      const isActive = link.getAttribute('href') === hash;
      link.classList.toggle('nav__link--active', isActive && link.classList.contains('nav__link'));
      link.classList.toggle('nav-panel__link--active', isActive && link.classList.contains('nav-panel__link'));
      if (isActive) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive('#' + entry.target.id);
      });
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
  );

  byHash.forEach((_, hash) => {
    const section = document.querySelector(hash);
    if (section) observer.observe(section);
  });
}

/** Botón flotante para volver arriba. */
function initBackToTop() {
  const button = document.getElementById('back-to-top');
  if (!button) return;

  const onScroll = () => button.classList.toggle('visible', window.scrollY > 600);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/** Acordeón accesible (FAQ): solo un panel abierto a la vez. */
function initAccordion() {
  const accordion = document.getElementById('faq');
  if (!accordion) return;

  const items = Array.from(accordion.querySelectorAll('.accordion-item'));

  const closeItem = (item) => {
    const trigger = item.querySelector('.accordion-trigger');
    const content = item.querySelector('.accordion-content');
    trigger.setAttribute('aria-expanded', 'false');
    content.classList.remove('is-open');
    content.style.maxHeight = '0px';
  };

  const openItem = (item) => {
    const trigger = item.querySelector('.accordion-trigger');
    const content = item.querySelector('.accordion-content');
    trigger.setAttribute('aria-expanded', 'true');
    content.classList.add('is-open');
    content.style.maxHeight = content.scrollHeight + 'px';
  };

  items.forEach((item) => {
    const trigger = item.querySelector('.accordion-trigger');
    trigger.addEventListener('click', () => {
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      items.forEach(closeItem);
      if (!isOpen) openItem(item);
    });
  });
}

/** Año dinámico del footer. */
function initCurrentYear() {
  const year = document.getElementById('current-year');
  if (year) year.textContent = String(new Date().getFullYear());
}

/** Punto de entrada de UI. Llamar una vez desde main.js */
export function initUI() {
  initHeader();
  initMobileMenu();
  initActiveLinks();
  initBackToTop();
  initAccordion();
  initCurrentYear();
}
