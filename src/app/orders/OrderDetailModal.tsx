import { FC, useEffect, useState } from "react";
import Image from "next/image";
import { X, Loader2, Package, Calendar, CreditCard, Keyboard } from "lucide-react";
import { orderService } from "@/src/services/order.service";
import { shopOrderService } from "@/src/services/shopOrder.service";
import { CartData } from "@/src/types/order.types";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";

interface OrderDetailModalProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
  role?: "user" | "shop";
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

const OrderDetailModal: FC<OrderDetailModalProps> = ({ orderId, isOpen, onClose, role = "user" }) => {
  const [order, setOrder] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && orderId) {
      const fetchOrderDetail = async () => {
        setLoading(true);
        try {
          const res = role === "shop" 
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
      };
      fetchOrderDetail();
    } else {
      setOrder(null);
    }
  }, [isOpen, orderId, role]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#151515] border border-[#1e2126] rounded-sm shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2126] bg-[#1a1c20]">
          <h2 className="text-xl font-oswald font-black uppercase text-white tracking-widest flex items-center gap-2">
            <Package className="w-5 h-5 text-[#f5d800]" />
            Order Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-white/10 rounded-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-[#f5d800] animate-spin mb-4" />
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                Loading order details...
              </p>
            </div>
          ) : !order ? (
            <div className="text-center py-20 text-gray-500 text-[11px] font-bold uppercase tracking-widest">
              No order data found.
            </div>
          ) : (
            <div className="space-y-8">
              {/* Top Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Shipping Info */}
                <div>
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-[#f5d800] mb-3 flex items-center gap-2">
                    Shipping Address
                  </h3>
                  <div className="bg-[#1a1c20] p-4 rounded-sm border border-[#1e2126]">
                    <p className="text-[12px] font-bold text-white mb-1 uppercase tracking-wider">{order.receiverName}</p>
                    <p className="text-[11px] font-bold text-gray-400 mb-2">{order.receiverPhone}</p>
                    <p className="text-[11px] text-gray-500 leading-relaxed">{order.shippingAddress}</p>
                  </div>
                </div>

                {/* Status Summary */}
                <div>
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-[#f5d800] mb-3 flex items-center gap-2">
                    Order Summary
                  </h3>
                  <div className="bg-[#1a1c20] p-4 rounded-sm border border-[#1e2126] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5"><Package className="w-3.5 h-3.5"/> Status</span>
                      <span className="text-[11px] font-black text-white">{order.orderStatus}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5"/> Payment</span>
                      <span className="text-[11px] font-black text-white">{order.paymentStatus}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> Date</span>
                      <span className="text-[11px] font-bold text-gray-400">{formatDate(order.createdAt)}</span>
                    </div>
                    {order.note && (
                      <div className="pt-2 border-t border-[#1e2126]">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block mb-1">Note:</span>
                        <p className="text-[11px] text-gray-400 italic">"{order.note}"</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-[#f5d800] mb-3">
                  Items ({order.orderItems.length})
                </h3>
                <div className="border border-[#1e2126] rounded-sm divide-y divide-[#1e2126] bg-[#1a1c20]">
                  {order.orderItems.map((item) => (
                    <div key={item.orderItemId} className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="relative w-16 h-16 bg-black border border-[#1e2126] rounded-sm flex-shrink-0 overflow-hidden">
                          {item.productImage ? (
                            <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Keyboard className="w-6 h-6 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-black uppercase tracking-wider text-white truncate pr-4">{item.productName}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                              Qty: <span className="text-[#f5d800]">{item.quantity}</span> × {formatCurrency(item.unitPrice)}
                            </p>
                            <p className="text-[13px] font-oswald font-black text-white">{formatCurrency(item.totalPrice)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Custom Components Nesting */}
                      {item.isCustom && item.orderItemComponents && item.orderItemComponents.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-[#1e2126]/50 pl-6 bg-black/20 rounded-sm p-3 border-l-2 border-l-[#f5d800]/50">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3 block">Includes Custom Parts:</p>
                          <div className="space-y-3">
                            {item.orderItemComponents.map((part) => (
                              <div key={part.partId} className="flex items-center gap-3">
                                <div className="relative w-10 h-10 bg-black border border-[#1e2126] rounded-sm flex-shrink-0 overflow-hidden">
                                  {part.partImageUrl ? (
                                    <Image src={part.partImageUrl} alt={part.partName} fill className="object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Package className="w-4 h-4 text-gray-600" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-300 truncate">{part.partName}</p>
                                  <p className="text-[10px] font-bold text-gray-500">
                                    Qty: <span className="text-white">{part.quantity}</span> × {formatCurrency(part.partPriceSnapshot)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
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
          <div className="px-6 py-4 border-t border-[#1e2126] bg-[#1a1c20] space-y-2">
            <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest text-gray-400">
              <span>Subtotal:</span>
              <span>{formatCurrency(order.subTotal)}</span>
            </div>
            <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest text-gray-400">
              <span>Shipping Fee:</span>
              <span>{formatCurrency(order.shippingFee)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest text-green-400">
                <span>Discount:</span>
                <span>-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-[#1e2126] flex justify-between items-center">
              <span className="text-[12px] font-black uppercase tracking-widest text-white">Final Total:</span>
              <span className="text-xl font-oswald font-black text-[#f5d800]">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailModal;
