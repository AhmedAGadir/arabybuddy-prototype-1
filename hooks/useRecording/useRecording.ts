import { getFirstSupportedMimeType, iOS } from "@/lib/utils";
import { useEffect } from "react";
import { useRecordingIOSCompatible } from "./useRecordingIOSCompatible";
import { useRecordingPermissionRequestedOnce } from "./useRecordingPermissionRequestedOnce";
import { useRecordingLogger } from "./logger";

export type UseRecordingProps = {
	onRecordingComplete: (blob: Blob) => void;
};

const useRecording = (onRecordingComplete: (blob: Blob) => void) => {
	const logger = useRecordingLogger();

	useEffect(() => {
		// logger.log(`supported mime type: ${getFirstSupportedMimeType()}`);
		logger.log(iOS() ? "iOS device detected" : "non-iOS device detected");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// for desktop browsers and android devices
	const useRecordingPermissionRequestedOnceReturn =
		useRecordingPermissionRequestedOnce(onRecordingComplete);

	// for iOS devices
	const useRecordingIOSCompatibleReturn =
		useRecordingIOSCompatible(onRecordingComplete);

	const { isRecording, startRecording, stopRecording, amplitude } = iOS()
		? useRecordingIOSCompatibleReturn
		: useRecordingPermissionRequestedOnceReturn;

	return {
		isRecording,
		startRecording,
		stopRecording,
		amplitude,
	};
};

export { useRecording };
