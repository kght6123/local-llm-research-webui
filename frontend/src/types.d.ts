export interface OperationProgress {
  completed: number;
  total: number;
  status: "findLatest" | "download" | "open" | "done" | "systemerror" | "pull";
  value: string;
}
export type OperationProgressHandler = (progress: OperationProgress) => void;
