export interface CharacterLocation {
  name: string;
  url: string;
}

export interface Character {
  id: number;
  name: string;
  status: 'Alive' | 'Dead' | 'unknown';
  species: string;
  type: string;
  gender: 'Female' | 'Male' | 'Genderless' | 'unknown';
  origin: CharacterLocation;
  location: CharacterLocation;
  image: string;
  episode: string[];
  url: string;
  created: string;
}

export interface ApiResponseInfo {
  count: number;
  pages: number;
  next: string | null;
  prev: string | null;
}

export interface ApiResponse {
  info: ApiResponseInfo;
  results: Character[];
}

export interface HttpMetrics {
  status: number;
  statusText: string;
  latencyMs: number;
  contentType: string;
  url: string;
  method: 'async/await' | 'Promises (.then)';
  timestamp: string;
}

export interface QueryFilters {
  page: number;
  name: string;
  status: string;
  gender: string;
}
