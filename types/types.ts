export const LANGUAGES = ['Arabic', 'English', 'Spanish', 'French', 'German', 'Italian', 'Japanese', 'Mandarin'] as const;
export type Language = typeof LANGUAGES[number];
