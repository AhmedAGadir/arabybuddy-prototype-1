import Image from "next/image";

export default function Background() {
	return (
		<Image
			alt="gradient background"
			src={"/assets/background.png"}
			placeholder="blur"
			blurDataURL={"/assets/background.png"}
			quality={100}
			fill
			sizes="100vw"
			objectFit="cover"
			style={{
				// objectFit: "cover",
				zIndex: -1,
			}}
		/>
	);
}
