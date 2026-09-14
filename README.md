# Concejo Deliberante de Cinco Saltos — Sitio web oficial

Sitio web institucional del **Concejo Deliberante de Cinco Saltos** (Río Negro, Argentina).
Página informativa, estática y sin backend: información institucional, autoridades,
transparencia y contacto ciudadano.

## Stack tecnológico

HTML5 semántico, CSS y JavaScript vanilla (ES Modules), **sin frameworks ni dependencias**.

| Decisión | Motivo |
| --- | --- |
| Sin frameworks | Sitio estático e informativo: cero dependencias, despliegue inmediato y superficie mínima de mantenimiento. |
| CSS con Custom Properties (BEM + ITCSS) | Sistema de diseño tematizable y escalable a futuras páginas o secciones. |
| JS en módulos (`main.js` → `ui.js` + `form-handler.js`) | Separación de responsabilidades: interfaz por un lado, formulario por otro. |
| Formspree para el formulario | Recibe consultas sin operar servidores ni bases de datos propias. |

## Estructura del proyecto

```
├── index.html              # Página principal (hero, institución, autoridades, transparencia, contacto)
├── aviso-legal.html        # Aviso legal
├── privacidad.html         # Política de privacidad
├── robots.txt / sitemap.xml
└── assets/
    ├── css/                # variables · reset · components · layout · main
    ├── js/                 # main · ui · form-handler (ES Modules)
    └── img/                # logo.jpg · favicon.svg
```

## Vista previa local

No requiere compilación. Servir la carpeta con cualquier servidor estático:

```bash
python -m http.server 8000
# abrir http://localhost:8000
```

> Abrir `index.html` directamente también funciona, excepto el envío del formulario
> (requiere HTTP para `fetch`) y los módulos ES en algunos navegadores.

## Configuración pendiente

1. **Formulario de contacto**: crear un formulario gratuito en
   [formspree.io](https://formspree.io) y reemplazar `TU_ID_AQUI` en el atributo
   `action` del formulario en `index.html`. Sin este paso, el sitio avisa que el
   envío no está configurado en lugar de fallar en silencio.
2. **Dominio definitivo**: reemplazar `TU-DOMINIO-FINAL.gob.ar` en los `canonical`
   de las tres páginas, `robots.txt` y `sitemap.xml` (marcados con `TODO`).
3. **Contenido oficial**: autoridades y bloques, horarios de sesión y composición
   real del cuerpo (algunas secciones lo indican como *placeholder*).

## Despliegue

Sitio 100 % estático: compatible con GitHub Pages, Netlify, Vercel o cualquier
hosting tradicional. Basta con publicar el contenido de esta carpeta.

## Accesibilidad y SEO

HTML semántico con landmarks, enlace de salto al contenido, focos visibles,
formulario con validación y mensajes asociados vía `aria-describedby`, datos
estructurados `GovernmentOrganization` (JSON-LD) y sitemap.

## Créditos

Diseñado y desarrollado por **[Corvexdev](https://corvexdev.com)** para el
Concejo Deliberante de Cinco Saltos.

© Concejo Deliberante de Cinco Saltos. Todos los derechos reservados.
