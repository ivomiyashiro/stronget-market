export type GetFileRequestDTO = {
  hiringId: string;
};

export type GetFilesResponseDTO = {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string;
  uploadDate: Date;
  uploadedBy: {
    id: string;
    name: string;
  };
}[];

export type GetFileByIdResponseDTO = {
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
