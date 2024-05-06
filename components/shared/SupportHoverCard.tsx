import React from "react";

import { Button } from "@/components/ui/button";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
	EnvelopeIcon,
	QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

const SupportHoverCard = ({ className }: { className?: string }) => {
	return (
		<HoverCard>
			<HoverCardTrigger asChild className={cn("py-6", className)}>
				<Button variant="link">
					<QuestionMarkCircleIcon className="h-7 w-7 text-gray-400" />
				</Button>
			</HoverCardTrigger>
			<HoverCardContent className="w-80 mr-4">
				<div className="flex justify-between space-x-4">
					<EnvelopeIcon className="h-8 w-8" />
					<div className="space-y-1 text-left">
						<h4 className="text-sm font-semibold">support@arabybuddy.com</h4>
						<p className="text-sm">
							Contact us with your questions and feedback!
						</p>
					</div>
				</div>
			</HoverCardContent>
		</HoverCard>
	);
};

export default SupportHoverCard;
