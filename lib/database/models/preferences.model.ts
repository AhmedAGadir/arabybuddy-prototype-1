import { ArabicDialect } from "@/types/languagesTypes";
import { Schema, model, models } from "mongoose";

export interface IPreferences {
	clerkId: string;
	arabic_dialect: ArabicDialect;
	assistant_language_level: "beginner" | "intermediate" | "native";
	assistant_gender: "young_male" | "young_female" | "old_male" | "old_female";
	assistant_tone: "casual" | "professional";
	assistant_detail_level: "low" | "medium" | "high";
	voice_stability: number;
	voice_similarity_boost: number;
	voice_style: number;
	voice_use_speaker_boost: boolean;
	user_interests: string[];
	user_personality_traits: string[];
}

export const DEFAULT_USER_PREFERENCES: Omit<IPreferences, "clerkId"> = {
	arabic_dialect: "Modern Standard Arabic",
	assistant_language_level: "intermediate",
	assistant_gender: "young_male",
	assistant_tone: "casual",
	assistant_detail_level: "medium",
	voice_stability: 0.5,
	voice_similarity_boost: 0.75,
	voice_style: 0,
	voice_use_speaker_boost: true,
	user_interests: [],
	user_personality_traits: [],
};

const PreferencesSchema = new Schema(
	{
		clerkId: {
			type: String,
			required: true,
			unique: true,
		},
		arabic_dialect: {
			type: String,
			required: true,
		},
		assistant_language_level: {
			type: String,
			required: true,
		},
		assistant_gender: {
			type: String,
			required: true,
		},
		assistant_tone: {
			type: String,
			required: true,
		},
		assistant_detail_level: {
			type: String,
			required: true,
		},
		voice_stability: {
			type: Number,
			required: true,
		},
		voice_similarity_boost: {
			type: Number,
			required: true,
		},
		voice_style: {
			type: Number,
			required: true,
		},
		voice_use_speaker_boost: {
			type: Boolean,
			required: true,
		},
		user_interests: {
			type: [String],
			required: true,
		},
		user_personality_traits: {
			type: [String],
			required: true,
		},
	},
	{
		timestamps: true,
		strict: false,
	}
);

const Preferences =
	models?.Preferences || model("Preferences", PreferencesSchema);

export default Preferences;
