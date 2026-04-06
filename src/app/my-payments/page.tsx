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
  Pending: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
  Processing: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  Completed: "bg-green-500/10 border-green-500/30 text-green-400",
  Delivered: "bg-green-500/10 border-green-500/30 text-green-400",
  Cancelled: "bg-red-500/10 border-red-500/30 text-red-400",
  Shipped: "bg-indigo-500/10 border-indigo-500/30 text-indigo-400",
};

const FINISHED_STATUSES = ["Delivered", "Completed"];

const getStatusBadge = (status: string): string =>
  ORDER_STATUS_STYLES[status] || "bg-[#202030] border-[#2a2d35] text-gray-400";

// ─── Loading Skeleton ──────────────────────────────────────
const PaymentHistorySkeleton: FC = () => (
  <div className="bg-black min-h-screen">
    <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-12 lg:py-20 animate-pulse">
      <div className="h-10 w-64 bg-[#1e2126] rounded-sm mb-8" />
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#151515] rounded-sm border border-[#1e2126] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#202030] rounded-sm" />
                <div className="h-5 w-32 bg-[#202030] rounded-sm" />
              </div>
              <div className="h-6 w-24 bg-[#202030] rounded-sm" />
            </div>
            <div className="space-y-3">
              {[1, 2].map((j) => (
                <div key={j} className="flex gap-3">
                  <div className="w-16 h-16 bg-[#202030] rounded-sm" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 bg-[#202030] rounded-sm" />
                    <div className="h-3 w-24 bg-[#202030] rounded-sm" />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 pt-4 border-t border-[#1e2126]">
              <div className="h-4 w-28 bg-[#202030] rounded-sm" />
              <div className="h-5 w-32 bg-[#202030] rounded-sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Empty State ───────────────────────────────────────────
const EmptyHistory: FC = () => (
  <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-[#1e2126] bg-[#151515] rounded-sm">
    <div className="w-16 h-16 rounded-full bg-[#202030] border border-[#2a2d35] flex items-center justify-center mb-5">
      <Package className="w-8 h-8 text-gray-500" />
    </div>
    <h2 className="text-[14px] font-black uppercase tracking-widest text-white mb-2">
      You have no orders yet
    </h2>
    <p className="text-[12px] font-bold text-gray-400 mb-8 max-w-sm">
      Explore our collection of mechanical keyboards and accessories!
    </p>
    <Link
      href="/shop"
      className="inline-flex items-center gap-2 bg-[#f5d800] text-black px-6 py-3 rounded-sm font-black text-[11px] uppercase tracking-widest hover:bg-[#e6ca00] transition-colors shadow-sm"
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
    <div className="relative w-16 h-16 rounded-sm overflow-hidden bg-[#0f0f0f] border border-[#1e2126] flex-shrink-0">
      {item.productImage ? (
        <Image
          src={item.productImage}
          alt={item.productName}
          fill
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[#111111]">
          <Keyboard className="w-6 h-6 text-gray-500" />
        </div>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[12px] font-black uppercase tracking-wider text-white truncate mb-1">
        {item.productName}
      </p>
      <p className="text-[11px] font-bold text-gray-400">
        <span className="text-white">{item.quantity}</span> × {formatCurrency(item.unitPrice)}
      </p>
    </div>
    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 flex-shrink-0">
      <p className="text-[12px] font-black tracking-widest text-[#f5d800] whitespace-nowrap">
        {formatCurrency(item.totalPrice)}
      </p>
      {showWarranty &&
        (hasActiveWarranty ? (
          <span className="inline-flex items-center text-[10px] uppercase font-black tracking-widest text-gray-400 bg-[#202030] border border-[#2a2d35] px-3 py-1.5 rounded-sm whitespace-nowrap">
            <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
            Warranty Requested
          </span>
        ) : (
          <button
            onClick={onWarrantyClick}
            className="text-[10px] uppercase font-black tracking-widest text-gray-300 border border-[#2a2d35] bg-[#111111] hover:bg-[#1a1c20] hover:text-white px-3 py-1.5 rounded-sm whitespace-nowrap transition-colors"
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
    <div className="bg-[#151515] rounded-sm border border-[#1e2126] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2126] bg-[#111111]">
        <div className="flex items-center gap-3">
          {order.shopAvatar ? (
            <Image
              src={order.shopAvatar}
              alt={order.shopName}
              width={36}
              height={36}
              className="rounded-sm object-cover border border-[#2a2d35]"
            />
          ) : (
            <div className="w-9 h-9 rounded-sm bg-[#202030] border border-[#2a2d35] flex items-center justify-center">
              <Store className="w-4 h-4 text-gray-500" />
            </div>
          )}
          <span className="font-black uppercase tracking-widest text-white text-[12px]">
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
      <div className="px-5 divide-y divide-[#1e2126]">
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
          <p className="py-4 text-[11px] font-bold uppercase tracking-widest text-gray-500 italic">No products</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-4 border-t border-[#1e2126] bg-[#0f0f0f]">
        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(order.createdAt)}
        </span>
        <div className="text-right">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mr-2">Total:</span>
          <span className="text-[14px] font-black tracking-widest text-[#f5d800]">
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
    <div className="bg-black min-h-screen text-white">
      <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-12 lg:py-20">
        <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-widest text-white mb-10 pb-4 border-b border-[#1e2126]">
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
                  <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-gray-500">
                    <span className="font-black text-white px-2 py-1 bg-[#1a1c20] rounded-sm border border-[#2a2d35]">
                      GRP #{group.orderGroupId.slice(0, 8).toUpperCase()}
                    </span>
                    <span>•</span>
                    <span>{formatDate(group.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 box-border rounded-sm border ${
                        group.paymentStatus === "Paid"
                          ? "bg-green-500/10 border-green-500/30 text-green-400"
                          : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                      }`}
                    >
                      {group.paymentStatus}
                    </span>
                    <span className="text-[14px] font-black tracking-widest text-white">
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
