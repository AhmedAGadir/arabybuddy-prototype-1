const blobDValues = [
	"M64.7,-37.8C78.4,-13.5,80.5,17.1,67.8,39.3C55.1,61.5,27.5,75.2,0.1,75.2C-27.4,75.2,-54.8,61.3,-69.2,38.2C-83.5,15.1,-84.8,-17.3,-71.1,-41.6C-57.4,-65.9,-28.7,-82.1,-1.6,-81.2C25.5,-80.3,50.9,-62.2,64.7,-37.8Z",
	"M65,-35.3C79.2,-12.8,82.3,18.2,69.6,38.6C57,59,28.5,68.8,1,68.2C-26.4,67.6,-52.8,56.6,-64.7,36.7C-76.5,16.8,-73.9,-12.2,-60.7,-34C-47.5,-55.9,-23.7,-70.6,0.8,-71.1C25.4,-71.6,50.7,-57.8,65,-35.3Z",
	"M51.8,-25.1C65,-7,72.1,19.3,62.5,40.4C52.8,61.5,26.4,77.3,2.3,76C-21.8,74.7,-43.6,56.2,-54.1,34.6C-64.7,13,-64,-11.8,-53.1,-28.5C-42.2,-45.2,-21.1,-53.9,-0.9,-53.4C19.3,-52.8,38.6,-43.1,51.8,-25.1Z",
	"M50.4,-28.2C60.5,-11.5,60.7,11.8,50.6,31.7C40.6,51.6,20.3,68.1,-1.4,68.9C-23.2,69.8,-46.4,55,-57.2,34.6C-68.1,14.2,-66.6,-11.7,-55,-29.2C-43.4,-46.8,-21.7,-55.9,-0.8,-55.5C20.1,-55,40.2,-44.9,50.4,-28.2Z",
	"M52.4,-26.3C66.3,-6.2,74.9,21,65.2,39.4C55.6,57.7,27.8,67.3,4.6,64.7C-18.6,62,-37.2,47.1,-50.8,26.4C-64.5,5.7,-73.2,-20.8,-63.9,-38.2C-54.6,-55.6,-27.3,-64,-4,-61.7C19.3,-59.4,38.5,-46.4,52.4,-26.3Z",
	"M42.9,-28.2C49,-14.3,42.6,3.3,33.3,17.5C24.1,31.7,12.1,42.5,-3.4,44.5C-18.9,46.4,-37.9,39.6,-43.4,27.6C-48.8,15.6,-40.8,-1.7,-31.4,-17.6C-21.9,-33.4,-11,-47.9,3.7,-50.1C18.4,-52.2,36.9,-42.1,42.9,-28.2Z",
	"M44.7,-21.8C50.5,-15.7,42.7,2.2,33,18.5C23.3,34.9,11.6,49.6,-8.1,54.2C-27.8,58.9,-55.6,53.5,-67.9,35.7C-80.2,17.9,-77,-12.4,-63.1,-23.1C-49.2,-33.8,-24.6,-25,-2.6,-23.5C19.5,-22,38.9,-27.9,44.7,-21.8Z",
	"M42.7,-23.7C48,-15.6,39.7,1.3,30.3,15.9C21,30.5,10.5,42.7,-5.8,46.1C-22.1,49.4,-44.2,43.8,-56.7,27.4C-69.2,11,-72.1,-16.2,-61.1,-27.7C-50.1,-39.2,-25,-35,-3.1,-33.2C18.7,-31.4,37.5,-31.9,42.7,-23.7Z",
	"M19.5,-17.5C24.9,-2,28.5,8.3,25,21.5C21.5,34.7,10.7,50.9,-3.5,52.9C-17.8,55,-35.5,42.9,-38.1,30.2C-40.7,17.5,-28.2,4.2,-19.3,-13.3C-10.4,-30.8,-5.2,-52.6,0.9,-53.2C7.1,-53.7,14.2,-33,19.5,-17.5Z",
	"M43.5,-30.3C53,-8.7,55,12.1,46.5,23.1C38,34,19,35.2,-4.8,37.9C-28.5,40.7,-57,45,-68.2,32.6C-79.3,20.1,-72.9,-9.2,-58.7,-33.6C-44.4,-58,-22.2,-77.5,-2.6,-76C17,-74.5,34,-52,43.5,-30.3Z",
	"M51.4,-31.6C63,-9.5,66.3,15.4,56.4,36C46.5,56.7,23.2,73.1,-1.2,73.7C-25.5,74.4,-51.1,59.3,-62,38.1C-72.8,17,-69,-10.3,-56.2,-33C-43.5,-55.7,-21.7,-73.8,-0.9,-73.3C19.9,-72.7,39.7,-53.6,51.4,-31.6Z",
	"M55.8,-26.2C63.6,-18.8,55.2,4.1,43.2,27.5C31.1,50.9,15.6,74.9,4.3,72.4C-6.9,69.9,-13.9,41,-26.7,17.1C-39.6,-6.8,-58.3,-25.7,-54.8,-30.6C-51.4,-35.5,-25.7,-26.5,-0.8,-26C24,-25.5,48.1,-33.6,55.8,-26.2Z",
	"M35.5,-29.3C40,-12.7,33.5,1.4,25.7,10.6C18,19.7,9,23.9,-5.6,27.1C-20.3,30.4,-40.6,32.8,-50.9,22.1C-61.2,11.5,-61.5,-12.1,-51.4,-32C-41.2,-51.8,-20.6,-67.9,-2.6,-66.5C15.5,-65,31,-45.9,35.5,-29.3Z",
	"M41.3,-23.8C52,-5.4,58,15.7,50.3,35.6C42.6,55.5,21.3,74,-1.5,74.9C-24.4,75.8,-48.8,59,-62.4,35.8C-75.9,12.5,-78.6,-17.2,-66.4,-36.5C-54.2,-55.8,-27.1,-64.6,-5.9,-61.2C15.3,-57.8,30.7,-42.2,41.3,-23.8Z",
	"M56,-31.7C69.6,-8.7,75.7,19.3,65.1,41C54.6,62.8,27.3,78.4,-0.4,78.6C-28.2,78.9,-56.3,63.8,-70.7,39.9C-85,15.9,-85.6,-16.9,-71.5,-40.2C-57.4,-63.5,-28.7,-77.2,-3.8,-75C21.2,-72.8,42.3,-54.7,56,-31.7Z",
	"M57.8,-34.3C69.7,-12.8,70.5,14.2,59,37C47.5,59.7,23.8,78.2,1,77.7C-21.8,77.1,-43.6,57.4,-56.7,33.7C-69.8,10,-74.2,-17.7,-63.3,-38.6C-52.4,-59.6,-26.2,-73.7,-1.6,-72.8C22.9,-71.9,45.9,-55.8,57.8,-34.3Z",
	"M64.9,-36C79,-13,81.9,18,69.2,40.4C56.6,62.8,28.3,76.6,0.9,76C-26.4,75.5,-52.8,60.6,-66.2,37.8C-79.6,14.9,-80.1,-15.8,-66.9,-38.3C-53.8,-60.9,-26.9,-75.2,-0.7,-74.7C25.4,-74.3,50.8,-59.1,64.9,-36Z",
	"M53.6,-32.8C66.3,-9,71.2,17.5,61,35.6C50.8,53.8,25.4,63.5,1.7,62.6C-22,61.6,-44.1,49.9,-54.3,31.7C-64.6,13.6,-63,-11,-52,-33.8C-41,-56.7,-20.5,-77.8,0,-77.8C20.4,-77.8,40.9,-56.6,53.6,-32.8Z",
	"M58.5,-34.9C68.2,-17,63.2,8.3,51,30.8C38.8,53.3,19.4,73,1,72.4C-17.3,71.8,-34.6,50.9,-47.3,28.1C-60,5.4,-68.1,-19.3,-59.4,-36.6C-50.8,-53.8,-25.4,-63.7,-0.5,-63.4C24.4,-63.1,48.8,-52.7,58.5,-34.9Z",
	"M24.9,-15.6C29.9,-5.7,30,5.8,25,17.7C20,29.5,10,41.7,-1.9,42.8C-13.9,43.9,-27.8,34,-31.6,22.8C-35.4,11.6,-29.1,-0.8,-22.2,-11.8C-15.2,-22.9,-7.6,-32.6,1.2,-33.3C9.9,-34,19.9,-25.6,24.9,-15.6Z",
	"M24.9,-15.6C29.9,-5.7,30,5.8,25,17.7C20,29.5,10,41.7,-1.9,42.8C-13.9,43.9,-27.8,34,-31.6,22.8C-35.4,11.6,-29.1,-0.8,-22.2,-11.8C-15.2,-22.9,-7.6,-32.6,1.2,-33.3C9.9,-34,19.9,-25.6,24.9,-15.6Z",
	"M39.7,-8C54.1,1.9,70,25.7,63.7,32.3C57.3,38.9,28.7,28.2,5,25.3C-18.7,22.4,-37.4,27.4,-40.5,22.7C-43.6,18,-31.1,3.6,-21.7,-3.3C-12.4,-10.3,-6.2,-9.9,3.3,-11.8C12.7,-13.6,25.4,-17.8,39.7,-8Z",
	"M66.1,-38C78,-17.6,74.6,11.8,61.1,32C47.5,52.3,23.8,63.4,-2.1,64.6C-28,65.9,-56,57.2,-68.5,37.6C-81,18,-77.9,-12.6,-63.9,-34.3C-49.9,-55.9,-25,-68.6,1.1,-69.2C27.1,-69.8,54.2,-58.4,66.1,-38Z",
	"M41.6,-22.3C54.7,-1.5,66.4,21.8,59.3,42.2C52.1,62.6,26,80.1,2.4,78.7C-21.2,77.3,-42.5,57.1,-50.3,36.3C-58.1,15.5,-52.4,-5.7,-41.8,-25.1C-31.1,-44.5,-15.6,-62,-0.6,-61.6C14.3,-61.3,28.6,-43,41.6,-22.3Z",
	"M45.6,-19.6C55.9,-8.6,58.7,13.5,49.9,34C41,54.6,20.5,73.6,3.2,71.8C-14.2,69.9,-28.3,47.2,-42.3,23.7C-56.3,0.2,-70.1,-24.1,-63.1,-33.3C-56,-42.6,-28,-36.6,-5.2,-33.6C17.7,-30.7,35.4,-30.6,45.6,-19.6Z",
	"M46.2,-21.6C60.3,-2.1,72.7,23.5,64.7,43.1C56.7,62.8,28.4,76.5,1.4,75.7C-25.5,74.8,-51,59.5,-59.4,39.6C-67.8,19.8,-59,-4.6,-46.3,-23.4C-33.6,-42.1,-16.8,-55,-0.4,-54.8C16,-54.6,32,-41.1,46.2,-21.6Z",
	"M66.8,-37.7C80.9,-14,83,17.6,69.9,36.9C56.7,56.3,28.4,63.4,0.1,63.3C-28.1,63.3,-56.2,56,-60.1,42C-63.9,28,-43.5,7.4,-29.4,-16.3C-15.4,-40,-7.7,-66.8,9.3,-72.1C26.3,-77.5,52.6,-61.5,66.8,-37.7Z",
];

const circleDValue =
	"M65,-37.2C78.2,-14.7,78.6,15.5,65.7,38.9C52.7,62.4,26.4,79,-0.8,79.5C-28,80,-56,64.2,-69.7,40.4C-83.3,16.6,-82.6,-15.4,-68.6,-38.4C-54.6,-61.4,-27.3,-75.4,-0.7,-75C25.9,-74.6,51.8,-59.7,65,-37.2Z";

const BlobInner = ({
	size,
	duration,
	values,
	pathProps,
}: {
	size: number;
	duration: number;
	values: string;
	pathProps?: { [key: string]: any };
}) => (
	<div
		style={{ width: size, height: size }}
		className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
	>
		<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
			<path
				transform="translate(100 100)"
				{...pathProps}
				// {...(!active && { d: circleDValue })}
			>
				<animate
					attributeName="d"
					dur={`${duration}s`}
					repeatCount="indefinite"
					values={values}
				></animate>
			</path>
		</svg>
	</div>
);

const BlobSvg = ({ size, fill }: { size: number; fill: string }) => {
	const duration = 10;

	return (
		<div
			style={{
				position: "relative",
				width: 300,
				height: 300,
			}}
		>
			<BlobInner
				size={size}
				duration={duration}
				values={blobDValues.join(";")}
				pathProps={{
					fill,
				}}
			/>

			<BlobInner
				size={size}
				duration={duration}
				values={blobDValues.reverse().join(";")}
				pathProps={{
					fill,
					fillOpacity: 0.5,
				}}
			/>

			<BlobInner
				size={200}
				duration={duration}
				values={blobDValues.reverse().join(";")}
				pathProps={{
					fill,
					fillOpacity: 0.5,
					filter: "blur(10px)",
				}}
			/>
		</div>
	);
};

export { BlobSvg };
