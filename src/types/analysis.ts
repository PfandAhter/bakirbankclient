// Analysis Service Types

export type AnalyzeRange = 'LAST_7_DAYS' | 'LAST_30_DAYS';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AnalysisReportDTO {
    id: string;
    accountId: string;
    invoiceId: string;
    analysisRange: string;
    overallRiskLevel: RiskLevel;
    summary: string;
    aiSummary: string;
    keyFindings: string;
    userGuidance: string;
    flaggedTransactionIds: string;
    generatedAt: string;
    totalTransactions: number;
    totalOutgoing: string;
    totalIncoming: string;
    netFlow: string;
    createdAt: string;
}

export interface AnalysisReportListResponse {
    analysisReports: AnalysisReportDTO[];
}

export interface AnalyzeTransactionRequest {
    analyzeRange: AnalyzeRange;
}

export interface AnalysisResult {
    analysisReportId: string;
    invoiceRequestId: string;
    invoiceStatus: string;
    estimatedCompletionDate: string;
    invoiceMessage: string;
}
