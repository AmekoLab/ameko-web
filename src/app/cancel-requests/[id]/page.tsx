"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Receipt, Clock, AlertCircle, MessageSquare } from "lucide-react";
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
          <span className="px-3 py-1.5 rounded-md text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200 shadow-sm">
            Pending
          </span>
        );
      case 2:
        return (
          <span className="px-3 py-1.5 rounded-md text-xs font-semibold bg-green-50 text-green-700 border border-green-200 shadow-sm">
            Approved
          </span>
        );
      case 3:
        return (
          <span className="px-3 py-1.5 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-200 shadow-sm">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-3 py-1.5 rounded-md text-xs font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200 shadow-sm">
            Unknown
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="bg-neutral-50 min-h-[calc(100vh-4rem)] p-4 md:p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-neutral-400"></div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="bg-neutral-50 min-h-[calc(100vh-4rem)] p-4 md:p-8 font-sans">
        <div className="max-w-2xl mx-auto text-center py-20 bg-white border border-neutral-100 rounded-2xl shadow-sm">
          <AlertCircle className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Request Not Found</h2>
          <p className="text-sm text-neutral-500 mb-8">We couldn't locate the details for this cancellation request.</p>
          <button 
            onClick={() => router.back()}
            className="px-6 py-3 bg-neutral-900 text-white font-medium rounded-xl hover:bg-neutral-800 transition-colors shadow-sm active:scale-[0.98]"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 min-h-[calc(100vh-4rem)] p-4 md:p-8 text-neutral-900 font-sans w-full">
      <div className="max-w-3xl mx-auto py-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors mb-6 group w-fit"
        >
          <div className="p-1.5 rounded-lg bg-white border border-neutral-200 shadow-sm group-hover:border-neutral-300 transition-colors">
             <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium">Back to Requests</span>
        </button>

        <h1 className="text-2xl font-bold text-neutral-900 mb-6 tracking-tight">
          Request Details
        </h1>

        <div className="bg-white border border-neutral-100 shadow-sm rounded-2xl flex flex-col overflow-hidden">
          {/* Section 1: Order Info */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 border-b border-neutral-50 bg-white">
            <div>
              <span className="text-neutral-500 text-xs font-semibold uppercase tracking-wider block mb-2">Order ID</span>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-100">
                    <Receipt className="w-5 h-5 text-neutral-400" />
                </div>
                <span className="text-neutral-900 text-lg font-mono font-bold break-all">
                  {issue.orderId}
                </span>
              </div>
              <div className="mt-3 text-amazon-price text-xl font-bold">
                {formatCurrency(issue.orderTotalAmount)}
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
              <div className="flex w-full md:w-auto justify-between md:justify-end items-center gap-4">
                 <span className="text-xs font-semibold text-neutral-500 uppercase tracking-widest md:hidden">Status</span>
                 {renderStatusBadge(issue.status)}
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-neutral-500 bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-100 w-full md:w-auto justify-center">
                <Clock className="w-4 h-4" />
                <span>{new Date(issue.createdAt).toLocaleString("vi-VN")}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Issue Details */}
          <div className="p-6">
            <span className="text-neutral-500 text-xs font-semibold uppercase tracking-wider block mb-4">Reason for Cancellation</span>
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-50 rounded-lg shrink-0 border border-red-100">
                 <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1 mt-1">
                <p className="text-neutral-900 font-semibold text-base leading-relaxed mb-3">
                  {issue.reason}
                </p>
                <div className="bg-neutral-50 p-4 rounded-xl text-sm font-medium text-neutral-600 italic border border-neutral-100 shadow-inner">
                  "{issue.description}"
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Shop Response */}
          {issue.shopResponse && (
            <div className="p-6 border-t border-neutral-50 bg-blue-50/30">
              <div className="flex items-center gap-2 text-blue-700 mb-3">
                <MessageSquare className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">
                  Shop Response
                </span>
              </div>
              <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl text-blue-900 font-medium leading-relaxed shadow-sm relative">
                <div className="absolute left-0 top-4 bottom-4 w-1 bg-blue-400 rounded-r-md opacity-70"></div>
                {issue.shopResponse}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
