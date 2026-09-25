# Concejo Deliberante de Cinco Saltos — Sitio web oficial

Sitio web institucional del **Concejo Deliberante de Cinco Saltos** (Río Negro, Argentina).
Página informativa, estática y sin backend: información institucional, autoridades,
transparencia y contacto ciudadano.

## Stack tecnológico

HTML5 semántico, CSS y JavaScript vanilla, **sin frameworks ni dependencias**.

| Decisión | Motivo |
| --- | --- |
| Sin frameworks | Sitio estático e informativo: cero dependencias, despliegue inmediato y superficie mínima de mantenimiento. |
| CSS con Custom Properties (BEM + ITCSS) | Sistema de diseño tematizable y escalable a futuras páginas o secciones. |
| JS en un solo archivo clásico (`assets/js/main.js`) | Sin `import`/módulos a propósito: funciona igual servido por HTTP o abriendo el HTML con doble clic (`file://`). UI y formulario separados en secciones internas. |
| Formspree para el formulario | Recibe consultas sin operar servidores ni bases de datos propias. |

## Estructura del proyecto

```
├── index.html              # Página principal (hero, institución, autoridades, comisiones, transparencia, contacto)
├── aviso-legal.html        # Aviso legal
├── privacidad.html         # Política de privacidad
├── robots.txt / sitemap.xml
└── assets/
    ├── css/                # variables · reset · components · layout · main
    ├── js/                 # main.js (clásico, con secciones UI + formulario)
    └── img/                # logo.png · favicon.ico/.png · apple-touch-icon.png
```

## Vista previa local

No requiere compilación. Servir la carpeta con cualquier servidor estático:

```bash
python -m http.server 8000
# abrir http://localhost:8000
```

> Abrir `index.html` con doble clic también funciona (menú, FAQ y validación
> incluidos); solo el envío del formulario requiere HTTP por el `fetch` a Formspree.

## Configuración pendiente

1. **Formulario de contacto**: crear un formulario gratuito en
   [formspree.io](https://formspree.io) y reemplazar `TU_ID_AQUI` en el atributo
   `action` del formulario en `index.html`. Sin este paso, el sitio avisa que el
   envío no está configurado en lugar de fallar en silencio.
2. **Dominio definitivo**: reemplazar `TU-DOMINIO-FINAL.gob.ar` en los `canonical`
   de las tres páginas, `robots.txt` y `sitemap.xml` (marcados con `TODO`).
3. **Contenido oficial**: fotos de las autoridades y horarios de sesión
   (las secciones que aún usan datos ilustrativos lo indican como *placeholder*).

## Arquitectura CSS

Los 5 módulos se enlazan **directo en el HTML**, en este orden de cascada
(variables → reset → components → layout → main). A propósito **no se usa
`@import` ni query strings `?v=` en CSS**: la cadena de imports es frágil en
GitHub Pages/caché y, si un import falla, se cae todo el sistema de diseño
(variables incluidas) y el sitio queda sin estilos.

## Despliegue

Sitio 100 % estático: compatible con GitHub Pages, Netlify, Vercel o cualquier
hosting tradicional. Basta con publicar el contenido de esta carpeta.

> Tras cambiar CSS ya publicado, ver el sitio con recarga forzada
> (Ctrl+Shift+R): Pages y el navegador cachean las hojas de estilo.

## Accesibilidad y SEO

HTML semántico con landmarks, enlace de salto al contenido, focos visibles,
formulario con validación y mensajes asociados vía `aria-describedby`, datos
estructurados `GovernmentOrganization` (JSON-LD) y sitemap.

## Créditos

Diseñado y desarrollado por **[Corvexdev](https://corvexdev.com)** para el
Concejo Deliberante de Cinco Saltos.

© Concejo Deliberante de Cinco Saltos. Todos los derechos reservados.
