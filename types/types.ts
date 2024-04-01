export const LANGUAGES = ['Arabic', 'English', 'Spanish', 'French', 'German', 'Italian'] as const;
export type Language = typeof LANGUAGES[number];
