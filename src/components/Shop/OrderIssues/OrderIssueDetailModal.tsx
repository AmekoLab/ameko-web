import { useEffect, useState, useMemo } from "react";
import { orderIssueService } from "@/src/services/orderIssue.service";
import { OrderIssue, AiAnalysisStatus } from "@/src/types/orderIssue.types";
import { X, Loader2, Sparkles, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

// ─── SAFE AI ANALYSIS PARSER ────────────────────────────────────────────────
function parseAiAnalysis(rawString?: string | null): AiAnalysisStatus {
  if (!rawString || rawString.trim() === "") {
    return { status: "EMPTY" };
  }

  if (rawString.trim() === "AI processing failed.") {
    return { status: "FAILED", message: "AI processing failed." };
  }

  try {
    const parsed = JSON.parse(rawString);
    if (
      parsed &&
      typeof parsed === "object" &&
      "Category" in parsed &&
      "Sentiment" in parsed &&
      "Summary" in parsed &&
      "Recommendation" in parsed &&
      "ConfidenceScore" in parsed
    ) {
      return { status: "SUCCESS", data: parsed };
    }
    return { status: "FAILED", message: "AI response format is unrecognized." };
  } catch {
    return { status: "FAILED", message: "Could not parse AI analysis data." };
  }
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  issueId: string | null;
}

export default function OrderIssueDetailModal({
  isOpen,
  onClose,
  onSuccess,
  issueId,
}: Props) {
  const t = useTranslations("OrderIssueDetailModal");
  const [issue, setIssue] = useState<OrderIssue | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [shopResponseText, setShopResponseText] = useState<string>("");
  const [processingDecision, setProcessingDecision] = useState<number | null>(
    null,
  );

  // Memoized AI analysis — avoids re-parsing JSON on every keystroke in the textarea
  const aiAnalysis = useMemo(
    () => parseAiAnalysis(issue?.aiAnalysisResult),
    [issue?.aiAnalysisResult],
  );

  useEffect(() => {
    const fetchIssue = async () => {
      if (isOpen && issueId) {
        setLoading(true);
        try {
          const res = await orderIssueService.getIssueDetail(issueId);
          if (res.success && res.data) {
            setIssue(res.data);
          }
        } catch (error) {
          console.error("Failed to fetch issue details", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchIssue();
  }, [isOpen, issueId]);

  const handleProcess = async (decision: number) => {
    if (!issue) return;
    setProcessingDecision(decision);
    try {
      const res = await orderIssueService.processIssue({
        issueId: issue.id,
        decision,
        shopResponse: shopResponseText,
      });
      if (res.success) {
        toast.success(t("toast.processSuccess"));
        onSuccess?.();
        onClose();
      } else {
        toast.error(res.message || t("toast.processFailed"));
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : t("toast.unexpectedError");
      toast.error(message);
    } finally {
      setProcessingDecision(null);
    }
  };

  const getAiFailureMessage = (message?: string) => {
    if (!message) return t("aiAnalysis.errors.unavailable");
    if (message === "AI processing failed.") {
      return t("aiAnalysis.errors.processingFailed");
    }
    if (message === "AI response format is unrecognized.") {
      return t("aiAnalysis.errors.unrecognizedFormat");
    }
    if (message === "Could not parse AI analysis data.") {
      return t("aiAnalysis.errors.parseFailed");
    }
    return message;
  };

  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="bg-black/50 backdrop-blur-sm fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-white border border-amazon-border shadow-2xl rounded-md w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
        <button
          onClick={onClose}
          aria-label={t("actions.close")}
          className="absolute top-4 right-4 text-amazon-textMuted hover:text-amazon-text transition-colors p-1 hover:bg-neutral-100 rounded-sm"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-amazon-text mb-6">
          {t("title")}
        </h2>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neutral-400"></div>
          </div>
        ) : issue ? (
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-amazon-text text-xs block mb-1">
                  {t("fields.orderId")}
                </span>
                <span className="text-amazon-text font-bold">
                  {issue.orderId}
                </span>
              </div>
              <div>
                <span className="text-amazon-text text-xs block mb-1">
                  {t("fields.customerName")}
                </span>
                <span className="text-amazon-text font-medium">
                  {issue.customerName}
                </span>
              </div>
              <div>
                <span className="text-amazon-textMuted text-xs block mb-1">
                  {t("fields.totalAmount")}
                </span>
                <span className="text-amazon-price font-bold">
                  {formatCurrency(issue.orderTotalAmount)}
                </span>
              </div>
            </div>

            <div>
              <span className="text-amazon-textMuted text-xs block mb-2">
                {t("fields.reason")}
              </span>
              <p className="text-amazon-text font-medium text-sm">
                {issue.reason}
              </p>
            </div>

            <div>
              <span className="text-amazon-textMuted text-xs block mb-2">
                {t("fields.description")}
              </span>
              <div className="bg-neutral-50 border border-amazon-border p-3 text-amazon-text block rounded-sm text-sm">
                {issue.description}
              </div>
            </div>

            {/* ── AI ANALYSIS SECTION ── */}
            {aiAnalysis.status !== "EMPTY" && (
              <div className="border border-amazon-border rounded-sm overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-50 to-indigo-50 border-b border-amazon-border">
                  <Sparkles className="w-4 h-4 text-violet-500" />
                  <span className="text-[18px] font-bold text-violet-700 tracking-wide">
                    {t("aiAnalysis.assistantTitle")}
                  </span>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-amazon-textMuted">
                      {t("aiAnalysis.assistantDisclaimer")}
                    </span>
                  </div>
                </div>

                {aiAnalysis.status === "FAILED" ? (
                  /* ─── FAILED STATE ─── */
                  <div className="px-4 py-3 bg-red-50/60 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-red-600">
                        {t("aiAnalysis.unavailable")}
                      </p>
                      <p className="text-[11px] text-red-500/80 mt-0.5">
                        {getAiFailureMessage(aiAnalysis.message)}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* ─── SUCCESS STATE ─── */
                  <div className="px-4 py-3 space-y-3 bg-white">
                    {/* Row 1: Category & Sentiment side-by-side */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-amazon-textMuted text-[10px] block mb-0.5 font-medium">
                          {t("aiAnalysis.labels.category")}
                        </span>
                        <span className="text-amazon-text text-xs font-semibold">
                          {aiAnalysis.data.Category}
                        </span>
                      </div>
                      <div>
                        <span className="text-amazon-textMuted text-[10px] block mb-0.5 font-medium">
                          {t("aiAnalysis.labels.sentiment")}
                        </span>
                        <span className="text-amazon-text text-xs font-semibold">
                          {aiAnalysis.data.Sentiment}
                        </span>
                      </div>
                    </div>

                    {/* Row 2: Summary */}
                    <div>
                      <span className="text-amazon-textMuted text-[10px] block mb-0.5 font-medium">
                        {t("aiAnalysis.labels.summary")}
                      </span>
                      <p className="text-amazon-text text-xs leading-relaxed bg-neutral-50 border border-amazon-border rounded-sm p-2.5">
                        {aiAnalysis.data.Summary}
                      </p>
                    </div>

                    {/* Row 3: Recommendation & Confidence */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-amazon-textMuted text-[10px] font-medium">
                          {t("aiAnalysis.labels.recommendation")}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            aiAnalysis.data.Recommendation.toLowerCase().includes(
                              "approve",
                            )
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : aiAnalysis.data.Recommendation.toLowerCase().includes(
                                    "reject",
                                  )
                                ? "bg-red-100 text-red-700 border border-red-200"
                                : "bg-amber-100 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {aiAnalysis.data.Recommendation}
                        </span>
                      </div>
                      <span className="text-[12px] text-amazon-text font-medium">
                        {t("aiAnalysis.labels.confidence")}{" "}
                        {typeof aiAnalysis.data.ConfidenceScore === "number"
                          ? `${(aiAnalysis.data.ConfidenceScore * 100).toFixed(0)}%`
                          : aiAnalysis.data.ConfidenceScore}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Footer space for future Approve/Reject buttons */}
            <div className="border-t border-amazon-border pt-6 flex justify-end gap-3 mt-4">
              {issue.status === 1 ? (
                <div className="flex flex-col gap-4 w-full">
                  <textarea
                    placeholder={t("placeholders.shopResponse")}
                    value={shopResponseText}
                    onChange={(e) => setShopResponseText(e.target.value)}
                    className="bg-white text-amazon-text border border-amazon-border w-full p-3 rounded-sm min-h-[80px] text-sm focus:outline-none focus:border-amazon-btnPrimary focus:ring-1 focus:ring-amazon-btnPrimary transition-colors placeholder-neutral-400"
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => handleProcess(3)}
                      disabled={processingDecision !== null}
                      className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-5 py-2 rounded-sm font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {processingDecision === 3 && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      )}
                      {t("actions.reject")}
                    </button>
                    <button
                      onClick={() => handleProcess(2)}
                      disabled={processingDecision !== null}
                      className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-sm font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
                    >
                      {processingDecision === 2 && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      )}
                      {t("actions.approve")}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={onClose}
                  className="bg-white border border-amazon-border text-amazon-text hover:bg-neutral-50 px-5 py-2 rounded-sm font-medium transition-colors shadow-sm"
                >
                  {t("actions.close")}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-amazon-textMuted">
            {t("error.loadFailed")}
          </div>
        )}
      </div>
    </div>
  );
}
