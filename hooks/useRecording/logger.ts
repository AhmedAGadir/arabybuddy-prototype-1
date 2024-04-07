import { useLogger } from "../useLogger";

const useRecordingLogger = () => {
	const logger = useLogger({
		label: "useRecording",
		color: "#75bfff",
	});
	return logger;
};

export { useRecordingLogger };
