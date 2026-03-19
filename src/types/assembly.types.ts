export interface AssemblyTemplate {
  templateId: string;
  shopId: string;
  stepName: string;
  stepOrder: number;
  isRequired: boolean;
}

export interface AssemblyTemplatePayload {
  stepName: string;
  stepOrder: number;
  isRequired: boolean;
}

export interface AssemblyLog {
  progressLogId: string;
  orderItemId: string;
  stepName: string;
  stepOrder: number;
  status: number; // 0: Pending, 1: Processing, 2: Completed
  note: string | null;
  mediaUrl: string | null;
  completedAt: string | null;
}
