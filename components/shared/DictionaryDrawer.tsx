import React from "react";
import {
	Drawer,
	DrawerContent,
	DrawerTitle,
	DrawerHeader,
	DrawerFooter,
} from "@/components/ui/drawer";

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

import { Button } from "@/components/ui/button";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ArrowTopRightOnSquareIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	InformationCircleIcon,
	SparklesIcon,
} from "@heroicons/react/24/outline";
import { cairo } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

const DictionaryDrawer = ({
	open,
	setOpen,
	words,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
	words: { word: string; id: string }[];
}) => {
	const searchParams = useSearchParams();
	const wordParam = searchParams.get("word");

	const wordInd = words.findIndex((w) => w.id === wordParam);

	const word = words[wordInd]?.word;

	return (
		<Drawer
			open={open}
			// open={true}
			onOpenChange={setOpen}
		>
			{/* <DrawerTrigger asChild>
				<Button variant="outline">Open Drawer</Button>
			</DrawerTrigger> */}
			<DrawerContent className="p-4 ">
				<div className="mx-auto w-full max-w-2xl ">
					<DrawerHeader>
						<DrawerTitle>Dictionary</DrawerTitle>
					</DrawerHeader>
					<div className="p-4 flex flex-col gap-8 items-center">
						<div className="flex items-center justify-center space-x-3 w-full">
							<div className="flex items-center  gap-10">
								{/* <Button
									variant="outline"
									className="h-12 w-12 shrink-0 rounded-full"
								>
									<span className="sr-only">previous word</span>
									<ChevronLeftIcon />
								</Button> */}
								<div className="flex-1 text-center">
									<div
										className={cn("text-4xl md:text-6xl m", cairo.className)}
									>
										{word && word}
									</div>
								</div>
								{/* <Button
									variant="outline"
									className="h-12 w-12 shrink-0 rounded-full"
								>
									<span className="sr-only">next word</span>
									<ChevronRightIcon />
								</Button> */}
							</div>
						</div>
						<div className="flex flex-col items-center gap-4 w-full">
							<div className="flex items-center gap-2 my-3">
								<Label
									htmlFor="monolingual_mode"
									className="text-sm font-medium leading-6 text-gray-900 flex items-center gap-1"
								>
									<span>Monolingual mode</span>
								</Label>
								<Switch
									id="monolingual_mode"
									checked={true}
									defaultChecked={true}
									onCheckedChange={() => {}}
								/>
								<TooltipProvider delayDuration={0}>
									<Tooltip>
										<TooltipTrigger>
											<InformationCircleIcon className="w-6 h-6 text-gray-400 hover:text-gray-700" />
										</TooltipTrigger>
										<TooltipContent>
											<div className="max-w-sm">
												When monolingual mode is enabled, the dictionary will
												only show definitions in Arabic.
											</div>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
							<Card className="w-full px-6 py-4">
								<CardContent className={cn("min-h-48 p-0", cairo.className)}>
									{/* The word "شخصية" in Arabic generally translates to "character"
									in English. This term can refer to: Character (Personality
									Trait): Describing an individual's set of characteristics or
									qualities that distinguishes them from others. Character
									(Fictional/Real Person): A person in a story or a narrative,
									or an individual in real life. In the context of your message,
									"شخصية" refers to a character in a narrative sense. The person
									described in the message is evidently a character from a story
									(likely a fictional one, given the mention of battles with
									Naruto), and the word is used to highlight his unique and
									complex attributes and the impact he has within his narrative
									world. */}
								</CardContent>
							</Card>
							<Button
								// variant="outline"
								size="lg"
								//  className="gap-2 w-full"
								className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800  w-full gap-2"
								disabled={!word}
							>
								<span>Generate definition</span>
								<SparklesIcon className="w-6 h-6" />
							</Button>
							<Button size="lg" className="gap-2 w-full" disabled={!word}>
								<span>Search al-maany.com</span>
								<ArrowTopRightOnSquareIcon className="w-6 h-6" />
							</Button>
						</div>
					</div>
				</div>
			</DrawerContent>
			<DrawerFooter />
		</Drawer>
	);
};

export { DictionaryDrawer };
