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
  Pending: "bg-yellow-100 text-yellow-800",
  Processing: "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
  Delivered: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
  Shipped: "bg-indigo-100 text-indigo-800",
};

const FINISHED_STATUSES = ["Delivered", "Completed"];

const getStatusBadge = (status: string): string =>
  ORDER_STATUS_STYLES[status] || "bg-gray-100 text-gray-800";

// ─── Loading Skeleton ──────────────────────────────────────
const PaymentHistorySkeleton: FC = () => (
  <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-12 lg:py-20 animate-pulse">
    <div className="h-10 w-64 bg-gray-200 rounded mb-8" />
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="h-5 w-32 bg-gray-200 rounded" />
            </div>
            <div className="h-6 w-24 bg-gray-200 rounded-full" />
          </div>
          <div className="space-y-3">
            {[1, 2].map((j) => (
              <div key={j} className="flex gap-3">
                <div className="w-16 h-16 bg-gray-200 rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-gray-200 rounded" />
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
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
const EmptyHistory: FC = () => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <Package className="w-20 h-20 text-gray-300 mb-6" strokeWidth={1} />
    <h2 className="text-2xl font-bold text-gray-900 mb-2">
      You have no orders yet
    </h2>
    <p className="text-gray-500 mb-8 max-w-sm">
      Explore our collection of mechanical keyboards and accessories!
    </p>
    <Link
      href="/shop/all-products"
      className="inline-flex items-center gap-2 bg-[#ce2a32] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#b52429] transition-colors"
    >
      <ShoppingBag className="w-5 h-5" />
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
  <div className="flex items-center gap-3 py-3">
    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
      {item.productImage ? (
        <Image
          src={item.productImage}
          alt={item.productName}
          fill
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-50">
          <Keyboard className="w-7 h-7 text-gray-300" />
        </div>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 truncate">
        {item.productName}
      </p>
      <p className="text-xs text-gray-500 mt-0.5">
        {item.quantity} × {formatCurrency(item.unitPrice)}
      </p>
    </div>
    <div className="flex items-center gap-3 flex-shrink-0">
      <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
        {formatCurrency(item.totalPrice)}
      </p>
      {showWarranty &&
        (hasActiveWarranty ? (
          <span className="inline-flex items-center text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-md font-medium whitespace-nowrap">
            <ShieldAlert className="w-4 h-4 mr-1" />
            Warranty Requested
          </span>
        ) : (
          <button
            onClick={onWarrantyClick}
            className="text-sm text-blue-600 border border-blue-600 px-3 py-1 rounded hover:bg-blue-50 whitespace-nowrap"
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
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          {order.shopAvatar ? (
            <Image
              src={order.shopAvatar}
              alt={order.shopName}
              width={36}
              height={36}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
              <Store className="w-4 h-4 text-gray-400" />
            </div>
          )}
          <span className="font-semibold text-gray-900 text-sm">
            {order.shopName}
          </span>
        </div>
        <span
          className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusBadge(order.orderStatus)}`}
        >
          {order.orderStatus}
        </span>
      </div>

      {/* Body — Order Items */}
      <div className="px-5 divide-y divide-gray-100">
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
          <p className="py-4 text-sm text-gray-400 italic">No products</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/50">
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(order.createdAt)}
        </span>
        <div className="text-right">
          <span className="text-xs text-gray-500">Total: </span>
          <span className="text-base font-bold text-[#ce2a32]">
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
    <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-12 lg:py-20">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        My Payment History
      </h1>

      {orderGroups.length === 0 ? (
        <EmptyHistory />
      ) : (
        <div className="space-y-8">
          {orderGroups.map((group) => (
            <div key={group.orderGroupId}>
              {/* Order Group Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="font-medium text-gray-700">
                    Order #{group.orderGroupId.slice(0, 8).toUpperCase()}
                  </span>
                  <span>•</span>
                  <span>{formatDate(group.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                      group.paymentStatus === "Paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {group.paymentStatus}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
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
  );
};

export default MyPaymentsPage;
