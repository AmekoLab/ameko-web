"use client";

import React, { useState, useEffect } from "react";
import { orderIssueService } from "@/src/services/orderIssue.service";
import { OrderIssue } from "@/src/types/orderIssue.types";
import { Eye, Search } from "lucide-react";
import OrderIssueDetailModal from "@/src/components/Shop/OrderIssues/OrderIssueDetailModal";
import toast from "react-hot-toast";

export default function ShopOrderIssuesPage() {
  const [issues, setIssues] = useState<OrderIssue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const res = await orderIssueService.getShopIssues({ Status: 1 });
      if (res.success && res.data) {
        setIssues(res.data.items);
      } else {
        toast.error(res.message || "Failed to fetch order issues");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred while fetching issues");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedIssueId(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 text-white min-h-screen">
      <h1 className="uppercase font-bold text-2xl tracking-widest text-white">
        Order Issues Management
      </h1>

      <div className="bg-[#151515] border border-[#1e2126] rounded-sm overflow-hidden mt-6">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#1a1c20] border-b border-[#1e2126] text-gray-400 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4 font-semibold">Order ID</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Reason</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2126]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#f5d800]"></div>
                    </div>
                  </td>
                </tr>
              ) : issues.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400 italic">
                    No pending order issues found.
                  </td>
                </tr>
              ) : (
                issues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-[#1a1c20]/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-[#f5d800]">
                      {issue.orderId}
                    </td>
                    <td className="px-6 py-4 text-gray-200">
                      {issue.customerName}
                    </td>
                    <td className="px-6 py-4 text-gray-200 font-medium">
                      {formatCurrency(issue.orderTotalAmount)}
                    </td>
                    <td className="px-6 py-4 text-gray-300 max-w-[200px] truncate" title={issue.reason}>
                      {issue.reason}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {formatDate(issue.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedIssueId(issue.id);
                          setIsModalOpen(true);
                        }}
                        className="p-2 bg-[#2a2d35] hover:bg-[#323640] text-white rounded-sm transition-colors border border-[#3e424d] inline-flex items-center justify-center group"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OrderIssueDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        issueId={selectedIssueId}
      />
    </div>
  );
}
