import Image from "next/image";
import { cn } from "@/lib/utils";
import React from "react";
import { ChatPartner } from "@/lib/chatPartners";

const ChatPartnerAvatar = ({
	chatPartner,
	className,
	hideFlag = false,
	classes = {
		image: "",
		flag: "",
	},
}: {
	chatPartner: ChatPartner;
	className?: string;
	classes?: {
		image?: string;
		flag?: string;
	};
	hideFlag?: boolean;
}) => {
	return (
		<div className={cn("w-fit relative rounded-full mx-auto", className)}>
			<Image
				className={cn(
					"w-36 h-36 rounded-full transition-all ease-in duration-50",
					classes.image
				)}
				width={12}
				height={12}
				src={chatPartner.image}
				alt={chatPartner.name}
				unoptimized
				priority
			/>
			{!hideFlag && chatPartner.flag && (
				<div className={cn("absolute top-0 right-0 text-4xl", classes.flag)}>
					{chatPartner.flag}
				</div>
			)}
		</div>
	);
};

export default ChatPartnerAvatar;
