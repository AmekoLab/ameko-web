// ============================================================
// Builder Types — Server-Driven UI Model
// ============================================================

// --- Step info returned by `/Builder/start` and `/Builder/select` ---
export interface BuilderStep {
  name: string;
  slug: string;
  stepOrder: number;
}

// --- Product option available for selection at each step ---
export interface BuilderProduct {
  optionId: string;
  partId: string;
  name: string;
  price: number;
  thumbnailUrl: string;
  layerImageUrl: string;
  isDefault: boolean;
  status: number;
  tags: string | null;
  nextStepFilterRule: string | null;
}

// --- A part that has been selected (stored in session.selection) ---
export interface SelectedPart {
  id: string;
  name: string;
  price: number;
  thumbnailUrl: string;
  quantity: number;
  kitDesignOptionId: string;
  layerImageUrl: string;
  nextStepFilterRule: string;
}

// --- The next step bundle ---
export interface BuilderNextStep {
  step: BuilderStep;
  products: BuilderProduct[];
}

// --- Session state from the server ---
export interface BuilderSession {
  id: string;
  selection: Record<string, SelectedPart>;
  totalPrice: number;
  updatedAt: string;
  isComplete: boolean;
  currentPreviewImage: string | null;
}

// --- Inner `data.data` payload from `/Builder/start` and `/Builder/select` ---
export interface BuilderPayload {
  session: BuilderSession;
  nextStep: BuilderNextStep | null;
  workflowSteps: string[];
}

// --- Full API envelope (outer wrapper) ---
export interface BuilderApiResponse {
  success: boolean;
  message: string;
  data: {
    message: string;
    data: BuilderPayload;
  };
  errors: string | null;
}

// --- Payload for POST /Builder/start ---
export interface StartBuilderPayload {
  baseKitId: string;
}

// --- Payload for POST /Builder/select ---
export interface SelectComponentPayload {
  sessionId: string;
  selectedPartId: string;
  stepName: string;
}
