/* ==========================================================
 * main.js — Lógica del sitio (vanilla, sin dependencias)
 *
 * Un solo archivo clásico (sin ES Modules) a propósito:
 * funciona tanto servido por HTTP como abriendo index.html
 * con doble clic (file://), donde los `import` se bloquean
 * por CORS y dejaban muerto todo el JS (menú, FAQ, form).
 *
 * Secciones:
 *  1. UI: header, menú móvil, links activos, volver-arriba,
 *     acordeón (FAQ), toasts y año dinámico.
 *  2. Formulario de contacto vía Formspree (sin backend).
 * ========================================================== */
(function () {
  'use strict';

  /* --------------------------------------------------------
   * 1. UI
   * -------------------------------------------------------- */

  /**
   * Muestra una notificación flotante (toast).
   * @param {string} message - Texto a mostrar
   * @param {'success'|'error'|'info'} [type='info']
   * @param {number} [duration=4500] - ms antes de ocultarse
   */
  function showToast(message, type, duration) {
    type = type || 'info';
    duration = duration || 4500;

    var container = document.getElementById('toast-container');
    if (!container) return;

    var toast = document.createElement('div');
    toast.className = 'toast alert alert--' + type;
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');

    var icon = document.createElement('span');
    icon.className = 'alert__icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';

    var content = document.createElement('div');
    content.className = 'alert__content';

    var text = document.createElement('p');
    text.className = 'alert__message';
    text.textContent = message;

    content.appendChild(text);
    toast.appendChild(icon);
    toast.appendChild(content);
    container.appendChild(toast);

    window.setTimeout(function () {
      toast.classList.add('removing');
      window.setTimeout(function () { toast.remove(); }, 350);
    }, duration);
  }

  /** Encoge el header y muestra sombra al hacer scroll. */
  function initHeader() {
    var header = document.getElementById('site-header');
    if (!header) return;

    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /** Menú hamburguesa: abrir/cerrar, Escape, cerrar al navegar o redimensionar. */
  function initMobileMenu() {
    var toggle = document.querySelector('.nav-toggle');
    var panel = document.getElementById('nav-panel');
    if (!toggle || !panel) return;

    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
      panel.classList.toggle('is-open', open);
      document.body.classList.toggle('overflow-hidden', open);
    };

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    var links = panel.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function () { setOpen(false); });
    }

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && panel.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    var desktop = window.matchMedia('(min-width: 768px)');
    var onChange = function (event) {
      if (event.matches) setOpen(false);
    };
    if (typeof desktop.addEventListener === 'function') {
      desktop.addEventListener('change', onChange);
    } else if (typeof desktop.addListener === 'function') {
      desktop.addListener(onChange); // Safari < 14
    }
  }

  /** Resalta en el nav la sección visible (desktop + mobile). */
  function initActiveLinks() {
    var links = Array.prototype.slice.call(
      document.querySelectorAll('.nav__link[href^="#"], .nav-panel__link[href^="#"]'),
    );
    if (!links.length || !('IntersectionObserver' in window)) return;

    var seen = {};
    var setActive = function (hash) {
      links.forEach(function (link) {
        var isActive = link.getAttribute('href') === hash;
        link.classList.toggle('nav__link--active', isActive && link.classList.contains('nav__link'));
        link.classList.toggle('nav-panel__link--active', isActive && link.classList.contains('nav-panel__link'));
        if (isActive) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    };

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActive('#' + entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
    );

    links.forEach(function (link) {
      var hash = link.getAttribute('href');
      if (seen[hash]) return;
      seen[hash] = true;
      var section = document.querySelector(hash);
      if (section) observer.observe(section);
    });
  }

  /** Botón flotante para volver arriba. */
  function initBackToTop() {
    var button = document.getElementById('back-to-top');
    if (!button) return;

    var onScroll = function () {
      button.classList.toggle('visible', window.scrollY > 600);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /** Acordeón accesible (FAQ): solo un panel abierto a la vez. */
  function initAccordion() {
    var accordion = document.getElementById('faq');
    if (!accordion) return;

    var items = Array.prototype.slice.call(accordion.querySelectorAll('.accordion-item'));

    var closeItem = function (item) {
      var trigger = item.querySelector('.accordion-trigger');
      var content = item.querySelector('.accordion-content');
      trigger.setAttribute('aria-expanded', 'false');
      content.classList.remove('is-open');
      content.style.maxHeight = '0px';
    };

    var openItem = function (item) {
      var trigger = item.querySelector('.accordion-trigger');
      var content = item.querySelector('.accordion-content');
      trigger.setAttribute('aria-expanded', 'true');
      content.classList.add('is-open');
      // scrollHeight mide el alto total aun con max-height: 0,
      // por eso el panel se despliega a su medida exacta.
      content.style.maxHeight = content.scrollHeight + 'px';
    };

    items.forEach(function (item) {
      var trigger = item.querySelector('.accordion-trigger');
      trigger.addEventListener('click', function () {
        var isOpen = trigger.getAttribute('aria-expanded') === 'true';
        items.forEach(closeItem);
        if (!isOpen) openItem(item);
      });
    });
  }

  /** Año dinámico del footer. */
  function initCurrentYear() {
    var year = document.getElementById('current-year');
    if (year) year.textContent = String(new Date().getFullYear());
  }

  function initUI() {
    initHeader();
    initMobileMenu();
    initActiveLinks();
    initBackToTop();
    initAccordion();
    initCurrentYear();
  }

  /* --------------------------------------------------------
   * 2. Formulario de contacto vía Formspree (sin backend)
   *
   * PASO PARA ACTIVAR:
   * 1. Crear un formulario gratis en https://formspree.io
   * 2. Copiar el endpoint (https://formspree.io/f/xxxxxx)
   * 3. Pegarlo en el atributo `action` del <form id="contact-form">
   *    en index.html (reemplazar TU_ID_AQUI).
   * -------------------------------------------------------- */

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var PHONE_RE = /^[+()\-.\s\d]{6,30}$/;
  var PLACEHOLDER_TOKEN = 'TU_ID_AQUI';

  /**
   * Muestra un error bajo un campo ('' para limpiar).
   */
  function setFieldError(field, message) {
    var error = document.querySelector('[data-error-for="' + field.id + '"]');
    if (!error) return;
    // ID estable para referenciar el error desde aria-describedby
    if (!error.id) error.id = 'error-' + field.id;
    if (!message) {
      error.textContent = '';
      error.hidden = true;
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
    } else {
      error.textContent = message;
      error.hidden = false;
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', error.id);
    }
  }

  /** Valida el formulario y devuelve los datos o null si hay errores. */
  function validate(form) {
    var nombre = form.querySelector('#nombre');
    var email = form.querySelector('#email');
    var telefono = form.querySelector('#telefono');
    var asunto = form.querySelector('#asunto');
    var mensaje = form.querySelector('#mensaje');
    var privacidad = form.querySelector('#privacidad');

    var firstInvalid = null;
    var fail = function (field, message) {
      setFieldError(field, message);
      if (!firstInvalid) firstInvalid = field;
    };

    // Limpieza previa
    [nombre, email, telefono, asunto, mensaje, privacidad].forEach(function (f) {
      setFieldError(f, '');
    });

    var nombreVal = nombre.value.trim();
    if (nombreVal.length < 3) fail(nombre, 'Ingresá tu nombre completo (mínimo 3 caracteres).');
    else if (nombreVal.length > 80) fail(nombre, 'El nombre no puede superar los 80 caracteres.');

    var emailVal = email.value.trim();
    if (!emailVal) fail(email, 'El correo electrónico es obligatorio.');
    else if (!EMAIL_RE.test(emailVal)) fail(email, 'Ingresá un correo válido (ej.: nombre@correo.com).');

    var telVal = telefono.value.trim();
    if (telVal && !PHONE_RE.test(telVal)) fail(telefono, 'El teléfono contiene caracteres no válidos.');

    if (!asunto.value) fail(asunto, 'Seleccioná el asunto de tu consulta.');

    var msgVal = mensaje.value.trim();
    if (msgVal.length < 10) fail(mensaje, 'Contanos un poco más (mínimo 10 caracteres).');
    else if (msgVal.length > 2000) fail(mensaje, 'El mensaje no puede superar los 2000 caracteres.');

    if (!privacidad.checked) fail(privacidad, 'Debés aceptar el uso de tus datos para responderte.');

    if (firstInvalid) {
      firstInvalid.focus();
      return null;
    }

    // FormData con fallback para navegadores muy viejos
    if (typeof FormData === 'function') return new FormData(form);
    var data = {};
    var fields = form.querySelectorAll('input, select, textarea');
    for (var i = 0; i < fields.length; i++) {
      if (fields[i].name && fields[i].type !== 'checkbox') data[fields[i].name] = fields[i].value;
    }
    return data;
  }

  /** Renderiza el banner de estado dentro del formulario. */
  function renderFeedback(container, type, title, message) {
    if (!container) return;
    container.innerHTML = '';
    var alert = document.createElement('div');
    alert.className = 'alert alert--' + type;
    alert.setAttribute('role', type === 'error' ? 'alert' : 'status');

    var content = document.createElement('div');
    content.className = 'alert__content';
    var strong = document.createElement('p');
    strong.className = 'alert__title';
    strong.textContent = title;
    var text = document.createElement('p');
    text.className = 'alert__message';
    text.textContent = message;

    content.appendChild(strong);
    content.appendChild(text);
    alert.appendChild(content);
    container.appendChild(alert);
    if (typeof alert.scrollIntoView === 'function') {
      alert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /** Contador de caracteres del mensaje. */
  function initCharCounter(form) {
    var mensaje = form.querySelector('#mensaje');
    var counter = document.getElementById('mensaje-count');
    if (!mensaje || !counter) return;
    var update = function () {
      counter.textContent = String(mensaje.value.length);
    };
    mensaje.addEventListener('input', update);
    update();
  }

  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var feedback = document.getElementById('form-feedback');
    var submitBtn = document.getElementById('form-submit');
    var endpoint = form.getAttribute('action') || '';
    initCharCounter(form);

    // Validación en vivo: limpia el error al corregir
    var fields = form.querySelectorAll('input, select, textarea');
    for (var i = 0; i < fields.length; i++) {
      (function (field) {
        field.addEventListener('input', function () { setFieldError(field, ''); });
        field.addEventListener('change', function () { setFieldError(field, ''); });
      })(fields[i]);
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      // Antispam honeypot
      var gotcha = form.querySelector('input[name="_gotcha"]');
      if (gotcha && gotcha.value) return; // bot: ignorar en silencio

      // Endpoint sin configurar → avisar sin fingir un envío
      if (!endpoint || endpoint.indexOf(PLACEHOLDER_TOKEN) !== -1) {
        renderFeedback(
          feedback,
          'error',
          'Formulario aún no configurado',
          'Falta pegar el endpoint real de Formspree en el atributo action del formulario (ver comentario TODO en index.html).',
        );
        showToast('Configurá tu endpoint de Formspree para activar el envío.', 'error');
        return;
      }

      var data = validate(form);
      if (!data) {
        showToast('Revisá los campos marcados en el formulario.', 'error');
        return;
      }

      submitBtn.classList.add('btn--loading');
      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-disabled', 'true');

      var done = function () {
        submitBtn.classList.remove('btn--loading');
        submitBtn.disabled = false;
        submitBtn.removeAttribute('aria-disabled');
      };

      var onOk = function () {
        renderFeedback(
          feedback,
          'success',
          '¡Consulta enviada!',
          'Gracias por escribirnos. Te responderemos a la brevedad por correo electrónico.',
        );
        showToast('Tu consulta fue enviada correctamente.', 'success');
        form.reset();
        initCharCounter(form);
        done();
      };

      var onError = function (detail) {
        renderFeedback(feedback, 'error', 'Error al enviar', detail);
        showToast(detail, 'error');
        done();
      };

      // fetch con fallback para navegadores sin fetch/XHR
      if (typeof fetch === 'function') {
        fetch(endpoint, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: data,
        })
          .then(function (response) {
            if (response.ok) {
              onOk();
              return null;
            }
            return response.json().catch(function () { return null; });
          })
          .then(function (payload) {
            if (payload === null) return; // ya fue éxito
            var detail =
              payload && Array.isArray(payload.errors)
                ? payload.errors.map(function (e) { return e.message; }).join(' ')
                : 'No pudimos enviar tu consulta. Intentá nuevamente en unos minutos.';
            onError(detail);
          })
          .catch(function () {
            onError('Parece que no hay conexión a internet. Verificá tu red e intentá de nuevo.');
          });
      } else if (typeof XMLHttpRequest === 'function') {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', endpoint);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.onload = function () {
          if (xhr.status >= 200 && xhr.status < 300) onOk();
          else onError('No pudimos enviar tu consulta. Intentá nuevamente en unos minutos.');
        };
        xhr.onerror = function () {
          onError('Parece que no hay conexión a internet. Verificá tu red e intentá de nuevo.');
        };
        xhr.send(data);
      } else {
        // Sin fetch ni XHR: envío clásico del formulario
        form.submit();
      }
    });
  }

  /* --------------------------------------------------------
   * Arranque
   * -------------------------------------------------------- */
  function init() {
    initUI();
    initContactForm();
  }

  // Con `defer` el DOM ya existe, pero se tolera
  // cualquier estado de carga por robustez.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
