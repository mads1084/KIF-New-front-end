import { DocumentAnalysis } from "./interfaces";

export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
}

export interface DocumentAnalysisResponse
  extends ApiResponse<DocumentAnalysis> {}

export interface ErrorResponse {
  success: false;
  message: string;
  error_code?: string;
  status?: number;
}
