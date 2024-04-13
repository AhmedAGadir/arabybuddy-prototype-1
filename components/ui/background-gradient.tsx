import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@react-hooks-hub/use-media-query";

export const BackgroundGradient = ({
	children,
	className,
	animate = true,
	glow = false,
}: {
	children?: React.ReactNode;
	className?: string;
	animate?: boolean;
	glow?: boolean;
}) => {
	const variants = {
		initial: {
			backgroundPosition: "0 50%",
		},
		animate: {
			backgroundPosition: ["0, 50%", "100% 50%", "0 50%"],
		},
	};

	const { device } = useMediaQuery();
	const isMobile = device === "mobile";

	return (
		<div
			className={cn(
				"relative group",
				isMobile ? "p-[2px]" : "p-[4px]",
				className
			)}
		>
			<motion.div
				variants={animate ? variants : undefined}
				initial={animate ? "initial" : undefined}
				animate={animate ? "animate" : undefined}
				transition={
					animate
						? {
								duration: 5,
								repeat: Infinity,
								repeatType: "reverse",
						  }
						: undefined
				}
				style={{
					backgroundSize: animate ? "400% 400%" : undefined,
				}}
				className={cn(
					"absolute inset-0 rounded-3xl z-[1] opacity-60 group-hover:opacity-100 blur-md  transition duration-500 will-change-transform",
					// original
					// "bg-[radial-gradient(circle_farthest-side_at_0_100%,#00ccb1,transparent),radial-gradient(circle_farthest-side_at_100%_0,#7b61ff,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#ffc414,transparent),radial-gradient(circle_farthest-side_at_0_0,#1ca0fb,#141316)]"
					glow &&
						"bg-[radial-gradient(circle_farthest-side_at_0_100%,#38B6FF,transparent),radial-gradient(circle_farthest-side_at_100%_0,#5E17EB,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#ffc414,transparent),radial-gradient(circle_farthest-side_at_0_0,#1ca0fb,#141316)]"
				)}
			/>
			<motion.div
				variants={animate ? variants : undefined}
				initial={animate ? "initial" : undefined}
				animate={animate ? "animate" : undefined}
				transition={
					animate
						? {
								duration: 5,
								repeat: Infinity,
								repeatType: "reverse",
						  }
						: undefined
				}
				style={{
					backgroundSize: animate ? "400% 400%" : undefined,
				}}
				className={cn(
					"absolute inset-0 rounded-3xl z-[1] will-change-transform",
					// original
					// "bg-[radial-gradient(circle_farthest-side_at_0_100%,#00ccb1,transparent),radial-gradient(circle_farthest-side_at_100%_0,#7b61ff,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#ffc414,transparent),radial-gradient(circle_farthest-side_at_0_0,#1ca0fb,#141316)]"
					"bg-[radial-gradient(circle_farthest-side_at_0_100%,#38B6FF,transparent),radial-gradient(circle_farthest-side_at_100%_0,#5E17EB,transparent),radial-gradient(circle_farthest-side_at_100%_100%,blue,transparent),radial-gradient(circle_farthest-side_at_0_0,#1ca0fb,#141316)]"
				)}
			/>

			<div className={cn("relative z-10")}>{children}</div>
		</div>
	);
};
