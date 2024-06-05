import React, { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ChatPartner } from "@/lib/chatPartners";
import ChatPartnerAvatar from "./ChatPartnerAvatar";
import { ArabicDialect } from "@/types/types";
import MoonLoader from "react-spinners/MoonLoader";
import { Button } from "@/components/ui/button";

const DialectDialog = ({
	open,
	onOpenChange,
	chatPartner,
	onDialectSelected,
	isPending,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	chatPartner: ChatPartner;
	onDialectSelected: (dialect: ArabicDialect) => void;
	isPending: boolean;
}) => {
	const [selectedDialect, setSelectedDialect] = useState<ArabicDialect | null>(
		null
	);

	const closeDialog = () => {
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Choose a dialect</DialogTitle>
				</DialogHeader>
				<DialogDescription>
					<div className="flex flex-col gap-5 justify-center items-center">
						<div className="w-auto">
							<ChatPartnerAvatar
								chatPartner={chatPartner}
								classes={{
									image: `w-32 h-32 ${
										chatPartner.id !== "arabybuddy" &&
										"ring-2 ring-slate-300 ring-offset-4 ring-offset-slate-50"
									}`,
									flag: "text-2xl",
								}}
							/>
						</div>
						<p className="text-center">
							<span className="font-semibold">{chatPartner.name}</span> speaks a
							few different dialects. Choose one to start a conversation.
						</p>
						<Select
							onValueChange={(value) => {
								setSelectedDialect(value as ArabicDialect);
							}}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select Dialect" />
							</SelectTrigger>
							<SelectContent>
								{chatPartner.dialects.map((dialect) => (
									<SelectItem key={dialect} value={dialect}>
										{dialect}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</DialogDescription>
				<DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
					<Button
						variant="outline"
						className="mx-auto w-full"
						onClick={() => {
							setSelectedDialect(null);
							closeDialog();
						}}
						disabled={isPending}
					>
						Cancel
					</Button>
					<Button
						variant="indigo"
						className="mx-auto w-full"
						disabled={!chatPartner || !selectedDialect || isPending}
						onClick={() => {
							onDialectSelected(selectedDialect!);
						}}
					>
						{isPending && <MoonLoader size={20} color="#fff" />}
						{!isPending && "Start Conversation"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default DialectDialog;
