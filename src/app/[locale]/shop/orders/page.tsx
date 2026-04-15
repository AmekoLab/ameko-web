"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Package, Search, Eye, Loader2, Keyboard, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import { shopOrderService } from "@/src/services/shopOrder.service";
import { CartData } from "@/src/types/order.types";
import OrderDetailModal from "@/src/app/[locale]/orders/OrderDetailModal";

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);

const STATUS_FILTERS = ["All", "Pending", "Processing", "Completed", "Cancelled" , "Shipped"];

export default function ShopOrdersPage() {
  const [orders, setOrders] = useState<CartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const size = 10;

  const [searchTerm, setSearchTerm] = useState("");
  const [activeStatusFilter, setActiveStatusFilter] = useState("All");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await shopOrderService.getShopOrders(page, size);
        if (res.success && res.data) {
          setOrders(res.data);
        } else {
          toast.error(res.message || "Failed to fetch shop orders");
        }
      } catch (err: unknown) {
        const msg = (err as { message?: string }).message || "Error fetching shop orders";
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [page]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchStatus =
        activeStatusFilter === "All" || order.orderStatus === activeStatusFilter;

      const lowerSearch = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        order.orderId.toLowerCase().includes(lowerSearch) ||
        order.receiverName.toLowerCase().includes(lowerSearch) ||
        order.receiverPhone.toLowerCase().includes(lowerSearch);

      return matchStatus && matchSearch;
    });
  }, [orders, activeStatusFilter, searchTerm]);

  const getStatusBadgeStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "processing":
      case "shipped":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "paid":
      case "completed":
        return "bg-green-50 text-green-700 border-green-200";
      case "cancelled":
      case "refunded":
      case "failed":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-neutral-100 text-amazon-textMuted border-amazon-border";
    }
  };

  return (
    <div className="py-2 px-2 md:px-6 relative bg-amazon-bgSecondary min-h-screen">
      <div className="max-w-[1440px] w-full mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 border-b border-amazon-border pb-4">
          {/* <Package className="w-8 h-8 text-amazon-textMuted" /> */}
          <div>
            <h1 className="text-2xl font-bold text-amazon-text">
              Order Management
            </h1>
            <p className="text-[11px] font-medium text-amazon-textMuted mt-1">
              Manage your shop's incoming orders from customers
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status}
                onClick={() => setActiveStatusFilter(status)}
                className={`px-4 py-2 rounded-sm text-[10px] transition-colors ${
                  activeStatusFilter === status
                    ? "bg-amazon-bg text-amazon-focus border border-amazon-focus font-medium"
                    : "bg-white text-amazon-textMuted border border-amazon-border hover:text-amazon-text hover:bg-neutral-50 font-normal"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amazon-textMuted" />
            <input
              type="text"
              placeholder="Search by order ID, phone, or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white text-amazon-text border border-amazon-border rounded-sm py-2 pl-9 pr-4 text-[11px] focus:outline-none focus:border-amazon-focus focus:ring-1 focus:ring-amazon-focus transition-colors placeholder:text-amazon-textMuted"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-sm shadow-sm border border-amazon-border overflow-hidden">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center text-amazon-textMuted">
              <Loader2 className="w-8 h-8 text-amazon-textMuted animate-spin mb-4" />
              <p className="text-[11px] font-medium">
                Fetching orders...
              </p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <Package className="w-16 h-16 text-neutral-300 mb-4" />
              <p className="text-[12px] font-medium text-amazon-text mb-1">
                No Orders Found
              </p>
              <p className="text-[10px] font-medium text-amazon-textMuted">
                {searchTerm || activeStatusFilter !== "All"
                  ? "Try adjusting your search or filters."
                  : "You don't have any incoming orders yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-neutral-50 text-amazon-textMuted text-[10px] border-b border-amazon-border">
                    <th className="px-5 py-4 font-medium">Order ID</th>
                    <th className="px-5 py-4 font-medium">Customer</th>
                    <th className="px-5 py-4 font-medium">Products</th>
                    <th className="px-5 py-4 font-medium">Total Amount</th>
                    <th className="px-5 py-4 font-medium">Order Status</th>
                    <th className="px-5 py-4 font-medium">Payment</th>
                    <th className="px-5 py-4 text-center font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amazon-border">
                  {filteredOrders.map((order) => {
                    const firstItem = order.orderItems[0];
                    const hasMore = order.orderItems.length > 1;

                    return (
                      <tr
                        key={order.orderId}
                        className="hover:bg-neutral-50 transition-colors group"
                      >
                        {/* Order ID */}
                        <td className="px-5 py-4">
                          <span className="text-[11px] text-amazon-text font-mono font-medium">
                            ...{order.orderId.slice(-8)}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="px-5 py-4">
                          <p className="text-[12px] font-medium text-amazon-text">
                            {order.receiverName}
                          </p>
                          <p className="text-[10px] font-normal text-amazon-textMuted mt-0.5">
                            {order.receiverPhone}
                          </p>
                        </td>

                        {/* Products */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 bg-neutral-100 rounded-sm  shrink-0 relative flex items-center justify-center overflow-hidden">
                              {firstItem?.productImage ? (
                                <Image
                                  src={firstItem.productImage}
                                  alt={firstItem.productName || "Product"}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <Keyboard className="w-3.5 h-3.5 text-amazon-textMuted" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-medium text-amazon-text truncate max-w-[200px]">
                                {firstItem?.productName || "Unknown Product"}
                              </p>
                              {hasMore && (
                                <p className="text-[9px] font-normal text-amazon-textMuted mt-0.5">
                                  + {order.orderItems.length - 1} other item(s)
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Total Amount */}
                        <td className="px-5 py-4">
                          <p className="font-bold text-amazon-price text-[13px]">
                            {formatCurrency(order.totalAmount)}
                          </p>
                        </td>

                        {/* Order Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`px-2 py-0.5 rounded-sm border text-[9px] whitespace-nowrap font-medium ${getStatusBadgeStyles(
                              order.orderStatus
                            )}`}
                          >
                            {order.orderStatus}
                          </span>
                        </td>

                        {/* Payment Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`px-2 py-0.5 rounded-sm border text-[9px] whitespace-nowrap font-medium ${getStatusBadgeStyles(
                              order.paymentStatus
                            )}`}
                          >
                            {order.paymentStatus}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => setSelectedOrderId(order.orderId)}
                            title="View order details"
                            className="p-1.5 rounded-sm border border-amazon-border bg-white text-amazon-textMuted inline-flex items-center justify-center hover:bg-neutral-50 hover:text-amazon-text transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {(!loading && filteredOrders.length > 0) || page > 1 ? (
            <div className="flex items-center justify-between px-5 py-4 border-t border-amazon-border bg-white">
              <p className="text-[10px] font-medium text-amazon-textMuted">
                Page <strong className="text-amazon-text mx-1">{page}</strong>
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-sm border border-amazon-border bg-white text-amazon-textMuted hover:text-amazon-text hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={orders.length < size}
                  className="p-1.5 rounded-sm border border-amazon-border bg-white text-amazon-textMuted hover:text-amazon-text hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Integration of Order Detail Modal */}
      <OrderDetailModal
        isOpen={!!selectedOrderId}
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />
    </div>
  );
}
