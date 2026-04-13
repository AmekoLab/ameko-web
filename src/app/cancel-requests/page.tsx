"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Ban, Clock, MessageSquare, AlertCircle, Loader2 } from "lucide-react";
import { orderIssueService } from "@/src/services/orderIssue.service";
import { OrderIssue } from "@/src/types/orderIssue.types";
import toast from "react-hot-toast";

export default function CancelRequestsPage() {
  const router = useRouter();
  const [issues, setIssues] = useState<OrderIssue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        const res = await orderIssueService.getMyIssues({ status: 1 });
        if (res.success) {
          setIssues(res.data.items);
        } else {
          toast.error(res.message || "Failed to load cancel requests.");
        }
      } catch (error: any) {
        toast.error(error.message || "An error occurred while fetching cancel requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-neutral-50 min-h-[calc(100vh-4rem)] p-4 md:p-8 text-neutral-900 font-sans">
      <div className="max-w-5xl mx-auto py-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-red-50 text-red-600 rounded-lg hidden sm:block">
                <Ban className="w-6 h-6" />
              </div>
              Cancel Requests
            </h1>
            <p className="text-neutral-500 mt-2 text-sm max-w-xl leading-relaxed">
              Track the status of your order cancellation requests and read shop responses.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24 bg-white rounded-2xl border border-neutral-100 shadow-sm">
            <div className="flex flex-col items-center gap-4">
               <Loader2 className="w-8 h-8 text-neutral-400 animate-spin" />
               <p className="text-sm font-medium text-neutral-500">Loading requests...</p>
            </div>
          </div>
        ) : issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-dashed border-neutral-200 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center mx-auto mb-5 border border-neutral-100">
               <AlertCircle className="w-8 h-8 text-neutral-400" strokeWidth={1.5} />
            </div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">
              No Cancel Requests
            </h2>
            <p className="text-sm text-neutral-500 mb-6 max-w-sm">
               You don't have any active or past order cancellation requests.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {issues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => router.push(`/cancel-requests/${issue.id}`)}
                className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-6 flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-neutral-300 cursor-pointer group"
              >
                <div className="flex justify-between items-start border-b border-neutral-50 pb-4 mb-4">
                  <div>
                    <span className="text-neutral-500 text-xs font-medium block mb-1">
                      Order ID
                    </span>
                    <span className="text-neutral-900 font-bold text-sm font-mono break-all group-hover:text-blue-600 transition-colors">
                      {issue.orderId}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-500 text-xs font-medium bg-neutral-50 px-2.5 py-1 rounded-md border border-neutral-100">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDate(issue.createdAt)}
                  </div>
                </div>

                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-center mb-5">
                    <span className="text-neutral-500 text-sm font-medium">Total Amount</span>
                    <span className="text-amazon-price font-bold text-base">
                      {formatCurrency(issue.orderTotalAmount)}
                    </span>
                  </div>

                  <div className="mb-4">
                    <span className="text-neutral-500 text-xs font-medium uppercase tracking-wider block mb-1.5">
                      Reason for Cancellation
                    </span>
                    <p className="text-sm text-neutral-900 font-semibold border-l-2 border-red-400 pl-3 leading-relaxed">
                      {issue.reason}
                    </p>
                  </div>

                  <div className="mb-2">
                    <p className="text-sm text-neutral-600 italic bg-neutral-50 p-3 rounded-xl border border-neutral-100/60 shadow-inner">
                      "{issue.description}"
                    </p>
                  </div>
                </div>

                {issue.shopResponse && (
                  <div className="mt-4 bg-blue-50 p-4 rounded-xl flex flex-col gap-2 border border-blue-100">
                    <div className="flex items-center gap-2 text-blue-700">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">
                        Shop Response
                      </span>
                    </div>
                    <p className="text-sm text-blue-900 font-medium leading-relaxed">
                      {issue.shopResponse}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
