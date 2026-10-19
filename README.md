# 🧪 Portal Web: Consumo de Rick & Morty REST API

Proyecto desarrollado para la asignatura **Diseño de Sistemas de Internet**, enfocado en el consumo interactivo y estructurado de servicios web públicos utilizando la API nativa `fetch()`, **TypeScript** y **Tailwind CSS**.

---

## 🚀 Características del Portal

1. **Separación de Responsabilidades (Capa de Servicio):**
   - El consumo de la API está desacoplado de la interfaz en `src/services/api.ts`.
   - Incluye funciones dedicadas tanto para sintaxis moderna **`async/await`** como para **`Promesas (.then / .catch)`** abordadas en la sesión de clase.

2. **Tipado Estático con TypeScript:**
   - Modelado de interfaces en `src/types/character.ts` para tipar fuertemente las respuestas (`ApiResponse`, `Character`, `HttpMetrics`, `QueryFilters`), evitando errores en tiempo de ejecución.

3. **Panel de Telemetría HTTP en Tiempo Real:**
   - Muestra el **código de estado HTTP** (ej. `200 OK`, `404`), **latencia en milisegundos (ms)**, cabecera **`Content-Type`**, la **URL consultada** y el total de registros en la base de datos de la API.

4. **Diseño Moderno & Responsivo con Tailwind CSS:**
   - Interfaz en modo oscuro estilo *Glassmorphism*.
   - Grid adaptable (móvil, tablet, escritorio).
   - Indicadores de estado visuales animados (verde = Vivo, rojo = Muerto, gris = Desconocido).

5. **Búsqueda, Filtros y Paginación:**
   - Búsqueda en tiempo real por nombre de personaje.
   - Filtros por estado (*Alive*, *Dead*, *unknown*).
   - Filtro por género (*Female*, *Male*, *Genderless*, *unknown*).
   - Paginación interactiva (anterior, siguiente, indicador de páginas).

6. **Modal de Detalle & Inspector JSON:**
   - Ficha técnica completa de cada personaje (planeta de origen, ubicación actual, episodios en los que participa).
   - Pestaña para inspeccionar y copiar la respuesta JSON cruda devuelta por el servidor.
   - Pestaña con guía técnica y ejemplos de código.

---

## 📁 Estructura del Proyecto

```text
Consumo API/
├── index.html               # Estructura del portal y vistas (Galería, JSON, Guía)
├── vite.config.ts           # Configuración de Vite con plugin Tailwind CSS
├── tsconfig.json            # Configuración de TypeScript
├── package.json             # Dependencias y scripts de ejecución
└── src/
    ├── types/
    │   └── character.ts     # Interfaces y modelos de datos tipados
    ├── services/
    │   └── api.ts           # Lógica aislada de consumo de la API (async/await y promesas)
    ├── style.css            # Estilos base y Tailwind CSS
    └── main.ts              # Controlador principal, eventos del DOM y renderizado
```

---

## 🛠️ Tecnologías Utilizadas

- **TypeScript (v6):** Tipado estático robusto sin frameworks invasivos.
- **Tailwind CSS (v4):** Sistema de utilidades para un diseño responsive y estilizado.
- **Vite:** Empaquetador y entorno de desarrollo ultra veloz.
- **Rick and Morty API:** Servicio web REST público (`https://rickandmortyapi.com/api`).

---

## 💻 Instrucciones de Ejecución

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Ejecutar el servidor local de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre la URL en tu navegador (usualmente `http://localhost:5173`).

3. **Generar compilación para producción:**
   ```bash
   npm run build
   ```

4. **Previsualizar la compilación:**
   ```bash
   npm run preview
   ```
