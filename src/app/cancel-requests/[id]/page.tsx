"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Receipt, Store, Clock, AlertCircle, MessageSquare } from "lucide-react";
import { orderIssueService } from "@/src/services/orderIssue.service";
import { OrderIssue } from "@/src/types/orderIssue.types";
import toast from "react-hot-toast";

export default function CancelRequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [issue, setIssue] = useState<OrderIssue | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const res = await orderIssueService.getIssueDetail(id);
        if (res.success) {
          setIssue(res.data);
        } else {
          toast.error(res.message || "Failed to load cancel request details.");
        }
      } catch (error: any) {
        toast.error(error.message || "An error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const renderStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200">
            Pending
          </span>
        );
      case 2:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
            Approved
          </span>
        );
      case 3:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-amazon-textMuted border border-amazon-border">
            Unknown
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="bg-amazon-bgSecondary min-h-screen p-4 md:p-8 text-amazon-text flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amazon-btnPrimary"></div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="bg-amazon-bgSecondary min-h-screen p-4 md:p-8 text-amazon-text">
        <div className="max-w-3xl mx-auto text-center py-20 bg-white border border-amazon-border rounded-sm shadow-sm">
          <h2 className="text-xl text-amazon-textMuted">Cancel request not found.</h2>
          <button 
            onClick={() => router.back()}
            className="mt-6 px-6 py-2 bg-amazon-btnPrimary text-amazon-text font-semibold rounded-sm hover:opacity-90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amazon-bgSecondary min-h-screen p-4 md:p-8 text-amazon-text w-full">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-amazon-textMuted hover:text-amazon-text transition-colors mb-4 group w-fit"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-semibold uppercase tracking-wider">Back</span>
        </button>

        <h1 className="font-oswald uppercase tracking-widest text-2xl text-amazon-text mt-4 mb-6">
          Cancel Request Details
        </h1>

        <div className="bg-white border border-amazon-border shadow-sm rounded-sm p-6 flex flex-col gap-6">
          {/* Section 1: Order Info */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-amazon-textMuted text-xs block mb-1 uppercase tracking-wider">Order ID</span>
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-neutral-400" />
                <span className="text-amazon-text text-lg font-bold break-all">
                  {issue.orderId}
                </span>
              </div>
              <div className="mt-2 text-amazon-price font-bold">
                {formatCurrency(issue.orderTotalAmount)}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {renderStatusBadge(issue.status)}
              <div className="flex items-center gap-2 text-sm text-amazon-textMuted">
                <Clock className="w-4 h-4" />
                <span>{new Date(issue.createdAt).toLocaleString("vi-VN")}</span>
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-amazon-border" />

          {/* Section 2: Issue Details */}
          <div>
            <span className="text-amazon-textMuted text-xs block mb-3 uppercase tracking-wider">Issue Details</span>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-amazon-text font-semibold text-sm">
                  {issue.reason}
                </p>
                <div className="bg-neutral-50 p-4 rounded-sm text-sm text-amazon-textMuted italic mt-2 border border-amazon-border">
                  "{issue.description}"
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Shop Response */}
          {issue.shopResponse && (
            <div className="border-t border-amazon-border pt-6 mt-2">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <MessageSquare className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">
                  Shop Response
                </span>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-sm text-blue-800 mt-2">
                {issue.shopResponse}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
