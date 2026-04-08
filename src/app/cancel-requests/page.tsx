"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Ban, Clock, MessageSquare, Eye } from "lucide-react";
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
    <div className="bg-amazon-bgSecondary min-h-screen p-4 md:p-8 text-amazon-text">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Ban className="w-8 h-8 text-orange-500" />
          <h1 className="font-oswald uppercase tracking-widest text-2xl text-amazon-text">
            My Cancel Requests
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amazon-btnPrimary"></div>
          </div>
        ) : issues.length === 0 ? (
          <div className="text-center text-amazon-textMuted py-12 bg-white border border-amazon-border rounded-sm shadow-sm">
            <h3 className="text-lg">You have no cancellation requests.</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {issues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => router.push(`/cancel-requests/${issue.id}`)}
                className="bg-white border border-amazon-border shadow-sm rounded-sm p-5 flex flex-col gap-3 relative overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer"
              >
                <div className="flex justify-between items-start border-b border-amazon-border pb-3">
                  <div>
                    <span className="text-amazon-textMuted text-xs block mb-1">
                      Order ID
                    </span>
                    <span className="text-amazon-text font-bold text-sm tracking-wider break-all">
                      {issue.orderId}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-amazon-textMuted text-xs">
                    <Clock className="w-3 h-3" />
                    {formatDate(issue.createdAt)}
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-amazon-textMuted text-xs">Total Amount</span>
                    <span className="text-amazon-price font-bold flex items-center gap-1">
                      {formatCurrency(issue.orderTotalAmount)}
                    </span>
                  </div>

                  <div className="mt-2">
                    <span className="text-amazon-textMuted text-xs block mb-1">
                      Reason
                    </span>
                    <p className="text-sm text-amazon-text font-semibold border-l-2 border-orange-500 pl-2">
                      {issue.reason}
                    </p>
                  </div>

                  <div>
                    <span className="text-amazon-textMuted text-xs block mb-1">
                      Description
                    </span>
                    <p className="text-xs text-amazon-textMuted italic bg-neutral-50 p-2 rounded-sm border border-amazon-border">
                      "{issue.description}"
                    </p>
                  </div>
                </div>

                {issue.shopResponse && (
                  <div className="mt-2 bg-neutral-50 p-3 rounded-sm border-l-2 border-blue-500 flex flex-col gap-2 border border-amazon-border">
                    <div className="flex items-center gap-2 text-blue-700">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">
                        Shop Response
                      </span>
                    </div>
                    <p className="text-xs text-amazon-text">
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
