"use client";

import { FC, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { removeFromCart, updateQuantity } from "@/src/store/slices/cartSlice";

// Constants
const ROUTES = {
  SHOP: "/shop/all-products",
  PRODUCT: (slug: string) => `/shop/product/${slug}`,
} as const;

const STYLES = {
  PRIMARY_COLOR: "#ce2a32",
  PAYPAL_BLUE: "#003087",
  PAYPAL_LIGHT_BLUE: "#009cde",
  PAYPAL_YELLOW: "#ffc439",
} as const;

// Extracted Components
const EmptyCart: FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
    <ShoppingBag className="w-16 h-16 text-gray-200 mb-6" />
    <h1 className="text-3xl font-oswald font-bold text-black mb-4 uppercase">
      Your Cart is Empty
    </h1>
    <p className="text-gray-500 mb-8 max-w-md">
      Looks like you haven't added anything yet. Browse our collection to find
      your perfect keyboard setup.
    </p>
    <Link
      href={ROUTES.SHOP}
      className="bg-black text-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-[#ce2a32] transition-colors duration-200"
    >
      Continue Shopping
    </Link>
  </div>
);

interface CartItemProps {
  item: {
    id: string;
    name: string;
    slug: string;
    image: string;
    price: number;
    quantity: number;
    variant?: string;
  };
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

const CartItem: FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {
  const itemTotal = useMemo(
    () => item.price * item.quantity,
    [item.price, item.quantity]
  );

  const handleIncrement = useCallback(
    () => onUpdateQuantity(item.id, item.quantity + 1),
    [item.id, item.quantity, onUpdateQuantity]
  );

  const handleDecrement = useCallback(
    () => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1)),
    [item.id, item.quantity, onUpdateQuantity]
  );

  const handleRemove = useCallback(
    () => onRemove(item.id),
    [item.id, onRemove]
  );

  return (
    <div className="group py-6 border-b border-gray-100 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
      {/* Product Info */}
      <div className="md:col-span-6 flex gap-4">
        <Link
          href={ROUTES.PRODUCT(item.slug)}
          className="relative w-24 h-24 bg-gray-50 shrink-0 border border-gray-100 rounded-sm overflow-hidden hover:border-gray-300 transition-colors"
          aria-label={`View ${item.name}`}
        >
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="96px"
            className="object-contain p-2"
          />
        </Link>
        <div className="flex flex-col justify-center min-w-0">
          <Link
            href={ROUTES.PRODUCT(item.slug)}
            className="font-bold text-black text-lg hover:text-[#ce2a32] transition-colors leading-tight mb-1 truncate"
          >
            {item.name}
          </Link>
          {item.variant && (
            <p className="text-sm text-gray-500 truncate">{item.variant}</p>
          )}
          <p className="md:hidden text-sm font-medium text-gray-700 mt-1">
            ${item.price.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="md:col-span-3 flex items-center justify-between md:justify-center">
        <div className="flex items-center border border-gray-300 rounded-sm h-10 w-32 overflow-hidden">
          <button
            onClick={handleDecrement}
            disabled={item.quantity <= 1}
            className="w-10 h-full flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Decrease quantity"
          >
            <Minus className="w-3 h-3 text-gray-600" />
          </button>
          <span className="flex-1 flex items-center justify-center text-sm font-bold">
            {item.quantity}
          </span>
          <button
            onClick={handleIncrement}
            className="w-10 h-full flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="w-3 h-3 text-gray-600" />
          </button>
        </div>

        {/* Mobile Remove Button */}
        <button
          onClick={handleRemove}
          className="md:hidden p-2 text-gray-400 hover:text-red-600 transition-colors"
          aria-label={`Remove ${item.name}`}
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Total Price */}
      <div className="md:col-span-3 flex items-center justify-end gap-4">
        <span className="font-bold text-lg hidden md:block">
          ${itemTotal.toFixed(2)}
        </span>

        {/* Desktop Remove Button */}
        <button
          onClick={handleRemove}
          className="hidden md:block p-2 text-gray-300 hover:text-[#ce2a32] transition-colors"
          aria-label={`Remove ${item.name}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

interface OrderSummaryProps {
  totalAmount: number;
  orderNote: string;
  onNoteChange: (note: string) => void;
  onCheckout: () => void;
  onPayPalCheckout: () => void;
}

const OrderSummary: FC<OrderSummaryProps> = ({
  totalAmount,
  orderNote,
  onNoteChange,
  onCheckout,
  onPayPalCheckout,
}) => (
  <div className="w-full lg:w-[350px] shrink-0">
    <div className="bg-gray-50 p-6 md:p-8 rounded-sm sticky top-28">
      <h3 className="font-oswald font-bold text-lg uppercase mb-4 border-b border-gray-200 pb-2">
        Order Summary
      </h3>

      {/* Subtotal */}
      <div className="flex justify-between items-end mb-2">
        <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">
          Subtotal
        </span>
        <span className="text-xl font-black text-black">
          ${totalAmount.toFixed(2)} USD
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-6 text-right">
        Taxes and shipping calculated at checkout
      </p>

      {/* Order Note */}
      <div className="mb-6">
        <label
          htmlFor="order-note"
          className="text-xs font-bold text-gray-500 uppercase block mb-2"
        >
          Add order note
        </label>
        <textarea
          id="order-note"
          rows={3}
          value={orderNote}
          onChange={(e) => onNoteChange(e.target.value)}
          className="w-full text-sm p-3 border border-gray-200 bg-white rounded-sm focus:outline-none focus:border-black transition-colors resize-none"
          placeholder="Special instructions for seller..."
          maxLength={500}
        />
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={onCheckout}
          className="w-full bg-black text-white h-12 text-sm font-bold uppercase tracking-widest hover:bg-[#ce2a32] transition-colors duration-200 rounded-sm"
        >
          Check out
        </button>

        <button
          onClick={onPayPalCheckout}
          className="w-full bg-[#ffc439] text-black h-12 flex items-center justify-center hover:bg-[#f4bb34] transition-colors duration-200 rounded-sm"
          aria-label="Checkout with PayPal"
        >
          <span className="italic font-bold text-[#003087] text-lg mr-1">
            Pay
          </span>
          <span className="italic font-bold text-[#009cde] text-lg">Pal</span>
        </button>
      </div>
    </div>
  </div>
);

// Main Component
export default function CartPage() {
  const dispatch = useAppDispatch();
  const { items, totalAmount } = useAppSelector((state) => state.cart);
  const [orderNote, setOrderNote] = useState("");

  // Memoized handlers
  const handleUpdateQuantity = useCallback(
    (id: string, quantity: number) => {
      dispatch(updateQuantity({ id, quantity }));
    },
    [dispatch]
  );

  const handleRemoveItem = useCallback(
    (id: string) => {
      dispatch(removeFromCart(id));
    },
    [dispatch]
  );

  const handleCheckout = useCallback(() => {
    // Implement checkout logic
    console.log("Proceeding to checkout", { items, totalAmount, orderNote });
  }, [items, totalAmount, orderNote]);

  const handlePayPalCheckout = useCallback(() => {
    // Implement PayPal checkout logic
    console.log("Proceeding to PayPal checkout", {
      items,
      totalAmount,
      orderNote,
    });
  }, [items, totalAmount, orderNote]);

  // Empty cart state
  if (items.length === 0) {
    return <EmptyCart />;
  }

  // Main cart content
  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-12 lg:py-20">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 md:mb-12  pb-4">
        <h1 className="text-3xl md:text-4xl font-oswald font-bold uppercase tracking-wide">
          Your Cart
        </h1>
        <Link
          href={ROUTES.SHOP}
          className="hidden md:flex items-center gap-2 text-sm text-gray-500 hover:text-[#ce2a32] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </Link>
      </header>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Product List */}
        <div className="flex-1">
          {/* Table Header (Desktop) */}
          <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-gray-200 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <div className="col-span-6">Product</div>
            <div className="col-span-3 text-center">Quantity</div>
            <div className="col-span-3 text-right">Total</div>
          </div>

          {/* Cart Items */}
          <div className="flex flex-col">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <OrderSummary
          totalAmount={totalAmount}
          orderNote={orderNote}
          onNoteChange={setOrderNote}
          onCheckout={handleCheckout}
          onPayPalCheckout={handlePayPalCheckout}
        />
      </div>
    </div>
  );
}
