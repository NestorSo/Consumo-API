import type { ApiResponse, Character, HttpMetrics, QueryFilters } from '../types/character';

const BASE_URL = 'https://rickandmortyapi.com/api';

export interface FetchResult {
  success: boolean;
  data?: ApiResponse;
  metrics: HttpMetrics;
  rawJson: string;
  error?: string;
}

/**
 * Construye la URL con parámetros de búsqueda opcionales
 */
function buildCharacterUrl(filters: Partial<QueryFilters>): string {
  const url = new URL(`${BASE_URL}/character`);
  
  if (filters.page && filters.page > 1) {
    url.searchParams.set('page', filters.page.toString());
  }
  if (filters.name && filters.name.trim() !== '') {
    url.searchParams.set('name', filters.name.trim());
  }
  if (filters.status && filters.status !== 'all') {
    url.searchParams.set('status', filters.status);
  }
  if (filters.gender && filters.gender !== 'all') {
    url.searchParams.set('gender', filters.gender);
  }

  return url.toString();
}

/**
 * 1. Consumo asíncrono con async / await (Sintaxis moderna)
 */
export async function getCharactersAsync(filters: Partial<QueryFilters> = {}): Promise<FetchResult> {
  const requestUrl = buildCharacterUrl(filters);
  const startTime = performance.now();

  try {
    const response = await fetch(requestUrl);
    const endTime = performance.now();
    const latencyMs = Math.round(endTime - startTime);

    const contentType = response.headers.get('content-type') || 'application/json';
    const jsonText = await response.text();
    const data = JSON.parse(jsonText);

    const metrics: HttpMetrics = {
      status: response.status,
      statusText: response.statusText || (response.ok ? 'OK' : 'Error'),
      latencyMs,
      contentType,
      url: requestUrl,
      method: 'async/await',
      timestamp: new Date().toLocaleTimeString(),
    };

    if (!response.ok) {
      return {
        success: false,
        metrics,
        rawJson: jsonText,
        error: data.error || `HTTP ${response.status}: No se encontraron resultados`,
      };
    }

    return {
      success: true,
      data: data as ApiResponse,
      metrics,
      rawJson: jsonText,
    };
  } catch (err: unknown) {
    const latencyMs = Math.round(performance.now() - startTime);
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido al conectar con la API';

    return {
      success: false,
      metrics: {
        status: 0,
        statusText: 'Network / CORS Error',
        latencyMs,
        contentType: 'unknown',
        url: requestUrl,
        method: 'async/await',
        timestamp: new Date().toLocaleTimeString(),
      },
      rawJson: JSON.stringify({ error: errorMessage }, null, 2),
      error: errorMessage,
    };
  }
}

/**
 * 2. Consumo alternativo mediante Promesas (.then / .catch)
 * Mecanismo pedagógico abordado en la sesión de clase
 */
export function getCharactersPromises(filters: Partial<QueryFilters> = {}): Promise<FetchResult> {
  const requestUrl = buildCharacterUrl(filters);
  const startTime = performance.now();

  return fetch(requestUrl)
    .then(async (response) => {
      const endTime = performance.now();
      const latencyMs = Math.round(endTime - startTime);
      const contentType = response.headers.get('content-type') || 'application/json';
      const jsonText = await response.text();
      const data = JSON.parse(jsonText);

      const metrics: HttpMetrics = {
        status: response.status,
        statusText: response.statusText || (response.ok ? 'OK' : 'Error'),
        latencyMs,
        contentType,
        url: requestUrl,
        method: 'Promises (.then)',
        timestamp: new Date().toLocaleTimeString(),
      };

      if (!response.ok) {
        return {
          success: false,
          metrics,
          rawJson: jsonText,
          error: data.error || `HTTP ${response.status}: Error en la solicitud`,
        };
      }

      return {
        success: true,
        data: data as ApiResponse,
        metrics,
        rawJson: jsonText,
      };
    })
    .catch((err: Error) => {
      const latencyMs = Math.round(performance.now() - startTime);
      return {
        success: false,
        metrics: {
          status: 0,
          statusText: 'Network Error',
          latencyMs,
          contentType: 'unknown',
          url: requestUrl,
          method: 'Promises (.then)',
          timestamp: new Date().toLocaleTimeString(),
        },
        rawJson: JSON.stringify({ error: err.message }, null, 2),
        error: err.message,
      };
    });
}

/**
 * Obtener información de un personaje individual por su ID
 */
export async function getCharacterById(id: number): Promise<{ character?: Character; error?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/character/${id}`);
    if (!res.ok) {
      throw new Error(`Error al obtener personaje ${id}`);
    }
    const data: Character = await res.json();
    return { character: data };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Error inesperado' };
  }
}
