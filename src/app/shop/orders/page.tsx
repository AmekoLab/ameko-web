"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Package, Search, Eye, Loader2, Keyboard, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import { shopOrderService } from "@/src/services/shopOrder.service";
import { CartData } from "@/src/types/order.types";
import OrderDetailModal from "@/src/app/orders/OrderDetailModal";

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);

const STATUS_FILTERS = ["All", "Pending", "Processing", "Completed", "Cancelled"];

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
        return "bg-[#f5d800]/10 text-[#f5d800] border border-[#f5d800]/20";
      case "processing":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "paid":
      case "completed":
        return "bg-green-500/10 text-green-400 border border-green-500/20";
      case "cancelled":
      case "refunded":
      case "failed":
        return "bg-red-500/10 text-red-500 border border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border border-gray-500/20";
    }
  };

  return (
    <div className="bg-black min-h-screen p-4 md:p-8">
      <div className="max-w-[1440px] w-full mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 border-b border-[#1e2126] pb-4">
          <Package className="w-8 h-8 text-[#f5d800]" />
          <div>
            <h1 className="text-3xl font-black text-white font-oswald uppercase tracking-widest">
              Order Management
            </h1>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-1">
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
                className={`px-4 py-2 rounded-sm text-[10px] uppercase font-black tracking-widest transition-colors ${
                  activeStatusFilter === status
                    ? "bg-[#f5d800] text-black shadow-[0_0_10px_rgba(245,216,0,0.2)] border border-[#f5d800]"
                    : "bg-[#151515] text-gray-400 border border-[#1e2126] hover:bg-[#202030] hover:text-white"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="SEARCH BY ORDER ID, PHONE, OR NAME..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#151515] text-white border border-[#1e2126] rounded-sm py-2 pl-9 pr-4 text-[11px] font-bold uppercase tracking-widest focus:outline-none focus:border-[#f5d800] focus:ring-1 focus:ring-[#f5d800] transition-colors placeholder:text-gray-600"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-[#151515] rounded-sm shadow-sm border border-[#1e2126] overflow-hidden">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center text-gray-500">
              <Loader2 className="w-8 h-8 text-[#f5d800] animate-spin mb-4" />
              <p className="text-[11px] font-bold uppercase tracking-widest">
                Fetching orders...
              </p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <Package className="w-16 h-16 text-gray-600 mb-4" />
              <p className="text-[12px] font-black uppercase text-white tracking-widest mb-1">
                No Orders Found
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                {searchTerm || activeStatusFilter !== "All"
                  ? "Try adjusting your search or filters."
                  : "You don't have any incoming orders yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-[#1a1c20] text-gray-500 text-[10px] uppercase font-black tracking-widest border-b border-[#1e2126]">
                    <th className="px-5 py-4">Order ID</th>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Products</th>
                    <th className="px-5 py-4">Total Amount</th>
                    <th className="px-5 py-4">Order Status</th>
                    <th className="px-5 py-4">Payment</th>
                    <th className="px-5 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2126]">
                  {filteredOrders.map((order) => {
                    const firstItem = order.orderItems[0];
                    const hasMore = order.orderItems.length > 1;

                    return (
                      <tr
                        key={order.orderId}
                        className="hover:bg-[#202030] transition-colors group"
                      >
                        {/* Order ID */}
                        <td className="px-5 py-4">
                          <span className="text-[11px] text-[#f5d800] font-mono font-bold tracking-wider">
                            ...{order.orderId.slice(-8)}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="px-5 py-4">
                          <p className="text-[12px] font-black uppercase tracking-wider text-white">
                            {order.receiverName}
                          </p>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                            {order.receiverPhone}
                          </p>
                        </td>

                        {/* Products */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 bg-black rounded-sm border border-[#1e2126] shrink-0 relative flex items-center justify-center overflow-hidden">
                              {firstItem?.productImage ? (
                                <Image
                                  src={firstItem.productImage}
                                  alt={firstItem.productName || "Product"}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <Keyboard className="w-3.5 h-3.5 text-gray-600" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-300 truncate max-w-[200px]">
                                {firstItem?.productName || "Unknown Product"}
                              </p>
                              {hasMore && (
                                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-0.5">
                                  + {order.orderItems.length - 1} other item(s)
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Total Amount */}
                        <td className="px-5 py-4">
                          <p className="font-oswald font-black text-white text-[13px] tracking-wider">
                            {formatCurrency(order.totalAmount)}
                          </p>
                        </td>

                        {/* Order Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`px-2 py-0.5 rounded-sm border text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${getStatusBadgeStyles(
                              order.orderStatus
                            )}`}
                          >
                            {order.orderStatus}
                          </span>
                        </td>

                        {/* Payment Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`px-2 py-0.5 rounded-sm border text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${getStatusBadgeStyles(
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
                            className="p-1.5 rounded-sm border border-[#1e2126] bg-[#151515] text-gray-400 inline-flex items-center justify-center hover:bg-[#202030] hover:text-white hover:border-[#f5d800]/50 transition-colors"
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
            <div className="flex items-center justify-between px-5 py-4 border-t border-[#1e2126] bg-[#1a1c20]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                Page <strong className="text-white mx-1">{page}</strong>
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-sm border border-[#1e2126] bg-[#151515] text-gray-400 hover:text-white hover:bg-[#202030] hover:border-[#f5d800]/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={orders.length < size}
                  className="p-1.5 rounded-sm border border-[#1e2126] bg-[#151515] text-gray-400 hover:text-white hover:bg-[#202030] hover:border-[#f5d800]/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
