"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
	React.ElementRef<typeof SliderPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
	<TooltipProvider delayDuration={0}>
		<SliderPrimitive.Root
			ref={ref}
			className={cn(
				"relative flex w-full touch-none select-none items-center",
				className
			)}
			{...props}
		>
			<SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
				<SliderPrimitive.Range className="absolute h-full bg-indigo-600" />
			</SliderPrimitive.Track>
			<Tooltip>
				<TooltipTrigger asChild>
					<SliderPrimitive.Thumb className="cursor-pointer relative block h-5 w-5 rounded-full border-2 border-indigo-600 bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
				</TooltipTrigger>
				{props.value !== undefined && (
					<TooltipContent sideOffset={5}>
						<span>{Math.floor(props.value[0])}%</span>
					</TooltipContent>
				)}
			</Tooltip>
		</SliderPrimitive.Root>
	</TooltipProvider>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
