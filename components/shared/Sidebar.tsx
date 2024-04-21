import React from "react";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import Image from "next/image";

const Sidebar = () => {
	// up to https://www.youtube.com/watch?v=Ahwoks_dawU&t=662s
	// time: 40:42
	return (
		<aside className="sidebar">
			<div className="flex size-full fle-col gap-4">
				<Link href="/" className="sidebar-logo">
					<Image
						src="/assets/araby-text-logo.svg"
						alt="Logo"
						width={250}
						height={100}
					/>
				</Link>
			</div>
		</aside>
	);
	{
		/* <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
            <SheetHeader>
                <SheetTitle>Are you absolutely sure?</SheetTitle>
                <SheetDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove your data from our servers.
                </SheetDescription>
            </SheetHeader>
        </SheetContent>
    </Sheet> */
	}
};

export default Sidebar;
