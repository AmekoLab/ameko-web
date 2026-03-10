"use client";

import { useState, useEffect, useCallback, useMemo, FormEvent, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  ShoppingBag,
  HelpCircle,
  ChevronRight,
  Loader2,
  ChevronUp,
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
        <div className="relative w-16 h-16 border border-gray-200 rounded-lg bg-white shrink-0">
          {displayImage ? (
            <Image
              src={displayImage}
              alt={item.productName}
              fill
              className="object-contain p-1 rounded-lg"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-gray-300" />
            </div>
          )}
          <span className="absolute -top-2 -right-2 bg-gray-600 text-white text-[11px] font-medium w-5 h-5 rounded-full flex items-center justify-center z-10 shadow-sm border border-white">
            {item.quantity}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm text-gray-800 truncate capitalize">
            {item.productName}
          </h3>
          {isCustom && (
            <button
              onClick={() => setShowComponents(!showComponents)}
              className="text-[11px] text-[#ce2a32] hover:underline flex items-center gap-0.5 mt-0.5"
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
        <p className="font-medium text-sm text-gray-800 tabular-nums shrink-0">
          {item.totalPrice.toLocaleString()}₫
        </p>
      </div>

      {/* Inline component list */}
      {isCustom && showComponents && (
        <div className="ml-20 mt-2 space-y-1.5 mb-2">
          {item.orderItemComponents.map((comp) => (
            <div
              key={comp.partId}
              className="flex items-center gap-2 text-xs text-gray-500"
            >
              <div className="relative w-6 h-6 shrink-0 rounded overflow-hidden border border-gray-100">
                {comp.partImageUrl ? (
                  <Image
                    src={comp.partImageUrl}
                    alt={comp.partName}
                    fill
                    sizes="24px"
                    className="object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100" />
                )}
              </div>
              <span className="capitalize truncate">{comp.partName}</span>
              <span className="text-gray-400 ml-auto shrink-0">
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

  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const [form, setForm] = useState<CheckoutForm>({
    receiverName: "",
    receiverPhone: "",
    shippingAddress: "",
    note: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

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
        const res = await orderService.checkout({
          receiverName: form.receiverName.trim(),
          receiverPhone: form.receiverPhone.trim(),
          shippingAddress: form.shippingAddress.trim(),
          note: form.note.trim(),
          successUrl: `${origin}/payment-success`,
          cancelUrl: `${origin}/payment-fail`,
          selectedOrderItemIds,
        });

        if (res.success && res.data?.paymentUrl) {
          // Redirect to Stripe Checkout
          window.location.href = res.data.paymentUrl;
        } else {
          toast.error(res.message || "Checkout failed. Please try again.");
          setSubmitting(false);
        }
      } catch (error: unknown) {
        const err = error as { message?: string };
        toast.error(err.message || "Checkout failed. Please try again.");
        setSubmitting(false);
      }
    },
    [form, selectedOrderItemIds],
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

  // Mobile total: prefer live preview, fall back to local sum
  const displayTotal = cartPreview?.finalTotalAmount ?? selectedTotal;


  // ─── Loading ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // ─── Empty Cart ──────────────────────────────────────────
  if (!cart || cart.orderItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
        <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some products to checkout.</p>
        <Link
          href="/shop/all-products"
          className="bg-black text-white px-6 py-3 rounded text-sm font-bold uppercase hover:bg-[#ce2a32] transition-colors"
        >
          Return to Shop
        </Link>
      </div>
    );
  }
  // No selected items found
  if (selectedItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
        <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-2">No items selected</h2>
        <p className="text-gray-500 mb-6">
          Please go back to your cart and select items to checkout.
        </p>
        <Link
          href="/cart"
          className="bg-black text-white px-6 py-3 rounded text-sm font-bold uppercase hover:bg-[#ce2a32] transition-colors"
        >
          Return to Cart
        </Link>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans text-[#333]">
      {/* ═══════════════════════════════════════════════════════
          LEFT COLUMN: CHECKOUT FORM
      ═══════════════════════════════════════════════════════ */}
      <div className="flex-1 lg:flex-[0_0_58%] lg:order-1 order-2 bg-white px-4 md:px-8 lg:px-14 py-8 lg:py-12 border-r border-gray-200">
        <form
          onSubmit={handleSubmit}
          className="max-w-[600px] ml-auto mr-auto lg:mr-0"
        >
          {/* Logo */}
          <Link href="/" className="block mb-6">
            <h1 className="text-2xl font-black font-oswald uppercase tracking-tight">
              AMEKO STORE
            </h1>
          </Link>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
            <Link href="/cart" className="text-[#ce2a32] hover:underline">
              Cart
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="font-medium text-black">Information</span>
            <ChevronRight className="w-3 h-3" />
            <span>Payment</span>
          </nav>

          {/* ─── Shipping Information ─────────────────────── */}
          <div className="mb-8">
            <h2 className="text-lg font-medium mb-4">Shipping Information</h2>

            <div className="space-y-3">
              {/* Receiver Name */}
              <div>
                <input
                  type="text"
                  placeholder="Receiver name *"
                  value={form.receiverName}
                  onChange={handleInputChange("receiverName")}
                  className={`w-full h-[50px] px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ce2a32] text-sm placeholder:text-gray-500 ${
                    errors.receiverName
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
                {errors.receiverName && (
                  <p className="text-red-500 text-xs mt-1">
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
                  className={`w-full h-[50px] px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ce2a32] text-sm placeholder:text-gray-500 ${
                    errors.receiverPhone
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
                <div
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-help"
                  title="Phone number needed for shipping"
                >
                  <HelpCircle className="w-4 h-4" />
                </div>
                {errors.receiverPhone && (
                  <p className="text-red-500 text-xs mt-1">
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
                  className={`w-full h-[50px] px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ce2a32] text-sm placeholder:text-gray-500 ${
                    errors.shippingAddress
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
                {errors.shippingAddress && (
                  <p className="text-red-500 text-xs mt-1">
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
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ce2a32] text-sm placeholder:text-gray-500 resize-none"
                maxLength={500}
              />
            </div>
          </div>

          {/* ─── Footer Actions ───────────────────────────── */}
          <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4 mt-10">
            <Link
              href="/cart"
              className="text-[#ce2a32] hover:text-[#a01e25] transition-colors text-sm flex items-center gap-1"
            >
              <ChevronRight className="w-4 h-4 rotate-180" /> Return to cart
            </Link>
            <button
              type="submit"
              disabled={submitting || isCalculatingPreview || cartPreview === null}
              className="w-full md:w-auto bg-[#1a1a1a] hover:bg-black text-white px-8 py-4 rounded-md font-medium transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Pay with Stripe"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ═══════════════════════════════════════════════════════
          RIGHT COLUMN: ORDER SUMMARY
      ═══════════════════════════════════════════════════════ */}
      <div className="flex-1 lg:flex-[0_0_42%] lg:order-2 order-1 bg-[#fafafa] border-l border-gray-200 px-4 md:px-8 lg:px-10 py-8 lg:py-12">
        {/* Mobile Toggle */}
        <button
          onClick={() => setIsSummaryOpen(!isSummaryOpen)}
          className="lg:hidden flex w-full items-center justify-between border-b border-gray-200 pb-4 mb-6 bg-[#fafafa]"
        >
          <div className="flex items-center gap-2 text-[#ce2a32]">
            <ShoppingBag className="w-4 h-4" />
            <span className="text-sm font-medium">
              {isSummaryOpen ? "Hide" : "Show"} order summary
            </span>
            <ChevronDown
              className={`w-3 h-3 transition-transform ${
                isSummaryOpen ? "rotate-180" : ""
              }`}
            />
          </div>
          <span className="font-bold text-lg text-black">
            {isCalculatingPreview ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            ) : (
              `${displayTotal.toLocaleString()}₫`
            )}
          </span>
        </button>

        {/* Content */}
        <div
          className={`lg:block ${
            isSummaryOpen ? "block" : "hidden"
          } max-w-[400px]`}
        >
          {/* Product List */}
          <div className="space-y-4 mb-6">
            {selectedItems.map((item) => (
              <CheckoutItemRow key={item.orderItemId} item={item} />
            ))}
          </div>

          {/* Cost Breakdown */}
          <div className="space-y-3 border-t border-gray-200 pt-6 pb-6 mb-6 text-sm text-gray-600">
            <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-black">
                  {isCalculatingPreview ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  ) : (
                    `${(cartPreview?.totalCartSubTotal ?? selectedTotal).toLocaleString()}₫`
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-medium text-black">
                  {isCalculatingPreview ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  ) : (
                    `${(cartPreview?.totalShippingFee ?? 0).toLocaleString()}₫`
                  )}
                </span>
              </div>
              {(cartPreview?.totalDiscountAmount ?? 0) > 0 && (
              <div className="flex justify-between">
                <span>Discount</span>
                <span className="font-medium text-green-600">
                  {isCalculatingPreview ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  ) : (
                    `-${cartPreview!.totalDiscountAmount.toLocaleString()}₫`
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="flex justify-between items-center border-t border-gray-200 pt-6">
            <span className="text-base font-medium text-gray-800">Total</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-gray-500 font-medium">VND</span>
              <span className="text-2xl font-bold text-black tracking-tight">
                {isCalculatingPreview ? (
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                ) : (
                  `${(cartPreview?.finalTotalAmount ?? displayTotal).toLocaleString()}₫`
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
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
