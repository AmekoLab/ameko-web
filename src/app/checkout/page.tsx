"use client";

import { useState, useEffect, useCallback, useMemo, FormEvent, Suspense } from "react";
import { useAppSelector, useAppDispatch } from "@/src/store/hook";
import { fetchWalletDetails } from "@/src/store/slices/walletSlice";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  ShoppingBag,
  HelpCircle,
  ChevronRight,
  Loader2,
  ChevronUp,
  X,
  Store,
} from "lucide-react";
import { orderService } from "@/src/services/order.service";
import { CartData, OrderItem } from "@/src/types/order.types";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";
import { useCartPreviewLogic } from "@/src/hooks/useCartPreviewLogic";

// ─── Form State ────────────────────────────────────────────
interface CheckoutForm {
  receiverName: string;
  receiverPhone: string;
  shippingAddress: string;
  note: string;
}

interface FormErrors {
  receiverName?: string;
  receiverPhone?: string;
  shippingAddress?: string;
}

const validateForm = (form: CheckoutForm): FormErrors => {
  const errors: FormErrors = {};

  if (!form.receiverName.trim()) {
    errors.receiverName = "Receiver name is required";
  }

  if (!form.receiverPhone.trim()) {
    errors.receiverPhone = "Phone number is required";
  } else if (
    form.receiverPhone.trim().length < 9 ||
    form.receiverPhone.trim().length > 15
  ) {
    errors.receiverPhone = "Phone number must be 9-15 digits";
  }

  if (!form.shippingAddress.trim()) {
    errors.shippingAddress = "Shipping address is required";
  }

  return errors;
};

// ─── Checkout Item Row (shows custom components inline) ────
const CheckoutItemRow = ({ item }: { item: OrderItem }) => {
  const isCustom = item.isCustom && item.orderItemComponents.length > 0;
  const [showComponents, setShowComponents] = useState(false);

  const displayImage =
    item.productImage ||
    (isCustom ? item.orderItemComponents[0]?.partImageUrl : null);

  return (
    <div>
      <div className="flex gap-4 items-center">
        {/* Image with Badge */}
        <div className="relative w-16 h-16  rounded-sm bg-white shrink-0">
          {displayImage ? (
            <Image
              src={displayImage}
              alt={item.productName}
              fill
              className="object-contain p-1 rounded-sm"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-amazon-textMuted" />
            </div>
          )}
          <span className="absolute -top-2 -right-2 bg-neutral-200 text-amazon-text text-[11px] font-medium w-5 h-5 rounded-full flex items-center justify-center z-10 shadow-sm border border-amazon-border">
            {item.quantity}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-amazon-text truncate capitalize uppercase tracking-widest">
            {item.productName}
          </h3>
          {/* {item.shopName && (
            <p className="text-xs text-amazon-textMuted mt-0.5 truncate">
              Shop: <span className="font-medium text-amazon-text">{item.shopName}</span>
            </p>
          )} */}
          {isCustom && (
            <button
              onClick={() => setShowComponents(!showComponents)}
              className="text-[11px] font-bold text-amazon-link hover:underline flex items-center gap-0.5 mt-0.5 uppercase tracking-wider"
            >
              {showComponents ? "Hide" : "View"} components
              {showComponents ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          )}
        </div>

        {/* Price */}
        <p className="font-bold text-sm text-amazon-price tabular-nums shrink-0 mt-0.5">
          {item.totalPrice.toLocaleString("vi-VN")}₫
        </p>
      </div>

      {/* Inline component list */}
      {isCustom && showComponents && (
        <div className="ml-20 mt-2 space-y-1.5 mb-2">
          {item.orderItemComponents.map((comp) => (
            <div
              key={comp.partId}
              className="flex items-center gap-2 text-xs text-amazon-textMuted"
            >
              <div className="relative w-6 h-6 shrink-0 rounded-sm overflow-hidden border border-amazon-border bg-neutral-50 mb-0.5">
                {comp.partImageUrl ? (
                  <Image
                    src={comp.partImageUrl}
                    alt={comp.partName}
                    fill
                    sizes="24px"
                    className="object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-100" />
                )}
              </div>
              <span className="capitalize truncate font-medium text-amazon-text">{comp.partName}</span>
              <span className="text-amazon-textMuted ml-auto shrink-0 font-bold">
                ×{comp.quantity}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════
// Main Checkout Page
// ═════════════════════════════════════════════════════════════
function CheckoutContent() {
  const searchParams = useSearchParams();
  const selectedOrderItemIds = searchParams.getAll("items");

  const dispatch = useAppDispatch();

  // ── Voucher state from Redux (same source used by the preview hook) ──
  const applicableVouchers = useAppSelector((state) => state.voucher.applicableVouchers);
  const selectedSystemCode = useAppSelector((state) => state.voucher.selectedSystemVoucherCode);
  const selectedShopVoucherCodesMap = useAppSelector((state) => state.voucher.selectedShopVoucherCodes);

  // ── Wallet state ──────────────────────────────────────────────────────
  const { details: walletDetails } = useAppSelector((state) => state.wallet);

  useEffect(() => {
    dispatch(fetchWalletDetails());
  }, [dispatch]);

  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [activePolicy, setActivePolicy] = useState<"terms" | "privacy" | "returns" | null>(null);

  const [form, setForm] = useState<CheckoutForm>({
    receiverName: "",
    receiverPhone: "",
    shippingAddress: "",
    note: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [paymentMethod, setPaymentMethod] = useState<number>(0);

  // Fetch cart data and pre-fill form if available
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await orderService.getCart();
        if (res.success) {
          setCart(res.data);

          // Pre-fill form with saved shipping info from cart
          const cartData = res.data;
          if (
            cartData.receiverName ||
            cartData.receiverPhone ||
            cartData.shippingAddress
          ) {
            setForm((prev) => ({
              ...prev,
              receiverName: cartData.receiverName || prev.receiverName,
              receiverPhone: cartData.receiverPhone || prev.receiverPhone,
              shippingAddress: cartData.shippingAddress || prev.shippingAddress,
              note: cartData.note || prev.note,
            }));
          }
        }
      } catch {
        // Cart fetch failed — will show empty state
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  // ── Build voucher codes payload (codes stored directly in state) ─────────
  const payloadCodes = useMemo(() => {
    const shopCodeGroups: Record<string, string[]> = {};
    if (selectedShopVoucherCodesMap) {
      Object.entries(selectedShopVoucherCodesMap).forEach(([shopId, codes]) => {
        if (codes && codes.length > 0) {
          shopCodeGroups[shopId] = codes;
        }
      });
    }
    return {
      systemCode: selectedSystemCode ?? undefined,
      shopCodeGroups,
    };
  }, [selectedSystemCode, selectedShopVoucherCodesMap]);

  const handleInputChange = useCallback(
    (field: keyof CheckoutForm) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
        // Clear error on change
        if (errors[field as keyof FormErrors]) {
          setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
      },
    [errors],
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      // Validate
      const validationErrors = validateForm(form);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setSubmitting(true);
      try {
        const origin =
          typeof window !== "undefined" ? window.location.origin : "";

        const payload = {
          receiverName: form.receiverName.trim(),
          receiverPhone: form.receiverPhone.trim(),
          shippingAddress: form.shippingAddress.trim(),
          note: form.note.trim(),
          successUrl: `${origin}/payment-success`,
          cancelUrl: `${origin}/payment-fail`,
          selectedOrderItemIds,
          // Voucher codes — undefined omits field from JSON; {} is explicit "no shop vouchers"
          appliedSystemVoucherCode: payloadCodes.systemCode,
          appliedShopVoucherCodeGroups:
            Object.keys(payloadCodes.shopCodeGroups).length > 0
              ? payloadCodes.shopCodeGroups
              : undefined,
          paymentMethod,
        };

        console.log("🚀 FINAL CHECKOUT PAYLOAD:", payload);

        const res = await orderService.checkout(payload);

       if (res.success) {
  if (res.data?.paymentUrl) {
    // Trường hợp 1: VNPay hoặc Stripe (Có URL chuyển hướng)
    window.location.href = res.data.paymentUrl;
  } else {
    // Trường hợp 2: Ví Ameko Wallet (Thanh toán xong ngay lập tức, không có URL)
    // Bạn chuyển hướng khách về thẳng trang Thành công của dự án
    window.location.href = `/payment-success?orderId=${res.data?.orderGroupId || ''}`;
  }
} else {
  // Thất bại thực sự (lỗi Backend, hết hàng, lỗi hệ thống...)
  toast.error(res.message || "Checkout failed. Please try again.");
  setSubmitting(false);
}
      } catch (error: unknown) {
        const err = error as { message?: string };
        toast.error(err.message || "Checkout failed. Please try again.");
        setSubmitting(false);
      }
    },
    [form, selectedOrderItemIds, payloadCodes, paymentMethod],
  );

  // ─── Derived data (must be above early returns — Rules of Hooks) ───────────
  // Build a stable Set for the hook
  const selectedItemIdsSet = useMemo(
    () => new Set(selectedOrderItemIds),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedOrderItemIds.join(",")],
  );

  // Selected items list (safe: cart may be null before fetch completes)
  const selectedItems = useMemo(() => {
    if (!cart) return [];
    return selectedOrderItemIds.length > 0
      ? cart.orderItems.filter((item) =>
          selectedOrderItemIds.includes(item.orderItemId),
        )
      : cart.orderItems;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, selectedOrderItemIds.join(",")]);

  const selectedTotal = selectedItems.reduce(
    (sum, item) => sum + item.totalPrice,
    0,
  );

  // Live pricing from the calculate-preview API
  const { cartPreview, isCalculatingPreview } = useCartPreviewLogic(
    cart?.orderItems || [],
    selectedItemIdsSet,
  );

  // Mobile total: Subtotal - Discount (shipping is Pay-on-Delivery, excluded from Stripe total)
  const displayTotal = cartPreview
    ? (cartPreview.totalCartSubTotal ?? selectedTotal) - (cartPreview.totalDiscountAmount ?? 0)
    : selectedTotal;

  // Group selected items by shop for Shopee-style rendering
  const groupedItems = useMemo(() => {
    return selectedItems.reduce<Record<string, typeof selectedItems>>((acc, item) => {
      const key = item.shopName || "AMK Collective Official";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [selectedItems]);


  // ─── Loading ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amazon-bgSecondary text-amazon-text">
        <Loader2 className="w-8 h-8 animate-spin text-amazon-btnSecondary" />
      </div>
    );
  }

  // ─── Empty Cart ──────────────────────────────────────────
  if (!cart || cart.orderItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-amazon-bgSecondary text-center px-4">
        <ShoppingBag className="w-16 h-16 text-amazon-btnSecondary mb-4 opacity-50" />
        <h2 className="text-2xl font-black uppercase tracking-widest text-amazon-text mb-2">Your cart is empty</h2>
        <p className="text-amazon-textMuted mb-6 font-medium">Add some products to checkout.</p>
        <Link
          href="/shop/all-products"
          className="bg-amazon-btnPrimary text-amazon-text px-6 py-3 rounded-sm text-sm font-black uppercase tracking-widest hover:brightness-95 transition-colors shadow-sm"
        >
          Return to Shop
        </Link>
      </div>
    );
  }
  // No selected items found
  if (selectedItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-amazon-bgSecondary text-center px-4">
        <ShoppingBag className="w-16 h-16 text-amazon-btnSecondary mb-4 opacity-50" />
        <h2 className="text-2xl font-black  uppercase tracking-widest text-amazon-text mb-2">No items selected</h2>
        <p className="text-amazon-textMuted mb-6 font-medium">
          Please go back to your cart and select items to checkout.
        </p>
        <Link
          href="/cart"
          className="bg-amazon-btnPrimary text-amazon-text px-6 py-3 rounded-sm text-sm font-black uppercase tracking-widest hover:brightness-95 transition-colors shadow-sm"
        >
          Return to Cart
        </Link>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans text-amazon-text bg-amazon-bgSecondary">
      {/* ═══════════════════════════════════════════════════════
          LEFT COLUMN: CHECKOUT FORM
      ═══════════════════════════════════════════════════════ */}
      <div className="flex-1 lg:flex-[0_0_58%] lg:order-1 order-2 bg-bgSecondary px-4 md:px-8 lg:px-14 py-8 lg:py-4 border-r border-amazon-border">
        <form
          id="checkout-form"
          onSubmit={handleSubmit}
          className="max-w-[600px] ml-auto mr-auto lg:mr-0"
        >
          {/* Logo */}
          <Link href="/" className="block mb-6">
            <h1 className="text-2xl font-black uppercase tracking-tight text-amazon-text">
              AMEKO STORE
            </h1>
          </Link>
{/* 
          <Link
            href="/cart"
            className="text-amazon-link hover:underline transition-colors text-sm inline-flex items-center gap-1 mb-8 font-bold"
          >
            <ChevronRight className="w-4 h-4 rotate-180" /> Return to cart
          </Link> */}
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-amazon-textMuted mb-6">
            <Link href="/cart" className="text-amazon-link hover:underline">
              Cart
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="font-black text-amazon-text">Information</span>
            <ChevronRight className="w-3 h-3" />
            <span>Payment</span>
          </nav>


          {/* ─── Shipping Information ─────────────────────── */}
          <div className="mb-8">
            <h2 className="text-lg  tracking-tight text-amazon-text mb-4">Shipping Information</h2>

            <div className="space-y-3">
              {/* Receiver Name */}
              <div>
                <input
                  type="text"
                  placeholder="Receiver name *"
                  value={form.receiverName}
                  onChange={handleInputChange("receiverName")}
                  className={`w-full h-[50px] px-3 border rounded-sm focus:outline-none focus:border-amazon-focus focus:ring-1 focus:ring-amazon-focus/30 text-[13px] placeholder:text-amazon-textMuted ${
                    errors.receiverName
                      ? "border-red-400 bg-red-50"
                      : "border-amazon-border bg-white"
                  }`}
                />
                {errors.receiverName && (
                  <p className="text-red-600 text-xs mt-1 font-bold">
                    {errors.receiverName}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Phone number *"
                  value={form.receiverPhone}
                  onChange={handleInputChange("receiverPhone")}
                  className={`w-full h-[50px] px-3 border rounded-sm focus:outline-none focus:border-amazon-focus focus:ring-1 focus:ring-amazon-focus/30 text-[13px]  placeholder:text-amazon-textMuted ${
                    errors.receiverPhone
                      ? "border-red-400 bg-red-50"
                      : "border-amazon-border bg-white"
                  }`}
                />
                <div
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-amazon-textMuted cursor-help"
                  title="Phone number needed for shipping"
                >
                  <HelpCircle className="w-4 h-4" />
                </div>
                {errors.receiverPhone && (
                  <p className="text-red-600 text-xs mt-1 font-bold">
                    {errors.receiverPhone}
                  </p>
                )}
              </div>

              {/* Address */}
              <div>
                <input
                  type="text"
                  placeholder="Shipping address *"
                  value={form.shippingAddress}
                  onChange={handleInputChange("shippingAddress")}
                  className={`w-full h-[50px] px-3 border rounded-sm focus:outline-none focus:border-amazon-focus focus:ring-1 focus:ring-amazon-focus/30 text-[13px] placeholder:text-amazon-textMuted ${
                    errors.shippingAddress
                      ? "border-red-400 bg-red-50"
                      : "border-amazon-border bg-white"
                  }`}
                />
                {errors.shippingAddress && (
                  <p className="text-red-600 text-xs mt-1 font-bold">
                    {errors.shippingAddress}
                  </p>
                )}
              </div>

              {/* Note */}
              <textarea
                placeholder="Order note (optional)"
                rows={3}
                value={form.note}
                onChange={handleInputChange("note")}
                className="w-full px-3 py-3 border rounded-sm focus:outline-none focus:border-amazon-focus focus:ring-1 focus:ring-amazon-focus/30 text-[13px] placeholder:text-amazon-textMuted border-amazon-border bg-white resize-none"
                maxLength={500}
              />
            </div>

            {/* ─── Payment Method ──────────────────────────── */}
            {/* ─── Payment Method ──────────────────────────── */}
            <h2 className="text-lg   text-amazon-text mb-4 mt-8 pt-8 border-t border-amazon-border">Payment Method</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Stripe */}
              <label
                className={`flex items-center gap-3 p-4 border rounded-sm cursor-pointer transition-colors ${
                  paymentMethod === 0
                    ? "border-amazon-focus ring-1 ring-amazon-focus/30 bg-neutral-50 shadow-sm"
                    : "border-amazon-border bg-white hover:border-neutral-300"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={0}
                  checked={paymentMethod === 0}
                  onChange={() => setPaymentMethod(0)}
                  className="accent-amazon-btnPrimary w-4 h-4 cursor-pointer"
                />
                <div>
                  <p className="text-sm font-bold text-amazon-text  ">Stripe (Credit Card)</p>
                  <p className="text-[11px]  text-amazon-textMuted mt-0.5 ">Pay securely via Stripe</p>
                </div>
              </label>

              {/* VN PAY*/}
              <label
                className={`flex items-center gap-3 p-4 border rounded-sm cursor-pointer transition-colors ${
                  paymentMethod === 2
                    ? "border-amazon-focus ring-1 ring-amazon-focus/30 bg-neutral-50 shadow-sm"
                    : "border-amazon-border bg-white hover:border-neutral-300"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={2}
                  checked={paymentMethod === 2}
                  onChange={() => setPaymentMethod(2)}
                  className="accent-amazon-btnPrimary w-4 h-4 cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-amazon-text  ">VN PAY</span>
                  <span className="text-[11px]  text-amazon-textMuted mt-0.5 ">Pay securely via VN PAY</span>
                </div>
              </label>

              {/* Ameko Wallet */}
              <label
                className={`flex items-center gap-3 p-4 border rounded-sm cursor-pointer transition-colors md:col-span-2 lg:col-span-1 ${
                  paymentMethod === 1
                    ? "border-amazon-focus ring-1 ring-amazon-focus/30 bg-neutral-50 shadow-sm"
                    : "border-amazon-border bg-white hover:border-neutral-300"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={1}
                  checked={paymentMethod === 1}
                  onChange={() => setPaymentMethod(1)}
                  className="accent-amazon-btnPrimary w-4 h-4 cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-amazon-text  ">Ameko Wallet</span>
                  <span className="text-[11px]  text-amazon-textMuted italic mt-0.5 ">
                    Balance: {walletDetails?.balance?.toLocaleString("vi-VN") ?? 0}₫
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* ─── Footer Actions ───────────────────────────── */}
          <div className="mt-10 border-t border-amazon-border pt-6">
            <p className="text-[11px] md:text-xs text-amazon-textMuted leading-relaxed mb-6 text-justify">
              By placing your order, you confirm that you have read, understood, and agree to be bound by AMK Collective&apos;s{" "}
              <button
                type="button"
                onClick={() => setActivePolicy("terms")}
                className="font-bold text-amazon-text hover:text-amazon-link hover:underline transition-colors"
              >
                Terms of Use and Sale
              </button>
              . You also acknowledge that your personal information will be securely collected and processed in accordance with our{" "}
              <button
                type="button"
                onClick={() => setActivePolicy("privacy")}
                className="font-bold text-amazon-text hover:text-amazon-link hover:underline transition-colors"
              >
                Privacy Policy
              </button>{" "}
              to fulfill your order and enhance your shopping experience. All financial transactions are fully encrypted and processed through secure third-party payment gateways; we do not store your full credit card details on our servers. For details regarding cancellations or refunds, please refer to our{" "}
              <button
                type="button"
                onClick={() => setActivePolicy("returns")}
                className="font-bold text-amazon-text hover:text-amazon-link hover:underline transition-colors"
              >
                Return & Refund Policy
              </button>
              .
            </p>
          </div>
        </form>
      </div>

      {/* ═══════════════════════════════════════════════════════
          RIGHT COLUMN: ORDER SUMMARY
      ═══════════════════════════════════════════════════════ */}
      <div className="flex-1 lg:flex-[0_0_42%] lg:order-2 order-1 bg-amazon-bgSecondary border-l border-amazon-border px-4 md:px-8 lg:px-10 py-8 lg:py-12">
        {/* Mobile Toggle */}
        <button
          onClick={() => setIsSummaryOpen(!isSummaryOpen)}
          className="lg:hidden flex w-full items-center justify-between border-b border-amazon-border pb-4 mb-6 bg-amazon-bgSecondary"
        >
          <div className="flex items-center gap-2 text-amazon-text">
            <ShoppingBag className="w-4 h-4" />
            <span className="text-sm font-bold uppercase tracking-widest text-amazon-text">
              {isSummaryOpen ? "Hide" : "Show"} order summary
            </span>
            <ChevronDown
              className={`w-3 h-3 text-amazon-textMuted transition-transform ${
                isSummaryOpen ? "rotate-180" : ""
              }`}
            />
          </div>
          <span className="font-bold text-lg text-amazon-price">
            {isCalculatingPreview ? (
              <Loader2 className="w-5 h-5 animate-spin text-amazon-textMuted" />
            ) : (
              `${displayTotal.toLocaleString("vi-VN")}₫`
            )}
          </span>
        </button>

        {/* Content */}
        <div
          className={`lg:block ${
            isSummaryOpen ? "block" : "hidden"
          } max-w-[400px]`}
        >
          {/* Product List — grouped by shop */}
          {Object.entries(groupedItems).map(([shopName, items]) => (
            <div key={shopName} className="bg-white rounded-sm  overflow-hidden  mb-4">
              {/* Shop Header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-amazon-border bg-neutral-50">
                <Store className="w-4 h-4 text-amazon-textMuted shrink-0" />
                <span className="font-black text-sm text-amazon-text uppercase tracking-widest truncate">
                  {shopName}
                </span>
              </div>
              {/* Items */}
              <div className="p-4 space-y-4">
                {items.map((item) => (
                  <CheckoutItemRow key={item.orderItemId} item={item} />
                ))}
              </div>
            </div>
          ))}

          {/* Cost Breakdown */}
          <div className="space-y-3 border-t border-amazon-border pt-6 pb-6 mb-6 text-sm text-amazon-textMuted font-bold  tracking-wider">
            <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-black text-amazon-text">
                  {isCalculatingPreview ? (
                    <Loader2 className="w-4 h-4 animate-spin text-amazon-textMuted" />
                  ) : (
                    `${(cartPreview?.totalCartSubTotal ?? selectedTotal).toLocaleString("vi-VN")}₫`
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="italic text-amazon-textMuted text-xs">
                  Pay on delivery
                </span>
              </div>
              {(cartPreview?.totalDiscountAmount ?? 0) > 0 && (
              <div className="flex justify-between">
                <span>Discount</span>
                <span className="font-black text-green-600">
                  {isCalculatingPreview ? (
                    <Loader2 className="w-4 h-4 animate-spin text-amazon-textMuted" />
                  ) : (
                    `-${cartPreview!.totalDiscountAmount.toLocaleString("vi-VN")}₫`
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="flex justify-between items-center border-t border-amazon-border pt-6 mb-6">
            <span className="text-base font-black uppercase tracking-widest text-amazon-text">Total</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amazon-price tracking-tight">
                {isCalculatingPreview ? (
                  <Loader2 className="w-6 h-6 animate-spin text-amazon-textMuted" />
                ) : (
                  `${displayTotal.toLocaleString("vi-VN")}₫`
                )}
              </span>
            </div>
          </div>

          {/* Pay Button */}
          <button
            type="submit"
            form="checkout-form"
            disabled={submitting || isCalculatingPreview || cartPreview === null}
            className="w-full bg-amazon-btnPrimary text-amazon-text hover:brightness-95 px-10 py-4 rounded-sm font-black uppercase  transition-colors text-[15px] shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : paymentMethod === 1 ? (
              "Pay with Wallet"
            ) : paymentMethod === 2 ? (
              "Pay with VN PAY"
            ) : (
              "Pay with Stripe"
            )
            }
          </button>
        </div>
      </div>

      {activePolicy && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 transition-opacity">
          <div className="bg-white rounded-sm shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden max-h-[85vh] animate-in slide-in-from-bottom duration-300 border border-amazon-border">
            <div className="flex items-center justify-between px-6 py-4 border-b border-amazon-border bg-neutral-50">
              <h2 className="text-xl font-black uppercase tracking-widest text-amazon-text">
                {activePolicy === "terms" && "Terms of Use and Sale"}
                {activePolicy === "privacy" && "Privacy Policy"}
                {activePolicy === "returns" && "Return & Refund Policy"}
              </h2>
              <button
                type="button"
                onClick={() => setActivePolicy(null)}
                className="p-2 text-amazon-textMuted hover:text-amazon-text hover:bg-neutral-200 rounded-sm transition-colors focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="px-6 py-5 overflow-y-auto flex-1 text-sm text-amazon-textMuted space-y-4">
              {activePolicy === "terms" && (
                <>
                  <p>Welcome to AMK Collective. By accessing our platform, you agree to these terms.</p>
                  <p>All products sold are subject to availability. Prices may change without notice.</p>
                  <p>We are not liable for external delays in shipping once the product is handed over to the carrier.</p>
                </>
              )}
              {activePolicy === "privacy" && (
                <>
                  <p>Your privacy is critically important to us.</p>
                  <p>We only collect personal information that is necessary to process your order and deliver your items.</p>
                  <p>We will never sell your personal contact information or credit card details to third parties.</p>
                </>
              )}
              {activePolicy === "returns" && (
                <>
                  <p>We accept returns within 14 days of receipt for most items in new condition.</p>
                  <p>Custom-built products may be subject to a restocking fee.</p>
                  <p>Refunds will be processed to the original method of payment within 5-7 business days of receiving the returned item.</p>
                </>
              )}
            </div>

            <div className="p-4 sm:p-6 border-t border-amazon-border bg-neutral-50 mt-auto">
              <button
                type="button"
                onClick={() => setActivePolicy(null)}
                className="w-full bg-amazon-btnPrimary text-amazon-text py-2.5 rounded-sm font-black shadow-sm uppercase tracking-widest hover:brightness-95 transition-colors focus:outline-none"
              >
                I Understand & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
