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
    <div className="bg-black/80 backdrop-blur-sm fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-[#151515] border border-[#1e2126] rounded-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-6 uppercase">Issue Details</h2>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#f5d800]"></div>
          </div>
        ) : issue ? (
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-400 text-xs block mb-1 uppercase tracking-wider">Order ID</span>
                <span className="text-[#f5d800] font-bold">{issue.orderId}</span>
              </div>
              <div>
                <span className="text-gray-400 text-xs block mb-1 uppercase tracking-wider">Customer Name</span>
                <span className="text-white font-medium">{issue.customerName}</span>
              </div>
              <div>
                <span className="text-gray-400 text-xs block mb-1 uppercase tracking-wider">Total Amount</span>
                <span className="text-white font-medium">{formatCurrency(issue.orderTotalAmount)}</span>
              </div>
            </div>

            <div>
              <span className="text-gray-400 text-xs block mb-2 uppercase tracking-wider">Reason</span>
              <p className="text-gray-200 font-semibold text-sm">{issue.reason}</p>
            </div>

            <div>
              <span className="text-gray-400 text-xs block mb-2 uppercase tracking-wider">Description</span>
              <div className="bg-[#1a1c20] p-3 text-gray-400 italic block rounded-sm text-sm">
                "{issue.description}"
              </div>
            </div>

            {/* Footer space for future Approve/Reject buttons */}
            <div className="border-t border-[#1e2126] pt-6 flex justify-end gap-3 mt-4">
              {issue.status === 1 ? (
                <div className="flex flex-col gap-4 w-full">
                  <textarea
                    placeholder="Type your response to the customer..."
                    value={shopResponseText}
                    onChange={(e) => setShopResponseText(e.target.value)}
                    className="bg-[#1a1c20] text-white border border-[#1e2126] w-full p-3 rounded-sm min-h-[80px] text-sm focus:outline-none focus:border-[#f5d800] transition-colors"
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => handleProcess(3)}
                      disabled={processingDecision !== null}
                      className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-sm font-bold uppercase tracking-widest text-[11px] transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {processingDecision === 3 && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Reject
                    </button>
                    <button
                      onClick={() => handleProcess(2)}
                      disabled={processingDecision !== null}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-sm font-bold uppercase tracking-widest text-[11px] transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {processingDecision === 2 && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Approve
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={onClose}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-sm font-semibold transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400">Failed to load issue details.</div>
        )}
      </div>
    </div>
  );
}
