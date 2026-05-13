# AccesoSport — Sistema de Diseño

Guía de referencia para mantener consistencia visual en el portal de participantes y el backoffice de organizadores.

---

## Índice

1. [Principios de marca](#1-principios-de-marca)
2. [Paleta de colores](#2-paleta-de-colores)
3. [Tipografía](#3-tipografía)
4. [Espaciado y layout](#4-espaciado-y-layout)
5. [Bordes y radios](#5-bordes-y-radios)
6. [Componentes](#6-componentes)
7. [Patrones de UI](#7-patrones-de-ui)
8. [Iconografía](#8-iconografía)
9. [Voz y tono](#9-voz-y-tono)
10. [Superficies por contexto](#10-superficies-por-contexto)

---

## 1. Principios de marca

AccesoSport es una plataforma de inscripción a carreras atléticas. La identidad visual refleja **energía, velocidad y confianza**.

| Principio | Descripción |
|---|---|
| **Energético** | Colores vibrantes (amber), tipografía condensada en mayúsculas, jerarquía visual clara |
| **Confiable** | Azul como color de acción primaria, feedback inmediato en cada interacción |
| **Eficiente** | Interfaces densas pero legibles; el participante encuentra lo que necesita en segundos |
| **Deportivo** | Lenguaje visual del atletismo: números grandes, uppercase agresivo, imágenes de acción |

---

## 2. Paleta de colores

### 2.1 Colores de marca (portal)

Estos colores se usan directamente con clases de Tailwind en el portal de participantes. No pasan por tokens CSS.

| Nombre | Clase Tailwind | Hex aprox. | Uso |
|---|---|---|---|
| Amber 400 | `bg-amber-400` | `#FBBF24` | Acento principal, stripe, hero, badges de precio, avatar |
| Amber 500 | `bg-amber-500` | `#F59E0B` | Hover sobre amber-400 |
| Amber 50 | `bg-amber-50` | `#FFFBEB` | Fondo general del portal |
| Amber 100 | `bg-amber-100` | `#FEF3C7` | Nav activo, fondos sutiles |
| Amber 800 | `text-amber-800` | `#92400E` | Texto sobre fondos amber claros |
| Orange 500 | `to-orange-500` | `#F97316` | Extremo del gradiente de placeholder de evento |

### 2.2 Tokens de color (sistema)

Definidos en `app/globals.css` como custom properties OKLCH. Se consumen automáticamente por shadcn/ui y Tailwind mediante `var()`.

| Token | OKLCH | Equivalente aprox. | Uso |
|---|---|---|---|
| `--background` | `oklch(0.984 0.003 247)` | slate-50 | Fondo de página (backoffice) |
| `--foreground` | `oklch(0.145 0 0)` | gray-900 | Texto principal |
| `--card` | `oklch(1 0 0)` | white | Superficie de tarjetas |
| `--primary` | `oklch(0.546 0.243 264)` | blue-600 | Botones CTA, links activos, ring de focus |
| `--primary-foreground` | `oklch(0.98 0 0)` | white | Texto sobre primary |
| `--secondary` | `oklch(0.968 0.007 248)` | slate-100 | Superficies secundarias |
| `--muted` | `oklch(0.968 0.007 248)` | slate-100 | Fondos sutiles, chips |
| `--muted-foreground` | `oklch(0.5 0 0)` | gray-500 | Textos de apoyo |
| `--destructive` | `oklch(0.55 0.22 27)` | red-600 | Acciones destructivas |
| `--border` | `oklch(0.929 0.013 256)` | slate-200 | Bordes de inputs y tarjetas |
| `--success` | `oklch(0.6 0.18 145)` | green-600 | Estados de éxito |
| `--warning` | `oklch(0.75 0.18 85)` | amber-500 | Alertas y advertencias |

### 2.3 Tokens del sidebar (backoffice)

| Token | OKLCH | Uso |
|---|---|---|
| `--sidebar` | `oklch(1 0 0)` | Fondo del sidebar (blanco) |
| `--sidebar-foreground` | `oklch(0.42 0.006 248)` | Texto de items de nav |
| `--sidebar-primary` | `oklch(0.546 0.243 264)` | blue-600 — logo, item activo |
| `--sidebar-accent` | `oklch(0.968 0.007 248)` | Fondo hover de items |
| `--sidebar-border` | `oklch(0.929 0.013 256)` | Borde derecho del sidebar |

### 2.4 Colores semánticos de estado

| Estado | Clases Tailwind | Uso |
|---|---|---|
| Éxito | `bg-green-50 border-green-200 text-green-800` | Inscripción confirmada, check-in OK |
| Error | `bg-red-50 border-red-200 text-red-700` | Errores de API, validaciones |
| Advertencia | `bg-amber-50 border-amber-200 text-amber-800` | Sin lugares, registro incompleto |
| Info | `bg-blue-50 border-blue-200 text-blue-700` | Mensajes informativos |
| Neutro | `bg-gray-50 border-gray-200 text-gray-600` | Estados cerrados, no disponibles |

---

## 3. Tipografía

### 3.1 Familias

| Familia | Variable CSS / Utility | Pesos | Uso |
|---|---|---|---|
| **Barlow Condensed** | `font-barlow-condensed` | 600, 700, 800 | Títulos, headings, números grandes, CTAs uppercase |
| **Barlow** | `font-barlow` | 400, 500, 600 | Cuerpo de texto del portal, etiquetas, navegación |
| **Geist** | `font-sans` (default) | Variable | Interfaces del backoffice (shadcn/ui por defecto) |
| **Geist Mono** | `font-mono` | Variable | Códigos de ticket, valores técnicos |

> Las fuentes Barlow se cargan desde Google Fonts en `app/globals.css`. Geist se sirve localmente con `next/font`.

### 3.2 Escala de tamaños

| Nivel | Clases | Uso típico |
|---|---|---|
| Hero | `text-[clamp(3.5rem,10vw,6.5rem)]` | Headline principal del landing |
| Display | `text-5xl font-extrabold uppercase` | Títulos de sección en portal |
| H1 | `text-4xl font-extrabold uppercase` | Nombre del evento, títulos de página |
| H2 | `text-2xl font-bold uppercase` | Secciones dentro de una página |
| H3 | `text-xl font-bold uppercase` | Cards, subtítulos |
| Label | `text-xs font-bold uppercase tracking-wider` | Etiquetas de campos, kickers |
| Body | `text-sm` / `text-base` | Texto de descripción, párrafos |
| Caption | `text-xs` | Metadata, fechas, ubicaciones en cards |
| Mono | `font-mono text-xs` | Códigos de ticket (`ticketCode`) |

### 3.3 Convenciones

- Los headings del portal van siempre en **UPPERCASE** con `font-barlow-condensed`.
- Los kickers (texto pequeño sobre un título) usan `text-xs font-bold uppercase tracking-widest text-amber-600`.
- El texto de apoyo usa `text-gray-500` o `text-muted-foreground`.
- Nunca usar texto menor a `text-xs` (10px) salvo para badges internos.

---

## 4. Espaciado y layout

### 4.1 Grid base

Tailwind usa un sistema de 4px por unidad. Escala recomendada:

| Unidad | px | Uso |
|---|---|---|
| `gap-1` / `p-1` | 4px | Separación mínima entre elementos inline |
| `gap-2` / `p-2` | 8px | Separación entre iconos y texto |
| `gap-3` / `p-3` | 12px | Items en listas compactas |
| `gap-4` / `p-4` | 16px | Padding interno de cards, separación general |
| `gap-5` / `p-5` | 20px | Grid de cards de eventos |
| `gap-6` / `p-6` | 24px | Padding de cards grandes, secciones |
| `gap-8` / `p-8` | 32px | Separación entre bloques de contenido |
| `gap-16` / `py-16` | 64px | Secciones del landing page |

### 4.2 Contenedor principal

```
max-w-6xl mx-auto px-4
```

Ancho máximo de **1152px** con padding lateral de 16px. Se usa en header, main y footer del portal y backoffice.

### 4.3 Breakpoints

| Breakpoint | px | Uso |
|---|---|---|
| `sm` | 640px | Activar nav de escritorio, grid 2 columnas |
| `lg` | 1024px | Grid 3 columnas, sidebar fijo, ocultar mobile CTA |

### 4.4 Grids frecuentes

```
grid gap-5 sm:grid-cols-2 lg:grid-cols-3   → Cards de eventos
grid gap-8 lg:grid-cols-3                  → Layout main + sidebar (2+1)
grid gap-3 sm:grid-cols-2                  → Filtros de fecha
```

---

## 5. Bordes y radios

| Token / Clase | Valor | Uso |
|---|---|---|
| `--radius` | `0.5rem` (8px) | Base del sistema |
| `rounded-md` | 6px | Botones tamaño default y sm |
| `rounded-lg` | 8px | Items de navegación, dropdowns |
| `rounded-xl` | 12px | Cards compactas, badges de precio, inputs de filtro |
| `rounded-2xl` | 16px | Cards grandes, hero image, sidebar cards |
| `rounded-full` | 9999px | Badges de estado, avatar, pills de precio |

**Regla general:** a mayor superficie, mayor radio. Un badge es `rounded-full`; una card grande es `rounded-2xl`.

---

## 6. Componentes

### 6.1 Button

Importar: `import { Button } from '@/components/ui/button'`

| Variante | Clase generada | Uso |
|---|---|---|
| `default` | `bg-primary text-white` | CTA primario del backoffice |
| `destructive` | `bg-destructive text-white` | Cancelar evento, eliminar |
| `outline` | `border bg-background` | Acciones secundarias |
| `secondary` | `bg-secondary text-secondary-foreground` | Acciones terciarias |
| `ghost` | `hover:bg-accent` | Botones de navegación, iconos |
| `link` | `text-primary underline` | Links inline |

| Tamaño | Altura | Uso |
|---|---|---|
| `sm` | 32px | Acciones en tablas, filtros |
| `default` | 36px | Formularios, acciones generales |
| `lg` | 40px | CTAs principales del portal |
| `icon` | 36×36px | Botones de solo icono |

**CTAs del portal** usan clases directas sobre `Button` para amber/blue específicos:
```tsx
// CTA de inscripción
<Button className="bg-blue-600 text-white hover:bg-blue-700 font-bold uppercase tracking-wider text-lg">

// Botón de login
<Button className="bg-blue-600 text-white hover:bg-blue-700">
```

### 6.2 Card

```tsx
// Card plana (backoffice)
<div className="rounded-2xl bg-white p-6 shadow-sm">

// Card overlay (portal — imagen de fondo con gradiente)
<div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
  <img className="absolute inset-0 h-full w-full object-cover" />
  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
  <div className="absolute bottom-0 left-0 right-0 p-4"> {/* contenido */} </div>
</div>
```

### 6.3 Badge / Pill

```tsx
// Badge de precio (amber)
<span className="rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-bold text-black shadow">
  $350

// Badge de estado activo
<span className="rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white">
  Inscripciones abiertas

// Badge neutro
<span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-gray-800">
  Borrador
```

### 6.4 Estado vacío (Empty State)

```tsx
<div className="flex h-64 flex-col items-center justify-center gap-4 rounded-2xl bg-white shadow-sm">
  <Trophy className="h-14 w-14 text-amber-300" />
  <div className="text-center">
    <p className="font-barlow-condensed text-2xl font-bold uppercase text-gray-800">¡Próximamente!</p>
    <p className="mt-1 text-sm text-gray-500">Descripción de apoyo.</p>
  </div>
</div>
```

### 6.5 Spinner de carga

```tsx
import { Spinner } from '@/components/ui/spinner'

// Pantalla completa
<div className="flex h-64 items-center justify-center">
  <Spinner className="h-8 w-8 text-amber-500" />
</div>
```

### 6.6 Mensajes de feedback

```tsx
// Error
<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
  Mensaje de error.
</div>

// Éxito
<div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
  <CheckCircle2 className="h-5 w-5 text-green-600" />
  <p className="font-semibold text-green-800">¡Acción completada!</p>
</div>
```

---

## 7. Patrones de UI

### 7.1 Hero full-bleed

Usado en la cabecera del detalle de evento. La imagen ocupa todo el ancho rompiendo el padding del contenedor (`-mx-4`), con un gradiente oscuro desde abajo para legibilidad del texto.

```tsx
<div className="-mx-4 relative mb-8 h-64 overflow-hidden sm:h-80 md:h-96 md:rounded-2xl">
  <img src={url} className="h-full w-full object-cover" />
  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/5" />
  <div className="absolute bottom-0 left-0 right-0 px-4 pb-6">
    {/* título y metadata en blanco */}
  </div>
</div>
```

### 7.2 Sticky CTA mobile

En el detalle de evento, cuando las inscripciones están abiertas, el botón de inscripción flota en la parte inferior en mobile. Se oculta en desktop donde vive en el sidebar.

```tsx
<div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 p-4 backdrop-blur-sm lg:hidden">
  <RegistrationCTA compact />
</div>
```

Compensar con `pb-24 lg:pb-0` en el contenedor principal para evitar solapamiento.

### 7.3 Layout main + sidebar

Para páginas de detalle con información secundaria en desktop:

```tsx
<div className="grid gap-8 lg:grid-cols-3">
  <div className="space-y-6 lg:col-span-2"> {/* contenido principal */} </div>
  <div className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
    {/* sidebar con precio y CTA */}
  </div>
</div>
```

### 7.4 Dropdown de avatar

Patrón estándar de cuenta en el portal. El trigger es un círculo con las iniciales del usuario. El menú se organiza en grupos separados por divisores:

1. Información del usuario (nombre + email)
2. Links de cuenta (Mi perfil, Mis inscripciones)
3. Acceso al dashboard — **solo visible para ROLE_ORGANIZER y ROLE_ADMIN**
4. Cerrar sesión

### 7.5 Panel de filtros colapsable

En el catálogo de eventos, los filtros se ocultan por defecto y se revelan con un botón que muestra un indicador de filtros activos (`!` en amber cuando hay filtros aplicados).

### 7.6 Stepper de formulario

Usado en la creación de eventos (backoffice). Los pasos tienen tres estados visuales:

| Estado | Clases del círculo |
|---|---|
| Completado | `bg-primary text-white` con ✓ |
| Activo | `ring-2 ring-primary ring-offset-2 bg-white text-primary` |
| Pendiente | `bg-slate-200 text-slate-500` |

---

## 8. Iconografía

**Librería:** [Lucide React](https://lucide.dev/) — stroke uniforme, esquinas redondeadas.

```bash
import { NombreIcono } from 'lucide-react'
```

**Tamaños estándar:**

| Contexto | Clase |
|---|---|
| Icono en texto / badge | `h-3.5 w-3.5` |
| Icono en botón / nav | `h-4 w-4` |
| Icono en input / label | `h-4 w-4` |
| Icono en stat card | `h-5 w-5` |
| Empty state | `h-10 w-10` a `h-14 w-14` |
| Hero decorativo | `h-24 w-24` |

**Iconos de referencia por dominio:**

| Dominio | Icono |
|---|---|
| Evento / carrera | `Trophy`, `Medal`, `Timer` |
| Fecha | `CalendarDays`, `Clock` |
| Ubicación | `MapPin` |
| Modalidad / distancia | `Ruler` |
| Participantes | `Users` |
| Inscripción confirmada | `CheckCircle2` |
| Ticket | `Ticket` |
| Login / logout | `LogIn`, `LogOut` |
| Dashboard | `LayoutDashboard` |
| Marca AccesoSport | `Zap` |

**Regla:** nunca usar emojis como iconos funcionales. Solo Lucide SVG.

---

## 9. Voz y tono

### 9.1 Idioma

- Español de México (`es-MX`) en toda la interfaz.
- Fechas: `toLocaleDateString('es-MX', { weekday: 'long', ... })` → "lunes, 12 de mayo de 2026".
- Precios: `Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })` → "$350.00".
- Precio cero: mostrar **"Gratis"**, no "$0.00".

### 9.2 Tono por superficie

| Superficie | Tono | Ejemplo |
|---|---|---|
| Headlines del portal | Enérgico, imperativo | "¡Inscribirme ahora!", "Corre. Supérate." |
| Botones de CTA | Directo, con precio cuando aplica | "¡Inscribirme · $350!" |
| Mensajes de éxito | Celebratorio | "¡Ya estás inscrito!" |
| Mensajes de error | Claro, sin tecnicismos | "Error al cargar el evento." |
| Estado vacío | Esperanzador | "Próximamente · Estamos preparando nuevas carreras." |
| Backoffice | Neutro y profesional | "Guardar cambios", "Cancelar evento" |

### 9.3 Convenciones de texto

- Headings del portal: **UPPERCASE** siempre.
- Kickers (línea sobre un título): `text-xs uppercase tracking-widest` en amber o gris.
- Etiquetas de campos: `text-xs font-bold uppercase tracking-wider text-gray-400`.
- Nunca "Usuario" como fallback de nombre — usar el email.
- Fechas de evento: primera letra en mayúscula (`capitalize`).

---

## 10. Superficies por contexto

### Portal de participantes

| Elemento | Clase de fondo | Notas |
|---|---|---|
| Página | `bg-amber-50` | Fondo cálido del portal |
| Navbar | `bg-white/95 backdrop-blur-sm` | Fixed, con stripe amber-400 arriba |
| Cards de evento | Imagen de fondo + overlay | Patrón overlay |
| Cards de información | `bg-white shadow-sm rounded-2xl` | Sección "Acerca del evento", stats |
| Sidebar de detalle | `bg-white shadow-md rounded-2xl` | Precio + CTA en desktop |
| CTA mobile sticky | `bg-white/95 backdrop-blur-sm` | Fixed bottom, `lg:hidden` |
| Footer | `bg-white border-t border-amber-100` | Links + copyright |

### Backoffice (organizadores)

| Elemento | Clase de fondo | Notas |
|---|---|---|
| Página | `bg-background` → slate-50 | Fondo neutro |
| Sidebar | `bg-sidebar` → white | Borde derecho slate-200 |
| Header | `bg-card shadow-sm` → white | Sticky top-0 |
| Cards / formularios | `bg-card` → white | `rounded-xl` o `rounded-2xl` |
| Inputs | `bg-background border-border` | Estilo shadcn/ui por defecto |
| Tablas | `bg-card` con filas hover `bg-muted/50` | |
