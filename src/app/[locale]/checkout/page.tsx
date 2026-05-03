"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  FormEvent,
  Suspense,
} from "react";
import { useAppSelector, useAppDispatch } from "@/src/store/hook";
import { fetchWalletDetails } from "@/src/store/slices/walletSlice";
import { fetchProfileThunk } from "@/src/store/slices/authSlice";
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
  User,
  AlertCircle,
} from "lucide-react";
import { reputationService, CustomerReputationData } from "@/src/services/reputation.service";
import { orderService } from "@/src/services/order.service";
import { CartData, OrderItem } from "@/src/types/order.types";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";
import { useCartPreviewLogic } from "@/src/hooks/useCartPreviewLogic";
import { useTranslations } from "next-intl";

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

// ─── Checkout Item Row (shows custom components inline) ────
const CheckoutItemRow = ({ item }: { item: OrderItem }) => {
  const t = useTranslations("CheckoutPage");
  const isCustom = item.isCustom && item.orderItemComponents.length > 0;
  const [showComponents, setShowComponents] = useState(false);

  const displayImage =
    item.productImage ||
    (isCustom ? item.orderItemComponents[0]?.partImageUrl : null);

  return (
    <div>
      <div className="flex gap-4 items-center">
        {/* Image with Badge */}
        <div className="relative w-16 h-16 rounded-lg bg-neutral-50 shrink-0 border border-neutral-100">
          {displayImage ? (
            <Image
              src={displayImage}
              alt={item.productName}
              fill
              className="object-contain p-1 rounded-lg"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-neutral-300" />
            </div>
          )}
          <span className="absolute -top-2 -right-2 bg-neutral-900 text-white text-[11px] font-medium w-5 h-5 rounded-full flex items-center justify-center z-10 shadow-sm border border-neutral-800">
            {item.quantity}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm text-neutral-800 truncate">
            {item.productName}
          </h3>
          {/* {item.shopName && (
            <p className="text-xs text-neutral-500 mt-0.5 truncate">
              Shop: <span className="font-medium text-neutral-800">{item.shopName}</span>
            </p>
          )} */}
          {isCustom && (
            <button
              onClick={() => setShowComponents(!showComponents)}
              className="text-xs text-neutral-500 hover:text-neutral-800 flex items-center gap-1 mt-1 transition-colors"
            >
              {showComponents
                ? t("itemRow.hideComponents")
                : t("itemRow.viewComponents", {
                    count: item.orderItemComponents.length,
                  })}
              {showComponents ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>

        {/* Price */}
        <p className="font-semibold text-sm text-neutral-900 tabular-nums shrink-0 mt-0.5">
          {item.totalPrice.toLocaleString("vi-VN")}₫
        </p>
      </div>

      {/* Inline component list */}
      {isCustom && showComponents && (
        <div className="ml-[4.5rem] mt-3 space-y-2 mb-2 bg-neutral-50/50 p-2.5 rounded-lg border border-neutral-100">
          {item.orderItemComponents.map((comp) => (
            <div
              key={comp.partId}
              className="flex items-center gap-2.5 text-xs text-neutral-600"
            >
              <div className="relative w-7 h-7 shrink-0 rounded-md overflow-hidden border border-neutral-200 bg-white">
                {comp.partImageUrl ? (
                  <Image
                    src={comp.partImageUrl}
                    alt={comp.partName}
                    fill
                    sizes="28px"
                    className="object-contain p-0.5"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-50" />
                )}
              </div>
              <span className="truncate flex-1">{comp.partName}</span>
              <span className="text-neutral-400 shrink-0">
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
  const t = useTranslations("CheckoutPage");
  const searchParams = useSearchParams();
  const selectedOrderItemIds = searchParams.getAll("items");

  const dispatch = useAppDispatch();

  // ── Voucher state from Redux (same source used by the preview hook) ──
  const selectedSystemCode = useAppSelector(
    (state) => state.voucher.selectedSystemVoucherCode,
  );
  const selectedShopVoucherCodesMap = useAppSelector(
    (state) => state.voucher.selectedShopVoucherCodes,
  );

  // ── Wallet and Auth state ─────────────────────────────────────────────
  const { details: walletDetails } = useAppSelector((state) => state.wallet);
  const { user } = useAppSelector((state) => state.auth);
  const [reputation, setReputation] = useState<CustomerReputationData | null>(null);

  useEffect(() => {
    dispatch(fetchWalletDetails());
  }, [dispatch]);

  // Fetch Reputation
  useEffect(() => {
    reputationService.getMyReputation()
      .then((res) => {
        if (res.success && res.data) {
          setReputation(res.data);
        }
      })
      .catch((err) => console.error("Failed to fetch reputation for checkout", err));
  }, []);

  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [activePolicy, setActivePolicy] = useState<
    "terms" | "privacy" | "returns" | null
  >(null);

  const [form, setForm] = useState<CheckoutForm>({
    receiverName: "",
    receiverPhone: "",
    shippingAddress: "",
    note: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [paymentMethod, setPaymentMethod] = useState<number>(0);
  const [walletPin, setWalletPin] = useState<string>("");
  const [pinError, setPinError] = useState<string>("");

  const validateForm = useCallback(
    (formData: CheckoutForm): FormErrors => {
      const nextErrors: FormErrors = {};

      if (!formData.receiverName.trim()) {
        nextErrors.receiverName = t("validation.receiverNameRequired");
      }

      if (!formData.receiverPhone.trim()) {
        nextErrors.receiverPhone = t("validation.phoneRequired");
      } else if (
        formData.receiverPhone.trim().length < 9 ||
        formData.receiverPhone.trim().length > 15
      ) {
        nextErrors.receiverPhone = t("validation.phoneLengthInvalid");
      }

      if (!formData.shippingAddress.trim()) {
        nextErrors.shippingAddress = t("validation.shippingAddressRequired");
      }

      return nextErrors;
    },
    [t],
  );

  // Fetch cart data and pre-fill form if available
  useEffect(() => {
    const fetchCheckoutData = async () => {
      try {
        // 1. Fetch Cart
        const cartRes = await orderService.getCart();
        let cartData = null;
        if (cartRes.success) {
          cartData = cartRes.data;
          setCart(cartData);
        }

        // 3. Pre-fill form (Cart data takes precedence over Profile data)
        setForm((prev) => {
          return {
            ...prev,
            receiverName: cartData?.receiverName || prev.receiverName,
            receiverPhone: cartData?.receiverPhone || prev.receiverPhone,
            shippingAddress: cartData?.shippingAddress || prev.shippingAddress,
            note: cartData?.note || prev.note,
          };
        });
      } catch {
        // Fetch failed — will show empty state
      } finally {
        setLoading(false);
      }
    };
    fetchCheckoutData();
  }, [dispatch]);

  const handleAutoFill = async () => {
    if (!user?.id) {
      toast.error(t("toasts.loginRequiredForAutoFill"));
      return;
    }

    setIsAutoFilling(true);
    try {
      const profileRes = await dispatch(fetchProfileThunk(user.id));
      if (fetchProfileThunk.fulfilled.match(profileRes)) {
        const profileData = profileRes.payload;
        setForm((prev) => ({
          ...prev,
          receiverName:
            `${profileData.firstName || ""} ${profileData.lastName || ""}`.trim() ||
            prev.receiverName,
          receiverPhone: profileData.phoneNumber || prev.receiverPhone,
          shippingAddress: profileData.storeAddress || prev.shippingAddress,
        }));
        // toast.success("Filled from your profile!");
      } else {
        toast.error(t("toasts.fetchProfileFailed"));
      }
    } catch {
      toast.error(t("toasts.fetchProfileError"));
    } finally {
      setIsAutoFilling(false);
    }
  };

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

      // Wallet PIN Validation
      if (paymentMethod === 1) {
        if (!walletPin || walletPin.length < 6) {
          setPinError(
            t("validation.pinRequired") ||
              "Vui lòng nhập đủ 6 số mã PIN ví ảo.",
          );
          return;
        }
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
          ...(paymentMethod === 1 && { walletPin }), // Inject PIN for virtual wallet
        };

        console.log("🚀 FINAL CHECKOUT PAYLOAD:", payload);

        const res = await orderService.checkout(payload);

        if (res.success) {
          if (res.data?.orderGroupId) {
            localStorage.setItem("pending_order_id", res.data.orderGroupId);
          }

          if (res.data?.paymentUrl) {
            const sessionMatch = res.data.paymentUrl.match(/cs_(test|live)_[a-zA-Z0-9]+/);
            if (sessionMatch) {
              localStorage.setItem("pending_session_id", sessionMatch[0]);
            }
            window.location.href = res.data.paymentUrl;
          } else {
            window.location.href = `/payment-success?orderId=${res.data?.orderGroupId || ""}`;
          }
        } else {
          // Check if error is related to PIN
          if (res.message && res.message.toLowerCase().includes("pin")) {
            setPinError(res.message);
          } else {
            toast.error(res.message || t("toasts.checkoutFailed"));
          }
          setSubmitting(false);
        }
      } catch (error: unknown) {
        const err = error as { message?: string; response?: any };
        const status = err?.response?.status;
        const msg = err?.response?.data?.message || err?.message;
        
        if (status === 403 && msg?.includes("locked from purchasing")) {
          toast.error(t("errorLocked") || "Bạn đã bị khóa tính năng mua hàng do điểm uy tín.");
        } else if (status === 403 && msg?.includes("Monthly order limit reached")) {
          toast.error(t("errorLimitReached") || "Bạn đã đạt giới hạn số đơn hàng tối đa trong tháng.");
        } else {
          toast.error(msg || t("toasts.checkoutFailed"));
        }
        setSubmitting(false);
      }
    },
    [
      form,
      selectedOrderItemIds,
      payloadCodes,
      paymentMethod,
      walletPin,
      t,
      validateForm,
    ],
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
    ? (cartPreview.totalCartSubTotal ?? selectedTotal) -
      (cartPreview.totalDiscountAmount ?? 0)
    : selectedTotal;

  // Group selected items by shop for Shopee-style rendering
  const groupedItems = useMemo(() => {
    return selectedItems.reduce<Record<string, typeof selectedItems>>(
      (acc, item) => {
        const key = item.shopName || t("shopFallbackName");
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      },
      {},
    );
  }, [selectedItems, t]);

  // ─── Loading ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-neutral-800">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  // ─── Empty Cart ──────────────────────────────────────────
  if (!cart || cart.orderItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 text-center px-4">
        <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mb-6">
          <ShoppingBag className="w-9 h-9 text-neutral-400" />
        </div>
        <h2 className="text-2xl font-semibold text-neutral-900 mb-3">
          {t("emptyCartTitle")}
        </h2>
        <p className="text-neutral-500 mb-8 max-w-md text-sm leading-relaxed">
          {t("emptyCartDescription")}
        </p>
        <Link
          href="/shop/all-products"
          className="bg-neutral-900 text-white px-8 py-3 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors shadow-sm"
        >
          {t("returnToShop")}
        </Link>
      </div>
    );
  }
  // No selected items found
  if (selectedItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 text-center px-4">
        <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mb-6">
          <ShoppingBag className="w-9 h-9 text-neutral-400" />
        </div>
        <h2 className="text-2xl font-semibold text-neutral-900 mb-3">
          {t("noItemsSelectedTitle")}
        </h2>
        <p className="text-neutral-500 mb-8 max-w-md text-sm leading-relaxed">
          {t("noItemsSelectedDescription")}
        </p>
        <Link
          href="/cart"
          className="bg-neutral-900 text-white px-8 py-3 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors shadow-sm"
        >
          {t("returnToCart")}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans text-neutral-800 bg-neutral-50">
      {/* ═══════════════════════════════════════════════════════
          LEFT COLUMN: CHECKOUT FORM
      ═══════════════════════════════════════════════════════ */}
      <div className="flex-1 lg:flex-[0_0_55%] lg:order-1 order-2 bg-white px-4 md:px-8 lg:px-14 py-8 lg:py-4 border-r border-neutral-200">
        <form
          id="checkout-form"
          onSubmit={handleSubmit}
          className="max-w-[600px] ml-auto mr-auto lg:mr-0"
        >
          {/* Logo */}
          <Link href="/" className="block mb-2">
            <h1 className="text-3xl font-black tracking-tight text-neutral-900">
              AMEKO STORE
            </h1>
          </Link>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-10">
            <Link
              href="/cart"
              className="hover:text-neutral-800 transition-colors"
            >
              {t("breadcrumb.cart")}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="font-semibold text-neutral-900">
              {t("breadcrumb.information")}
            </span>
            <ChevronRight className="w-4 h-4" />
            <span>{t("breadcrumb.payment")}</span>
          </nav>

          {/* REPUTATION LOCK WARNING */}
          {reputation?.gate.isLocked && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-bold text-red-800 text-sm">
                  {t("repuLockedTitle") || "Tài khoản bị hạn chế mua hàng"}
                </h3>
                <p className="text-red-600 text-sm mt-1">
                  {t("repuLockedDesc") || "Điểm uy tín của bạn quá thấp nên tính năng đặt hàng đã bị khóa tạm thời. Vui lòng liên hệ CSKH."}
                </p>
              </div>
            </div>
          )}

          {/* ─── Shipping Information ─────────────────────── */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-medium text-neutral-900">
                {t("shippingInformation")}
              </h2>
              <button
                type="button"
                onClick={handleAutoFill}
                disabled={isAutoFilling}
                title={t("autoFillTitle")}
                className="flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors disabled:opacity-50"
              >
                {isAutoFilling ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <User className="w-4 h-4" />
                )}
                {t("autoFill")}
              </button>
            </div>

            <div className="space-y-4">
              {/* Receiver Name */}
              <div>
                <input
                  type="text"
                  placeholder={t("receiverNamePlaceholder")}
                  value={form.receiverName}
                  onChange={handleInputChange("receiverName")}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-shadow text-sm placeholder:text-neutral-400 ${
                    errors.receiverName
                      ? "border-red-400 bg-red-50"
                      : "border-neutral-200 bg-white"
                  }`}
                />
                {errors.receiverName && (
                  <p className="text-red-500 text-xs mt-1.5 ml-1">
                    {errors.receiverName}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="relative">
                <input
                  type="text"
                  placeholder={t("phonePlaceholder")}
                  value={form.receiverPhone}
                  onChange={handleInputChange("receiverPhone")}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-shadow text-sm placeholder:text-neutral-400 ${
                    errors.receiverPhone
                      ? "border-red-400 bg-red-50"
                      : "border-neutral-200 bg-white"
                  }`}
                />
                <div
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 cursor-help"
                  title={t("phoneHelpTitle")}
                >
                  <HelpCircle className="w-4 h-4" />
                </div>
                {errors.receiverPhone && (
                  <p className="text-red-500 text-xs mt-1.5 ml-1">
                    {errors.receiverPhone}
                  </p>
                )}
              </div>

              {/* Address */}
              <div>
                <input
                  type="text"
                  placeholder={t("shippingAddressPlaceholder")}
                  value={form.shippingAddress}
                  onChange={handleInputChange("shippingAddress")}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-shadow text-sm placeholder:text-neutral-400 ${
                    errors.shippingAddress
                      ? "border-red-400 bg-red-50"
                      : "border-neutral-200 bg-white"
                  }`}
                />
                {errors.shippingAddress && (
                  <p className="text-red-500 text-xs mt-1.5 ml-1">
                    {errors.shippingAddress}
                  </p>
                )}
              </div>

              {/* Note */}
              <textarea
                placeholder={t("orderNotePlaceholder")}
                rows={3}
                value={form.note}
                onChange={handleInputChange("note")}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-shadow text-sm placeholder:text-neutral-400 border-neutral-200 bg-white resize-none"
                maxLength={500}
              />
            </div>

            {/* ─── Payment Method ──────────────────────────── */}
            <h2 className="text-xl font-medium text-neutral-900 mb-5 mt-4 pt-4 border-t border-neutral-100">
              {t("paymentMethodTitle")}
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {/* Stripe */}
              <label
                className={`flex items-center gap-4 p-5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 0
                    ? "border-neutral-900 bg-neutral-50 shadow-sm"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={0}
                  checked={paymentMethod === 0}
                  onChange={() => setPaymentMethod(0)}
                  className="w-5 h-5 accent-neutral-900 cursor-pointer"
                />
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {t("paymentOptions.stripe.title")}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {t("paymentOptions.stripe.description")}
                  </p>
                </div>
              </label>

              {/* VN PAY*/}
              <label
                className={`flex items-center gap-4 p-5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 2
                    ? "border-neutral-900 bg-neutral-50 shadow-sm"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={2}
                  checked={paymentMethod === 2}
                  onChange={() => setPaymentMethod(2)}
                  className="w-5 h-5 accent-neutral-900 cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-neutral-900">
                    {t("paymentOptions.vnpay.title")}
                  </span>
                  <span className="text-xs text-neutral-500 mt-0.5">
                    {t("paymentOptions.vnpay.description")}
                  </span>
                </div>
              </label>

              {/* Ameko Wallet (Virtual Wallet) */}
              <div className="flex flex-col">
                <label
                  className={`flex items-center gap-4 p-5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 1
                      ? "border-neutral-900 bg-neutral-50 shadow-sm"
                      : "border-neutral-200 bg-white hover:border-neutral-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={1}
                    checked={paymentMethod === 1}
                    onChange={() => {
                      setPaymentMethod(1);
                      setPinError(""); // Clear error when switching
                    }}
                    className="w-5 h-5 accent-neutral-900 cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-neutral-900">
                      {t("paymentOptions.wallet.title")}
                    </span>
                    <span className="text-xs text-amber-600 font-medium mt-0.5">
                      {t("walletAvailable", {
                        amount: `${walletDetails?.balance?.toLocaleString("vi-VN") ?? 0}₫`,
                      })}
                    </span>
                  </div>
                </label>

                {/* Virtual Wallet PIN Input (Expands when selected) */}
                {paymentMethod === 1 && (
                  <div className="pl-14 pr-5 pt-3 pb-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-xs text-neutral-600 mb-2 font-medium">
                      {t("walletPinPrompt") ||
                        "Nhập mã PIN 6 số của ví ảo để xác nhận:"}
                    </p>
                    <input
                      type="password"
                      maxLength={6}
                      value={walletPin}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, ""); // Allow only numbers
                        setWalletPin(value);
                        if (pinError) setPinError("");
                      }}
                      placeholder="••••••"
                      className={`w-full max-w-[160px] px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-1 transition-all text-center tracking-[0.5em] font-mono text-xl ${
                        pinError
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50 text-red-900"
                          : "border-neutral-300 focus:border-neutral-900 focus:ring-neutral-900 bg-white text-neutral-900"
                      }`}
                    />
                    {pinError && (
                      <p className="text-red-500 text-xs mt-2 font-medium">
                        {pinError}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ─── Footer Actions ───────────────────────────── */}
          <div className="mt-1 border-t border-neutral-100 pt-1">
            <p className="text-xs text-neutral-500 leading-relaxed text-justify">
              {t.rich("policyNotice", {
                terms: (chunks) => (
                  <button
                    type="button"
                    onClick={() => setActivePolicy("terms")}
                    className="font-medium text-neutral-800 hover:text-amber-600 transition-colors"
                  >
                    {chunks}
                  </button>
                ),
                privacy: (chunks) => (
                  <button
                    type="button"
                    onClick={() => setActivePolicy("privacy")}
                    className="font-medium text-neutral-800 hover:text-amber-600 transition-colors"
                  >
                    {chunks}
                  </button>
                ),
                returns: (chunks) => (
                  <button
                    type="button"
                    onClick={() => setActivePolicy("returns")}
                    className="font-medium text-neutral-800 hover:text-amber-600 transition-colors"
                  >
                    {chunks}
                  </button>
                ),
              })}
            </p>
          </div>
        </form>
      </div>

      {/* ═══════════════════════════════════════════════════════
          RIGHT COLUMN: ORDER SUMMARY
      ═══════════════════════════════════════════════════════ */}
      <div className="flex-1 lg:flex-[0_0_45%] lg:order-2 order-1 bg-neutral-50 lg:border-l border-neutral-200 px-4 md:px-8 lg:px-12 py-8 lg:py-12">
        {/* Mobile Toggle */}
        <button
          onClick={() => setIsSummaryOpen(!isSummaryOpen)}
          className="lg:hidden flex w-full items-center justify-between border-b border-neutral-200 pb-5 mb-6"
        >
          <div className="flex items-center gap-2 text-neutral-700">
            <ShoppingBag className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-medium">
              {isSummaryOpen ? t("hideOrderSummary") : t("showOrderSummary")}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-neutral-400 transition-transform ${
                isSummaryOpen ? "rotate-180" : ""
              }`}
            />
          </div>
          <span className="font-semibold text-lg text-neutral-900 tabular-nums">
            {isCalculatingPreview ? (
              <Loader2 className="w-5 h-5 animate-spin text-neutral-400 inline" />
            ) : (
              `${displayTotal.toLocaleString("vi-VN")}₫`
            )}
          </span>
        </button>

        {/* Content */}
        <div
          className={`lg:block ${
            isSummaryOpen ? "block" : "hidden"
          } max-w-[440px] mx-auto lg:mx-0`}
        >
          {/* Product List — grouped by shop */}
          <div className="space-y-6">
            {Object.entries(groupedItems).map(([shopName, items]) => (
              <div
                key={shopName}
                className="bg-white rounded-xl border border-neutral-200/80 overflow-hidden shadow-sm"
              >
                {/* Shop Header */}
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-neutral-100 bg-neutral-50/50">
                  <Store className="w-4 h-4 text-neutral-400 shrink-0" />
                  <span className="font-medium text-sm text-neutral-800 truncate">
                    {shopName}
                  </span>
                </div>
                {/* Items */}
                <div className="p-5 space-y-5">
                  {items.map((item) => (
                    <CheckoutItemRow key={item.orderItemId} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Cost Breakdown */}
          <div className="space-y-3.5 mt-8 mb-6 text-sm text-neutral-600">
            <div className="flex justify-between items-center">
              <span>{t("subtotal")}</span>
              <span className="font-medium text-neutral-900 tabular-nums">
                {isCalculatingPreview ? (
                  <Loader2 className="w-4 h-4 animate-spin text-neutral-400 inline" />
                ) : (
                  `${(cartPreview?.totalCartSubTotal ?? selectedTotal).toLocaleString("vi-VN")}₫`
                )}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>{t("shipping")}</span>
              <span className="italic text-neutral-400 text-xs">
                {t("payOnDelivery")}
              </span>
            </div>
            {(cartPreview?.totalDiscountAmount ?? 0) > 0 && (
              <div className="flex justify-between items-center">
                <span>{t("discount")}</span>
                <span className="font-medium text-green-600 tabular-nums">
                  {isCalculatingPreview ? (
                    <Loader2 className="w-4 h-4 animate-spin text-neutral-400 inline" />
                  ) : (
                    `-${cartPreview!.totalDiscountAmount.toLocaleString("vi-VN")}₫`
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="flex justify-between items-end border-t border-neutral-200 pt-5 mb-8">
            <span className="text-base font-medium text-neutral-800">
              {t("estimatedTotal")}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-neutral-900 tracking-tight tabular-nums">
                {isCalculatingPreview ? (
                  <Loader2 className="w-8 h-8 animate-spin text-neutral-400 inline" />
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
            disabled={
              submitting || isCalculatingPreview || cartPreview === null || reputation?.gate?.isLocked
            }
            className={`w-full py-4 rounded-xl font-semibold transition-all text-base shadow-md flex items-center justify-center gap-2 active:scale-[0.98] ${
              reputation?.gate?.isLocked 
                ? "bg-neutral-400 text-neutral-100 cursor-not-allowed opacity-80" 
                : "bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed"
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t("processing")}
              </>
            ) : reputation?.gate?.isLocked ? (
              t("checkoutLockedBtn") || "Khóa đặt hàng"
            ) : paymentMethod === 1 ? (
              t("payWithWallet")
            ) : paymentMethod === 2 ? (
              t("payWithVNPay")
            ) : (
              t("payWithStripe")
            )}
          </button>
        </div>
      </div>

      {activePolicy && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 sm:p-6 transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden max-h-[85vh] animate-in zoom-in-95 duration-200 border border-neutral-100">
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 bg-white">
              <h2 className="text-lg font-semibold text-neutral-900">
                {activePolicy === "terms" && t("policies.terms.title")}
                {activePolicy === "privacy" && t("policies.privacy.title")}
                {activePolicy === "returns" && t("policies.returns.title")}
              </h2>
              <button
                type="button"
                onClick={() => setActivePolicy(null)}
                className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-8 py-6 overflow-y-auto flex-1 text-sm text-neutral-600 space-y-4 leading-relaxed">
              {activePolicy === "terms" && (
                <>
                  <p>{t("policies.terms.line1")}</p>
                  <p>{t("policies.terms.line2")}</p>
                  <p>{t("policies.terms.line3")}</p>
                </>
              )}
              {activePolicy === "privacy" && (
                <>
                  <p>{t("policies.privacy.line1")}</p>
                  <p>{t("policies.privacy.line2")}</p>
                  <p>{t("policies.privacy.line3")}</p>
                </>
              )}
              {activePolicy === "returns" && (
                <>
                  <p>{t("policies.returns.line1")}</p>
                  <p>{t("policies.returns.line2")}</p>
                  <p>{t("policies.returns.line3")}</p>
                </>
              )}
            </div>

            <div className="p-6 border-t border-neutral-100 bg-neutral-50 mt-auto">
              <button
                type="button"
                onClick={() => setActivePolicy(null)}
                className="w-full bg-neutral-900 text-white py-3 rounded-lg font-medium shadow-sm hover:bg-neutral-800 transition-colors focus:outline-none active:scale-[0.99]"
              >
                {t("policyModalClose")}
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
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
