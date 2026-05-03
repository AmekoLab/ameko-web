"use client";

import { FC, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/src/i18n/routing";
import { useAppSelector } from "@/src/store/hook";
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
  FileText,
  Info,
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
  Refunded: "bg-neutral-100 text-neutral-700 border border-neutral-200",
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
): string =>
  styles[status] || "bg-neutral-50 text-neutral-700 border border-neutral-200";

const ORDER_STATUS_LABEL_KEYS: Record<string, string> = {
  Pending: "pending",
  Processing: "processing",
  Completed: "completed",
  Cancelled: "cancelled",
  Shipped: "shipped",
};

const PAYMENT_STATUS_LABEL_KEYS: Record<string, string> = {
  Pending: "pending",
  Paid: "paid",
  Released: "released",
  Failed: "failed",
  Refunded: "refunded",
};

// ─── Loading Skeleton ──────────────────────────────────────
const OrdersSkeleton: FC = () => (
  <div className="max-w-5xl mx-auto px-4 md:px-8 py-12 lg:py-16 animate-pulse">
    <div className="h-10 w-64 bg-neutral-200 rounded-xl mb-10" />
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-2xl overflow-hidden border border-neutral-100 shadow-sm"
        >
          <div className="flex items-center justify-between p-5 border-b border-neutral-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-neutral-100 rounded-full" />
              <div className="h-5 w-32 bg-neutral-100 rounded-md" />
            </div>
            <div className="h-6 w-20 bg-neutral-100 rounded-md" />
          </div>
          <div className="p-5">
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-neutral-100 rounded-xl" />
              <div className="flex-1 space-y-3 py-1">
                <div className="h-4 w-48 bg-neutral-100 rounded-md" />
                <div className="h-3 w-24 bg-neutral-100 rounded-md" />
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center p-5 border-t border-neutral-50 bg-neutral-50/50">
            <div className="h-4 w-28 bg-neutral-200 rounded-md" />
            <div className="h-8 w-32 bg-neutral-200 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Empty State ───────────────────────────────────────────
const EmptyOrders: FC = () => {
  const t = useTranslations("page");

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-dashed border-neutral-200 shadow-sm">
      <div className="w-20 h-20 rounded-full bg-neutral-50 flex items-center justify-center mb-6">
        <Package className="w-10 h-10 text-neutral-300" strokeWidth={1.5} />
      </div>
      <h2 className="text-xl font-bold text-neutral-900 mb-2">
        {t("noOrdersYet")}
      </h2>
      <p className="text-neutral-500 text-sm leading-relaxed mb-8 max-w-sm">
        {t("noOrdersDescription")}
      </p>
      <Link
        href="/shop/all-products"
        className="inline-flex items-center justify-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-neutral-800 transition-colors shadow-sm active:scale-[0.98]"
      >
        <ShoppingBag className="w-5 h-5" />
        {t("browseProducts")}
      </Link>
    </div>
  );
};

// ─── Order Item Row ────────────────────────────────────────
interface OrderItemRowProps {
  item: OrderItem;
}

const OrderItemRow: FC<OrderItemRowProps> = ({ item }) => {
  const tCommon = useTranslations("Common");
  const isCancelled = item.itemStatus === "Cancelled";

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 py-4 border-b border-neutral-100 last:border-b-0 group ${isCancelled ? "opacity-50 grayscale bg-neutral-50/50" : ""}`}>
      <div className="relative w-24 h-24 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden bg-neutral-50 border border-neutral-100">
        {item.productImage ? (
          <Image
            src={item.productImage}
            alt={item.productName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Keyboard className="w-6 h-6 text-neutral-300" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-neutral-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
            {item.productName}
          </p>
          {isCancelled && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-neutral-200 text-neutral-600 rounded-sm whitespace-nowrap">
              {tCommon("cancelled")}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <p className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-md">
            {tCommon("qty")}: {item.quantity}
          </p>
          <span className="text-neutral-300">•</span>
          <p className="text-xs font-medium text-amazon-price">
            {formatCurrency(item.unitPrice)} {tCommon("ea")}
          </p>
        </div>
      </div>
      <div className="sm:text-right mt-2 sm:mt-0 flex flex-row sm:flex-col items-center sm:items-end justify-between">
        <span className="text-xs font-medium text-neutral-400 sm:hidden">
          {tCommon("total")}:
        </span>
        <div className="flex flex-col items-end">
          {item.allocatedDiscount && item.allocatedDiscount > 0 ? (
            <>
              <span className="text-xs font-medium text-neutral-400 line-through mb-0.5">
                {formatCurrency(item.totalPrice)}
              </span>
              <p className="text-base font-bold text-amazon-price whitespace-nowrap">
                {formatCurrency(item.finalPrice ?? item.totalPrice)}
              </p>
            </>
          ) : (
            <p className="text-base font-bold text-amazon-price whitespace-nowrap">
              {formatCurrency(item.totalPrice)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Order Card ────────────────────────────────────────────
interface OrderCardProps {
  order: CartData;
  onViewDetails: (orderId: string) => void;
}

const OrderCard: FC<OrderCardProps> = ({ order, onViewDetails }) => {
  const [expanded, setExpanded] = useState(false);
  const [paying, setPaying] = useState(false);
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);
  const t = useTranslations("page");
  const tCommon = useTranslations("Common");
  const visibleItems = expanded
    ? order.orderItems
    : order.orderItems.slice(0, 2);
  const hasMore = order.orderItems.length > 2;

  // Invoice Download Handler
  const handleDownloadInvoice = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDownloadingInvoice(true);
    try {
      const blob = await orderService.downloadInvoicePDF(order.orderId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Hoa_Don_${order.orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 5000);
    } catch (error: any) {
      console.error("Lỗi tải hóa đơn:", error);
      const status = error?.response?.status;
      if (status === 403) toast.error("Không có quyền tải hóa đơn này.");
      else if (status === 404) toast.error("Không tìm thấy đơn hàng.");
      else toast.error("Lỗi khi tải hóa đơn PDF.");
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

  // Repay handler
  const handleRepay = async () => {
    setPaying(true);
    try {
      const res = await orderService.repayOrder(order.orderGroupId);
      if (res.success && res.data?.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      } else {
        toast.error(res.message || t("paymentLinkFailed"));
      }
    } catch (err: unknown) {
      toast.error(
        (err as { message?: string }).message || t("paymentLinkFailed"),
      );
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-4 border-b border-neutral-50 bg-white">
        <div className="flex items-center gap-3.5">
          {order.shopAvatar ? (
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-neutral-100 bg-neutral-50 shrink-0">
              <Image
                src={order.shopAvatar}
                alt={order.shopName}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center border border-neutral-100 shrink-0">
              <Store className="w-4 h-4 text-neutral-400" />
            </div>
          )}
          <div>
            <p className="text-sm font-bold text-neutral-900">
              {order.shopName}
            </p>
            <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              {formatDate(order.createdAt)}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${getStatusBadge(order.orderStatus, ORDER_STATUS_STYLES)}`}
          >
            {ORDER_STATUS_LABEL_KEYS[order.orderStatus]
              ? t(`orderStatus.${ORDER_STATUS_LABEL_KEYS[order.orderStatus]}`)
              : order.orderStatus}
          </span>
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${getStatusBadge(order.paymentStatus, PAYMENT_STATUS_STYLES)}`}
          >
            {PAYMENT_STATUS_LABEL_KEYS[order.paymentStatus]
              ? t(
                  `paymentStatus.${PAYMENT_STATUS_LABEL_KEYS[order.paymentStatus]}`,
                )
              : order.paymentStatus}
          </span>
        </div>
      </div>

      {/* Cancellation Notice for OrderCard */}
      {order.orderStatus === "Cancelled" && order.cancelledBy && (
        <div className="px-6 py-2 bg-red-50/50 border-b border-red-50">
          <p className="text-xs text-red-600 font-medium flex items-start sm:items-center gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 sm:mt-0" />
            <span>
              {t("orderCancelledBy")} <strong>{order.cancelledBy === "Customer" ? t("customer") : order.cancelledBy}</strong> 
              {order.cancelReason ? ` - ${t("orderCancelReason")} : ${order.cancelReason}` : ""}
            </span>
          </p>
        </div>
      )}

      {/* Order Items */}
      <div className="px-6 py-2 flex-grow bg-white">
        {visibleItems.map((item) => (
          <OrderItemRow key={item.orderItemId} item={item} />
        ))}

        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50/50 hover:bg-blue-50 rounded-xl transition-colors py-3 mt-4 w-full"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                {tCommon("showLess")}
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                {t("showMoreItems", { count: order.orderItems.length - 2 })}
              </>
            )}
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 px-6 py-4 bg-neutral-50/50 border-t border-neutral-100 mt-auto">
        <div className="text-sm font-medium text-neutral-500 flex items-center gap-2">
          <span className="bg-white px-2.5 py-1 border border-neutral-200 rounded-lg text-neutral-700">
            {t("itemsCount", { count: order.orderItems.length })}
          </span>
          {order.shippingFee > 0 && (
            <span className="flex items-center gap-2">
              <span className="text-neutral-300">•</span>
              <span>
                {tCommon("shipping")}:{" "}
                <span className="text-neutral-900">
                  {formatCurrency(order.shippingFee)}
                </span>
              </span>
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between w-full md:w-auto mt-2 md:mt-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-widest sm:hidden">
              {t("orderTotal")}
            </span>
            <p className="text-xl font-bold text-amazon-price">
              {formatCurrency(order.totalAmount)}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Pay Now button: only for Pending orders with Pending payment */}
            {order.orderStatus === "Pending" &&
              order.paymentStatus === "Pending" && (
                <button
                  onClick={handleRepay}
                  disabled={paying}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {tCommon("payNow")}
                </button>
              )}
            <button
              onClick={handleDownloadInvoice}
              disabled={isDownloadingInvoice}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm border border-neutral-200 text-neutral-700 bg-white hover:bg-neutral-50 transition-all shadow-sm active:scale-[0.98] disabled:opacity-60"
            >
              {isDownloadingInvoice ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              <span className="hidden sm:inline">{tCommon("downloadInvoice")}</span>
            </button>
            <button
              onClick={() => onViewDetails(order.orderId)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm border border-neutral-200 text-neutral-700 bg-white hover:bg-neutral-50 transition-all shadow-sm active:scale-[0.98]"
            >
              {tCommon("viewDetails")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Status Filter Tabs ────────────────────────────────────
const STATUS_FILTERS = [
  { labelKey: "all", value: "all" },
  { labelKey: "pending", value: "Pending" },
  { labelKey: "processing", value: "Processing" },
  { labelKey: "completed", value: "Completed" },
  { labelKey: "cancelled", value: "Cancelled" },
] as const;

// ─── Main Page ─────────────────────────────────────────────
export default function MyOrdersPage() {
  const t = useTranslations("page");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isInitialized } = useAppSelector(
    (state) => state.auth,
  );
  const [orders, setOrders] = useState<CartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [isInitialized, isAuthenticated, router, pathname]);

  // Trigger fetch when activeFilter changes
  useEffect(() => {
    if (!isInitialized || !isAuthenticated) return;
    setPage(1);
    fetchOrders(1, activeFilter);
  }, [activeFilter, isInitialized, isAuthenticated]);

  const fetchOrders = async (currentPage: number, statusFilter: string) => {
    try {
      if (currentPage === 1) setLoading(true);
      else setLoadingMore(true);

      const params: any = { page: currentPage, size: 10 };
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const res = await orderService.getMyOrders(params);
      if (res.success && res.data) {
        // Filter out InCart just in case (backend shouldn't return it anyway)
        const actualOrders = res.data.items.filter((o) => o.orderStatus !== "InCart");
        
        if (currentPage === 1) {
          setOrders(actualOrders);
        } else {
          setOrders(prev => [...prev, ...actualOrders]);
        }
        setHasNextPage(res.data.hasNextPage);
      } else {
        setError(res.message || t("fetchOrdersFailed"));
        toast.error(res.message || t("fetchOrdersFailed"));
      }
    } catch (err: unknown) {
      const message = (err as { message?: string }).message || t("fetchOrdersFailed");
      setError(message);
      toast.error(message);
    } finally {
      if (currentPage === 1) setLoading(false);
      setLoadingMore(false);
    }
  };

  if (!isInitialized) return <OrdersSkeleton />;
  if (!isAuthenticated) return null;
  if (loading) return <OrdersSkeleton />;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-neutral-50 text-neutral-900 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Back + Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2.5 rounded-xl bg-white border border-neutral-200 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-50 transition-all shadow-sm group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 tracking-tight flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg hidden sm:block">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                {t("title")}
              </h1>
              <p className="text-neutral-500 mt-1 text-sm font-medium">
                {/* Total count removed since we don't have total orders across all filters in the paginated response items, 
                    we only have items for the current page/filter. The user didn't ask to show totalCount from API. */}
              </p>
            </div>
          </div>
        </div>

        {/* Warranty & Return Notice Banner */}
        <div className="mb-6 flex items-start sm:items-center gap-3 px-5 py-4 bg-blue-50/50 border border-blue-100 rounded-xl shadow-sm">
          <div className="p-1.5 bg-blue-100 rounded-lg shrink-0 mt-0.5 sm:mt-0">
            <Info className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm text-neutral-700 font-medium leading-relaxed">
            {t("warrantyAndReturnNotice")}{" "}
            <Link 
              href="/my-payments" 
              className="text-blue-600 font-bold hover:text-blue-700 hover:underline transition-all inline-flex items-center gap-1"
            >
              {t("warrantyAndReturnLink")}
            </Link>
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2.5 mb-8 overflow-x-auto pb-3 custom-scrollbar">
          {STATUS_FILTERS.map((f) => {
            return (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  activeFilter === f.value
                    ? "bg-neutral-900 text-white shadow-md"
                    : "bg-white text-neutral-500 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-800"
                }`}
              >
                {t(`filters.${f.labelKey}`)}
              </button>
            );
          })}
        </div>

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mb-8 flex flex-col items-center justify-center text-center">
            <p className="text-red-700 text-sm font-semibold mb-3">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-white border border-red-200 text-red-600 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors shadow-sm"
            >
              {tCommon("tryAgain")}
            </button>
          </div>
        )}

        {/* Order List */}
        {orders.length === 0 && !error ? (
          activeFilter !== "all" ? (
            <div className="text-center py-24 border border-dashed border-neutral-200 bg-white rounded-2xl shadow-sm">
              <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center mx-auto mb-5 border border-neutral-100">
                <Package
                  className="w-8 h-8 text-neutral-400"
                  strokeWidth={1.5}
                />
              </div>
              <p className="text-lg font-semibold text-neutral-900 mb-2">
                {activeFilter === "Pending"
                  ? t("noOrdersByStatus", { status: t("filters.pending") })
                  : activeFilter === "Processing"
                    ? t("noOrdersByStatus", { status: t("filters.processing") })
                    : activeFilter === "Completed"
                      ? t("noOrdersByStatus", {
                          status: t("filters.completed"),
                        })
                      : activeFilter === "Cancelled"
                        ? t("noOrdersByStatus", {
                            status: t("filters.cancelled"),
                          })
                        : t("noOrdersByStatus", { status: activeFilter })}
              </p>
              <p className="text-sm text-neutral-500 mb-6">
                {t("noOrdersByStatusDescription")}
              </p>
              <button
                onClick={() => setActiveFilter("all")}
                className="text-white bg-neutral-900 hover:bg-neutral-800 px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm active:scale-[0.98]"
              >
                {t("viewAllOrders")}
              </button>
            </div>
          ) : (
            <EmptyOrders />
          )
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <OrderCard
                key={order.orderId}
                order={order}
                onViewDetails={(id) => setSelectedOrderId(id)}
              />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasNextPage && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => {
                const nextPage = page + 1;
                setPage(nextPage);
                fetchOrders(nextPage, activeFilter);
              }}
              disabled={loadingMore}
              className="px-6 py-2.5 bg-white border border-neutral-200 text-neutral-700 font-medium rounded-xl hover:bg-neutral-50 transition-colors flex items-center gap-2 shadow-sm"
            >
              {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
              {tCommon("loadMore") || "Tải thêm"}
            </button>
          </div>
        )}
      </div>
      <OrderDetailModal
        isOpen={!!selectedOrderId}
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />
    </div>
  );
}
