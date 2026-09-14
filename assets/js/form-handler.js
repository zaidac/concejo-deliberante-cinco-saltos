/* ==========================================================
 * form-handler.js — Formulario de contacto vía Formspree
 * Sin backend propio: POST directo a https://formspree.io
 *
 * PASO PARA ACTIVAR:
 * 1. Crear un formulario gratis en https://formspree.io
 * 2. Copiar el endpoint (https://formspree.io/f/xxxxxx)
 * 3. Pegarlo en el atributo `action` del <form id="contact-form">
 *    en index.html (reemplazar TU_ID_AQUI).
 * ========================================================== */

import { showToast } from './ui.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+()\-.\s\d]{6,30}$/;
const PLACEHOLDER_TOKEN = 'TU_ID_AQUI';

/**
 * Muestra un error bajo un campo.
 * @param {HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement} field
 * @param {string} message - '' para limpiar
 */
function setFieldError(field, message) {
  const error = document.querySelector(`[data-error-for="${field.id}"]`);
  if (!error) return;
  // ID estable para referenciar el error desde aria-describedby
  if (!error.id) error.id = `error-${field.id}`;
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
  const nombre = form.querySelector('#nombre');
  const email = form.querySelector('#email');
  const telefono = form.querySelector('#telefono');
  const asunto = form.querySelector('#asunto');
  const mensaje = form.querySelector('#mensaje');
  const privacidad = form.querySelector('#privacidad');

  let firstInvalid = null;
  const fail = (field, message) => {
    setFieldError(field, message);
    if (!firstInvalid) firstInvalid = field;
  };

  // Limpieza previa
  [nombre, email, telefono, asunto, mensaje, privacidad].forEach((f) => setFieldError(f, ''));

  const nombreVal = nombre.value.trim();
  if (nombreVal.length < 3) fail(nombre, 'Ingresá tu nombre completo (mínimo 3 caracteres).');
  else if (nombreVal.length > 80) fail(nombre, 'El nombre no puede superar los 80 caracteres.');

  const emailVal = email.value.trim();
  if (!emailVal) fail(email, 'El correo electrónico es obligatorio.');
  else if (!EMAIL_RE.test(emailVal)) fail(email, 'Ingresá un correo válido (ej.: nombre@correo.com).');

  const telVal = telefono.value.trim();
  if (telVal && !PHONE_RE.test(telVal)) fail(telefono, 'El teléfono contiene caracteres no válidos.');

  if (!asunto.value) fail(asunto, 'Seleccioná el asunto de tu consulta.');

  const msgVal = mensaje.value.trim();
  if (msgVal.length < 10) fail(mensaje, 'Contanos un poco más (mínimo 10 caracteres).');
  else if (msgVal.length > 2000) fail(mensaje, 'El mensaje no puede superar los 2000 caracteres.');

  if (!privacidad.checked) fail(privacidad, 'Debés aceptar el uso de tus datos para responderte.');

  if (firstInvalid) {
    firstInvalid.focus({ preventScroll: false });
    return null;
  }
  return new FormData(form);
}

/** Renderiza el banner de estado dentro del formulario. */
function renderFeedback(container, type, title, message) {
  container.innerHTML = '';
  const alert = document.createElement('div');
  alert.className = `alert alert--${type}`;
  alert.setAttribute('role', type === 'error' ? 'alert' : 'status');

  const content = document.createElement('div');
  content.className = 'alert__content';
  const strong = document.createElement('p');
  strong.className = 'alert__title';
  strong.textContent = title;
  const text = document.createElement('p');
  text.className = 'alert__message';
  text.textContent = message;

  content.append(strong, text);
  alert.appendChild(content);
  container.appendChild(alert);
  alert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/** Contador de caracteres del mensaje. */
function initCharCounter(form) {
  const mensaje = form.querySelector('#mensaje');
  const counter = document.getElementById('mensaje-count');
  if (!mensaje || !counter) return;
  const update = () => {
    counter.textContent = String(mensaje.value.length);
  };
  mensaje.addEventListener('input', update);
  update();
}

/** Inicializa el formulario de contacto. Llamar una vez desde main.js */
export function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const feedback = document.getElementById('form-feedback');
  const submitBtn = document.getElementById('form-submit');
  const endpoint = form.getAttribute('action') || '';
  initCharCounter(form);

  // Validación en vivo: limpia el error al corregir
  form.querySelectorAll('input, select, textarea').forEach((field) => {
    field.addEventListener('input', () => setFieldError(field, ''));
    field.addEventListener('change', () => setFieldError(field, ''));
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Antispam honeypot
    const gotcha = form.querySelector('input[name="_gotcha"]');
    if (gotcha && gotcha.value) return; // bot: ignorar en silencio

    // Endpoint sin configurar → avisar sin fingir un envío
    if (!endpoint || endpoint.includes(PLACEHOLDER_TOKEN)) {
      renderFeedback(
        feedback,
        'error',
        'Formulario aún no configurado',
        'Falta pegar el endpoint real de Formspree en el atributo action del formulario (ver comentario TODO en index.html).',
      );
      showToast('Configurá tu endpoint de Formspree para activar el envío.', 'error');
      return;
    }

    const data = validate(form);
    if (!data) {
      showToast('Revisá los campos marcados en el formulario.', 'error');
      return;
    }

    submitBtn.classList.add('btn--loading');
    submitBtn.disabled = true;
    submitBtn.setAttribute('aria-disabled', 'true');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data,
      });

      if (response.ok) {
        renderFeedback(
          feedback,
          'success',
          '¡Consulta enviada!',
          'Gracias por escribirnos. Te responderemos a la brevedad por correo electrónico.',
        );
        showToast('Tu consulta fue enviada correctamente.', 'success');
        form.reset();
        initCharCounter(form);
      } else {
        const payload = await response.json().catch(() => null);
        const detail =
          payload && Array.isArray(payload.errors)
            ? payload.errors.map((e) => e.message).join(' ')
            : 'No pudimos enviar tu consulta. Intentá nuevamente en unos minutos.';
        renderFeedback(feedback, 'error', 'Error al enviar', detail);
        showToast(detail, 'error');
      }
    } catch {
      renderFeedback(
        feedback,
        'error',
        'Sin conexión',
        'Parece que no hay conexión a internet. Verificá tu red e intentá de nuevo.',
      );
      showToast('Sin conexión. Intentá nuevamente.', 'error');
    } finally {
      submitBtn.classList.remove('btn--loading');
      submitBtn.disabled = false;
      submitBtn.removeAttribute('aria-disabled');
    }
  });
}
