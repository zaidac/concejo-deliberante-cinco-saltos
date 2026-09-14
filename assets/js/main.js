/* ==========================================================
 * main.js — Punto de entrada (ES Modules, sin dependencias)
 * Arquitectura: cada módulo tiene una sola responsabilidad.
 *  - ui.js:           interacciones visuales y navegación
 *  - form-handler.js: validación + envío vía Formspree
 * ========================================================== */

import { initUI } from './ui.js';
import { initContactForm } from './form-handler.js';

function init() {
  initUI();
  initContactForm();
}

// El script se carga al final del <body>: el DOM ya existe,
// pero se tolera cualquier estado de carga por robustez.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
