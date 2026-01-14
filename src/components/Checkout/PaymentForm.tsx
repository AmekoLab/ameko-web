"use client";

import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

export const PaymentForm = ({ totalAmount }: { totalAmount: number }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return; // Stripe chưa load xong

    setIsLoading(true);

    // Xác nhận thanh toán với Stripe
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Sau khi thanh toán xong, Stripe sẽ redirect user về trang này
        return_url: `${window.location.origin}/checkout/success`,
      },
    });

    // Nếu có lỗi (thẻ sai, hết tiền...)
    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message || "An unexpected error occurred.");
    } else {
      setMessage("An unexpected error occurred.");
    }

    setIsLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 border-t border-gray-200 pt-6"
    >
      <h3 className="text-lg font-medium mb-4">Payment</h3>

      {/* Đây là nơi Stripe tự vẽ giao diện nhập thẻ (An toàn tuyệt đối) */}
      <div className="border border-gray-300 rounded-md p-4 bg-white mb-4">
        <PaymentElement />
      </div>

      {/* Hiển thị lỗi nếu có */}
      {message && <div className="text-red-500 text-sm mb-4">{message}</div>}

      {/* Nút thanh toán */}
      <button
        disabled={isLoading || !stripe || !elements}
        className="w-full bg-[#1a1a1a] hover:bg-black text-white px-8 py-4 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Processing..." : `Pay Now $${totalAmount.toFixed(2)}`}
      </button>
    </form>
  );
};
