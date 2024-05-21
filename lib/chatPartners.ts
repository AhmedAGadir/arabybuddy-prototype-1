// paid prompts: https://promptbase.com/account?view=purchases
// discord server: https://discord.com/channels/1084334773369045104/1084334773851406428

import { ARABIC_DIALECTS, ArabicDialect } from "@/types/types";

const prompts: { id: string; prompt: string }[] = [
	{
		id: "layla",
		prompt:
			"A high-quality portrait illustration of a friendly female Egyptian university student with glasses on a lively background, in the style of simple 90s anime, anime art, colored anime drawings, arabian features, arab skin tone, front-facing, looking directly at camera, 8K anime drawings, stunning anime aesthetic art, beautiful anime character drawings, precision, eye-catching anime artworks, visually appealing anime characters, and captivating anime-inspired characters, created by a professional --v 5.2 --style raw",
	},
	{
		id: "mustafa",
		prompt:
			"A high-quality portrait illustration of a professional early-30's bearded Arab man in a blue shirt, job interviewer, office background in the style of simple 90s anime, anime art, colored anime drawings, Arabian features, Arab skin tone, front-facing, looking directly at camera, 8K anime drawings, stunning anime aesthetic art, beautiful anime character drawings, precision, eye-catching anime artworks, visually appealing anime characters, and captivating anime-inspired characters, created by a professional --v 5.2 --style raw",
	},
	{
		id: "abu-khalid",
		prompt:
			"A high-quality portrait illustration of a renowned male arab chef with an apron, middle-aged, overweight, hairy forearms on a lively kitchen background, in the style of simple 90s anime, anime art, colored anime drawings, Arabian features, Arab skin tone, front-facing, looking directly at camera, 8K anime drawings, stunning anime aesthetic art, beautiful anime character drawings, precision, eye-catching anime artworks, visually appealing anime characters, and captivating anime-inspired characters, created by a professional --v 5.2 --style raw",
	},
	{
		id: "youssef",
		prompt:
			"A high-quality portrait illustration of a youthful brown-skinned sudanese arab male travel blogger, medium-length curly hair, light beard, casual shirt, camera strap, Moroccan architecture lively background, in the style of simple 90s anime, anime art, colored anime drawings, Arabian features, Arab skin tone, front-facing, looking directly at camera, 8K anime drawings, stunning anime aesthetic art, beautiful anime character drawings, precision, eye-catching anime artworks, visually appealing anime characters, and captivating anime-inspired characters, created by a professional --v 5.2 --style raw",
	},
	{
		id: "noura",
		prompt:
			"A high-quality portrait illustration of a passionate, female, late-20's, dark-skinned kenyan environmental activist, wearing a hijab, with determined eyes and a warm smile, wearing a green blouse, urban buildings in lively background, in the style of simple 90s anime, anime art, colored anime drawings, arabian features,, front-facing, looking directly at camera, 8K anime drawings, stunning anime aesthetic art, beautiful anime character drawings, precision, eye-catching anime artworks, visually appealing anime characters, and captivating anime-inspired characters, created by a professional --v 5.2 --style raw",
	},
	{
		id: "fatima",
		prompt:
			"A high-quality portrait illustration of an intelligent, female, in her 50s, Yemeni math teacher, brown-skinned, thick eyebrows, middle-aged, overweight, large nose, wise eyes, strict-looking, discerning, wearing a traditional hijab and modest clothing, classroom setting in the background, in the style of simple 90s anime, colored anime drawings, front-facing, looking directly at camera, 8K anime drawings, stunning anime aesthetic art, precision, eye-catching anime artworks, created by a professional --v 5.2 --style raw",
	},
	{
		id: "sofia",
		prompt:
			"A high-quality portrait illustration of a passionate, female, early-30's, Moroccan athlete from Casablanca, with a fit physique, determined eyes, and a confident smile, wearing athletic gear, track and field stadium in the background, in the style of simple 90s anime, anime art, colored anime drawings, Moroccan features, front-facing, looking directly at camera, 8K anime drawings, stunning anime aesthetic art, beautiful anime character drawings, precision, eye-catching anime artworks, created by a professional --v 5.2 --style raw",
	},
	{
		id: "juha",
		prompt:
			"A high-quality portrait illustration of middle-aged turkish man, mischievous grin, fool, goofy, long grey beard, traditional 9th century abassid attire, turkish turban, playful yet thoughtful expression, Middle Eastern background with oversized teapot, in the style of simple 90s anime, anime art, colored anime drawings, turkish features, turkish skin tone, front-facing, looking directly at camera, 8K anime drawings, stunning anime aesthetic art, beautiful anime character drawings, precision, eye-catching anime artworks, visually appealing anime characters, and captivating anime-inspired characters, created by a professional --v 5.2 --style raw",
	},
];

export const chatPartners: {
	id: string;
	name: string;
	role: string;
	background: string;
	conversationTopics: string[];
	image: string;
	dialects: ArabicDialect[];
	location?: [string, string, string];
}[] = [
	{
		id: "layla",
		name: "Layla",
		role: "University Student",
		background:
			"Layla is a friendly and energetic university student from Cairo, Egypt. She studies history and is passionate about Egyptian culture and arts.",
		conversationTopics: [
			"Campus life",
			"Egyptian history",
			"Popular tourist sites in Cairo",
			"Current events in the education sector",
			"Music and movies",
		],
		image: "/assets/chat-partners/student-female.png",
		dialects: ["Modern Standard Arabic", "Egyptian"],
		location: ["Cairo", "EGY", "Egypt"],
	},
	{
		id: "mustafa",
		name: "Mustafa",
		role: "Job Interviewer",
		background:
			"Mustafa is a seasoned HR professional from Riyadh, Saudi Arabia. He specializes in recruitment and has vast experience in conducting interviews across various industries.",
		conversationTopics: [
			"Mock interviews",
			"Resume building",
			"Career development",
			"Workplace culture",
			"Job interview tips",
		],
		image: "/assets/chat-partners/professional-male.png",
		dialects: ["Modern Standard Arabic", "Gulf"],
		location: ["Riyadh", "SAU", "Saudi Arabia"],
	},
	{
		id: "abu-khalid",
		name: "Abu Khalid",
		role: "Chef",
		background:
			"Khalid is a renowned chef from Basra, Iraq, who specializes in Mediterranean cuisine. He runs a popular restaurant and cooking school.",
		conversationTopics: [
			"Names of foods and ingredients",
			"Middle-Eastern cuisine",
			"Recipe exchange",
			"Cooking techniques",
			"Importance of food in cultural identity",
		],
		image: "/assets/chat-partners/chef-male.png",
		dialects: ["Modern Standard Arabic", "Iraqi"],
		location: ["Basra", "IRQ", "Iraq"],
	},
	{
		id: "fatima",
		name: "Fatima",
		role: "Math Teacher",
		background:
			"Fatima is a dedicated math teacher from Sana'a, Yemen, in her 50s. She is passionate about making math accessible and enjoyable for her students. With years of experience, Fatima helps learners understand mathematical concepts and develop strong problem-solving skills.",
		conversationTopics: [
			"Counting and numbers",
			"Days of the week and months",
			"Telling time",
			"Arithmetic and geometry",
		],
		image: "/assets/chat-partners/teacher-female.png",
		dialects: ["Modern Standard Arabic", "Yemeni"],
		location: ["Sana'a", "YEM", "Yemen"],
	},
	{
		id: "youssef",
		name: "Youssef",
		role: "Travel Blogger",
		background:
			"Youssef is a travel blogger from Khartoum, Sudan, who explores different countries and shares his experiences through his popular blog and social media.",
		conversationTopics: [
			"Travel tips",
			"Cultural experiences",
			"Must-visit places in the Arab world",
			"Storytelling from his travels",
			"Asking for directions",
		],
		image: "/assets/chat-partners/traveler-male.png",
		dialects: ["Modern Standard Arabic", "Sudanese"],
		location: ["Khartoum", "SDN", "Sudan"],
	},
	{
		id: "sofia",
		name: "Sofia",
		role: "Athlete",
		background:
			"Sofia is a spirited athlete from Casablanca, Morocco, in her 20s. She competes in track and field and is a strong advocate for sports and fitness. Sofia enjoys sharing her knowledge about physical health and the benefits of an active lifestyle.",
		conversationTopics: [
			"names of body parts",
			"Sports & fitness",
			"exercise routines",
			"healthy eating habits",
			"competitive events",
		],
		image: "/assets/chat-partners/athlete-female.png",
		dialects: ["Modern Standard Arabic", "Maghrebi"],
		location: ["Casablanca", "MAR", "Morocco"],
	},
	{
		id: "noura",
		name: "Noura",
		role: "Environmental Activist",
		background:
			"Noura is an environmental activist from Amman, Jordan. She has a fiery passion for justice and her enthusiasm is infectious. She works with various NGOs to promote sustainability and environmental awareness.",
		conversationTopics: [
			"Sustainability projects",
			"Eco-friendly living",
			"Activism",
			"Climate change",
		],
		image: "/assets/chat-partners/activist-female.png",
		dialects: ["Modern Standard Arabic", "Levantine"],
		location: ["Amman", "JOR", "Jordan"],
	},
	{
		id: "juha",
		name: "Juha",
		role: "Wise Fool",
		background:
			"Juha is a legendary character from Arabic folklore, known for his wit and often paradoxical wisdom. Often appearing in humorous tales that carry deeper moral lessons, Juha's stories are an integral part of Middle Eastern culture. He dresses in traditional clothing, reflecting his historical roots.",
		conversationTopics: [
			"Folk tales",
			"Arabic proverbs",
			"Life lessons",
			"Comedic anecdotes",
			"Philosophical questions framed humorously",
		],
		image: "/assets/chat-partners/juha.png",
		dialects: ["Modern Standard Arabic"],
		location: ["Here, there, and everywhere", "", ""],
	},
	{
		id: "arabybuddy",
		name: "ArabyBuddy",
		role: "AI Language Learning Companion",
		background:
			"ArabyBuddy is an AI language learning companion designed to help you improve your Arabic language skills. Whether you're a beginner or an advanced learner, ArabyBuddy is here to assist you in your language learning journey.",
		conversationTopics: [
			"Arabic language learning tips",
			"vocabulary building",
			"grammar explanations",
			"cultural insights",
			"practice conversations",
		],
		image: "/assets/arabybuddy.png",
		dialects: [...ARABIC_DIALECTS],
	},
];

// athletes, artists, musicians, writers, scientists, doctors, teachers, students, chefs, travelers, environmental activists, tech entrepreneurs, historians, merchants, talking dog, anime villain

// kid, arabybuddy AI

// parked:

// {
// 	name: "Ammar",
// 	role: "Tech Entrepreneur",
// 	background:
// 		"Ammar is a tech-savvy entrepreneur from Dubai, UAE. He runs a successful startup and loves to discuss technology, innovation, and business trends.",
// 	conversationTopics: [
// 		"Startups in the Middle East",
// 		"technological advancements",
// 		"entrepreneurship",
// 		"future tech trends",
// 	],
// },

// {
// 	name: "Ahmed",
// 	role: "Retired Historian",
// 	background:
// 		"Ahmed is a retired historian from Damascus, Syria. He has a deep knowledge of Middle Eastern history and enjoys sharing stories from the past.",
// 	conversationTopics: [
// 		"Historical events",
// 		"cultural heritage of Syria",
// 		"ancient civilizations",
// 		"importance of preserving history",
// 	],
// },
// {
// 	name: "Jamil",
// 	role: "Merchant",
// 	background:
// 		"Jamil is a charismatic merchant in the bustling souk of Fez, Morocco. He sells traditional crafts and loves to share stories about the origins of his goods.",
// 	conversationTopics: [
// 		"Trading in the souk",
// 		"Moroccan crafts",
// 		"bargaining techniques",
// 		"daily life in Fez",
// 	],
// },
// {
// 	name: "Barky",
// 	role: "Talking Dog (Funny)",
// 	background:
// 		"Barky is a humorous talking dog character who loves jokes and brings light-hearted fun to language learning.",
// 	conversationTopics: [
// 		"Animal jokes",
// 		"everyday humor",
// 		"funny stories",
// 		"light-hearted chat",
// 	],
// },
// {
// 	name: "Kuro",
// 	role: "Anime Villain",
// 	background:
// 		"Kuro is a cunning and powerful anime villain from a popular series, known for his strategic mind and mysterious aura.",
// 	conversationTopics: [
// 		"Villainous plots",
// 		"anime culture",
// 		"power and ambition",
// 		"conflicts and resolutions",
// 	],
// },
