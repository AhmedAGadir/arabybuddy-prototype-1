import React, { useCallback } from "react";
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
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const DictionaryDrawer = ({
	open,
	setOpen,
	words,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
	words: { word: string; id: string }[];
}) => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const wordIndParam = searchParams.get("wordInd");

	const wordInd = wordIndParam ? parseInt(wordIndParam) : null;

	const word = wordInd !== null ? words[wordInd]?.word : null;

	const updateQueryStr = useCallback(
		(name: string, value: string) => {
			const params = new URLSearchParams(searchParams.toString());
			params.set(name, value);

			router.replace(pathname + "?" + params.toString());
		},
		[pathname, router, searchParams]
	);

	const viewPreviousWord = () => {
		if (wordInd !== null && wordInd > 0) {
			updateQueryStr("wordInd", String(wordInd - 1));
		}
	};

	const viewNextWord = () => {
		if (wordInd !== null && wordInd < words.length - 1) {
			updateQueryStr("wordInd", String(wordInd + 1));
		}
	};

	// some state for monolingual mode, initialized from local storage,
	const [monolingualMode, setMonolingualMode] = React.useState(
		localStorage.getItem("monolingualMode") === "true"
	);

	const toggleMonolingualMode = () => {
		setMonolingualMode((prev) => {
			localStorage.setItem("monolingualMode", String(!prev));
			return !prev;
		});
	};

	return (
		<Drawer open={open} onOpenChange={setOpen}>
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
							<div className="flex items-center w-full gap-10">
								<Button
									variant="outline"
									className="h-12 w-12 shrink-0 rounded-full"
									onClick={viewNextWord}
									disabled={wordInd === words.length - 1}
								>
									<span className="sr-only">next word</span>
									<ChevronLeftIcon />
								</Button>
								<div className="flex-1 text-center">
									<div
										className={cn("text-4xl md:text-6xl m", cairo.className)}
									>
										{word && word}
									</div>
								</div>
								<Button
									variant="outline"
									className="h-12 w-12 shrink-0 rounded-full"
									onClick={viewPreviousWord}
									disabled={wordInd === 0}
								>
									<span className="sr-only">previous word</span>
									<ChevronRightIcon />
								</Button>
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
									checked={monolingualMode}
									onCheckedChange={toggleMonolingualMode}
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
							<Button size="lg" className="w-full" disabled={!word}>
								<a
									href={`https://www.almaany.com/ar/dict/${
										monolingualMode ? "ar-ar" : "ar-en"
									}/${word}/`}
									target="_blank"
									rel="noreferrer"
									className="flex justify-center items-center w-full h-full"
								>
									<span className="flex items-center gap-2">
										<span>Search al-maany.com</span>
										<ArrowTopRightOnSquareIcon className="w-6 h-6" />
									</span>
								</a>
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
