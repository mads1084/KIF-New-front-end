import {
  DocumentAnalysisResponse,
  ErrorResponse,
} from "../types/apiInterfaces";
import { AnalysisRequest, DocumentAnalysis } from "../types/interfaces";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

class DocumentAnalysisService {
  private async makeRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json().catch(() => ({
        success: false,
        message: `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
      }));

      throw new Error(
        errorData.message || `Request failed with status ${response.status}`
      );
    }

    return response.json();
  }

  private async makeFormDataRequest<T>(
    url: string,
    formData: FormData
  ): Promise<T> {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json().catch(() => ({
        success: false,
        message: `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
      }));

      throw new Error(
        errorData.message || `Request failed with status ${response.status}`
      );
    }

    return response.json();
  }

  async analyzeDocuments(request: AnalysisRequest): Promise<DocumentAnalysis> {
    const formData = new FormData();

    // Add the three documents to the form data
    formData.append("unemployment_document", request.unemployment_document);
    formData.append("sickness_document", request.sickness_document);
    formData.append("income_document", request.income_document);

    const response = await this.makeFormDataRequest<DocumentAnalysisResponse>(
      `${API_URL}/kis`,
      formData
    );

    if (!response.success) {
      throw new Error(response.message || "Analysis failed");
    }

    return response.data;
  }

  async readCitizenInfo(
    unemploymentDocument: File,
    sicknessDocument: File
  ): Promise<any> {
    const formData = new FormData();

    formData.append("unemployment_document", unemploymentDocument);
    formData.append("sickness_document", sicknessDocument);

    const response = await this.makeFormDataRequest<any>(
      `${API_URL}/read_citizen_info`,
      formData
    );

    if (!response.success) {
      throw new Error(response.message || "Failed to read citizen info");
    }

    // Metadata is now directly in response.data
    // Metadata is now directly in response.data
    return response.data;
  }

  async readIncomeStatements(
    incomeDocument: File,
    firstUnemploymentDate: string
  ): Promise<any> {
    const formData = new FormData();
    formData.append("income_document", incomeDocument);
    formData.append("first_unemployment_date", firstUnemploymentDate);

    const response = await this.makeFormDataRequest<any>(
      `${API_URL}/read_income_statements`,
      formData
    );

    if (!response.success) {
      throw new Error(response.message || "Failed to read income statements");
    }

    return response.data;
  }


  async generateDraft(
    citizenInfo: any,
    incomeStatement: any
  ): Promise<any> {
    const response = await this.makeRequest<any>(
      `${API_URL}/generate_draft`,
      {
        method: "POST",
        body: JSON.stringify({
          citizen_info: citizenInfo,
          income_statement: incomeStatement,
        }),
      }
    );

    if (!response.success) {
      throw new Error(response.message || "Failed to generate draft");
    }

    return response.data;
  }
}

// Export a singleton instance
export const documentAnalysisService = new DocumentAnalysisService();
export default documentAnalysisService;
