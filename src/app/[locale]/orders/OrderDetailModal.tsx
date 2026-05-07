import { FC, useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation"; // Thêm hook này
import {
  X,
  Loader2,
  Package,
  CreditCard,
  Keyboard,
  Pencil,
  FileText,
} from "lucide-react";
import { orderService } from "@/src/services/order.service";
import { shopOrderService } from "@/src/services/shopOrder.service";
import { feedbackService } from "@/src/services/feedback.service";
import { CartData } from "@/src/types/order.types";
import { FeedbackEligibilityData, ProductEligibilityItem } from "@/src/types/feedback.types";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";
import { useTranslations } from "next-intl";
import AssemblyTimeline from "@/src/components/Shop/Assembly/AssemblyTimeline";
import CancelOrderModal from "@/src/components/User/Orders/CancelOrderModal";
import FeedbackModal from "@/src/components/User/Orders/FeedbackModal";
import ItemFeedbackModal from "@/src/components/User/Orders/ItemFeedbackModal";

interface OrderDetailModalProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
  // Bỏ cái role ở đây đi vì nó làm rối luồng, ta dùng pathname để check
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);

const formatDate = (dateStr: string): string => {
  try {
    return format(parseISO(dateStr), "MMM dd, yyyy HH:mm");
  } catch {
    return dateStr;
  }
};

const OrderDetailModal: FC<OrderDetailModalProps> = ({
  orderId,
  isOpen,
  onClose,
}) => {
  const pathname = usePathname();
  const t = useTranslations("OrderDetailModal");
  const tCommon = useTranslations("Common");
  // KIỂM TRA NGỮ CẢNH: Đang ở URL bắt đầu bằng "/orders" -> Là Người Mua (Buyer)
  // Đang ở "/shop/..." -> Là Người Bán (Seller)
  const isBuyerContext =
    pathname?.includes("/orders") && !pathname?.includes("/shop");

  const [order, setOrder] = useState<CartData | null>(null);
  const [eligibility, setEligibility] =
    useState<FeedbackEligibilityData | null>(null);
  const [itemsEligibility, setItemsEligibility] = useState<
    Record<string, ProductEligibilityItem>
  >({});
  const [loading, setLoading] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [feedbackConfig, setFeedbackConfig] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
  }>({ isOpen: false, mode: "create" });
  const [itemFeedbackConfig, setItemFeedbackConfig] = useState<{
    isOpen: boolean;
    mode: "create" | "view" | "edit";
    orderItemId: string | null;
  }>({ isOpen: false, mode: "create", orderItemId: null });
  const [cancelingOrderId, setCancelingOrderId] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<number | null>(null);

  // ── Shop cancel order state ──
  const [isShopCancelOpen, setIsShopCancelOpen] = useState(false);
  const [shopCancelReason, setShopCancelReason] = useState("");
  const [isCancellingOrder, setIsCancellingOrder] = useState(false);

  // ── Shipping address editing state ──
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");

  // ── Shipped Status Modal State ──
  const [isShippedModalOpen, setIsShippedModalOpen] = useState(false);
  const [expectedDate, setExpectedDate] = useState<string>("");

  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);

  const [assemblyCompletionMap, setAssemblyCompletionMap] = useState<
    Record<string, boolean>
  >({});

  const handleAssemblyReady = useCallback(
    (itemId: string, isReady: boolean) => {
      setAssemblyCompletionMap((prev) => {
        // Prevent state update if value hasn't changed to break infinite loops
        if (prev[itemId] === isReady) return prev;
        return { ...prev, [itemId]: isReady };
      });
    },
    [],
  );

  const canShipOrComplete = useMemo(() => {
    if (!order) return false;
    
    // Only check custom items that are NOT cancelled
    const activeCustomItems = order.orderItems.filter(
      (item) => item.isCustom && item.itemStatus !== "Cancelled"
    );
    
    // If there are no active custom items left, the order is ready to ship
    if (activeCustomItems.length === 0) return true; 
    
    // Ready ONLY if every ACTIVE custom item has reported true in the map
    return activeCustomItems.every(
      (item) => assemblyCompletionMap[item.orderItemId] === true,
    );
  }, [order, assemblyCompletionMap]);

  const getStatusLabel = useCallback(
    (status: string) => {
      const statusKeyMap: Record<string, string> = {
        pending: "status.pending",
        processing: "status.processing",
        shipped: "status.shipped",
        completed: "status.completed",
        cancelled: "status.cancelled",
        canceled: "status.cancelled",
        returned: "status.returned",
        paid: "status.paid",
        released: "status.released",
        refunded: "status.refunded",
        failed: "status.failed",
        unpaid: "status.unpaid",
      };

      const key = statusKeyMap[status.toLowerCase()];
      return key ? t(key) : status;
    },
    [t],
  );

  const fetchOrderDetail = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      // Dùng isBuyerContext để gọi đúng API
      const res = !isBuyerContext
        ? await shopOrderService.getShopOrderDetail(orderId)
        : await orderService.getOrderDetail(orderId);

      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        toast.error(res.message || t("fetchOrderDetailsFailed"));
      }
    } catch (err: unknown) {
      const message =
        (err as { message?: string }).message || t("fetchOrderDetailsFailed");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [orderId, isBuyerContext, t]);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetail();
    } else {
      setOrder(null);
    }
  }, [isOpen, orderId, fetchOrderDetail]);

  const fetchEligibility = useCallback(async () => {
    if (
      !isBuyerContext ||
      !isOpen ||
      !order ||
      order.orderStatus.toLowerCase() !== "completed"
    ) {
      setEligibility(null);
      setItemsEligibility({});
      return;
    }

    try {
      const res = await feedbackService.checkEligibility(order.orderId);
      if (res.success) {
        setEligibility(res.data);
      } else {
        setEligibility(null);
      }

      const customProductIds = Array.from(
        new Set(
          order.orderItems
            .map((i) => i.assembledProductId || i.productId)
            .filter((id) => id && id !== "null")
        )
      ) as string[];

      const map: Record<string, ProductEligibilityItem> = {};

      await Promise.all(
        customProductIds.map(async (productId) => {
          try {
            const productRes: any = await feedbackService.getProductFeedbackEligibility(productId);
            if (productRes?.success && productRes?.data?.items) {
              productRes.data.items.forEach((ai: ProductEligibilityItem) => {
                map[ai.orderItemId] = ai;
              });
            }
          } catch (e) {
            console.error(`Failed to fetch product eligibility for ${productId}`, e);
          }
        })
      );

      setItemsEligibility(map);
    } catch (error) {
      setEligibility(null);
      console.error("Failed to fetch feedback eligibility", error);
    }
  }, [isBuyerContext, isOpen, order]);

  useEffect(() => {
    fetchEligibility();
  }, [fetchEligibility]);

  const handleUpdateStatus = async (newStatus: number) => {
    if (!orderId) return;

    // Intercept Shipped status to open modal instead
    if (newStatus === 3) {
      setIsShippedModalOpen(true);
      return;
    }

    setIsUpdatingStatus(newStatus);
    try {
      const res = await shopOrderService.updateOrderStatus(
        orderId,
        newStatus,
        undefined,
      );
      if (res.success) {
        toast.success(t("updateStatusSuccess") || "Update successful");
        fetchOrderDetail();
      } else {
        toast.error(res.message || t("updateStatusFailed"));
      }
    } catch (err: unknown) {
      const message =
        (err as { message?: string }).message ||
        t("updateStatusUnexpectedError");
      toast.error(message);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleConfirmShipped = async () => {
    if (!orderId) return;
    if (!expectedDate) {
      toast.error(
        t("deliveryDateRequired") || "Vui lòng chọn ngày dự kiến giao hàng",
      );
      return;
    }

    setIsUpdatingStatus(3);
    try {
      const isoDate = new Date(expectedDate).toISOString();
      const res = await shopOrderService.updateOrderStatus(orderId, 3, isoDate);
      if (res.success) {
        toast.success(t("updateStatusSuccess") || "Update successful");
        setIsShippedModalOpen(false);
        setExpectedDate("");
        fetchOrderDetail();
      } else {
        toast.error(res.message || t("updateStatusFailed"));
      }
    } catch (err: unknown) {
      const message =
        (err as { message?: string }).message ||
        t("updateStatusUnexpectedError");
      toast.error(message);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  // ── Shop cancel order ──
  const handleShopCancelOrder = useCallback(async () => {
    if (!orderId) return;
    const reason = shopCancelReason.trim();
    if (!reason) {
      toast.error(t("cancelReasonRequired"));
      return;
    }
    setIsCancellingOrder(true);
    try {
      const res = await shopOrderService.shopCancelOrder(orderId, reason);
      if (res.success) {
        toast.success(t("cancelOrderSuccess"));
        setIsShopCancelOpen(false);
        setShopCancelReason("");
        fetchOrderDetail();
      } else {
        toast.error(res.message || t("cancelOrderFailed"));
      }
    } catch (err: unknown) {
      const message =
        (err as { message?: string }).message || t("cancelOrderFailed");
      toast.error(message);
    } finally {
      setIsCancellingOrder(false);
    }
  }, [orderId, shopCancelReason, fetchOrderDetail, t]);

  // ── Save shipping address ──
  const handleSaveAddress = useCallback(async () => {
    if (!orderId || !order) return;
    const name = editName.trim();
    const phone = editPhone.trim();
    const address = editAddress.trim();
    if (!name || !phone || !address) {
      toast.error(t("shippingFieldsRequired"));
      return;
    }
    setIsSavingAddress(true);
    try {
      const res = await orderService.updateShippingAddress(orderId, {
        receiverName: name,
        receiverPhone: phone,
        shippingAddress: address,
      });
      if (res.success) {
        toast.success(t("updateAddressSuccess"));
        setIsEditingAddress(false);
        fetchOrderDetail(); // Refresh data
      } else {
        toast.error(res.message || t("updateAddressFailed"));
      }
    } catch (err: unknown) {
      const message =
        (err as { message?: string }).message || t("updateAddressFailed");
      toast.error(message);
    } finally {
      setIsSavingAddress(false);
    }
  }, [orderId, order, editName, editPhone, editAddress, fetchOrderDetail, t]);

  const startEditingAddress = useCallback(() => {
    if (!order) return;
    setEditName(order.receiverName || "");
    setEditPhone(order.receiverPhone || "");
    setEditAddress(order.shippingAddress || "");
    setIsEditingAddress(true);
  }, [order]);

  const handleDownloadInvoice = async () => {
    if (!orderId) return;
    setIsDownloadingInvoice(true);
    try {
      const blob = await orderService.downloadInvoicePDF(orderId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Hoa_Don_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 5000);
    } catch (error: any) {
      console.error("Lỗi tải hóa đơn:", error);
      const status = error?.response?.status;
      if (status === 403) toast.error(t("invoiceForbidden") || "Không có quyền tải hóa đơn này.");
      else if (status === 404) toast.error(t("invoiceNotFound") || "Không tìm thấy đơn hàng.");
      else toast.error(t("invoiceError") || "Lỗi khi tải hóa đơn PDF.");
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white border border-amazon-border rounded-sm shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amazon-border bg-neutral-50">
          <h2 className="text-xl font-bold text-amazon-text flex items-center gap-2">
            <Package className="w-5 h-5 text-amazon-text" />
            {t("title")}
          </h2>
          <button
            onClick={onClose}
            aria-label={tCommon("close")}
            className="p-2 text-amazon-textMuted hover:text-amazon-text transition-colors hover:bg-neutral-100 rounded-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-amazon-link animate-spin mb-4" />
              <p className="text-[11px] font-medium text-amazon-textMuted">
                {t("loadingOrderDetails")}
              </p>
            </div>
          ) : !order ? (
            <div className="text-center py-20 text-amazon-textMuted text-[11px] font-medium">
              {t("noOrderData")}
            </div>
          ) : (
            <div className="space-y-6">
              {/* CANCELLATION BANNER */}
              {order.orderStatus === "Cancelled" && order.cancelledBy && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-sm flex items-start gap-3">
                  <div className="p-1 bg-red-100 rounded-full shrink-0">
                    <X className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-red-800">
                     {t("orderCancelledBy")} {order.cancelledBy === "Customer" ? "Khách hàng" : order.cancelledBy}
                    </h3>
                    {order.cancelReason && (
                      <p className="text-sm text-red-600 mt-1">
                        <span className="font-medium">{t("orderCancelReason")}</span> {order.cancelReason}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* 1. STATUS BANNER (TOP) */}
              <div className="bg-neutral-50 border border-amazon-border rounded-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Left: Status & Date */}
                <div>
                  <p className="text-lg font-medium text-amazon-text flex items-center gap-2">
                    {tCommon("status")}: {getStatusLabel(order.orderStatus)}
                  </p>
                  <p className="text-xs text-amazon-textMuted mt-1">
                    {t("placedOn", { date: formatDate(order.createdAt) })}
                  </p>
                  {/* Hiển thị Expected Delivery Date nếu có */}
                  {order.expectedDeliveryDate && (
                    <p className="text-xs text-amazon-link font-medium mt-1">
                      {t("expectedDelivery", {
                        date: formatDate(order.expectedDeliveryDate),
                      })}
                    </p>
                  )}
                </div>

                {/* Right: Action Hub */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadInvoice}
                    disabled={isDownloadingInvoice}
                    className="text-xs text-amazon-text bg-white border border-amazon-border rounded-sm px-4 py-2 hover:bg-neutral-100 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    {isDownloadingInvoice ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <FileText className="w-3.5 h-3.5" />
                    )}
                    {t("downloadInvoice") || "In hóa đơn"}
                  </button>

                  {/* BUYER ACTIONS */}
                  {isBuyerContext &&
                    order.orderStatus === "Processing" &&
                    order.paymentStatus === "Paid" &&
                    !order.hasCancelRequest && (
                      <button
                        type="button"
                        onClick={() => {
                          setCancelingOrderId(order.orderId);
                          setIsCancelModalOpen(true);
                        }}
                        className="text-xs text-red-500 border border-red-500 border-dashed rounded-sm px-4 py-2 hover:bg-red-50 hover:text-red-600 transition-colors font-medium text-center"
                      >
                        {t("requestCancel")}
                      </button>
                    )}
                  {isBuyerContext && order.hasCancelRequest && (
                    <div className="text-xs text-yellow-600 border border-yellow-500/50 bg-yellow-500/10 rounded-sm px-4 py-2 text-center font-medium">
                      {t("cancelRequestPendingApproval")}
                    </div>
                  )}
                  {isBuyerContext &&
                    eligibility?.canReviewShop &&
                    !eligibility?.hasShopFeedback && (
                      <button
                        type="button"
                        onClick={() =>
                          setFeedbackConfig({ isOpen: true, mode: "create" })
                        }
                        className="text-xs text-amazon-text bg-amazon-btnPrimary rounded-sm px-4 py-2 hover:brightness-95 transition-colors font-medium text-center"
                      >
                        Đánh giá Shop
                      </button>
                    )}
                  {isBuyerContext && eligibility?.hasShopFeedback === true && (
                    <button
                      type="button"
                      onClick={() =>
                        setFeedbackConfig({ isOpen: true, mode: "edit" })
                      }
                      className="text-xs text-amazon-text border border-amazon-border rounded-sm px-4 py-2 hover:bg-neutral-100 transition-colors font-medium text-center"
                    >
                      Xem / Sửa Đánh giá
                    </button>
                  )}

                  {/* SHOP ACTIONS */}
                  {!isBuyerContext &&
                    (order.orderStatus === "Processing" ||
                      order.orderStatus === "Shipped") && (
                      <>
                        {order.orderStatus === "Processing" && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(3)}
                            disabled={
                              isUpdatingStatus !== null || !canShipOrComplete
                            }
                            title={
                              !canShipOrComplete
                                ? t("cannotShipUntilAssemblyComplete")
                                : ""
                            }
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-4 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {isUpdatingStatus === 3 && (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            )}
                            {t("markShipped")}
                          </button>
                        )}
                        {order.orderStatus === "Shipped" && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(4)}
                            disabled={isUpdatingStatus !== null}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-2 px-4 rounded-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {isUpdatingStatus === 4 && (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            )}
                            {t("markCompleted")}
                          </button>
                        )}
                        {order.orderStatus === "Processing" &&
                          !isShopCancelOpen && (
                            <button
                              type="button"
                              onClick={() => setIsShopCancelOpen(true)}
                              disabled={
                                isUpdatingStatus !== null || isCancellingOrder
                              }
                              className="text-xs text-red-500 border border-red-500/40 border-dashed rounded-sm px-4 py-2 hover:bg-red-50 hover:text-red-600 transition-colors font-medium text-center disabled:opacity-50"
                            >
                              {t("cancelOrder")}
                            </button>
                          )}
                      </>
                    )}
                </div>
              </div>

              {/* 3. SHOP CANCEL FORM (FULL WIDTH) */}
              {order.orderStatus === "Processing" &&
                isShopCancelOpen &&
                !isBuyerContext && (
                  <div className="bg-red-50 border border-red-200 rounded-sm p-4">
                    <label className="block text-xs font-bold text-red-700 mb-2">
                      {t("cancellationReason")}
                    </label>
                    <textarea
                      value={shopCancelReason}
                      onChange={(e) => setShopCancelReason(e.target.value)}
                      rows={2}
                      className="w-full bg-white border border-amazon-border rounded-sm px-3 py-2 text-sm text-amazon-text focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 placeholder-neutral-400 resize-none mb-3"
                      placeholder={t("cancellationReasonPlaceholder")}
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setIsShopCancelOpen(false);
                          setShopCancelReason("");
                        }}
                        disabled={isCancellingOrder}
                        className="px-4 py-2 rounded-sm text-xs font-medium text-amazon-textMuted hover:bg-neutral-50 bg-white transition-colors border border-amazon-border"
                      >
                        {tCommon("back")}
                      </button>
                      <button
                        type="button"
                        onClick={handleShopCancelOrder}
                        disabled={isCancellingOrder || !shopCancelReason.trim()}
                        className="px-4 py-2 rounded-sm text-xs font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isCancellingOrder && (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        )}
                        {t("confirmCancel")}
                      </button>
                    </div>
                  </div>
                )}

              {/* 2. TWO-COLUMN INFO GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Column 1 (Shipping) */}
                <div className="bg-white border border-amazon-border rounded-sm p-4">
                  <h3 className="text-xs font-bold text-amazon-text mb-3 flex items-center justify-between uppercase tracking-wider">
                    {t("shippingAddress")}
                    {isBuyerContext &&
                      order.orderStatus === "Processing" &&
                      !isEditingAddress && (
                        <button
                          type="button"
                          onClick={startEditingAddress}
                          className="p-1 text-amazon-textMuted hover:text-amazon-text transition-colors rounded-sm hover:bg-neutral-100"
                          title={t("editShippingAddress")}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                  </h3>

                  {isEditingAddress ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-amazon-textMuted mb-1">
                          {tCommon("name")}
                        </label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-white border border-amazon-border rounded-sm px-3 py-2 text-sm font-medium text-amazon-text focus:outline-none focus:border-amazon-focus focus:ring-1 focus:ring-amazon-focus placeholder-neutral-400"
                          placeholder={t("receiverNamePlaceholder")}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-amazon-textMuted mb-1">
                          {tCommon("phone")}
                        </label>
                        <input
                          type="text"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full bg-white border border-amazon-border rounded-sm px-3 py-2 text-sm font-medium text-amazon-text focus:outline-none focus:border-amazon-focus focus:ring-1 focus:ring-amazon-focus placeholder-neutral-400"
                          placeholder={t("phoneNumberPlaceholder")}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-amazon-textMuted mb-1">
                          {tCommon("address")}
                        </label>
                        <input
                          type="text"
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          className="w-full bg-white border border-amazon-border rounded-sm px-3 py-2 text-sm font-medium text-amazon-text focus:outline-none focus:border-amazon-focus focus:ring-1 focus:ring-amazon-focus placeholder-neutral-400"
                          placeholder={t("shippingAddressPlaceholder")}
                        />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsEditingAddress(false)}
                          disabled={isSavingAddress}
                          className="flex-1 py-2 rounded-sm text-xs font-medium text-amazon-textMuted hover:bg-neutral-50 bg-white transition-colors border border-amazon-border"
                        >
                          {tCommon("cancel")}
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveAddress}
                          disabled={isSavingAddress}
                          className="flex-1 py-2 rounded-sm text-xs font-medium text-amazon-text bg-amazon-btnPrimary hover:brightness-95 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isSavingAddress && (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          )}
                          {tCommon("save")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-amazon-text mb-1 capitalize">
                        {order.receiverName}
                      </p>
                      <p className="text-xs font-normal text-amazon-textMuted mb-2">
                        {order.receiverPhone}
                      </p>
                      <p className="text-sm text-amazon-text leading-relaxed">
                        {order.shippingAddress}
                      </p>
                    </div>
                  )}
                </div>

                {/* Column 2 (Payment & Notes) */}
                <div className="bg-white border border-amazon-border rounded-sm p-2">
                  <h3 className="text-xs font-bold text-amazon-text mb-3 uppercase tracking-wider">
                    {t("paymentAndNotes")}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-amazon-textMuted flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4" /> {tCommon("payment")}
                      </span>
                      <span className="text-sm font-medium text-amazon-text">
                        {getStatusLabel(order.paymentStatus)}
                      </span>
                    </div>
                    {order.note && (
                      <div className="pt-3 border-t border-amazon-border">
                        <span className="text-xs font-medium text-amazon-textMuted block mb-1">
                          {t("customerNote")}
                        </span>
                        <p className="text-sm text-amazon-text italic">
                          &quot;{order.note}&quot;
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h3 className="text-[11px] font-medium text-amazon-text pb-2">
                  {t("itemsCount", { count: order.orderItems.length })}
                </h3>
                <div className="list-container">
                  {order.orderItems.map((item) => {
                    const isCancelled = item.itemStatus === "Cancelled";
                    return (
                    <div
                      key={item.orderItemId}
                      className={`border border-amazon-border rounded-md overflow-hidden mb-4 shadow-sm ${isCancelled ? "opacity-50 grayscale bg-neutral-50" : "bg-white"}`}
                    >
                      <div
                        className={
                          item.isCustom
                            ? "grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-amazon-border"
                            : "p-4 sm:p-5"
                        }
                      >
                        {/* Left Column (Item Info & Components) */}
                        <div
                          className={
                            item.isCustom
                              ? "col-span-12 lg:col-span-6 p-4 sm:p-5 flex flex-col gap-4"
                              : "flex flex-col gap-4"
                          }
                        >
                          <div className="flex items-start gap-4 sm:gap-6">
                            <div className="relative w-20 h-20 bg-white flex-shrink-0 overflow-hidden border border-amazon-border rounded-sm">
                              {item.productImage ? (
                                <Image
                                  src={item.productImage}
                                  alt={item.productName}
                                  fill
                                  className="object-contain p-1"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-neutral-50">
                                  <Keyboard className="w-6 h-6 text-amazon-textMuted" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-sm text-amazon-text">{item.productName}</h4>
                                {isCancelled && (
                                  <span className="px-2 py-0.5 text-[10px] font-bold bg-neutral-200 text-neutral-600 rounded-sm">
                                    {t("cancelled")}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-xs font-normal text-amazon-textMuted">
                                  {tCommon("qty")}:{" "}
                                  <span className="text-amazon-link">
                                    {item.quantity}
                                  </span>{" "}
                                  ×{" "}
                                  <span className="text-amazon-price">
                                    {formatCurrency(item.unitPrice)}
                                  </span>
                                </p>
                              </div>
                              {/* Discount Breakdown & Final Price */}
                              <div className="flex flex-col items-end gap-1 mt-2">
                                {/* Price Display */}
                                <div className="flex items-center gap-2">
                                  {item.allocatedDiscount && item.allocatedDiscount > 0 ? (
                                    <>
                                      <span className="text-xs text-neutral-400 line-through">
                                        {formatCurrency(item.totalPrice)}
                                      </span>
                                      <span className="font-bold text-amazon-text text-base">
                                        {formatCurrency(item.finalPrice ?? item.totalPrice)}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="font-bold text-amazon-text text-base">
                                      {formatCurrency(item.totalPrice)}
                                    </span>
                                  )}
                                </div>

                                {/* Discount Breakdown Tags */}
                                {((item.systemAllocatedDiscount ?? 0) > 0 || (item.shopAllocatedDiscount ?? 0) > 0) && (
                                  <div className="flex flex-col items-end gap-0.5">
                                    {(item.systemAllocatedDiscount ?? 0) > 0 && (
                                      <span className="text-[10px] text-green-600 bg-green-50 border border-green-100 px-1.5 py-0.5 rounded-sm">
                                        {t("discountFromPlatform") || "Discount from Platform"}: -{formatCurrency(item.systemAllocatedDiscount!)}
                                      </span>
                                    )}
                                    {(item.shopAllocatedDiscount ?? 0) > 0 && (
                                      <span className="text-[10px] text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-sm">
                                        {t("discountFromShop") || "Discount from Shop"}: -{formatCurrency(item.shopAllocatedDiscount!)}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              {/* Product feedback buttons */}
                              {isBuyerContext &&
                                order.orderStatus.toLowerCase() === "completed" && (
                                  <div className="mt-2">
                                    {(() => {
                                      const itemEligibility = itemsEligibility[item.orderItemId];
                                      if (itemEligibility?.canReview && !itemEligibility?.hasFeedback) {
                                        return (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setItemFeedbackConfig({
                                                isOpen: true,
                                                mode: "create",
                                                orderItemId: item.orderItemId,
                                              })
                                            }
                                            className="text-xs text-amazon-text bg-amazon-btnPrimary rounded-sm px-3 py-1.5 hover:brightness-95 transition-colors font-medium border border-amazon-border"
                                          >
                                            {t("evaluateProduct")}
                                          </button>
                                        );
                                      }
                                      if (itemEligibility?.hasFeedback) {
                                        return (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setItemFeedbackConfig({
                                                isOpen: true,
                                                mode: "edit",
                                                orderItemId: item.orderItemId,
                                              })
                                            }
                                            className="text-xs text-amazon-text bg-white border border-amazon-border rounded-sm px-3 py-1.5 hover:bg-neutral-100 transition-colors font-medium"
                                          >
                                            {t("viewOrEditFeedback")}
                                          </button>
                                        );
                                      }
                                      return null;
                                    })()}
                                  </div>
                                )}
                            </div>
                          </div>

                          {/* Custom Components Nesting */}
                          {item.isCustom && (
                            <div className="mt-2 pt-4 border-t border-amazon-border border-dashed">
                              <p className="text-xs font-bold text-amazon-text mb-3 block uppercase tracking-wider">
                                {t("includesCustomParts") || "Chi tiết linh kiện Build"}
                              </p>
                              <div className="space-y-3">
                                {/* BASE KIT */}
                                {item.baseKitPriceSnapshot != null && (
                                  <div className="flex items-center gap-3 pb-3 border-b border-amazon-border border-dashed">
                                    <div className="relative w-10 h-10 bg-neutral-100 border border-amazon-border rounded-sm flex-shrink-0 flex items-center justify-center">
                                      <Keyboard className="w-5 h-5 text-neutral-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-bold text-amazon-text truncate">
                                        {t("baseKit") || "Base Kit"}
                                      </p>
                                      <p className="text-xs font-normal text-amazon-textMuted">
                                        {tCommon("qty") || "SL"}: <span className="text-amazon-link">1</span> × {formatCurrency(item.baseKitPriceSnapshot)}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* OTHER COMPONENTS */}
                                {item.orderItemComponents?.map((part, index) => (
                                    <div
                                      key={`${part.partId}-${index}`}
                                      className="flex items-center gap-3"
                                    >
                                      <div className="relative w-10 h-10 bg-white border border-amazon-border rounded-sm flex-shrink-0 overflow-hidden">
                                        {part.partImageUrl ? (
                                          <Image
                                            src={part.partImageUrl}
                                            alt={part.partName}
                                            fill
                                            className="object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center bg-neutral-50">
                                            <Package className="w-4 h-4 text-amazon-textMuted" />
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-amazon-text truncate">
                                          {part.partName}
                                        </p>
                                        <p className="text-xs font-normal text-amazon-textMuted">
                                          {tCommon("qty")}:{" "}
                                          <span className="text-amazon-link">
                                            {part.quantity}
                                          </span>{" "}
                                          ×{" "}
                                          {formatCurrency(
                                            part.partPriceSnapshot,
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>

                        {/* Right Column (Assembly Timeline) */}
                        {item.isCustom && (
                          <div className="col-span-12 lg:col-span-6 p-4 sm:p-5 bg-neutral-50/50">
                            <h4 className="text-xs font-bold text-amazon-text mb-3 flex items-center gap-2">
                              <Package className="w-4 h-4" />{" "}
                              {t("assemblyProgress")}
                            </h4>
                            <AssemblyTimeline
                              orderItemId={item.orderItemId}
                              role={!isBuyerContext ? "shop" : "user"}
                              isCancelled={
                                order.orderStatus === "Cancelled" ||
                                order.orderStatus === "Returned"
                              }
                              onReadyChange={handleAssemblyReady}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {order && !loading && (
          <div className="px-6 py-4 border-t border-amazon-border bg-neutral-50 space-y-2">
            <div className="flex justify-between items-center text-[11px] font-medium text-amazon-textMuted">
              <span>{tCommon("subtotal")}:</span>
              <span>{formatCurrency(order.subTotal)}</span>
            </div>
            <div className="flex justify-between items-center text-[11px] font-medium text-amazon-textMuted">
              <span>{t("shippingFee")}</span>
              <span>{formatCurrency(order.shippingFee)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between items-center text-[11px] font-medium text-green-600">
                <span>{tCommon("discount")}:</span>
                <span>-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}
            {order.systemDiscountAmount && order.systemDiscountAmount > 0 ? (
              <div className="flex justify-between items-center text-[11px] font-medium text-green-600">
                <span>{t("systemVoucher")}</span>
                <span>-{formatCurrency(order.systemDiscountAmount)}</span>
              </div>
            ) : null}
            <div className="pt-2 border-t border-amazon-border flex justify-between items-center">
              <span className="text-[12px] font-medium text-amazon-text">
                {t("finalTotal")}
              </span>
              <span className="text-xl font-bold text-amazon-price">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>

            {/* Platform Fee & Revenue - ONLY FOR SHOP/ADMIN */}
            {!isBuyerContext && order.platformFeeAmount !== undefined && (
              <>
                <div className="flex justify-between text-sm py-1 border-t border-amazon-border border-dashed mt-2 pt-2">
                  <span className="text-amazon-textMuted italic">{t("platformFee")}:</span>
                  <span className="text-red-500">-{formatCurrency(order.platformFeeAmount!)}</span>
                </div>
                <div className="flex justify-between text-sm py-1 font-bold bg-neutral-50 px-2 rounded-sm mt-1">
                  <span className="text-amazon-text">{t("netRevenue")}:</span>
                  <span className="text-green-600">{formatCurrency(order.totalAmount - (order.platformFeeAmount || 0))}</span>
                </div>
                {order.revenueRecognizedAt && (
                  <div className="flex justify-between text-[10px] text-neutral-400 mt-1 px-2 italic">
                    <span>{t("revenueRecognizedAt")}:</span>
                    <span>{format(parseISO(order.revenueRecognizedAt), "dd/MM/yyyy HH:mm")}</span>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ─── SHIPPED STATUS MODAL ─── */}
      {isShippedModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-sm shadow-2xl w-full max-w-sm overflow-hidden animate-slideUp border border-amazon-border">
            <div className="px-6 py-4 border-b border-amazon-border">
              <h3 className="text-amazon-text font-bold text-lg">
                {t("updateDeliveryDate") || "Cập nhật ngày giao hàng"}
              </h3>
            </div>

            <div className="p-6">
              <label className="block text-sm font-bold text-amazon-text mb-2">
                {t("expectedDeliveryDateLabel") || "Ngày dự kiến nhận hàng"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={expectedDate}
                // Calculate local current time for the 'min' attribute to prevent past selections
                min={new Date(
                  new Date().getTime() - new Date().getTimezoneOffset() * 60000,
                )
                  .toISOString()
                  .slice(0, 16)}
                onChange={(e) => setExpectedDate(e.target.value)}
                className="w-full px-4 py-2 border border-amazon-border rounded-sm focus:outline-none focus:border-amazon-focus transition-colors text-sm"
              />
              <p className="text-xs text-neutral-500 mt-2 font-medium">
                {t("deliveryDateNotice") ||
                  "Khách hàng sẽ nhận được thông báo về ngày dự kiến này."}
              </p>
            </div>

            <div className="px-6 py-4 bg-neutral-50 border-t border-amazon-border flex gap-3">
              <button
                onClick={() => {
                  setIsShippedModalOpen(false);
                  setExpectedDate("");
                }}
                disabled={isUpdatingStatus === 3}
                className="flex-1 py-2 text-xs font-bold text-amazon-text bg-white border border-amazon-border rounded-sm hover:bg-neutral-50 transition-colors uppercase"
              >
                {tCommon("cancel") || "Hủy"}
              </button>
              <button
                onClick={handleConfirmShipped}
                disabled={isUpdatingStatus === 3 || !expectedDate}
                className="flex-1 py-2 text-xs font-bold text-amazon-text bg-amazon-primary hover:brightness-95 rounded-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 uppercase border border-amazon-border"
              >
                {isUpdatingStatus === 3 && (
                  <Loader2 className="w-3 h-3 animate-spin" />
                )}
                {t("confirm") || "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}

      <CancelOrderModal
        isOpen={isCancelModalOpen}
        order={order}
        onClose={() => setIsCancelModalOpen(false)}
        onSuccess={fetchOrderDetail}
      />

      {order && isBuyerContext && (
        <FeedbackModal
          isOpen={feedbackConfig.isOpen}
          onClose={() =>
            setFeedbackConfig({ ...feedbackConfig, isOpen: false })
          }
          orderId={order.orderId}
          mode={feedbackConfig.mode}
          onSuccess={fetchEligibility}
        />
      )}

      {order && isBuyerContext && (
        <ItemFeedbackModal
          isOpen={itemFeedbackConfig.isOpen}
          onClose={() =>
            setItemFeedbackConfig({ ...itemFeedbackConfig, isOpen: false, orderItemId: null })
          }
          orderItemId={itemFeedbackConfig.orderItemId}
          mode={itemFeedbackConfig.mode}
          onSuccess={fetchEligibility}
        />
      )}
    </div>
  );
};

export default OrderDetailModal;
