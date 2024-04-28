import React from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ConfirmationDialog = ({
	title = "Are you absolutely sure?",
	description = "This action cannot be undone. This will permanently delete your account and remove your data from our servers.",
	open = false,
	onOpenChange = () => {},
	onConfirm = () => {},
}: {
	title?: string;
	description?: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm?: () => void;
}) => {
	const onCancel = () => {
		onOpenChange(false);
	};

	const onContinue = () => {
		onConfirm();
		onOpenChange(false);
	};
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			{/* <AlertDialogTrigger>Open</AlertDialogTrigger> */}
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={onContinue}>Continue</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default ConfirmationDialog;
