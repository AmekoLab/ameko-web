import { FC, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation"; // Thêm hook này
import { X, Loader2, Package, Calendar, CreditCard, Keyboard, Pencil } from "lucide-react";
import { orderService } from "@/src/services/order.service";
import { shopOrderService } from "@/src/services/shopOrder.service";
import { CartData } from "@/src/types/order.types";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";
import AssemblyTimeline from "@/src/components/Shop/Assembly/AssemblyTimeline";
import CancelOrderModal from "@/src/components/User/Orders/CancelOrderModal";

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

const OrderDetailModal: FC<OrderDetailModalProps> = ({ orderId, isOpen, onClose }) => {
  const pathname = usePathname();
  // KIỂM TRA NGỮ CẢNH: Đang ở URL bắt đầu bằng "/orders" -> Là Người Mua (Buyer)
  // Đang ở "/shop/..." -> Là Người Bán (Seller)
  const isBuyerContext = pathname?.startsWith("/orders");

  const [order, setOrder] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
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
        toast.error(res.message || "Failed to fetch order details");
      }
    } catch (err: unknown) {
      const message = (err as { message?: string }).message || "Failed to fetch order details";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [orderId, isBuyerContext]);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetail();
    } else {
      setOrder(null);
    }
  }, [isOpen, orderId, fetchOrderDetail]);

  const handleUpdateStatus = async (newStatus: number) => {
    if (!orderId) return;
    setIsUpdatingStatus(newStatus);
    try {
      const res = await shopOrderService.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        toast.success("Order status updated successfully.");
        fetchOrderDetail(); // Refresh the modal data
      } else {
        toast.error(res.message || "Failed to update status.");
      }
    } catch (err: unknown) {
      const message = (err as { message?: string }).message || "An error occurred while updating status.";
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
      toast.error("Please provide a cancellation reason");
      return;
    }
    setIsCancellingOrder(true);
    try {
      const res = await shopOrderService.shopCancelOrder(orderId, reason);
      if (res.success) {
        toast.success("Order cancelled successfully");
        setIsShopCancelOpen(false);
        setShopCancelReason("");
        fetchOrderDetail();
      } else {
        toast.error(res.message || "Failed to cancel order");
      }
    } catch (err: unknown) {
      const message = (err as { message?: string }).message || "Failed to cancel order";
      toast.error(message);
    } finally {
      setIsCancellingOrder(false);
    }
  }, [orderId, shopCancelReason, fetchOrderDetail]);

  // ── Save shipping address ──
  const handleSaveAddress = useCallback(async () => {
    if (!orderId || !order) return;
    const name = editName.trim();
    const phone = editPhone.trim();
    const address = editAddress.trim();
    if (!name || !phone || !address) {
      toast.error("Please fill in all shipping fields");
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
        toast.success("Shipping address updated successfully");
        setIsEditingAddress(false);
        fetchOrderDetail(); // Refresh data
      } else {
        toast.error(res.message || "Failed to update address");
      }
    } catch (err: unknown) {
      const message = (err as { message?: string }).message || "Failed to update address";
      toast.error(message);
    } finally {
      setIsSavingAddress(false);
    }
  }, [orderId, order, editName, editPhone, editAddress, fetchOrderDetail]);

  const startEditingAddress = useCallback(() => {
    if (!order) return;
    setEditName(order.receiverName || "");
    setEditPhone(order.receiverPhone || "");
    setEditAddress(order.shippingAddress || "");
    setIsEditingAddress(true);
  }, [order]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white border border-amazon-border rounded-sm shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amazon-border bg-neutral-50">
          <h2 className="text-xl font-oswald font-black uppercase text-amazon-text tracking-widest flex items-center gap-2">
            <Package className="w-5 h-5 text-amazon-text" />
            Order Details
          </h2>
          <button
            onClick={onClose}
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
              <p className="text-[11px] font-bold uppercase tracking-widest text-amazon-textMuted">
                Loading order details...
              </p>
            </div>
          ) : !order ? (
            <div className="text-center py-20 text-amazon-textMuted text-[11px] font-bold uppercase tracking-widest">
              No order data found.
            </div>
          ) : (
            <div className="space-y-8">
              {/* Top Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Shipping Info */}
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-amazon-text mb-3 flex items-center gap-2">
                    Shipping Address
                    {isBuyerContext && order.orderStatus === 'Processing' && !isEditingAddress && (
                      <button
                        type="button"
                        onClick={startEditingAddress}
                        className="ml-auto p-1 text-amazon-textMuted hover:text-amazon-text transition-colors rounded-sm hover:bg-neutral-100"
                        title="Edit shipping address"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </h3>

                  {isEditingAddress ? (
                    <div className="bg-white p-4 rounded-sm border border-amazon-border space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-amazon-textMuted mb-1">Name</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-white border border-amazon-border rounded-sm px-3 py-2 text-[12px] font-bold text-amazon-text focus:outline-none focus:border-amazon-focus focus:ring-1 focus:ring-amazon-focus placeholder-neutral-400"
                          placeholder="Receiver name"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-amazon-textMuted mb-1">Phone</label>
                        <input
                          type="text"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full bg-white border border-amazon-border rounded-sm px-3 py-2 text-[12px] font-bold text-amazon-text focus:outline-none focus:border-amazon-focus focus:ring-1 focus:ring-amazon-focus placeholder-neutral-400"
                          placeholder="Phone number"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-amazon-textMuted mb-1">Address</label>
                        <input
                          type="text"
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          className="w-full bg-white border border-amazon-border rounded-sm px-3 py-2 text-[12px] font-bold text-amazon-text focus:outline-none focus:border-amazon-focus focus:ring-1 focus:ring-amazon-focus placeholder-neutral-400"
                          placeholder="Shipping address"
                        />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsEditingAddress(false)}
                          disabled={isSavingAddress}
                          className="flex-1 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest text-amazon-textMuted hover:bg-neutral-50 bg-white transition-colors border border-amazon-border"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveAddress}
                          disabled={isSavingAddress}
                          className="flex-1 py-2 rounded-sm text-[10px] font-bold text-amazon-text bg-amazon-btnPrimary hover:brightness-95 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isSavingAddress && <Loader2 className="w-3 h-3 animate-spin" />}
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white p-4 rounded-sm border border-amazon-border">
                      <p className="text-[12px] font-bold text-amazon-text mb-1 uppercase tracking-wider">{order.receiverName}</p>
                      <p className="text-[11px] font-bold text-amazon-textMuted mb-2">{order.receiverPhone}</p>
                      <p className="text-[11px] text-amazon-textMuted leading-relaxed">{order.shippingAddress}</p>
                    </div>
                  )}
                </div>

                {/* Status Summary */}
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-amazon-text mb-3 flex items-center gap-2">
                    Order Summary
                  </h3>
                  <div className="bg-white p-4 rounded-sm border border-amazon-border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amazon-textMuted flex items-center gap-1.5"><Package className="w-3.5 h-3.5"/> Status</span>
                      <span className="text-[11px] font-black text-amazon-text">{order.orderStatus}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amazon-textMuted flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5"/> Payment</span>
                      <span className="text-[11px] font-black text-amazon-text">{order.paymentStatus}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amazon-textMuted flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> Date</span>
                      <span className="text-[11px] font-bold text-amazon-textMuted">{formatDate(order.createdAt)}</span>
                    </div>
                    {order.note && (
                      <div className="pt-2 border-t border-amazon-border">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-amazon-textMuted block mb-1">Note:</span>
                        <p className="text-[11px] text-amazon-textMuted italic">"{order.note}"</p>
                      </div>
                    )}
                    
                 
                    {isBuyerContext && order.orderStatus === 'Processing' && order.paymentStatus === 'Paid' &&  !order.hasCancelRequest && (
                      <button
                        type="button"
                        onClick={() => {
                          setCancelingOrderId(order.orderId);
                          setIsCancelModalOpen(true);
                        }}
                        className="mt-4 text-[10px] text-red-500 border border-red-500 border-dashed rounded-sm px-4 py-2 hover:bg-red-500 hover:text-white transition-colors uppercase font-bold tracking-widest w-full text-center"
                      >
                        Request Cancel
                      </button>
                        )}
                        {isBuyerContext && order.hasCancelRequest && (
  <div className="mt-4 text-[10px] text-yellow-500 border border-yellow-500/50 bg-yellow-500/10 rounded-sm px-4 py-2 text-center uppercase font-bold tracking-widest w-full">
    Cancel Request Pending Approval
  </div>
)}

                    {/* SHOP ACTIONS: Update Status */}
                    {!isBuyerContext && (order.orderStatus === 'Processing' || order.orderStatus === 'Shipped') && (
                      <div className="pt-3 mt-3 border-t border-amazon-border flex flex-col gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-amazon-textMuted block mb-1">Shop Actions:</span>
                        <div className="flex gap-2">
                          
                          {order.orderStatus === 'Processing' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(3)}
                              disabled={isUpdatingStatus !== null}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase tracking-widest py-2 rounded-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              {isUpdatingStatus === 3 && <Loader2 className="w-3 h-3 animate-spin" />}
                              Mark Shipped
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(4)}
                            disabled={isUpdatingStatus !== null}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold uppercase tracking-widest py-2 rounded-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {isUpdatingStatus === 4 && <Loader2 className="w-3 h-3 animate-spin" />}
                            Mark Completed
                          </button>

                        </div>

                        {/* Shop Cancel Order */}
                        {order.orderStatus === 'Processing' && (
                          <div className="pt-2 mt-1">
                            {!isShopCancelOpen ? (
                              <button
                                type="button"
                                onClick={() => setIsShopCancelOpen(true)}
                                disabled={isUpdatingStatus !== null || isCancellingOrder}
                                className="w-full text-[10px] text-red-500 border border-red-500/40 border-dashed rounded-sm px-4 py-2 hover:bg-red-500 hover:text-white transition-colors uppercase font-bold tracking-widest text-center disabled:opacity-50"
                              >
                                Cancel Order
                              </button>
                            ) : (
                              <div className="border border-red-200 rounded-sm p-3 bg-red-50 space-y-2">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-red-700 mb-1">Cancellation Reason</label>
                                <textarea
                                  value={shopCancelReason}
                                  onChange={(e) => setShopCancelReason(e.target.value)}
                                  rows={2}
                                  className="w-full bg-white border border-amazon-border rounded-sm px-3 py-2 text-[11px] text-amazon-text focus:outline-none focus:border-amazon-focus focus:ring-1 focus:ring-amazon-focus placeholder-neutral-400 resize-none"
                                  placeholder="Why are you cancelling this order?"
                                />
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => { setIsShopCancelOpen(false); setShopCancelReason(""); }}
                                    disabled={isCancellingOrder}
                                    className="flex-1 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest text-amazon-textMuted hover:bg-neutral-50 bg-white transition-colors border border-amazon-border"
                                  >
                                    Back
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleShopCancelOrder}
                                    disabled={isCancellingOrder || !shopCancelReason.trim()}
                                    className="flex-1 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-widest text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                  >
                                    {isCancellingOrder && <Loader2 className="w-3 h-3 animate-spin" />}
                                    Confirm Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-amazon-text mb-3">
                  Items ({order.orderItems.length})
                </h3>
                <div className="divide-y divide-amazon-border bg-white">
                  {order.orderItems.map((item) => (
                    <div key={item.orderItemId} className="p-12">
                      <div className="flex items-start gap-8">
                        <div className="relative w-28 h-28 bg-white flex-shrink-0 overflow-hidden border border-amazon-border rounded-sm">
                          {item.productImage ? (
                            <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-neutral-50">
                              <Keyboard className="w-6 h-6 text-amazon-textMuted" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-black uppercase tracking-wider text-amazon-text truncate pr-4">{item.productName}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-amazon-textMuted">
                              Qty: <span className="text-amazon-link">{item.quantity}</span> × {formatCurrency(item.unitPrice)}
                            </p>
                            {/* <p className="text-[13px] font-oswald font-black text-amazon-text">Total:{" "} {formatCurrency(item.totalPrice)}</p> */}
                          </div>
                        </div>
                      </div>

                      {/* Custom Components Nesting */}
                      {item.isCustom && item.orderItemComponents && item.orderItemComponents.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-amazon-border pl-6 bg-neutral-50 rounded-sm p-3 border-l-4 border-l-amazon-btnSecondary">
                          <p className="text-[10px] font-black uppercase tracking-widest text-amazon-textMuted mb-3 block">Includes Custom Parts:</p>
                          <div className="space-y-3">
                            {item.orderItemComponents.map((part) => (
                              <div key={part.partId} className="flex items-center gap-3">
                                <div className="relative w-10 h-10 bg-white border border-amazon-border rounded-sm flex-shrink-0 overflow-hidden">
                                  {part.partImageUrl ? (
                                    <Image src={part.partImageUrl} alt={part.partName} fill className="object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-neutral-50">
                                      <Package className="w-4 h-4 text-amazon-textMuted" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-bold uppercase tracking-wider text-amazon-text truncate">{part.partName}</p>
                                  <p className="text-[10px] font-bold text-amazon-textMuted">
                                    Qty: <span className="text-amazon-link">{part.quantity}</span> × {formatCurrency(part.partPriceSnapshot)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Assembly Timeline */}
                      {item.isCustom && (
                        <div className="mt-4">
                          <AssemblyTimeline orderItemId={item.orderItemId} role={!isBuyerContext ? "shop" : "user"} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {order && !loading && (
          <div className="px-6 py-4 border-t border-amazon-border bg-neutral-50 space-y-2">
            <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest text-amazon-textMuted">
              <span>Subtotal:</span>
              <span>{formatCurrency(order.subTotal)}</span>
            </div>
            <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest text-amazon-textMuted">
              <span>Shipping Fee:</span>
              <span>{formatCurrency(order.shippingFee)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest text-green-600">
                <span>Discount:</span>
                <span>-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-amazon-border flex justify-between items-center">
              <span className="text-[12px] font-black uppercase tracking-widest text-amazon-text">Final Total:</span>
              <span className="text-xl font-oswald font-black text-amazon-price">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        )}
      </div>

      <CancelOrderModal
        isOpen={isCancelModalOpen}
        orderId={cancelingOrderId}
        onClose={() => setIsCancelModalOpen(false)}
        onSuccess={fetchOrderDetail}
      />
    </div>
  );
};

export default OrderDetailModal;