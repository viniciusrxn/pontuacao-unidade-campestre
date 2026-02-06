export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export const MAX_PHOTO_SIZE_MB = 5;
export const MAX_PHOTO_SIZE_BYTES = MAX_PHOTO_SIZE_MB * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export const PUNCTUALITY_MAX = 10;
export const MEMBERS_MAX = 12;

export const ARCHIVE_DEADLINE = '1900-01-01T00:00:00.000Z';

export const DIFFICULTY_LEVELS = {
  easy: { label: 'Facil', color: 'bg-blue-100 text-blue-800' },
  medium: { label: 'Medio', color: 'bg-green-100 text-green-800' },
  hard: { label: 'Dificil', color: 'bg-red-100 text-red-800' },
  very_hard: { label: 'Muito Dificil', color: 'bg-gray-100 text-gray-800' },
  legendary: { label: 'Lendario', color: 'bg-yellow-100 text-yellow-800' },
} as const;

export const TASK_CATEGORIES = {
  geral: { label: 'Geral' },
  estudo: { label: 'Estudo' },
  social: { label: 'Social' },
  espiritual: { label: 'Espiritual' },
  atividade: { label: 'Atividade' },
  missao: { label: 'Missao' },
  comunidade: { label: 'Comunidade' },
} as const;

export const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Facil (Azul)' },
  { value: 'medium', label: 'Medio (Verde)' },
  { value: 'hard', label: 'Dificil (Vermelho)' },
  { value: 'very_hard', label: 'Muito Dificil (Cinza)' },
  { value: 'legendary', label: 'Lendario (Amarelo)' },
] as const;

export const CATEGORY_OPTIONS = [
  { value: 'geral', label: 'Geral' },
  { value: 'estudo', label: 'Estudo' },
  { value: 'social', label: 'Social' },
  { value: 'espiritual', label: 'Espiritual' },
  { value: 'atividade', label: 'Atividade' },
  { value: 'missao', label: 'Missao' },
  { value: 'comunidade', label: 'Comunidade' },
] as const;
