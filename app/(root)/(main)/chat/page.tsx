"use client";

import SupportCard from "@/components/shared/SupportCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useConversations } from "@/hooks/useConversations";
import { useLogger } from "@/hooks/useLogger";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import {
	AdjustmentsHorizontalIcon,
	PencilSquareIcon,
	PlusIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useState } from "react";
import MoonLoader from "react-spinners/MoonLoader";

const ChatPage = () => {
	const logger = useLogger({ label: "ChatPage", color: "#fe7de9" });

	const { user } = useUser();

	const router = useRouter();

	const { toast } = useToast();

	const { createConversation } = useConversations();

	const [isCreating, setIsCreating] = useState(false);

	const newChatHandler = async () => {
		try {
			setIsCreating(true);
			const { _id } = await createConversation();
			setIsCreating(false);
			router.push(`/chat/${_id}`);
		} catch (error) {
			setIsCreating(false);
			logger.error(error);
			toast({
				title: "Error creating chat",
				description:
					"An error occurred while creating a new chat, please try again later.",
				className: "error-toast",
			});
		}
	};

	const preferencesHandler = () => {
		router.push("/preferences");
	};

	return (
		<div className="text-center flex-1 flex items-center justify-center relative">
			<div>
				<PencilSquareIcon
					className="mx-auto h-12 w-12 text-gray-400"
					aria-hidden="true"
				/>
				<h3 className="mt-4 mb-4 text-xl font-semibold text-gray-900">
					{`Hi ${user?.username ?? user?.firstName ?? ""} 👋`}
				</h3>
				<p className="mt-1 text-sm text-gray-500">
					Get started by creating a new chat.
				</p>
				<div className="mt-6 flex flex-col gap-4">
					<Button
						type="button"
						className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
						// className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-8 h-11 text-center me-2 mb-2 w-full md:w-fit"
						onClick={newChatHandler}
						disabled={isCreating}
					>
						{isCreating && <MoonLoader size={20} color="#fff" />}
						{!isCreating && (
							<>
								<PlusIcon
									className="-ml-0.5 mr-1.5 h-5 w-5"
									aria-hidden="true"
								/>
								New Chat
							</>
						)}
					</Button>
					<Button
						variant="outline"
						type="button"
						className={cn(
							"inline-flex items-center rounded-md  px-3 py-2 text-sm font-semibold shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 text-slate-600"
							// "bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600"
						)}
						onClick={preferencesHandler}
						disabled={isCreating}
						// className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-8 h-11 text-center me-2 mb-2 w-full md:w-fit"
					>
						<AdjustmentsHorizontalIcon
							className="-ml-0.5 mr-1.5 h-5 w-5"
							aria-hidden="true"
						/>
						Preferences
					</Button>
				</div>
			</div>
			<SupportCard className="absolute bottom-0 right-0" />
		</div>
	);
};

export default ChatPage;
