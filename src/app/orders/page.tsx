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
  Pending: "bg-[#f5d800]/10 text-[#f5d800] border border-[#f5d800]/20",
  Processing: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  Completed: "bg-green-500/10 text-green-400 border border-green-500/20",
  Cancelled: "bg-red-500/10 text-red-500 border border-red-500/20",
  Shipped: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
};

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  Pending: "bg-[#f5d800]/10 text-[#f5d800] border border-[#f5d800]/20",
  Paid: "bg-green-500/10 text-green-400 border border-green-500/20",
  Released: "bg-teal-500/10 text-teal-400 border border-teal-500/20",
  Failed: "bg-red-500/10 text-red-500 border border-red-500/20",
  Refunded: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
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
): string => styles[status] || "bg-gray-500/10 text-gray-400 border border-gray-500/20";

// ─── Loading Skeleton ──────────────────────────────────────
const OrdersSkeleton: FC = () => (
  <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-12 lg:py-20 animate-pulse">
    <div className="h-10 w-56 bg-[#1e2126] rounded-sm mb-8" />
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-[#151515] rounded-sm border border-[#1e2126] overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-[#1e2126] bg-[#1a1c20]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1e2126] rounded-full" />
              <div className="h-5 w-32 bg-[#1e2126] rounded-sm" />
            </div>
            <div className="h-6 w-20 bg-[#1e2126] rounded-sm" />
          </div>
          <div className="p-5">
            <div className="flex gap-3">
              <div className="w-16 h-16 bg-[#1e2126] rounded-sm" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 bg-[#1e2126] rounded-sm" />
                <div className="h-3 w-24 bg-[#1e2126] rounded-sm" />
              </div>
            </div>
          </div>
          <div className="flex justify-between p-5 border-t border-[#1e2126] bg-[#1a1c20]">
            <div className="h-4 w-28 bg-[#1e2126] rounded-sm" />
            <div className="h-5 w-32 bg-[#1e2126] rounded-sm" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Empty State ───────────────────────────────────────────
const EmptyOrders: FC = () => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <Package className="w-20 h-20 text-[#1e2126] mb-6" strokeWidth={1} />
    <h2 className="text-2xl font-black text-white mb-2 font-oswald uppercase tracking-widest">
      No Orders Yet
    </h2>
    <p className="text-gray-500 text-[11px] font-bold uppercase tracking-widest leading-relaxed mb-8 max-w-sm">
      You haven&apos;t placed any orders yet. Start exploring our collection of
      mechanical keyboards and parts!
    </p>
    <Link
      href="/shop/all-products"
      className="inline-flex items-center gap-2 bg-[#f5d800] text-black px-6 py-3 rounded-sm font-black uppercase tracking-widest hover:bg-[#ffe500] transition-colors shadow-[0_0_15px_rgba(245,216,0,0.3)]"
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
  <div className="flex items-center gap-3 py-3 border-b border-[#1e2126] last:border-b-0">
    <div className="relative w-14 h-14 rounded-sm overflow-hidden bg-black border border-[#1e2126] flex-shrink-0">
      {item.productImage ? (
        <Image
          src={item.productImage}
          alt={item.productName}
          fill
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[#151515]">
          <Keyboard className="w-6 h-6 text-gray-500" />
        </div>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[12px] font-black uppercase tracking-wider text-white truncate">
        {item.productName}
      </p>
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mt-1">
        {item.quantity} × <span className="text-[#f5d800]">{formatCurrency(item.unitPrice)}</span>
      </p>
    </div>
    <p className="text-[13px] font-oswald font-black tracking-wider text-white whitespace-nowrap">
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
    <div className="bg-[#151515] rounded-sm border border-[#1e2126] transition-all hover:border-[#f5d800]/50 hover:shadow-[0_0_15px_rgba(245,216,0,0.1)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-5 py-4 border-b border-[#1e2126] bg-[#1a1c20] rounded-t-sm">
        <div className="flex items-center gap-3">
          {order.shopAvatar ? (
            <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#1e2126]">
              <Image
                src={order.shopAvatar}
                alt={order.shopName}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center border border-[#1e2126]">
              <Store className="w-4 h-4 text-gray-500" />
            </div>
          )}
          <div>
            <p className="text-[12px] font-black uppercase tracking-wider text-white">{order.shopName}</p>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-0.5">
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
            className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-[#f5d800] hover:text-[#ffe500] transition-colors py-3 hover:underline w-full justify-center"
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-5 py-4 bg-[#1a1c20] rounded-b-sm border-t border-[#1e2126]">
        <div className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
          {order.orderItems.length} item
          {order.orderItems.length !== 1 ? "s" : ""}
          {order.shippingFee > 0 && (
            <span className="ml-2">
              · Shipping: {formatCurrency(order.shippingFee)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <p className="text-lg font-oswald font-black text-white tracking-wider">
            {formatCurrency(order.totalAmount)}
          </p>
          {/* Pay Now button: only for Pending orders with Pending payment */}
          {order.orderStatus === "Pending" &&
            order.paymentStatus === "Pending" && (
              <button
                onClick={handleRepay}
                disabled={paying}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-sm font-black uppercase tracking-widest text-[11px] bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed ml-2 shadow-[0_0_10px_rgba(220,38,38,0.3)]"
              >
                {paying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Pay Now
              </button>
            )}
          <button onClick={() => onViewDetails(order.orderId)} className="inline-flex items-center gap-2 px-4 py-2 rounded-sm font-black uppercase tracking-widest text-[11px] border border-[#1e2126] text-white hover:text-white hover:border-[#f5d800] hover:bg-[#202030] transition-colors ml-2">View Details</button>
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
    <div className="min-h-screen bg-black">
      <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-12 lg:py-20">
        {/* Back + Title */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="p-2.5 rounded-sm bg-[#151515] border border-[#1e2126] text-gray-400 hover:text-white hover:bg-[#202030] hover:border-[#f5d800]/50 transition-all flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-white font-oswald tracking-widest uppercase">
              My Orders
            </h1>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mt-1">
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
                  className={`flex items-center gap-2 px-4 py-2 rounded-sm text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                    activeFilter === f.value
                      ? "bg-[#f5d800] text-black border-[#f5d800] shadow-[0_0_10px_rgba(245,216,0,0.2)]"
                      : "bg-[#151515] text-gray-400 border-[#1e2126] hover:border-[#f5d800]/50 hover:text-white"
                  }`}
                >
                  {f.label}
                  {count > 0 && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${
                        activeFilter === f.value
                          ? "bg-black/20 text-black"
                          : "bg-black text-gray-500 border border-[#1e2126]"
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
          <div className="bg-red-500/10 border border-red-500/20 rounded-sm p-4 mb-6">
            <p className="text-red-500 text-[11px] font-bold uppercase tracking-widest">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-red-400 text-[11px] font-black uppercase tracking-widest mt-2 hover:underline inline-flex items-center gap-1"
            >
              Try again
            </button>
          </div>
        )}

        {/* Order List */}
        {filteredOrders.length === 0 && !error ? (
          activeFilter !== "all" ? (
            <div className="text-center py-16 border border-[#1e2126] bg-[#151515] rounded-sm">
              <Package
                className="w-16 h-16 text-[#1e2126] mx-auto mb-4"
                strokeWidth={1}
              />
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                No{" "}
                <span className="font-black text-white">{activeFilter}</span>{" "}
                orders found
              </p>
              <button
                onClick={() => setActiveFilter("all")}
                className="text-[#f5d800] text-[10px] font-black uppercase tracking-widest mt-4 hover:underline"
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
