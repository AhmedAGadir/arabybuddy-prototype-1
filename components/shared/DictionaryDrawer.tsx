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
import { Skeleton } from "@/components/ui/skeleton";
import {
	ArrowTopRightOnSquareIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	InformationCircleIcon,
	SparklesIcon,
} from "@heroicons/react/24/outline";
import MoonLoader from "react-spinners/MoonLoader";
import SyncLoader from "react-spinners/SyncLoader";

import { cairo } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useChatService } from "@/hooks/useChatService";
import { useToast } from "@/components/ui/use-toast";
import { completionMode } from "@/lib/api/assistant";
import { useLogger } from "@/hooks/useLogger";
import { ToastAction } from "@radix-ui/react-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const DictionaryDrawer = ({
	open,
	setOpen,
	words,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
	words: { word: string; id: string }[];
}) => {
	const logger = useLogger({ label: "DictionaryDrawer", color: "#ff9662" });

	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const wordIndParam = searchParams.get("wordInd");

	const wordInd = wordIndParam ? parseInt(wordIndParam) : null;

	const wordData = wordInd !== null ? words[wordInd] : null;

	const word = wordData?.word;

	// some state for monolingual mode, initialized from local storage,
	const [monolingualMode, setMonolingualMode] = React.useState(
		localStorage?.getItem("monolingualMode") === "true" || false
	);

	const toggleMonolingualMode = () => {
		setMonolingualMode((prev) => {
			localStorage?.setItem("monolingualMode", String(!prev));
			return !prev;
		});
	};

	const { makeChatCompletionStream, abortMakeChatCompletionStream } =
		useChatService();

	// {
	// 	word: "موقع",
	// 	definitions: ["Website", "Location"],
	// 	context:
	// 		"In the provided context, the word 'موقع' refers to a 'website' within the framework of a programming project discussion. It specifically pertains to a digital presence or platform where various types of content or services are hosted and can be accessed via the internet.",
	// }

	const { toast } = useToast();

	const queryClient = useQueryClient();

	const queryKey = ["dictionary", word, monolingualMode];

	const { data: definition } = useQuery({
		queryKey,
		queryFn: async () => {
			const data: {
				word: string;
				definitions: string[];
				context: string;
				monolingual: boolean;
			} | null = queryClient.getQueryData(queryKey) || null;

			return data;
		},
		enabled: !!word,
	});

	const generateDefinitionMutation = useMutation({
		mutationFn: async () => {
			const completionStream = await makeChatCompletionStream(
				[
					{
						role: "user",
						content: JSON.stringify({
							word,
							context: words.map((w) => w.word).join(" "),
							monolingual: monolingualMode,
						}),
					},
				],
				{
					mode: completionMode.DICTIONARY,
				}
			);

			let completionContent = "";

			for await (const data of completionStream) {
				completionContent = data.content;
			}

			const completion = JSON.parse(completionContent);

			return {
				...completion,
				monolingual: monolingualMode,
			};
		},
		onSuccess: (data) => {
			queryClient.setQueryData(queryKey, data);
			return data;
		},
		onError: (error) => {
			toast({
				title: "Error generating definition",
				description: "An error occurred while generating the definition",
				action: (
					<ToastAction altText="Try again">
						<Button variant="outline" onClick={generateDefinition}>
							Try again
						</Button>
					</ToastAction>
				),
				className: "error-toast",
				duration: Infinity,
			});
		},
	});

	const isPending = generateDefinitionMutation.isPending;

	const generateDefinition = async () => {
		await generateDefinitionMutation.mutate();
	};

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

	const wordDisplayAndPaginationContent = (
		<div className="flex items-center justify-center space-x-3 w-full">
			<div className="flex items-center w-full gap-10">
				<Button
					variant="outline"
					className="h-12 w-12 shrink-0 rounded-full"
					onClick={viewNextWord}
					disabled={wordInd === words.length - 1}
				>
					<span className="sr-only">next word</span>
					<ChevronLeftIcon className="w-5 h-5" />
				</Button>
				<div className="flex-1 text-center">
					<div className={cn("text-4xl md:text-6xl m", cairo.className)}>
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
					<ChevronRightIcon className="w-5 h-5" />
				</Button>
			</div>
		</div>
	);

	const skeletonContent = (
		<div className="space-y-4">
			<div className="space-y-3">
				<Skeleton className="h-4 w-[75px] bg-slate-200" />
				<div className="flex items-center gap-2 w-fit">
					<Skeleton className="h-3 w-3 rounded-full bg-slate-200" />
					<Skeleton className="h-4 w-[150px] bg-slate-200" />
				</div>
				<div className="flex items-center gap-2 w-fit">
					<Skeleton className="h-3 w-3 rounded-full bg-slate-200" />
					<Skeleton className="h-4 w-[150px] bg-slate-200" />
				</div>
			</div>

			<div className="space-y-3">
				<Skeleton className="h-4 w-[75px] bg-slate-200" />
				<Skeleton className="h-4 w-full bg-slate-200" />
				<Skeleton className="h-4 w-full bg-slate-200" />
				<Skeleton className="h-4 w-full bg-slate-200" />
			</div>
		</div>
	);

	const definitionContent = (isPending ||
		(definition && definition.monolingual === monolingualMode)) && (
		<Card className="w-full px-6 py-4">
			<CardContent
				className={cn(
					"max-h-64 overflow-y-scroll p-0 leading-loose",
					cairo.className
				)}
				style={{ direction: monolingualMode ? "rtl" : "ltr" }}
			>
				{isPending && skeletonContent}
				{!isPending && definition && (
					<div className="space-y-4">
						<div className="space-y-2">
							<div className="text-md text-slate-500">
								{monolingualMode ? "المعاني" : "Meanings"}
							</div>

							<div className="text-lg font-semibold">
								<ul className="max-w-md space-y-1 list-disc list-inside ">
									{definition.definitions.map((def) => (
										<li key={def}>{def}</li>
									))}
								</ul>
							</div>
						</div>
						<div className="space-y-2">
							<div className="text-md text-slate-500">
								{monolingualMode ? "السياق" : "Context"}
							</div>
							<div className="text-lg font-semibold">{definition.context}</div>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);

	const monolingualToggleContent = (
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
				disabled={isPending}
			/>
			<TooltipProvider delayDuration={0}>
				<Tooltip>
					<TooltipTrigger>
						<InformationCircleIcon className="w-6 h-6 text-gray-400 hover:text-gray-700" />
					</TooltipTrigger>
					<TooltipContent>
						<div className="max-w-sm">
							When monolingual mode is enabled, the dictionary will only show
							definitions in Arabic.
						</div>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</div>
	);

	return (
		<Drawer open={true} onOpenChange={setOpen}>
			{/* <DrawerTrigger asChild>
				<Button variant="outline">Open Drawer</Button>
			</DrawerTrigger> */}
			<DrawerContent className="p-4 ">
				<div className="mx-auto w-full max-w-2xl ">
					<DrawerHeader>
						<DrawerTitle>Dictionary</DrawerTitle>
					</DrawerHeader>
					<div className="p-4 flex flex-col gap-8 items-center">
						{wordDisplayAndPaginationContent}
						<div className="flex flex-col items-center gap-4 w-full">
							{monolingualToggleContent}
							{definitionContent}
							<Button
								size="lg"
								className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800  w-full px-8 gap-2"
								disabled={!word || isPending}
								onClick={generateDefinition}
							>
								{!isPending && (
									<>
										<span>Generate definition</span>
										<SparklesIcon className="w-6 h-6" />
									</>
								)}
								{isPending && <MoonLoader size={20} color="#fff" />}
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
