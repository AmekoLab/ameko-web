"use client";

import { FC, useState } from "react";
import { X, CreditCard, Wallet, Smartphone, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { orderService } from "@/src/services/order.service";

interface RepayModalProps {
  isOpen: boolean;
  orderGroupId: string | null;
  onClose: () => void;
}

export const RepayModal: FC<RepayModalProps> = ({ isOpen, orderGroupId, onClose }) => {
  const t = useTranslations("RepayModal");
  const [method, setMethod] = useState<number>(1);
  const [pin, setPin] = useState("");
  const [paying, setPaying] = useState(false);

  const PAYMENT_METHODS = [
    { id: 1, name: t("wallet"), icon: Wallet },
    { id: 2, name: t("vnpay"), icon: Smartphone },
    { id: 0, name: t("creditCard"), icon: CreditCard },
  ];

  if (!isOpen || !orderGroupId) return null;

  const handleRepaySubmit = async () => {
    if (method === 1 && (!pin || pin.length < 6)) {
      toast.warning(t("pinRequired"));
      return;
    }

    setPaying(true);
    try {
      const payload = {
        paymentMethod: method,
        walletPin: method === 1 ? pin : undefined,
        successUrl: window.location.href, 
        cancelUrl: window.location.href,
      };

      const res = await orderService.repayOrder(orderGroupId, payload);
      
      if (res.success) {
        if (method === 1) {
          toast.success(t("paymentSuccess"));
          window.location.reload(); 
        } else if (res.data?.paymentUrl) {
          window.location.href = res.data.paymentUrl;
        }
      } else {
        toast.error(res.message || t("paymentFailed"));
      }
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.message;

      if (status === 401 && msg?.includes("Incorrect Wallet PIN")) {
        toast.error(t("incorrectPin"));
      } else if (status === 400 && msg?.includes("set up a Wallet PIN")) {
        toast.error(t("pinNotSetup"));
      } else if (status === 400 && msg?.includes("no longer in Pending")) {
        toast.error(t("orderNotPending"));
        window.location.reload();
      } else {
        toast.error(msg || t("genericError"));
      }
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h3 className="text-lg font-bold text-neutral-900">{t("title")}</h3>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:bg-neutral-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid gap-3">
            {PAYMENT_METHODS.map((pm) => {
              const Icon = pm.icon;
              const isActive = method === pm.id;
              return (
                <button
                  key={pm.id}
                  onClick={() => setMethod(pm.id)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                    isActive ? "border-blue-600 bg-blue-50/30" : "border-neutral-100 bg-white hover:border-neutral-200"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isActive ? "bg-blue-100 text-blue-600" : "bg-neutral-50 text-neutral-500"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`font-semibold ${isActive ? "text-blue-700" : "text-neutral-700"}`}>
                    {pm.name}
                  </span>
                </button>
              );
            })}
          </div>

          {method === 1 && (
            <div className="mt-4">
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                {t("pinLabel")}
              </label>
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="••••••"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-600 text-center tracking-[0.5em] text-lg font-bold"
              />
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl font-medium text-neutral-600 hover:bg-neutral-200">
            {t("cancel")}
          </button>
          <button
            onClick={handleRepaySubmit}
            disabled={paying}
            className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 flex justify-center items-center gap-2"
          >
            {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : t("confirm")}
          </button>
        </div>
      </div>
    </div>
  );
};
