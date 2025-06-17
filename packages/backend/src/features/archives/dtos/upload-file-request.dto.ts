export type UploadFileRequestDTO = {
  hiringId: string;
};

export type UploadFileResponseDTO = {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string;
  uploadDate: Date;
  hiringId: string;
  uploadedBy: {
    id: string;
    name: string;
  };
};
