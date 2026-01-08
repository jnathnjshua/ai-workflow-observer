export type UploadItem = {
  id: string;
  file: File;
  status: "idle" | "uploading" | "done" | "error";
  error?: string;
  progress: number;
};

type UploadState = {
  files: UploadItem[];
  result: any | null;
};

let state: UploadState = {
  files: [],
  result: null,
};

export function getUploadState() {
  return state;
}

export function setUploadState(next: Partial<UploadState>) {
  state = { ...state, ...next };
}
