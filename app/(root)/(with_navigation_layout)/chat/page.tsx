"use client";

import { Button } from "@/components/ui/button";
import { useConversations } from "@/hooks/useConversations";
import { IConversation } from "@/lib/database/models/conversation.model";
import { useUser } from "@clerk/nextjs";
import { PencilSquareIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

const ChatPage = () => {
	const { user } = useUser();

	const router = useRouter();

	const onConversationCreated = useCallback(
		(data: IConversation) => {
			router.push(`/chat/${data._id}`);
		},
		[router]
	);

	const { createConversation } = useConversations({ onConversationCreated });

	return (
		<div className="text-center w-full flex items-center justify-center">
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
				<div className="mt-6">
					<Button
						type="button"
						className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
						onClick={createConversation}
					>
						<PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
						New Chat
					</Button>
				</div>
			</div>
		</div>
	);
};

export default ChatPage;
