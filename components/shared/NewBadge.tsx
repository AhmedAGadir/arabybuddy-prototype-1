import { cn } from "@/lib/utils";

const NewBadge = ({ className }: { className?: string }) => (
	<span
		className={cn(
			"inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20",
			className
		)}
	>
		New
	</span>
);

export { NewBadge };
