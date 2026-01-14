"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  ShoppingBag,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import { useAppSelector } from "@/src/store/hook";

export default function CheckoutPage() {
  const { items, totalAmount } = useAppSelector((state) => state.cart);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  // Giả lập user đã login (hoặc lấy từ Redux Auth)
  const userEmail = "trinhtiendat2208@gmail.com";

  if (items.length === 0) {
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

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans text-[#333]">
      {/* =========================================================
          LEFT COLUMN: INPUT FORM (Nền Trắng)
          Chiếm 58% chiều rộng trên màn hình lớn
      ========================================================= */}
      <div className="flex-1 lg:flex-[0_0_58%] lg:order-1 order-2 bg-white px-4 md:px-8 lg:px-14 py-8 lg:py-12 border-r border-gray-200">
        <div className="max-w-[600px] ml-auto mr-auto lg:mr-0">
          {/* Logo */}
          <Link href="/" className="block mb-6">
            <h1 className="text-2xl font-black font-oswald uppercase tracking-tight">
              AMEKO STORE
            </h1>
          </Link>

          {/* Breadcrumb (Optional - giống Shopify) */}
          <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
            <Link href="/cart" className="text-[#ce2a32] hover:underline">
              Cart
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="font-medium text-black">Information</span>
            <ChevronRight className="w-3 h-3" />
            <span>Shipping</span>
            <ChevronRight className="w-3 h-3" />
            <span>Payment</span>
          </nav>

          {/* Account Info */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-medium">Contact</h2>
              <Link
                href="/login"
                className="text-xs text-[#ce2a32] hover:underline"
              >
                Log out
              </Link>
            </div>
            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-md bg-gray-50/50">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs">
                T
              </div>
              <div className="flex-1 text-sm">
                <p className="text-gray-600">{userEmail}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input
                type="checkbox"
                id="news"
                className="rounded border-gray-300 text-[#ce2a32] focus:ring-[#ce2a32]"
              />
              <label
                htmlFor="news"
                className="text-sm text-gray-600 cursor-pointer"
              >
                Email me with news and offers
              </label>
            </div>
          </div>

          {/* Delivery Form */}
          <div className="mb-8">
            <h2 className="text-lg font-medium mb-4">Delivery</h2>

            <div className="space-y-3">
              {/* Country */}
              <div className="relative">
                <label className="absolute text-[10px] text-gray-500 top-1 left-3">
                  Country/Region
                </label>
                <select className="w-full h-[50px] pt-3 px-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#ce2a32] focus:border-transparent text-sm">
                  <option>Vietnam</option>
                  <option>United States</option>
                  <option>Singapore</option>
                </select>
              </div>

              {/* Name Row */}
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="First name"
                  className="w-full h-[50px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ce2a32] text-sm placeholder:text-gray-500"
                />
                <input
                  type="text"
                  placeholder="Last name"
                  className="w-full h-[50px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ce2a32] text-sm placeholder:text-gray-500"
                />
              </div>

              {/* Address */}
              <input
                type="text"
                placeholder="Address"
                className="w-full h-[50px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ce2a32] text-sm placeholder:text-gray-500"
              />

              {/* Apartment */}
              <input
                type="text"
                placeholder="Apartment, suite, etc. (optional)"
                className="w-full h-[50px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ce2a32] text-sm placeholder:text-gray-500"
              />

              {/* City & Postal Code Row */}
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="City"
                  className="w-full h-[50px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ce2a32] text-sm placeholder:text-gray-500"
                />
                <input
                  type="text"
                  placeholder="Postal code (optional)"
                  className="w-full h-[50px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ce2a32] text-sm placeholder:text-gray-500"
                />
              </div>

              {/* Phone with Tooltip */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Phone"
                  className="w-full h-[50px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ce2a32] text-sm placeholder:text-gray-500"
                />
                <div
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-help"
                  title="Phone number needed for shipping"
                >
                  <HelpCircle className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sms"
                  className="rounded border-gray-300 text-[#ce2a32] focus:ring-[#ce2a32]"
                />
                <label
                  htmlFor="sms"
                  className="text-sm text-gray-600 cursor-pointer"
                >
                  Text me with news and offers
                </label>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4 mt-10">
            <Link
              href="/cart"
              className="text-[#ce2a32] hover:text-[#a01e25] transition-colors text-sm flex items-center gap-1"
            >
              <ChevronRight className="w-4 h-4 rotate-180" /> Return to cart
            </Link>
            <button className="w-full md:w-auto bg-[#1a1a1a] hover:bg-black text-white px-8 py-4 rounded-md font-medium transition-colors text-sm">
              Continue to shipping
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================
          RIGHT COLUMN: ORDER SUMMARY (Nền Xám)
          Chiếm 42% chiều rộng trên màn hình lớn
      ========================================================= */}
      <div className="flex-1 lg:flex-[0_0_42%] lg:order-2 order-1 bg-[#fafafa] border-l border-gray-200 px-4 md:px-8 lg:px-10 py-8 lg:py-12">
        {/* Mobile Toggle (Giữ nguyên cho mobile) */}
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
            ${totalAmount.toFixed(2)}
          </span>
        </button>

        {/* Content */}
        <div
          className={`lg:block ${
            isSummaryOpen ? "block" : "hidden"
          } max-w-[400px]`}
        >
          {/* 1. Product List */}
          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 items-center">
                {/* Image with Badge */}
                <div className="relative w-16 h-16 border border-gray-200 rounded-lg bg-white shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain p-1 rounded-lg"
                  />
                  {/* Badge số lượng nằm góc trên phải */}
                  <span className="absolute -top-2 -right-2 bg-gray-600 text-white text-[11px] font-medium w-5 h-5 rounded-full flex items-center justify-center z-10 shadow-sm border border-white">
                    {item.quantity}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-gray-800 truncate">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">
                    {item.variant !== "Default" ? item.variant : ""}
                  </p>
                </div>

                {/* Price */}
                <p className="font-medium text-sm text-gray-800 tabular-nums">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          {/* 2. Discount Input */}
          <div className="flex gap-3 mb-6 border-b border-gray-200 pb-6">
            <input
              type="text"
              placeholder="Discount code or gift card"
              className="flex-1 h-[46px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ce2a32] text-sm placeholder:text-gray-500 shadow-sm"
            />
            <button className="h-[46px] px-5 bg-[#c8c8c8] text-white font-medium rounded-md text-sm cursor-not-allowed hover:bg-[#b0b0b0] transition-colors">
              Apply
            </button>
          </div>

          {/* 3. Cost Breakdown */}
          <div className="space-y-3 border-b border-gray-200 pb-6 mb-6 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-black">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1">
                Shipping <HelpCircle className="w-3 h-3 text-gray-400" />
              </span>
              <span className="text-xs text-gray-500">
                Enter shipping address
              </span>
            </div>
          </div>

          {/* 4. Total */}
          <div className="flex justify-between items-center">
            <span className="text-base font-medium text-gray-800">Total</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-gray-500 font-medium">USD</span>
              <span className="text-2xl font-bold text-black tracking-tight">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
