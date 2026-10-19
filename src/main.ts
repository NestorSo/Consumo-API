import './style.css';
import { getCharactersAsync, getCharactersPromises, getCharacterById, type FetchResult } from './services/api';
import type { Character, QueryFilters } from './types/character';

// ==========================================
// 1. Estado de la Aplicación (Directo y Limpio)
// ==========================================
const filters: QueryFilters = {
  page: 1,
  name: '',
  status: 'all',
  gender: 'all',
};

let fetchMode: 'async' | 'promises' = 'async';
let currentCharacters: Character[] = [];
let totalPages = 1;
let lastRawJson = '';

// ==========================================
// 2. Elementos del DOM
// ==========================================
// Filtros y Búsqueda
const searchInput = document.getElementById('searchInput') as HTMLInputElement;
const statusFilter = document.getElementById('statusFilter') as HTMLSelectElement;
const genderFilter = document.getElementById('genderFilter') as HTMLSelectElement;
const btnSearch = document.getElementById('btnSearch') as HTMLButtonElement;
const btnReset = document.getElementById('btnReset') as HTMLButtonElement;
const btnModeAsync = document.getElementById('btnModeAsync') as HTMLButtonElement;
const btnModePromises = document.getElementById('btnModePromises') as HTMLButtonElement;

// Métricas HTTP
const metricStatus = document.getElementById('metricStatus') as HTMLElement;
const metricLatency = document.getElementById('metricLatency') as HTMLElement;
const metricContentType = document.getElementById('metricContentType') as HTMLElement;
const metricTotalCount = document.getElementById('metricTotalCount') as HTMLElement;
const metricMethodBadge = document.getElementById('metricMethodBadge') as HTMLElement;
const metricUrlText = document.getElementById('metricUrlText') as HTMLElement;

// Contenedores de Estado y Galería
const charactersGrid = document.getElementById('charactersGrid') as HTMLElement;
const loadingState = document.getElementById('loadingState') as HTMLElement;
const errorState = document.getElementById('errorState') as HTMLElement;
const errorMessage = document.getElementById('errorMessage') as HTMLElement;
const resultsSummary = document.getElementById('resultsSummary') as HTMLElement;

// Paginación
const paginationInfo = document.getElementById('paginationInfo') as HTMLElement;
const btnPrevPage = document.getElementById('btnPrevPage') as HTMLButtonElement;
const btnNextPage = document.getElementById('btnNextPage') as HTMLButtonElement;
const currentPageBadge = document.getElementById('currentPageBadge') as HTMLElement;

// Pestañas e Inspector JSON
const tabBtns = document.querySelectorAll<HTMLButtonElement>('.tab-btn');
const tabPanes = document.querySelectorAll<HTMLElement>('.tab-pane');
const jsonOutput = document.getElementById('jsonOutput') as HTMLElement;
const btnCopyJson = document.getElementById('btnCopyJson') as HTMLButtonElement;

// Modal y Toast
const characterModal = document.getElementById('characterModal') as HTMLElement;
const btnCloseModal = document.getElementById('btnCloseModal') as HTMLButtonElement;
const modalContent = document.getElementById('modalContent') as HTMLElement;
const toast = document.getElementById('toast') as HTMLElement;
const toastMessage = document.getElementById('toastMessage') as HTMLElement;

// ==========================================
// 3. Helpers Visuales
// ==========================================
function getStatusBadge(status: Character['status']): { text: string; bgClass: string; dotClass: string } {
  switch (status) {
    case 'Alive':
      return {
        text: 'Alive',
        bgClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        dotClass: 'bg-emerald-500 shadow-emerald-500/50',
      };
    case 'Dead':
      return {
        text: 'Dead',
        bgClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        dotClass: 'bg-rose-500 shadow-rose-500/50',
      };
    default:
      return {
        text: 'Unknown',
        bgClass: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
        dotClass: 'bg-slate-400',
      };
  }
}

function showToast(message: string): void {
  toastMessage.textContent = message;
  toast.classList.remove('hidden');
  toast.classList.add('flex');

  setTimeout(() => {
    toast.classList.add('hidden');
    toast.classList.remove('flex');
  }, 2500);
}

// ==========================================
// 4. Renderizado Dinámico de Tarjetas
// ==========================================
function renderCharacters(characters: Character[]): void {
  charactersGrid.innerHTML = '';

  characters.forEach((char) => {
    const statusInfo = getStatusBadge(char.status);
    const card = document.createElement('article');
    card.className =
      'group rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 flex flex-col overflow-hidden';

    card.innerHTML = `
      <div class="relative overflow-hidden aspect-square bg-slate-950">
        <img
          src="${char.image}"
          alt="${char.name}"
          loading="lazy"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <!-- Badge de Estado Flotante -->
        <div class="absolute top-3 left-3 backdrop-blur-md px-2.5 py-1 rounded-full border text-[11px] font-semibold flex items-center gap-1.5 ${statusInfo.bgClass}">
          <span class="w-2 h-2 rounded-full ${statusInfo.dotClass} animate-pulse"></span>
          <span>${statusInfo.text}</span>
        </div>
        <div class="absolute bottom-2 right-2 backdrop-blur-md px-2 py-0.5 rounded-md bg-slate-950/70 text-slate-400 text-[10px] font-mono border border-slate-800">
          ID: #${char.id}
        </div>
      </div>

      <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h2 class="text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
            ${char.name}
          </h2>
          <p class="text-xs text-slate-400">
            ${char.species} • <span class="capitalize">${char.gender}</span>
          </p>
        </div>

        <div class="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
          <div>
            <span class="text-slate-500 text-[11px] block">Última ubicación conocida:</span>
            <span class="text-slate-300 font-medium truncate block">${char.location.name}</span>
          </div>
          <div>
            <span class="text-slate-500 text-[11px] block">Apariciones:</span>
            <span class="text-emerald-400/90 font-medium">${char.episode.length} episodio${char.episode.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <button
          data-id="${char.id}"
          class="btn-detail w-full mt-2 py-2 rounded-xl bg-slate-800/80 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 font-medium text-xs transition-colors border border-slate-700/80 hover:border-emerald-500 cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span>Ver ficha completa</span>
          <span class="material-icons text-xs leading-none">&#xe89e;</span>
        </button>
      </div>
    `;

    charactersGrid.appendChild(card);
  });

  // Asignar eventos de clic al botón de detalle
  const detailButtons = charactersGrid.querySelectorAll<HTMLButtonElement>('.btn-detail');
  detailButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const charId = Number(btn.getAttribute('data-id'));
      openCharacterModal(charId);
    });
  });
}

// ==========================================
// 5. Modal de Detalle
// ==========================================
async function openCharacterModal(id: number): Promise<void> {
  const localChar = currentCharacters.find((c) => c.id === id);
  const character = localChar || (await getCharacterById(id)).character;

  if (!character) {
    showToast('No se pudo cargar la información del personaje');
    return;
  }

  const statusInfo = getStatusBadge(character.status);

  modalContent.innerHTML = `
    <div class="relative bg-slate-950 flex flex-col sm:flex-row">
      <img
        src="${character.image}"
        alt="${character.name}"
        class="w-full sm:w-48 h-56 sm:h-auto object-cover"
      />
      <div class="p-5 flex-1 space-y-2">
        <div class="flex items-center gap-2">
          <span class="text-xs px-2.5 py-1 rounded-full border ${statusInfo.bgClass} flex items-center gap-1.5 font-semibold">
            <span class="w-2 h-2 rounded-full ${statusInfo.dotClass}"></span>
            ${statusInfo.text}
          </span>
          <span class="text-xs text-slate-500 font-mono">#${character.id}</span>
        </div>
        <h2 class="text-xl font-bold text-white tracking-tight">${character.name}</h2>
        <p class="text-xs text-slate-400">
          <span class="text-emerald-400 font-medium">${character.species}</span> ${character.type ? `(${character.type})` : ''} • ${character.gender}
        </p>
      </div>
    </div>

    <div class="p-6 space-y-4 text-xs">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <span class="text-slate-500 block text-[11px] mb-0.5">Planeta / Origen:</span>
          <span class="text-slate-200 font-medium">${character.origin.name}</span>
        </div>
        <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <span class="text-slate-500 block text-[11px] mb-0.5">Ubicación actual:</span>
          <span class="text-slate-200 font-medium">${character.location.name}</span>
        </div>
      </div>

      <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
        <span class="text-slate-500 block text-[11px]">Participación en la serie:</span>
        <p class="text-slate-300">
          Aparece en un total de <strong class="text-emerald-400">${character.episode.length}</strong> episodio(s) de Rick and Morty.
        </p>
      </div>

      <div class="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-500">
        <span>Creado en BD: ${new Date(character.created).toLocaleDateString()}</span>
        <a
          href="${character.url}"
          target="_blank"
          rel="noreferrer"
          class="text-emerald-400 hover:underline flex items-center gap-1.5"
        >
          <span>Ver Endpoint JSON</span>
          <span class="material-icons text-xs leading-none">&#xe89e;</span>
        </a>
      </div>
    </div>
  `;

  characterModal.classList.remove('hidden');
  characterModal.classList.add('flex');
}

function closeModal(): void {
  characterModal.classList.add('hidden');
  characterModal.classList.remove('flex');
}

// ==========================================
// 6. Carga Principal y Telemetría HTTP
// ==========================================
async function loadCharacters(): Promise<void> {
  // Mostrar estado de carga
  loadingState.classList.remove('hidden');
  errorState.classList.add('hidden');
  charactersGrid.classList.add('hidden');

  resultsSummary.textContent = 'Consultando servicio web...';

  // Consumir con el mecanismo seleccionado
  let result: FetchResult;
  if (fetchMode === 'async') {
    result = await getCharactersAsync(filters);
  } else {
    result = await getCharactersPromises(filters);
  }

  // Ocultar spinner
  loadingState.classList.add('hidden');

  // Actualizar Panel de Telemetría HTTP
  metricStatus.textContent = `${result.metrics.status} ${result.metrics.statusText}`;
  metricStatus.className = `text-base font-bold font-mono mt-0.5 ${
    result.success ? 'text-emerald-400' : 'text-rose-400'
  }`;

  metricLatency.textContent = `${result.metrics.latencyMs} ms`;
  metricContentType.textContent = result.metrics.contentType.split(';')[0];
  metricMethodBadge.textContent = result.metrics.method;
  metricUrlText.textContent = result.metrics.url;

  // Actualizar Inspector JSON
  lastRawJson = result.rawJson;
  try {
    const parsed = JSON.parse(result.rawJson);
    jsonOutput.textContent = JSON.stringify(parsed, null, 2);
  } catch {
    jsonOutput.textContent = result.rawJson;
  }

  // Manejo de Respuesta
  if (result.success && result.data) {
    currentCharacters = result.data.results;
    totalPages = result.data.info.pages;
    const totalCount = result.data.info.count;

    metricTotalCount.textContent = totalCount.toString();
    resultsSummary.textContent = `Mostrando ${currentCharacters.length} de ${totalCount} personajes encontrados`;

    // Renderizar tarjetas
    charactersGrid.classList.remove('hidden');
    renderCharacters(currentCharacters);

    // Actualizar Paginación
    paginationInfo.textContent = `Página ${filters.page} de ${totalPages} (${totalCount} personajes)`;
    currentPageBadge.textContent = filters.page.toString();
    btnPrevPage.disabled = filters.page <= 1;
    btnNextPage.disabled = filters.page >= totalPages;
  } else {
    // Estado de Error
    currentCharacters = [];
    totalPages = 1;
    metricTotalCount.textContent = '0';
    resultsSummary.textContent = '0 resultados';

    errorMessage.textContent = result.error || 'No se encontraron personajes con los filtros aplicados';
    errorState.classList.remove('hidden');

    paginationInfo.textContent = 'Página 1 de 1 (0 resultados)';
    currentPageBadge.textContent = '1';
    btnPrevPage.disabled = true;
    btnNextPage.disabled = true;
  }
}

// ==========================================
// 7. Configuración de Event Listeners
// ==========================================

// Búsqueda y Filtros
btnSearch.addEventListener('click', () => {
  filters.page = 1;
  filters.name = searchInput.value.trim();
  filters.status = statusFilter.value;
  filters.gender = genderFilter.value;
  loadCharacters();
});

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    filters.page = 1;
    filters.name = searchInput.value.trim();
    filters.status = statusFilter.value;
    filters.gender = genderFilter.value;
    loadCharacters();
  }
});

statusFilter.addEventListener('change', () => {
  filters.page = 1;
  filters.status = statusFilter.value;
  loadCharacters();
});

genderFilter.addEventListener('change', () => {
  filters.page = 1;
  filters.gender = genderFilter.value;
  loadCharacters();
});

btnReset.addEventListener('click', () => {
  searchInput.value = '';
  statusFilter.value = 'all';
  genderFilter.value = 'all';
  filters.page = 1;
  filters.name = '';
  filters.status = 'all';
  filters.gender = 'all';
  loadCharacters();
});

// Selector de Mecanismo de Fetch (async/await vs .then)
btnModeAsync.addEventListener('click', () => {
  fetchMode = 'async';
  btnModeAsync.className =
    'px-3 py-1 rounded-md text-xs font-medium transition-all bg-emerald-500 text-slate-950 shadow-sm cursor-pointer';
  btnModePromises.className =
    'px-3 py-1 rounded-md text-xs font-medium text-slate-400 hover:text-slate-200 transition-all cursor-pointer';
  loadCharacters();
});

btnModePromises.addEventListener('click', () => {
  fetchMode = 'promises';
  btnModePromises.className =
    'px-3 py-1 rounded-md text-xs font-medium transition-all bg-indigo-500 text-white shadow-sm cursor-pointer';
  btnModeAsync.className =
    'px-3 py-1 rounded-md text-xs font-medium text-slate-400 hover:text-slate-200 transition-all cursor-pointer';
  loadCharacters();
});

// Paginación
btnPrevPage.addEventListener('click', () => {
  if (filters.page > 1) {
    filters.page--;
    loadCharacters();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

btnNextPage.addEventListener('click', () => {
  if (filters.page < totalPages) {
    filters.page++;
    loadCharacters();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

// Selector de Pestañas
tabBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const targetTab = btn.getAttribute('data-tab');

    tabBtns.forEach((b) => {
      b.className =
        'tab-btn px-4 py-2 rounded-xl text-sm font-medium transition-all text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 cursor-pointer';
    });
    tabPanes.forEach((p) => p.classList.add('hidden'));

    btn.className =
      'tab-btn px-4 py-2 rounded-xl text-sm font-medium transition-all bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-pointer';

    if (targetTab) {
      document.getElementById(targetTab)?.classList.remove('hidden');
    }
  });
});

// Copiar JSON
btnCopyJson.addEventListener('click', () => {
  if (!lastRawJson) return;
  navigator.clipboard.writeText(lastRawJson).then(() => {
    showToast('JSON copiado al portapapeles');
  });
});

// Modal Events
btnCloseModal.addEventListener('click', closeModal);
characterModal.addEventListener('click', (e) => {
  if (e.target === characterModal) {
    closeModal();
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !characterModal.classList.contains('hidden')) {
    closeModal();
  }
});

// ==========================================
// 8. Inicialización
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  loadCharacters();
});
