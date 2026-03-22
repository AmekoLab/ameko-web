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
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
            Pending
          </span>
        );
      case 2:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-500 border border-green-500/30">
            Approved
          </span>
        );
      case 3:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-500 border border-red-500/30">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-400 border border-gray-500/30">
            Unknown
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen p-4 md:p-8 text-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f5d800]"></div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen p-4 md:p-8 text-white">
        <div className="max-w-3xl mx-auto text-center py-20 bg-[#151515] border border-[#1e2126] rounded-sm">
          <h2 className="text-xl text-gray-400">Cancel request not found.</h2>
          <button 
            onClick={() => router.back()}
            className="mt-6 px-6 py-2 bg-[#f5d800] text-black font-semibold rounded-sm hover:bg-[#e0c600] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] min-h-screen p-4 md:p-8 text-white w-full">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 group w-fit"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-semibold uppercase tracking-wider">Back</span>
        </button>

        <h1 className="font-oswald uppercase tracking-widest text-2xl text-white mt-4 mb-6">
          Cancel Request Details
        </h1>

        <div className="bg-[#151515] border border-[#1e2126] rounded-sm p-6 flex flex-col gap-6">
          {/* Section 1: Order Info */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-gray-400 text-xs block mb-1 uppercase tracking-wider">Order ID</span>
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-gray-500" />
                <span className="text-[#f5d800] text-lg font-bold break-all">
                  {issue.orderId}
                </span>
              </div>
              <div className="mt-2 text-gray-300 font-semibold">
                {formatCurrency(issue.orderTotalAmount)}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {renderStatusBadge(issue.status)}
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                <span>{new Date(issue.createdAt).toLocaleString("vi-VN")}</span>
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-[#1e2126]" />

          {/* Section 2: Issue Details */}
          <div>
            <span className="text-gray-400 text-xs block mb-3 uppercase tracking-wider">Issue Details</span>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-gray-200 font-semibold text-sm">
                  {issue.reason}
                </p>
                <div className="bg-[#1a1c20] p-4 rounded-sm text-sm text-gray-400 italic mt-2">
                  "{issue.description}"
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Shop Response */}
          {issue.shopResponse && (
            <div className="border-t border-[#1e2126] pt-6 mt-2">
              <div className="flex items-center gap-2 text-[#f5d800] mb-2">
                <MessageSquare className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">
                  Shop Response
                </span>
              </div>
              <div className="bg-[#2a2d35] border-l-4 border-[#f5d800] p-4 rounded-sm text-gray-200 mt-2">
                {issue.shopResponse}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
