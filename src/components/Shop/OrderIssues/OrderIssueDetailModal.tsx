import React, { useEffect, useState } from "react";
import { orderIssueService } from "@/src/services/orderIssue.service";
import { OrderIssue } from "@/src/types/orderIssue.types";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  issueId: string | null;
}

export default function OrderIssueDetailModal({ isOpen, onClose, onSuccess, issueId }: Props) {
  const [issue, setIssue] = useState<OrderIssue | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [shopResponseText, setShopResponseText] = useState<string>('');
  const [processingDecision, setProcessingDecision] = useState<number | null>(null);

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
        shopResponse: shopResponseText
      });
      if (res.success) {
        toast.success("Issue processed successfully.");
        onSuccess?.();
        onClose();
      } else {
        toast.error(res.message || "Failed to process issue.");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred.");
    } finally {
      setProcessingDecision(null);
    }
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
          className="absolute top-4 right-4 text-amazon-textMuted hover:text-amazon-text transition-colors p-1 hover:bg-neutral-100 rounded-sm"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-amazon-text mb-6">Issue Details</h2>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neutral-400"></div>
          </div>
        ) : issue ? (
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-amazon-textMuted text-xs block mb-1">Order ID</span>
                <span className="text-amazon-text font-bold">{issue.orderId}</span>
              </div>
              <div>
                <span className="text-amazon-textMuted text-xs block mb-1">Customer Name</span>
                <span className="text-amazon-text font-medium">{issue.customerName}</span>
              </div>
              <div>
                <span className="text-amazon-textMuted text-xs block mb-1">Total Amount</span>
                <span className="text-amazon-price font-bold">{formatCurrency(issue.orderTotalAmount)}</span>
              </div>
            </div>

            <div>
              <span className="text-amazon-textMuted text-xs block mb-2">Reason</span>
              <p className="text-amazon-text font-medium text-sm">{issue.reason}</p>
            </div>

            <div>
              <span className="text-amazon-textMuted text-xs block mb-2">Description</span>
              <div className="bg-neutral-50 border border-amazon-border p-3 text-amazon-text block rounded-sm text-sm">
                "{issue.description}"
              </div>
            </div>

            {/* Footer space for future Approve/Reject buttons */}
            <div className="border-t border-amazon-border pt-6 flex justify-end gap-3 mt-4">
              {issue.status === 1 ? (
                <div className="flex flex-col gap-4 w-full">
                  <textarea
                    placeholder="Type your response to the customer..."
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
                      {processingDecision === 3 && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Reject
                    </button>
                    <button
                      onClick={() => handleProcess(2)}
                      disabled={processingDecision !== null}
                      className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-sm font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
                    >
                      {processingDecision === 2 && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Approve
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={onClose}
                  className="bg-white border border-amazon-border text-amazon-text hover:bg-neutral-50 px-5 py-2 rounded-sm font-medium transition-colors shadow-sm"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-amazon-textMuted">Failed to load issue details.</div>
        )}
      </div>
    </div>
  );
}
