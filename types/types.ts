// export const NATIVE_LANGUAGES = [
// 	"English",
// 	"French",
// 	"German",
// 	"Italian",
// 	"Japanese",
// 	"Malay",
// 	"Mandarin",
// 	"Pashto",
// 	"Persian",
// 	"Russian",
// 	"Spanish",
// 	"Swahili",
// 	"Thai",
// 	"Turkish",
// 	"Urdu",
// 	"Uzbek",
// ] as const;

// export type NativeLanguage = (typeof NATIVE_LANGUAGES)[number];

export const ARABIC_DIALECTS = [
	"Modern Standard Arabic",
	"Egyptian",
	"Levantine",
	"Gulf",
	"Maghrebi",
	"Sudanese",
	"Iraqi",
	"Yemeni",
] as const;

export type ArabicDialect = (typeof ARABIC_DIALECTS)[number];

export const ARABIC_DIALECTS_SHORT: {
	[key in ArabicDialect]: string;
} = {
	"Modern Standard Arabic": "MSA",
	Egyptian: "EGY",
	Levantine: "LEV",
	Gulf: "GULF",
	Maghrebi: "MAR",
	Sudanese: "SDN",
	Iraqi: "IRQ",
	Yemeni: "YEM",
};

export const status = {
	IDLE: "IDLE",
	RECORDING: "RECORDING",
	PLAYING: "PLAYING",
	PROCESSING: "PROCESSING",
} as const;

export type Status = (typeof status)[keyof typeof status];
