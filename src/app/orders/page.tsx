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
import OrderDetailModal from "./OrderDetailModal";
import { orderService } from "@/src/services/order.service";
import { CartData, OrderItem } from "@/src/types/order.types";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";

// ─── Constants ─────────────────────────────────────────────
const ORDER_STATUS_STYLES: Record<string, string> = {
  Pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  Processing: "bg-blue-50 text-blue-700 border border-blue-200",
  Completed: "bg-green-50 text-green-700 border border-green-200",
  Cancelled: "bg-red-50 text-red-700 border border-red-200",
  Shipped: "bg-indigo-50 text-indigo-700 border border-indigo-200",
};

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  Pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  Paid: "bg-green-50 text-green-700 border border-green-200",
  Released: "bg-teal-50 text-teal-700 border border-teal-200",
  Failed: "bg-red-50 text-red-700 border border-red-200",
  Refunded: "bg-gray-50 text-gray-700 border border-gray-200",
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
): string => styles[status] || "bg-gray-50 text-gray-700 border border-gray-200";

// ─── Loading Skeleton ──────────────────────────────────────
const OrdersSkeleton: FC = () => (
  <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-12 lg:py-20 animate-pulse">
    <div className="h-10 w-56 bg-neutral-200 rounded-sm mb-8" />
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white overflow-hidden">
          <div className="flex items-center justify-between p-5 ">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-neutral-200 rounded-full" />
              <div className="h-5 w-32 bg-neutral-200 rounded-sm" />
            </div>
            <div className="h-6 w-20 bg-neutral-200 rounded-sm" />
          </div>
          <div className="p-5">
            <div className="flex gap-3">
              <div className="w-16 h-16 bg-neutral-200 rounded-sm" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 bg-neutral-200 rounded-sm" />
                <div className="h-3 w-24 bg-neutral-200 rounded-sm" />
              </div>
            </div>
          </div>
          <div className="flex justify-between p-5 border-t border-amazon-border bg-neutral-50">
            <div className="h-4 w-28 bg-neutral-200 rounded-sm" />
            <div className="h-5 w-32 bg-neutral-200 rounded-sm" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Empty State ───────────────────────────────────────────
const EmptyOrders: FC = () => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <Package className="w-20 h-20 text-neutral-300 mb-6" strokeWidth={1} />
    <h2 className="text-2xl font-black text-amazon-text mb-2 font-oswald uppercase tracking-widest">
      No Orders Yet
    </h2>
    <p className="text-amazon-textMuted text-[11px] font-bold uppercase tracking-widest leading-relaxed mb-8 max-w-sm">
      You haven&apos;t placed any orders yet. Start exploring our collection of
      mechanical keyboards and parts!
    </p>
    <Link
      href="/shop/all-products"
      className="inline-flex items-center gap-2 bg-amazon-btnPrimary text-amazon-text px-6 py-3 rounded-sm font-black uppercase tracking-widest hover:brightness-95 transition-colors shadow-sm"
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
  <div className="flex items-center gap-8 py-3 border-b border-amazon-border last:border-b-0">
    <div className="relative w-24 h-24 rounded-sm overflow-hidden bg-white ">
      {item.productImage ? (
        <Image
          src={item.productImage}
          alt={item.productName}
          fill
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-neutral-50">
          <Keyboard className="w-6 h-6 text-amazon-textMuted" />
        </div>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[12px] font-black uppercase tracking-wider text-amazon-text truncate">
        {item.productName}
      </p>
      <p className="text-[11px] font-bold uppercase tracking-widest text-amazon-textMuted mt-1">
        {item.quantity} × <span className="text-amazon-link">{formatCurrency(item.unitPrice)}</span>
      </p>
    </div>
    <p className="text-[13px] font-oswald font-black tracking-wider text-amazon-text whitespace-nowrap">
      {formatCurrency(item.totalPrice)}
    </p>
  </div>
);

// ─── Order Card ────────────────────────────────────────────
interface OrderCardProps {
  order: CartData;
  onViewDetails: (orderId: string) => void;
}

const OrderCard: FC<OrderCardProps> = ({ order, onViewDetails }) => {
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
    <div className="bg-white rounded-sm border border-amazon-border ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-5 py-4 ">
        <div className="flex items-center gap-3">
          {order.shopAvatar ? (
            <div className="relative w-9 h-9 rounded-full overflow-hidden border border-amazon-border">
              <Image
                src={order.shopAvatar}
                alt={order.shopName}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center ">
              <Store className="w-4 h-4 text-amazon-textMuted" />
            </div>
          )}
          <div>
            <p className="text-[12px] font-black uppercase tracking-wider text-amazon-text">{order.shopName}</p>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amazon-textMuted mt-0.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(order.createdAt)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-black uppercase tracking-widest ${getStatusBadge(order.orderStatus, ORDER_STATUS_STYLES)}`}
          >
            {order.orderStatus}
          </span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-black uppercase tracking-widest ${getStatusBadge(order.paymentStatus, PAYMENT_STATUS_STYLES)}`}
          >
            {order.paymentStatus}
          </span>
        </div>
      </div>

      {/* Order Items */}
      <div className="px-5 py-2">
        {visibleItems.map((item) => (
          <OrderItemRow key={item.orderItemId} item={item} />
        ))}

        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-amazon-link hover:underline transition-colors py-3 w-full justify-center"
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-5 py-4 bg-neutral-50 rounded-b-sm border-t border-amazon-border">
        <div className="text-[11px] font-bold uppercase tracking-widest text-amazon-textMuted">
          {order.orderItems.length} item
          {order.orderItems.length !== 1 ? "s" : ""}
          {order.shippingFee > 0 && (
            <span className="ml-2">
              · Shipping: {formatCurrency(order.shippingFee)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <p className="text-lg font-oswald font-black text-amazon-price tracking-wider">
            {formatCurrency(order.totalAmount)}
          </p>
          {/* Pay Now button: only for Pending orders with Pending payment */}
          {order.orderStatus === "Pending" &&
            order.paymentStatus === "Pending" && (
              <button
                onClick={handleRepay}
                disabled={paying}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-sm font-black uppercase tracking-widest text-[11px] bg-amazon-btnPrimary text-amazon-text hover:brightness-95 shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed ml-2"
              >
                {paying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Pay Now
              </button>
            )}
          <button onClick={() => onViewDetails(order.orderId)} className="inline-flex items-center gap-2 px-4 py-2 rounded-sm font-black uppercase tracking-widest text-[11px] border border-amazon-border text-amazon-text bg-white hover:bg-neutral-50 transition-colors ml-2 shadow-sm">View Details</button>
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
  { label: "Cancelled", value: "Cancelled" },
] as const;

// ─── Main Page ─────────────────────────────────────────────
export default function MyOrdersPage() {
  const [orders, setOrders] = useState<CartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

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
    <div className="min-h-screen bg-amazon-bgSecondary text-amazon-text">
      <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-12 lg:py-6">
        {/* Back + Title */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="p-2.5 rounded-sm bg-white border border-amazon-border text-amazon-textMuted hover:text-amazon-text hover:bg-neutral-50 hover:border-amazon-text transition-all flex-shrink-0 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-amazon-text font-oswald tracking-widest uppercase">
              My Orders
            </h1>
            <p className="text-[11px] font-bold uppercase tracking-widest text-amazon-textMuted mt-1">
              {orders.length} order{orders.length !== 1 ? "s" : ""} placed
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        {orders.length > 0 && (
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {STATUS_FILTERS.map((f) => {
              const count =
                f.value === "all"
                  ? orders.length
                  : orders.filter((o) => o.orderStatus === f.value).length;

              return (
                <button
                  key={f.value}
                  onClick={() => setActiveFilter(f.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-sm text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${
                    activeFilter === f.value
                      ? "bg-amazon-bg text-amazon-focus border-amazon-focus font-bold"
                      : "bg-white text-amazon-textMuted border-transparent hover:text-amazon-text"
                  }`}
                >
                  {f.label}
                  {count > 0 && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${
                        activeFilter === f.value
                          ? "bg-neutral-100 text-amazon-text"
                          : "bg-neutral-100 text-amazon-text"
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
          <div className="bg-red-50 border border-red-200 rounded-sm p-4 mb-6">
            <p className="text-red-700 text-[11px] font-bold uppercase tracking-widest">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-red-600 text-[11px] font-black uppercase tracking-widest mt-2 hover:underline inline-flex items-center gap-1"
            >
              Try again
            </button>
          </div>
        )}

        {/* Order List */}
        {filteredOrders.length === 0 && !error ? (
          activeFilter !== "all" ? (
            <div className="text-center py-16 border border-amazon-border bg-white rounded-sm shadow-sm">
              <Package
                className="w-16 h-16 text-neutral-300 mx-auto mb-4"
                strokeWidth={1}
              />
              <p className="text-[11px] font-bold uppercase tracking-widest text-amazon-textMuted">
                No{" "}
                <span className="font-black text-amazon-text">{activeFilter}</span>{" "}
                orders found
              </p>
              <button
                onClick={() => setActiveFilter("all")}
                className="text-amazon-link text-[10px] font-black uppercase tracking-widest mt-4 hover:underline"
              >
                View all orders
              </button>
            </div>
          ) : (
            <EmptyOrders />
          )
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <OrderCard key={order.orderId} order={order} onViewDetails={(id) => setSelectedOrderId(id)} />
            ))}
          </div>
        )}
      </div>
      <OrderDetailModal isOpen={!!selectedOrderId} orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />
    </div>
  );
}
