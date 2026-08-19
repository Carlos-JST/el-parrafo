# El Párrafo

> Donde las ideas se escriben completas.

Periódico digital dominicano construido desde cero como proyecto de aprendizaje.
Esta es la versión estática: HTML, CSS y JavaScript sin frameworks, sin backend
y sin base de datos.

**Estado:** en desarrollo · Fase 4 (arquitectura de JavaScript y contenido)

**Autor:** _(pon aquí tu nombre)_

---

## Qué es este proyecto

El Párrafo es la portada de un periódico digital con identidad editorial propia:
tipografía serif para los titulares, mucho espacio en blanco, líneas finas y el
rojo reservado como acento. La referencia visual son los diarios tradicionales,
no los paneles de control ni las plantillas de startup.

El contenido es ficticio y sirve para representar el diseño. No es un medio real
y no publica información verificada.

## Características actuales

- Portada con bloques de distinto peso: apertura con carrusel, franja de
  titulares breves, rejilla filtrable, reportajes largos y columnistas.
- Cabecera editorial con barra superior, logo centrado y buscador.
- Navegación por ocho secciones, con estado activo y barra fija al hacer scroll.
- Portada con carrusel de tres noticias: flechas, indicadores, teclado (← →),
  deslizamiento táctil y rotación automática pausable.
- Buscador que filtra en vivo los artículos de la página. Ignora mayúsculas y
  tildes: escribir `economia` encuentra "Economía".
- Menú móvil desplegable, con el mismo botón para abrir y cerrar.
- Últimas noticias con filtros por sección, En profundidad, Lo más leído,
  columnistas y formulario de boletín con validación.
- Páginas interiores: artículo completo, listado por sección y perfil de firma
  con botón de seguir.
- Diseño adaptable comprobado de 320 px a 1920 px, sin desbordes horizontales.
- Accesibilidad básica: navegación completa por teclado, foco visible, textos
  alternativos, `aria-*` en los controles y respeto a `prefers-reduced-motion`.

## Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| HTML5 semántico | Estructura del documento |
| CSS3 | Variables en `:root`, Grid, Flexbox, `clamp()`, media queries |
| JavaScript (ES6+) | Interacciones, sin librerías ni dependencias |
| Google Fonts | Playfair Display (titulares) e Inter (interfaz) |
| SVG | Ilustraciones e iconos, creados para el proyecto |

Sin frameworks. Sin `npm install`. El proyecto se abre directamente en el
navegador.

## Estructura del proyecto

```
EL-PARRAFO/
├── index.html                    Portada
├── articulo.html                 Una noticia    (?slug=...)
├── seccion.html                  Una sección    (?categoria=...)
├── autor.html                    Una firma      (?autor=...)
├── README.md                     Este archivo
├── .gitignore                    Archivos que Git no debe guardar
├── datos/
│   ├── articulos.json            Los artículos, con su texto completo
│   └── autores.json              Ficha de cada firma
├── css/
│   └── style.css                 Estilos, en 16 secciones numeradas
├── js/
│   ├── main.js                   Arranque de la portada
│   ├── comun.js                  Lo que toda página necesita
│   ├── paginas/
│   │   ├── articulo.js           Página de una noticia
│   │   ├── seccion.js            Listado de una sección
│   │   └── autor.js              Perfil de una firma
│   ├── config.js                 Todos los ajustes en un solo sitio
│   ├── utiles.js                 Funciones compartidas
│   ├── interfaz.js               Fecha, barra fija, progreso, revelado
│   ├── datos/
│   │   └── cargarArticulos.js    fetch + consultas sobre la lista
│   └── componentes/
│       ├── tarjeta.js            Fábricas de HTML por pieza
│       ├── portada.js            Carrusel
│       ├── ultimas.js            Rejilla + filtros por sección
│       ├── bloques.js            En profundidad, más leído, opinión
│       ├── busqueda.js           Buscador
│       ├── menu.js               Menú móvil
│       └── boletin.js            Formulario
└── assets/
    ├── images/                   16 ilustraciones (SVG)
    └── icons/                    Favicon y marca ¶
```

## Cómo añadir una noticia

Abre `datos/articulos.json`, copia un bloque `{ ... }` completo, pégalo y
edítalo. No hay que tocar el HTML: la portada, los filtros y el buscador la
recogen solos.

## Cómo ejecutarlo localmente

> **Ya no funciona abriendo `index.html` con doble clic.** El proyecto usa
> módulos de JavaScript (`import`/`export`) y carga los artículos con
> `fetch()`. Por seguridad, el navegador bloquea ambas cosas cuando la
> página se abre desde el disco (`file://`). Hay que servir la carpeta.

1. Abre la carpeta en Visual Studio Code.
2. Instala la extensión **Live Server** (de Ritwick Dey).
3. Clic derecho sobre `index.html` → *Open with Live Server*.

Se abrirá en `http://127.0.0.1:5500` y todo funcionará. En Internet no hay
problema: Vercel ya sirve el sitio por HTTP.

No hace falta instalar Node.js ni compilar nada.

## Dónde modificar cada cosa

| Quiero cambiar… | Voy a… |
|---|---|
| Colores | `css/style.css`, bloque `:root` |
| Tipografías | Variables `--fuente-titulo` y `--fuente-texto` + el `<link>` en `index.html` |
| Tamaño de títulos | Variables `--tit-xs` … `--tit-lg` |
| Espacio entre secciones | Variable `--e-seccion` |
| Ancho máximo | Variable `--ancho-contenedor` |
| Noticias (todas) | `datos/articulos.json` |
| Cuáles salen en el carrusel | Campo `"portada": true` en el JSON |
| Cuántas piezas por bloque | `js/config.js` |
| Velocidad del carrusel y animaciones | `js/config.js` |
| Textos fijos (secciones, pie) | `index.html` |
| Imágenes | Sustituye los archivos de `assets/images/` |

Las imágenes son ilustraciones SVG de muestra y llevan la marca
*IMAGEN DE MUESTRA*. Para usar fotos reales, guárdalas en `assets/images/` y
cambia la extensión en el `src`. Proporciones: 16:10 en portada, 4:3 en las
tarjetas y 3:2 en opinión.

## Estado actual

Completado:

- **Fase 1** — Maquetación editorial, diseño responsive e identidad visual.
- **Fase 2** — Interactividad con JavaScript: menú, búsqueda y carrusel.
- **Fase 3** — Control de versiones con Git, repositorio en GitHub y publicación.
- **Fase 4** — Datos separados del HTML, renderizado dinámico, filtros por
  sección, búsqueda sobre datos y páginas interiores (artículo, sección y firma).
- **Fase 4** — Datos separados de la presentación, renderizado dinámico,
  filtros por sección, módulos con `import`/`export`, `fetch` + `async/await`,
  estados de carga y error, sistema de movimiento y páginas interiores.

El proyecto son hoy cuatro páginas estáticas que leen sus datos de dos
archivos JSON locales. No hay base de datos, no hay usuarios y no se envía
nada a ningún servidor: el formulario del boletín solo valida y avisa.

## Roadmap

Ninguna de estas funcionalidades está implementada todavía. Es el plan de
aprendizaje del proyecto, en orden:

- [ ] **Fase 5** — Migración a React: componentes reutilizables y estado.
- [ ] **Fase 6** — Next.js: rutas, renderizado en servidor y SEO.
- [ ] **Fase 7** — PostgreSQL con Supabase: artículos reales en base de datos.
- [ ] **Fase 8** — Autenticación y roles (lector, redactor, editor).
- [ ] **Futuro** — Panel editorial (CMS), contenido multimedia y funciones de
      comunidad.

## Licencia

Proyecto personal de aprendizaje. Contenido de muestra, sin valor informativo.
