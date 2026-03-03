"use client";

import { FC, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  ChevronDown,
  ChevronUp,
  Store,
  Calendar,
  ShoppingBag,
  ArrowLeft,
  Keyboard,
  Loader2,
} from "lucide-react";
import { orderService } from "@/src/services/order.service";
import { CartData, OrderItem } from "@/src/types/order.types";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";

// ─── Constants ─────────────────────────────────────────────
const ORDER_STATUS_STYLES: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Processing: "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
  Shipped: "bg-indigo-100 text-indigo-800",
};

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Paid: "bg-green-100 text-green-800",
  Released: "bg-emerald-100 text-emerald-800",
  Failed: "bg-red-100 text-red-800",
  Refunded: "bg-gray-100 text-gray-800",
};

// ─── Helpers ───────────────────────────────────────────────
const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);

const formatDate = (dateStr: string): string => {
  try {
    return format(parseISO(dateStr), "MMM dd, yyyy");
  } catch {
    return dateStr;
  }
};

const getStatusBadge = (
  status: string,
  styles: Record<string, string>,
): string => styles[status] || "bg-gray-100 text-gray-800";

// ─── Loading Skeleton ──────────────────────────────────────
const OrdersSkeleton: FC = () => (
  <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-12 lg:py-20 animate-pulse">
    <div className="h-10 w-56 bg-gray-200 rounded mb-8" />
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="h-5 w-32 bg-gray-200 rounded" />
            </div>
            <div className="h-6 w-20 bg-gray-200 rounded-full" />
          </div>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-16 h-16 bg-gray-200 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 bg-gray-200 rounded" />
                <div className="h-3 w-24 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="h-4 w-28 bg-gray-200 rounded" />
            <div className="h-5 w-32 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Empty State ───────────────────────────────────────────
const EmptyOrders: FC = () => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <Package className="w-20 h-20 text-gray-300 mb-6" strokeWidth={1} />
    <h2 className="text-2xl font-bold text-gray-900 mb-2 font-oswald">
      No Orders Yet
    </h2>
    <p className="text-gray-500 mb-8 max-w-sm">
      You haven&apos;t placed any orders yet. Start exploring our collection of
      mechanical keyboards and parts!
    </p>
    <Link
      href="/shop/all-products"
      className="inline-flex items-center gap-2 bg-[#ce2a32] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#b52429] transition-colors"
    >
      <ShoppingBag className="w-5 h-5" />
      Browse Products
    </Link>
  </div>
);

// ─── Order Item Row ────────────────────────────────────────
interface OrderItemRowProps {
  item: OrderItem;
}

const OrderItemRow: FC<OrderItemRowProps> = ({ item }) => (
  <div className="flex items-center gap-3 py-2">
    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
      {item.productImage ? (
        <Image
          src={item.productImage}
          alt={item.productName}
          fill
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-50">
          <Keyboard className="w-6 h-6 text-gray-300" />
        </div>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 truncate">
        {item.productName}
      </p>
      <p className="text-xs text-gray-500">
        {item.quantity} × {formatCurrency(item.unitPrice)}
      </p>
    </div>
    <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
      {formatCurrency(item.totalPrice)}
    </p>
  </div>
);

// ─── Order Card ────────────────────────────────────────────
interface OrderCardProps {
  order: CartData;
}

const OrderCard: FC<OrderCardProps> = ({ order }) => {
  const [expanded, setExpanded] = useState(false);
  const [paying, setPaying] = useState(false);
  const visibleItems = expanded
    ? order.orderItems
    : order.orderItems.slice(0, 2);
  const hasMore = order.orderItems.length > 2;

  // Repay handler
  const handleRepay = async () => {
    setPaying(true);
    try {
      const res = await orderService.repayOrder(order.orderGroupId);
      if (res.success && res.data?.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      } else {
        toast.error(res.message || "Failed to generate payment link");
      }
    } catch (err: unknown) {
      toast.error(
        (err as { message?: string }).message ||
          "Failed to generate payment link",
      );
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          {order.shopAvatar ? (
            <div className="relative w-9 h-9 rounded-full overflow-hidden border border-gray-200">
              <Image
                src={order.shopAvatar}
                alt={order.shopName}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
              <Store className="w-4 h-4 text-gray-400" />
            </div>
          )}
          <div>
            <p className="text-sm font-bold text-gray-900">{order.shopName}</p>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              {formatDate(order.createdAt)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide ${getStatusBadge(order.orderStatus, ORDER_STATUS_STYLES)}`}
          >
            {order.orderStatus}
          </span>
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide ${getStatusBadge(order.paymentStatus, PAYMENT_STATUS_STYLES)}`}
          >
            {order.paymentStatus}
          </span>
        </div>
      </div>

      {/* Order Items */}
      <div className="px-5 py-3 divide-y divide-gray-50">
        {visibleItems.map((item) => (
          <OrderItemRow key={item.orderItemId} item={item} />
        ))}

        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-[#ce2a32] font-medium pt-2 hover:underline"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                {order.orderItems.length - 2} more item
                {order.orderItems.length - 2 > 1 ? "s" : ""}
              </>
            )}
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 bg-gray-50/60 rounded-b-xl border-t border-gray-100">
        <div className="text-xs text-gray-500">
          {order.orderItems.length} item
          {order.orderItems.length !== 1 ? "s" : ""}
          {order.shippingFee > 0 && (
            <span className="ml-2">
              · Shipping: {formatCurrency(order.shippingFee)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-base font-bold text-gray-900">
            {formatCurrency(order.totalAmount)}
          </p>
          {/* Pay Now button: only for Pending orders with Pending payment */}
          {order.orderStatus === "Pending" &&
            order.paymentStatus === "Pending" && (
              <button
                onClick={handleRepay}
                disabled={paying}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold bg-orange-500 text-white hover:bg-orange-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed ml-2"
              >
                {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Pay Now
              </button>
            )}
        </div>
      </div>
    </div>
  );
};

// ─── Status Filter Tabs ────────────────────────────────────
const STATUS_FILTERS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "Pending" },
  { label: "Processing", value: "Processing" },
  { label: "Completed", value: "Completed" },
] as const;

// ─── Main Page ─────────────────────────────────────────────
export default function MyOrdersPage() {
  const [orders, setOrders] = useState<CartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await orderService.getMyOrders();
        if (res.success && res.data) {
          // Filter out InCart orders, then sort newest-first
          const actualOrders = res.data
            .filter((o) => o.orderStatus !== "InCart")
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            );
          setOrders(actualOrders);
        } else {
          setError(res.message || "Failed to fetch orders");
          toast.error(res.message || "Failed to fetch orders");
        }
      } catch (err: unknown) {
        const message =
          (err as { message?: string }).message || "Failed to fetch orders";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Apply status filter
  const filteredOrders = useMemo(() => {
    if (activeFilter === "all") return orders;
    return orders.filter((o) => o.orderStatus === activeFilter);
  }, [orders, activeFilter]);

  if (loading) return <OrdersSkeleton />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-12 lg:py-20">
        {/* Back + Title */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-oswald tracking-tight">
              My Orders
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {orders.length} order{orders.length !== 1 ? "s" : ""} placed
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        {orders.length > 0 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {STATUS_FILTERS.map((f) => {
              const count =
                f.value === "all"
                  ? orders.length
                  : orders.filter((o) => o.orderStatus === f.value).length;

              return (
                <button
                  key={f.value}
                  onClick={() => setActiveFilter(f.value)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeFilter === f.value
                      ? "bg-[#ce2a32] text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {f.label}
                  {count > 0 && (
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full ${
                        activeFilter === f.value
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-red-600 text-sm font-semibold mt-2 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Order List */}
        {filteredOrders.length === 0 && !error ? (
          activeFilter !== "all" ? (
            <div className="text-center py-16">
              <Package
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                strokeWidth={1}
              />
              <p className="text-gray-500">
                No{" "}
                <span className="font-semibold lowercase">{activeFilter}</span>{" "}
                orders found
              </p>
              <button
                onClick={() => setActiveFilter("all")}
                className="text-[#ce2a32] text-sm font-semibold mt-2 hover:underline"
              >
                View all orders
              </button>
            </div>
          ) : (
            <EmptyOrders />
          )
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order.orderId} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
