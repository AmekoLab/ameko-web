"use client";

import { FC, useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  Keyboard,
  Store,
  Calendar,
  ShieldAlert,
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
    return format(parseISO(dateStr), "dd/MM/yyyy HH:mm");
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

const getStatusBadge = (status: string): string =>
  ORDER_STATUS_STYLES[status] || "bg-neutral-50 border-amazon-border text-amazon-textMuted";

// ─── Loading Skeleton ──────────────────────────────────────
const PaymentHistorySkeleton: FC = () => (
  <div className="bg-amazon-bgSecondary min-h-screen">
    <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-12 lg:py-20 animate-pulse">
      <div className="h-10 w-64 bg-neutral-200 rounded-sm mb-8" />
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-sm border border-amazon-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neutral-200 rounded-sm" />
                <div className="h-5 w-32 bg-neutral-200 rounded-sm" />
              </div>
              <div className="h-6 w-24 bg-neutral-200 rounded-sm" />
            </div>
            <div className="space-y-3">
              {[1, 2].map((j) => (
                <div key={j} className="flex gap-3">
                  <div className="w-16 h-16 bg-neutral-200 rounded-sm" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 bg-neutral-200 rounded-sm" />
                    <div className="h-3 w-24 bg-neutral-200 rounded-sm" />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 pt-4 border-t border-amazon-border">
              <div className="h-4 w-28 bg-neutral-200 rounded-sm" />
              <div className="h-5 w-32 bg-neutral-200 rounded-sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Empty State ───────────────────────────────────────────
const EmptyHistory: FC = () => (
  <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-amazon-border bg-white rounded-sm">
    <div className="w-16 h-16 rounded-full bg-neutral-50 border border-amazon-border flex items-center justify-center mb-5">
      <Package className="w-8 h-8 text-neutral-400" />
    </div>
    <h2 className="text-[14px] font-black uppercase tracking-widest text-amazon-text mb-2">
      You have no orders yet
    </h2>
    <p className="text-[12px] font-bold text-amazon-textMuted mb-8 max-w-sm">
      Explore our collection of mechanical keyboards and accessories!
    </p>
    <Link
      href="/shop"
      className="inline-flex items-center gap-2 bg-amazon-btnPrimary text-amazon-text px-6 py-3 rounded-sm font-black text-[11px] uppercase tracking-widest hover:opacity-90 transition-colors shadow-sm"
    >
      <ShoppingBag className="w-4 h-4" />
      Shop now
    </Link>
  </div>
);

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
}) => (
  <div className="flex items-center gap-3 py-4">
    <div className="relative w-16 h-16 rounded-sm overflow-hidden bg-white  flex-shrink-0">
      {item.productImage ? (
        <Image
          src={item.productImage}
          alt={item.productName}
          fill
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-neutral-50">
          <Keyboard className="w-6 h-6 text-neutral-400" />
        </div>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[12px] font-black uppercase tracking-wider text-amazon-text truncate mb-1">
        {item.productName}
      </p>
      <p className="text-[11px] font-bold text-amazon-textMuted">
        <span className="text-amazon-text">{item.quantity}</span> × {formatCurrency(item.unitPrice)}
      </p>
    </div>
    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 flex-shrink-0">
      <p className="text-[12px] text-amazon-price font-bold tracking-widest whitespace-nowrap">
        {formatCurrency(item.totalPrice)}
      </p>
      {showWarranty &&
        (hasActiveWarranty ? (
          <span className="inline-flex items-center text-[10px] uppercase font-black tracking-widest text-amazon-textMuted bg-neutral-100 border border-transparent px-3 py-1.5 rounded-sm whitespace-nowrap">
            <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-amazon-textMuted" />
            Warranty Requested
          </span>
        ) : (
          <button
            onClick={onWarrantyClick}
            className="text-[10px] uppercase font-black tracking-widest text-amazon-textMuted border border-amazon-border bg-white hover:bg-neutral-50 hover:text-amazon-text px-3 py-1.5 rounded-sm whitespace-nowrap transition-colors"
          >
            Request Warranty
          </button>
        ))}
    </div>
  </div>
);

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
  const isFinished = FINISHED_STATUSES.includes(order.orderStatus);

  return (
    <div className="bg-white rounded-sm border border-amazon-border overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-amazon-border bg-neutral-50">
        <div className="flex items-center gap-3">
          {order.shopAvatar ? (
            <Image
              src={order.shopAvatar}
              alt={order.shopName}
              width={36}
              height={36}
              className="rounded-sm object-cover border border-amazon-border"
            />
          ) : (
            <div className="w-9 h-9 rounded-sm bg-neutral-50 border border-amazon-border flex items-center justify-center">
              <Store className="w-4 h-4 text-amazon-textMuted" />
            </div>
          )}
          <span className="font-black uppercase tracking-widest text-amazon-text text-[12px]">
            {order.shopName}
          </span>
        </div>
        <span
          className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 box-border rounded-sm border ${getStatusBadge(order.orderStatus)}`}
        >
          {order.orderStatus}
        </span>
      </div>

      {/* Body — Order Items */}
      <div className="px-5 divide-y divide-amazon-border">
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
          <p className="py-4 text-[11px] font-bold uppercase tracking-widest text-amazon-textMuted italic">No products</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-4 border-t border-amazon-border bg-neutral-50">
        <span className="text-[11px] font-bold uppercase tracking-widest text-amazon-textMuted flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(order.createdAt)}
        </span>
        <div className="text-right">
          <span className="text-[10px] font-bold uppercase tracking-widest text-amazon-textMuted mr-2">Total:</span>
          <span className="text-[14px] text-amazon-price font-bold tracking-widest">
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
  const { orderGroups, loadingHistory } = useAppSelector(
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
    dispatch(fetchMyPaymentHistory());
    dispatch(fetchMyWarrantyRequests({ page: 1, pageSize: 100 }));
  }, [dispatch]);

  if (loadingHistory) return <PaymentHistorySkeleton />;

  return (
    <div className="bg-amazon-bgSecondary min-h-screen text-amazon-text">
      <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-12 lg:py-8">
        <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-widest text-amazon-text mb-10 pb-4 border-b border-amazon-border">
          My Payment History
        </h1>

        {orderGroups.length === 0 ? (
          <EmptyHistory />
        ) : (
          <div className="space-y-12">
            {orderGroups.map((group) => (
              <div key={group.orderGroupId}>
                {/* Order Group Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-amazon-textMuted">
                    <span className="font-black text-amazon-text px-2 py-1 bg-white rounded-sm border border-amazon-border shadow-sm">
                      GRP #{group.orderGroupId.slice(0, 8).toUpperCase()}
                    </span>
                    <span>•</span>
                    <span>{formatDate(group.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 box-border rounded-sm border ${
                        group.paymentStatus === "Paid"
                          ? "bg-green-50 border-green-200 text-green-700"
                          : "bg-yellow-50 border-yellow-200 text-yellow-700"
                      }`}
                    >
                      {group.paymentStatus}
                    </span>
                    <span className="text-[14px] text-amazon-price font-bold tracking-widest">
                      {formatCurrency(group.totalGroupAmount)}
                    </span>
                  </div>
                </div>

              {/* Orders within the group */}
              <div className="space-y-4">
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
