"use client";

import { Button } from "@/components/ui/button";
import { useConversations } from "@/hooks/useConversations";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import {
	AdjustmentsHorizontalIcon,
	PencilSquareIcon,
	PlusIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

const ChatPage = () => {
	const { user } = useUser();

	const router = useRouter();

	const newChatHandler = async () => {
		const { _id } = await createConversation();
		router.push(`/chat/${_id}`);
	};

	const preferencesHandler = () => {
		router.push("/preferences");
	};

	const { createConversation } = useConversations();

	return (
		<div className="text-center flex-1 flex items-center justify-center">
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
					>
						<PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
						New Chat
					</Button>
					<Button
						variant="outline"
						type="button"
						className={cn(
							"inline-flex items-center rounded-md  px-3 py-2 text-sm font-semibold shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 text-slate-600"
							// "bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600"
						)}
						onClick={preferencesHandler}
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
		</div>
	);
};

export default ChatPage;
