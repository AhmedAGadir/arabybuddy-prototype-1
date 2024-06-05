import { cn } from "@/lib/utils";
import { ARABIC_DIALECTS_SHORT, ArabicDialect } from "@/types/types";

export const dialectColors: {
	[key in ArabicDialect]: [string, string];
} = {
	"Modern Standard Arabic": ["bg-blue-100", "text-blue-700"],
	Egyptian: ["bg-yellow-100", "text-yellow-800"],
	Levantine: ["bg-green-100", "text-green-700"],
	Gulf: ["bg-red-100", "text-red-700"],
	Maghrebi: ["bg-indigo-100", "text-indigo-700"],
	Sudanese: ["bg-purple-100", "text-purple-700"],
	Iraqi: ["bg-pink-100", "text-pink-700"],
	Yemeni: ["bg-gray-100", "text-gray-700"],
};

export const DialectBadge = ({
	dialect,
	className,
	shorten,
}: {
	dialect: ArabicDialect;
	className?: string;
	shorten?: boolean;
}) => {
	const [bg, text] = dialectColors[dialect];
	return (
		<span
			className={cn(
				"inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-nowrap",
				bg,
				text,
				className
			)}
		>
			{shorten ? ARABIC_DIALECTS_SHORT[dialect] : dialect}
		</span>
	);
};
