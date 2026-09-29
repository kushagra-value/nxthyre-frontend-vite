import { useSyncExternalStore } from "react";
import {
  getRecordingState,
  subscribeRecordingState,
  type RecordingState,
} from "../services/manualRecordingService";

export function useManualRecordingState(): RecordingState {
  return useSyncExternalStore(subscribeRecordingState, getRecordingState);
}
