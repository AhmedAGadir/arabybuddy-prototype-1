import React from "react";

import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	EnvelopeIcon,
	QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

const SupportCard = ({ className }: { className?: string }) => {
	return (
		<Popover>
			<PopoverTrigger asChild className={cn("py-6", className)}>
				<Button variant="link">
					<QuestionMarkCircleIcon className="h-7 w-7 text-gray-400 hover:text-gray-700" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80 mr-4">
				<div className="flex justify-between space-x-4">
					<EnvelopeIcon className="h-8 w-8" />
					<div className="space-y-1 text-left">
						<h4 className="text-sm font-semibold">support@gadirlabs.io</h4>
						<p className="text-sm">
							Contact us with your questions and feedback!
						</p>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
};

export default SupportCard;
