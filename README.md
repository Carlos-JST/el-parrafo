# El Párrafo

> Donde las ideas se escriben completas.

Periódico digital dominicano construido desde cero como proyecto de aprendizaje.
Esta es la versión estática: HTML, CSS y JavaScript sin frameworks, sin backend
y sin base de datos.

**Estado:** en desarrollo · Fase 3 de 8 (Git, GitHub y deploy)

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

- Cabecera editorial con barra superior, logo centrado y buscador.
- Navegación por ocho secciones, con estado activo y barra fija al hacer scroll.
- Portada con carrusel de tres noticias: flechas, indicadores, teclado (← →),
  deslizamiento táctil y rotación automática pausable.
- Buscador que filtra en vivo los artículos de la página. Ignora mayúsculas y
  tildes: escribir `economia` encuentra "Economía".
- Menú móvil desplegable, con el mismo botón para abrir y cerrar.
- Cuatro últimas noticias, sección de opinión y formulario de boletín con
  validación de correo.
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
├── index.html          Página completa
├── README.md           Este archivo
├── .gitignore          Archivos que Git no debe guardar
├── css/
│   └── style.css       Estilos, organizados en 12 secciones numeradas
├── js/
│   └── main.js         Menú, búsqueda, carrusel, boletín y fecha
└── assets/
    ├── images/         Ilustraciones de muestra (SVG)
    └── icons/          Favicon y marca ¶
```

## Cómo ejecutarlo localmente

**Opción rápida:** descarga el proyecto y haz doble clic en `index.html`.

**Opción recomendada** (recarga automática al guardar):

1. Abre la carpeta en Visual Studio Code.
2. Instala la extensión **Live Server**.
3. Clic derecho sobre `index.html` → *Open with Live Server*.

No hace falta instalar Node.js ni ejecutar ningún comando de compilación.

## Dónde modificar cada cosa

| Quiero cambiar… | Voy a… |
|---|---|
| Colores | `css/style.css`, bloque `:root` |
| Tipografías | Variables `--fuente-titulo` y `--fuente-texto` + el `<link>` en `index.html` |
| Tamaño de títulos | Variables `--tit-xs` … `--tit-lg` |
| Espacio entre secciones | Variable `--e-seccion` |
| Ancho máximo | Variable `--ancho-contenedor` |
| Noticias del carrusel | `js/main.js`, array `NOTICIAS_PORTADA` |
| Velocidad del carrusel | `js/main.js`, objeto `CONFIG` |
| Resto de textos | `index.html` |
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

El proyecto es hoy una sola página estática. No guarda datos, no tiene usuarios
y no se conecta a ningún servidor.

## Roadmap

Ninguna de estas funcionalidades está implementada todavía. Es el plan de
aprendizaje del proyecto, en orden:

- [ ] **Fase 4** — Páginas interiores y datos separados del HTML.
- [ ] **Fase 5** — Migración a React: componentes reutilizables y estado.
- [ ] **Fase 6** — Next.js: rutas, renderizado en servidor y SEO.
- [ ] **Fase 7** — PostgreSQL con Supabase: artículos reales en base de datos.
- [ ] **Fase 8** — Autenticación y roles (lector, redactor, editor).
- [ ] **Futuro** — Panel editorial (CMS), contenido multimedia y funciones de
      comunidad.

## Licencia

Proyecto personal de aprendizaje. Contenido de muestra, sin valor informativo.
