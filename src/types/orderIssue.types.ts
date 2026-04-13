export interface OrderIssue {
  id: string;
  orderId: string;
  orderTotalAmount: number;
  customerName: string;
  shopName: string;
  type: number; // e.g., 0 for Cancel Request
  status: number; 
  reason: string;
  description: string;
  shopResponse: string | null;
  createdAt: string;
  aiAnalysisResult?: string;
}

export interface AiAnalysisParsed {
  Category: string;
  Sentiment: string;
  Summary: string;
  Recommendation: string;
  ConfidenceScore: string | number;
}

export type AiAnalysisStatus =
  | { status: "EMPTY" }
  | { status: "FAILED"; message: string }
  | { status: "SUCCESS"; data: AiAnalysisParsed };

export interface PaginatedOrderIssues {
  items: OrderIssue[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CancelRequestPayload {
  orderId: string;
  reason: string;
  description: string;
}

export interface ProcessIssuePayload {
  issueId: string;
  decision: number; // e.g., 2 for Approve, 3 for Reject
  shopResponse: string;
}
