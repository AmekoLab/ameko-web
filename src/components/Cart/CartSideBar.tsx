"use client";

import { FC, useEffect, useRef, useCallback, memo, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Trash2, Plus, Minus, ShoppingBag, Navigation } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import {
  setCartOpen,
  removeFromCart,
  updateQuantity,
  CartItem,
} from "@/src/store/slices/cartSlice";
import { nav } from "framer-motion/client";

// Separate CartItem component for better performance
interface CartItemProps {
  item: CartItem;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}

const CartItemComponent: FC<CartItemProps> = memo(
  ({ item, onUpdateQuantity, onRemove, onClose }) => {
    return (
      <div className="flex gap-4">
        {/* Image */}
        <div className="relative w-20 h-20 shrink-0 border border-gray-100 rounded-sm bg-[#f9f9f9]">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-contain p-2"
          />
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-1">
            <Link
              href={`/shop/product/${item.slug}`}
              className="text-sm font-bold text-black hover:text-[#ce2a32] line-clamp-2 pr-4 leading-tight transition-colors"
              onClick={onClose}
            >
              {item.name}
            </Link>
            <span className="text-sm font-bold text-gray-900">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </div>

          {/* Variant Info */}
          {item.variant && (
            <div className="text-xs text-gray-500 mb-3 space-y-0.5">
              <p>{item.variant}</p>
            </div>
          )}

          {/* Controls: Quantity & Remove */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center border border-gray-300 rounded-sm h-8">
              <button
                onClick={() =>
                  onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))
                }
                className="w-8 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-8 flex items-center justify-center text-xs font-bold">
                {item.quantity}
              </span>
              <button
                onClick={() =>
                  onUpdateQuantity(item.id, Math.min(99, item.quantity + 1))
                }
                className="w-8 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <button
              onClick={() => onRemove(item.id)}
              className="text-gray-400 hover:text-[#ce2a32] transition-colors p-1"
              aria-label="Remove item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }
);

CartItemComponent.displayName = "CartItemComponent";

// Main CartSidebar component
export const CartSidebar: FC = memo(() => {
  const dispatch = useAppDispatch();
  const { isCartOpen, items, totalAmount } = useAppSelector(
    (state) => state.cart
  );
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Memoized callbacks
  const handleClose = useCallback(() => {
    dispatch(setCartOpen(false));
  }, [dispatch]);

  const handleUpdateQuantity = useCallback(
    (id: string, quantity: number) => {
      dispatch(updateQuantity({ id, quantity }));
    },
    [dispatch]
  );

  const handleRemove = useCallback(
    (id: string) => {
      dispatch(removeFromCart(id));
    },
    [dispatch]
  );

  // Lock body scroll WITHOUT layout shift
  useEffect(() => {
    if (isCartOpen) {
      // Tính scrollbar width
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      // Lock scroll và thêm padding để compensate scrollbar
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;

      // Nếu có header fixed/sticky, cũng cần thêm padding
      const header = document.querySelector("header");
      if (header) {
        header.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      // Restore
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";

      const header = document.querySelector("header");
      if (header) {
        header.style.paddingRight = "";
      }
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";

      const header = document.querySelector("header");
      if (header) {
        header.style.paddingRight = "";
      }
    };
  }, [isCartOpen]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    if (isCartOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCartOpen, handleClose]);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isCartOpen) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isCartOpen, handleClose]);

  return (
    <>
      {/* OVERLAY */}
      <div
        className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${
          isCartOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        aria-hidden={!isCartOpen}
      />

      {/* SIDEBAR CONTENT */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full w-full md:w-[420px] bg-white z-[70] shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-baseline gap-3">
            <h2
              id="cart-title"
              className="text-xl font-bold font-oswald uppercase tracking-wide"
            >
              Your Cart
            </h2>
            <Link
              href="/cart"
              onClick={handleClose}
              className="text-xs text-gray-500 underline hover:text-black transition-colors"
            >
              View cart
            </Link>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close cart"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* BODY (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
              <ShoppingBag className="w-12 h-12 opacity-20" />
              <p>Your cart is currently empty.</p>
              <Link
                href="/shop/all-products"
                onClick={handleClose}
                className="bg-black text-white px-6 py-2 text-sm font-bold uppercase hover:bg-gray-900 transition-colors inline-block text-center"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <CartItemComponent
                key={item.id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemove}
                onClose={handleClose}
              />
            ))
          )}
        </div>

        {/* FOOTER */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-6 space-y-4 bg-white">
            <div className="flex justify-between items-center text-sm">
              <button className="underline text-gray-500 hover:text-black transition-colors">
                Add order note
              </button>
              <p className="text-gray-400 text-xs">
                Shipping & taxes calculated at checkout
              </p>
            </div>

            <div className="space-y-3">
              {/* Checkout Button */}
              <button className="w-full bg-[#1a1a1a] hover:bg-black text-white py-3.5 px-4 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors">
                <ShoppingBag className="w-4 h-4" />
                Checkout • ${totalAmount.toFixed(2)} USD
              </button>

              {/* PayPal Button */}
              <button className="w-full bg-[#ffc439] hover:bg-[#f4bb34] text-black py-3.5 px-4 flex items-center justify-center text-sm font-bold uppercase tracking-widest transition-colors italic">
                <span className="font-sans not-italic font-bold text-[#003087]">
                  Pay
                </span>
                <span className="font-sans not-italic font-bold text-[#009cde]">
                  Pal
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
});

CartSidebar.displayName = "CartSidebar";
