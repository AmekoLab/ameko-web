"use client";

import { FC, useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ShoppingBag,
  Keyboard,
  Store,
  Calendar,
  ShieldAlert,
  CreditCard,
  Loader2,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { fetchMyPaymentHistory } from "@/src/store/slices/orderSlice";
import { fetchMyWarrantyRequests } from "@/src/store/slices/warrantySlice";
import {
  PaymentHistoryOrder,
  PaymentHistoryOrderItem,
} from "@/src/types/order.types";
import { format, parseISO } from "date-fns";
import CreateWarrantyModal from "@/src/components/Warranty/CreateWarrantyModal";

// ─── Helpers ───────────────────────────────────────────────
const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);

const formatDate = (dateStr: string): string => {
  try {
    return format(parseISO(dateStr), "MMM dd, yyyy • HH:mm");
  } catch {
    return dateStr;
  }
};

const ORDER_STATUS_STYLES: Record<string, string> = {
  Pending: "bg-yellow-50 border-yellow-200 text-yellow-700",
  Processing: "bg-blue-50 border-blue-200 text-blue-700",
  Completed: "bg-green-50 border-green-200 text-green-700",
  Delivered: "bg-green-50 border-green-200 text-green-700",
  Cancelled: "bg-red-50 border-red-200 text-red-700",
  Shipped: "bg-indigo-50 border-indigo-200 text-indigo-700",
};

const FINISHED_STATUSES = ["Delivered", "Completed"];

const ORDER_STATUS_LABEL_KEYS: Record<string, string> = {
  Pending: "pending",
  Processing: "processing",
  Completed: "completed",
  Delivered: "delivered",
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

const getStatusBadge = (status: string): string =>
  ORDER_STATUS_STYLES[status] ||
  "bg-neutral-100 border-neutral-200 text-neutral-600";

// ─── Loading Skeleton ──────────────────────────────────────
const PaymentHistorySkeleton: FC = () => (
  <div className="bg-neutral-50 min-h-[calc(100vh-4rem)]">
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 lg:py-16 animate-pulse">
      <div className="h-10 w-64 bg-neutral-200 rounded-xl mb-10" />
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neutral-100 rounded-lg" />
                <div className="h-5 w-32 bg-neutral-100 rounded-md" />
              </div>
              <div className="h-6 w-24 bg-neutral-100 rounded-lg" />
            </div>
            <div className="space-y-4">
              {[1, 2].map((j) => (
                <div key={j} className="flex gap-4">
                  <div className="w-20 h-20 bg-neutral-100 rounded-xl" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-48 bg-neutral-100 rounded-md" />
                    <div className="h-4 w-28 bg-neutral-100 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-6 pt-5 border-t border-neutral-50">
              <div className="h-5 w-32 bg-neutral-200 rounded-md" />
              <div className="h-6 w-36 bg-neutral-200 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Empty State ───────────────────────────────────────────
const EmptyHistory: FC = () => {
  const t = useTranslations("MyPaymentsPage");

  return (
    <div className="flex flex-col items-center justify-center py-28 text-center border border-dashed border-neutral-200 bg-white rounded-3xl shadow-sm">
      <div className="w-20 h-20 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center mb-6">
        <CreditCard className="w-10 h-10 text-neutral-300" strokeWidth={1.5} />
      </div>
      <h2 className="text-xl font-bold text-neutral-900 mb-2">
        {t("noPaymentHistory")}
      </h2>
      <p className="text-sm font-medium text-neutral-500 mb-8 max-w-md leading-relaxed">
        {t("noPaymentHistoryDescription")}
      </p>
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 bg-neutral-900 text-white px-8 py-3.5 rounded-xl font-semibold text-sm hover:bg-neutral-800 transition-all shadow-md active:scale-[0.98]"
      >
        <ShoppingBag className="w-4 h-4" />
        {t("startShopping")}
      </Link>
    </div>
  );
};

// ─── Order Item Row ────────────────────────────────────────
interface OrderItemRowProps {
  item: PaymentHistoryOrderItem;
  showWarranty: boolean;
  hasActiveWarranty: boolean;
  onWarrantyClick?: () => void;
}

const OrderItemRow: FC<OrderItemRowProps> = ({
  item,
  showWarranty,
  hasActiveWarranty,
  onWarrantyClick,
}) => {
  const t = useTranslations("MyPaymentsPage");
  const tCommon = useTranslations("Common");

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-5 hover:bg-neutral-50/50 transition-colors px-2 -mx-2 rounded-xl group relative">
      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white border border-neutral-100 shrink-0 shadow-sm group-hover:border-neutral-200 transition-colors">
        {item.productImage ? (
          <Image
            src={item.productImage}
            alt={item.productName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-50">
            <Keyboard className="w-6 h-6 text-neutral-300" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <p className="text-sm font-semibold text-neutral-900 truncate mb-1">
          {item.productName}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">
            {tCommon("qty")}: {item.quantity}
          </span>
          <span className="text-xs font-medium text-neutral-400">
            × {formatCurrency(item.unitPrice)} {tCommon("ea")}
          </span>
        </div>
      </div>
      <div className="flex sm:flex-col items-center sm:items-end justify-between mt-2 sm:mt-0 gap-3 border-t sm:border-t-0 border-neutral-100 pt-3 sm:pt-0 shrink-0">
        <p className="text-base text-amazon-price font-bold">
          {formatCurrency(item.totalPrice)}
        </p>
        {showWarranty &&
          (hasActiveWarranty ? (
            <span className="inline-flex items-center text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg whitespace-nowrap shadow-sm">
              <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
              {t("warrantyRequested")}
            </span>
          ) : (
            <button
              onClick={onWarrantyClick}
              className="text-xs font-semibold text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 px-4 py-1.5 rounded-lg whitespace-nowrap transition-all shadow-sm active:scale-[0.98]"
            >
              {t("requestWarranty")}
            </button>
          ))}
      </div>
    </div>
  );
};

// ─── Order Card ────────────────────────────────────────────
interface OrderCardProps {
  order: PaymentHistoryOrder;
  warrantiedItemIds: Set<string>;
  onWarrantyClick: (
    orderGroupId: string,
    items: PaymentHistoryOrderItem[],
  ) => void;
}

const OrderCard: FC<OrderCardProps> = ({
  order,
  warrantiedItemIds,
  onWarrantyClick,
}) => {
  const t = useTranslations("MyPaymentsPage");
  const isFinished = FINISHED_STATUSES.includes(order.orderStatus);
  const orderStatusLabelKey = ORDER_STATUS_LABEL_KEYS[order.orderStatus];

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden shadow-sm hover:shadow-md hover:border-neutral-200 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-50 bg-white">
        <div className="flex items-center gap-3">
          {order.shopAvatar ? (
            <Image
              src={order.shopAvatar}
              alt={order.shopName}
              width={40}
              height={40}
              className="rounded-xl object-cover border border-neutral-100 shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center shadow-sm">
              <Store className="w-5 h-5 text-neutral-400" />
            </div>
          )}
          <span className="font-bold text-neutral-900 text-sm">
            {order.shopName}
          </span>
        </div>
        <span className="flex items-center gap-2 text-sm">
          {t("orderStatus")}:
          <span
            className={`text-xs font-semibold px-3 py-1 box-border rounded-md border shadow-sm ${getStatusBadge(order.orderStatus)}`}
          >
            {orderStatusLabelKey
              ? t(`orderStatusValues.${orderStatusLabelKey}`)
              : order.orderStatus}
          </span>
        </span>
      </div>

      {/* Body — Order Items */}
      <div className="px-6 divide-y divide-neutral-50">
        {order.orderItems.length > 0 ? (
          order.orderItems.map((item) => (
            <OrderItemRow
              key={item.orderItemId}
              item={item}
              showWarranty={isFinished}
              hasActiveWarranty={warrantiedItemIds.has(item.orderItemId)}
              onWarrantyClick={() =>
                onWarrantyClick(order.orderGroupId, order.orderItems)
              }
            />
          ))
        ) : (
          <p className="py-6 text-sm font-medium text-neutral-400 italic text-center bg-neutral-50 rounded-xl my-4">
            {t("noProductsFoundForOrder")}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-neutral-50 bg-neutral-50/50 gap-4">
        <span className="text-xs font-semibold text-neutral-500 flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-neutral-100 shadow-sm">
          <Calendar className="w-4 h-4 text-neutral-400" />
          {formatDate(order.createdAt)}
        </span>
        <div className="text-right flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-xs font-semibold text-neutral-400">
            {t("orderSubtotal")}
          </span>
          <span className="text-lg text-amazon-price font-bold bg-white px-3 py-1 rounded-lg border border-neutral-100 shadow-sm">
            {formatCurrency(order.totalAmount)}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────
const MyPaymentsPage: FC = () => {
  const dispatch = useAppDispatch();
  const t = useTranslations("MyPaymentsPage");
  const tCommon = useTranslations("Common");
  
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  
  const { orderGroups, loadingHistory, hasNextPage } = useAppSelector(
    (state) => state.order,
  );
  const { warrantyList } = useAppSelector((state) => state.warranty);

  const warrantiedItemIds = useMemo(() => {
    const ids = new Set<string>();
    warrantyList?.forEach((req) => {
      req.orderItemIds?.forEach((id) => ids.add(id));
    });
    return ids;
  }, [warrantyList]);

  const [warrantyModal, setWarrantyModal] = useState<{
    isOpen: boolean;
    orderGroupId: string;
    items: PaymentHistoryOrderItem[];
  }>({ isOpen: false, orderGroupId: "", items: [] });

  const openWarrantyModal = useCallback(
    (orderGroupId: string, items: PaymentHistoryOrderItem[]) => {
      setWarrantyModal({ isOpen: true, orderGroupId, items });
    },
    [],
  );

  const closeWarrantyModal = useCallback(() => {
    setWarrantyModal({ isOpen: false, orderGroupId: "", items: [] });
  }, []);

  useEffect(() => {
    dispatch(fetchMyPaymentHistory({ page, size: 10, paymentStatus: statusFilter }));
    if (page === 1) {
      dispatch(fetchMyWarrantyRequests({ page: 1, pageSize: 100 }));
    }
  }, [dispatch, page, statusFilter]);

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  if (loadingHistory && page === 1) return <PaymentHistorySkeleton />;

  return (
    <div className="bg-neutral-50 min-h-[calc(100vh-4rem)] text-neutral-900 font-sans">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 lg:py-12">
        <div className="mb-8 pb-6 border-b border-neutral-200">
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-green-50 text-green-600 rounded-xl hidden sm:block shadow-sm border border-green-100">
              <CreditCard className="w-6 h-6" />
            </div>
            {t("title")}
          </h1>
          <p className="mt-3 text-sm text-neutral-500 max-w-2xl leading-relaxed">
            {t("description")}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {["all", "Pending", "Paid", "Released", "Failed", "Refunded"].map((status) => (
            <button
              key={status}
              onClick={() => handleFilterChange(status)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm border ${
                statusFilter === status
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"
              }`}
            >
              {status === "all" ? tCommon("all") : t(`paymentStatusValues.${status.toLowerCase()}`) || status}
            </button>
          ))}
        </div>

        {orderGroups.length === 0 ? (
          <EmptyHistory />
        ) : (
          <div className="space-y-12">
            {orderGroups.map((group) => (
              <div key={group.orderGroupId} className="relative">
                {/* Visual Connector for the group (hidden on mobile) */}
                <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-neutral-200 hidden sm:block -z-10"></div>

                {/* Order Group Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 bg-white p-4 sm:px-6 rounded-2xl border border-neutral-100 shadow-sm">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono font-bold text-neutral-700 text-sm px-3 py-1.5 bg-neutral-50 rounded-lg border border-neutral-200">
                      {t("groupPrefix")} #
                      {group.orderGroupId.slice(0, 8).toUpperCase()}
                    </span>
                    <span className="text-neutral-300 hidden sm:inline">•</span>
                    <span className="text-xs font-semibold text-neutral-500">
                      {formatDate(group.createdAt)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="flex items-center gap-2 text-sm">
                      {t("paymentStatus")}:
                    </span>
                    <span
                      className={`text-xs font-semibold px-3 py-1.5 box-border rounded-lg border shadow-sm ${
                        group.paymentStatus === "Paid"
                          ? "bg-green-50 border-green-200 text-green-700"
                          : "bg-yellow-50 border-yellow-200 text-yellow-700"
                      }`}
                    >
                      {PAYMENT_STATUS_LABEL_KEYS[group.paymentStatus]
                        ? t(
                            `paymentStatusValues.${PAYMENT_STATUS_LABEL_KEYS[group.paymentStatus]}`,
                          )
                        : group.paymentStatus}
                    </span>
                    <span className="text-xl text-amazon-price font-bold tracking-tight">
                      {formatCurrency(group.totalGroupAmount)}
                    </span>
                  </div>
                </div>

                {/* Orders within the group */}
                <div className="space-y-5 sm:ml-12">
                  {group.orders.map((order) => (
                    <OrderCard
                      key={order.orderId}
                      order={order}
                      warrantiedItemIds={warrantiedItemIds}
                      onWarrantyClick={openWarrantyModal}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasNextPage && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => {
                setIsFetchingMore(true);
                setPage((prev) => prev + 1);
                setTimeout(() => setIsFetchingMore(false), 1000); // UI feedback
              }}
              disabled={loadingHistory || isFetchingMore}
              className="px-6 py-2.5 bg-white border border-neutral-200 text-neutral-700 font-medium rounded-xl hover:bg-neutral-50 transition-colors flex items-center gap-2 shadow-sm"
            >
              {(loadingHistory || isFetchingMore) && <Loader2 className="w-4 h-4 animate-spin" />}
              {tCommon("loadMore") || "Tải thêm"}
            </button>
          </div>
        )}

        <CreateWarrantyModal
          isOpen={warrantyModal.isOpen}
          onClose={closeWarrantyModal}
          orderGroupId={warrantyModal.orderGroupId}
          availableItems={warrantyModal.items}
        />
      </div>
    </div>
  );
};

export default MyPaymentsPage;
