"use client";

import { useState, FormEvent } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import {
  Mail,
  Phone,
  MessageSquare,
  Briefcase,
  Shield,
  Clock,
  Send,
  Package,
  RefreshCw,
  Store,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  const t = useTranslations("FooterPages.Contact");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    };

    // Simulate API call
    console.log("Contact form submitted:", data);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success(t("formSuccess"));
    setSubmitting(false);
    (e.target as HTMLFormElement).reset();
  };

  const channels = [
    { icon: Mail, label: t("emailLabel"), value: t("emailValue"), href: `mailto:${t("emailValue")}` },
    { icon: Phone, label: t("hotlineLabel"), value: t("hotlineValue") },
    { icon: MessageSquare, label: t("liveChatLabel"), value: t("liveChatValue") },
    { icon: Briefcase, label: t("businessLabel"), value: t("businessValue"), href: `mailto:${t("businessValue")}` },
    { icon: Shield, label: t("securityLabel"), value: t("securityValue"), href: `mailto:${t("securityValue")}` },
  ];

  const quickLinks = [
    { icon: Package, label: t("quickLink1"), href: "/orders" },
    { icon: RefreshCw, label: t("quickLink2"), href: "/warranty" },
    { icon: Store, label: t("quickLink3"), href: "/register-seller" },
    { icon: HelpCircle, label: t("quickLink4"), href: "#" },
  ];

  const processSteps = [
    t("processStep1"),
    t("processStep2"),
    t("processStep3"),
    t("processStep4"),
  ];

  const subjects = [
    { value: "orders", label: t("subjectOrders") },
    { value: "warranty", label: t("subjectWarranty") },
    { value: "payment", label: t("subjectPayment") },
    { value: "account", label: t("subjectAccount") },
    { value: "partnership", label: t("subjectPartnership") },
  ];

  return (
    <div className="bg-amazon-bgSecondary min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Hero Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-amazon-text mb-3">
            {t("title")}
          </h1>
          <p className="text-amazon-textMuted max-w-2xl mx-auto leading-relaxed">
            {t("heroDesc")}
          </p>
          <span className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {t("badge")}
          </span>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ── LEFT COLUMN: Info ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Support Channels */}
            <div className="bg-white rounded-lg shadow-sm border border-amazon-border p-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-amazon-text mb-5 flex items-center gap-2">
                <Mail className="w-4 h-4 text-amazon-link" />
                {t("channelsTitle")}
              </h2>
              <div className="space-y-4">
                {channels.map((ch) => (
                  <div key={ch.label} className="flex items-start gap-3 group">
                    <div className="w-8 h-8 shrink-0 rounded-md bg-neutral-100 border border-amazon-border flex items-center justify-center group-hover:border-amazon-link transition-colors">
                      <ch.icon className="w-3.5 h-3.5 text-amazon-textMuted group-hover:text-amazon-link transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-amazon-textMuted">
                        {ch.label}
                      </p>
                      {ch.href ? (
                        <a
                          href={ch.href}
                          className="text-sm text-amazon-link hover:underline font-medium break-all"
                        >
                          {ch.value}
                        </a>
                      ) : (
                        <p className="text-sm text-amazon-text font-medium">
                          {ch.value}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Working Hours */}
            <div className="bg-white rounded-lg shadow-sm border border-amazon-border p-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-amazon-text mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amazon-link" />
                {t("hoursTitle")}
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-dashed border-amazon-border">
                  <span className="text-neutral-600">{t("hoursWeekday").split(":")[0]}:</span>
                  <span className="font-bold text-amazon-text">
                    {t("hoursWeekday").split(": ").slice(1).join(": ")}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-dashed border-amazon-border">
                  <span className="text-neutral-600">{t("hoursWeekend").split(":")[0]}:</span>
                  <span className="font-bold text-amazon-text">
                    {t("hoursWeekend").split(": ").slice(1).join(": ")}
                  </span>
                </div>
                <p className="text-xs text-amazon-textMuted pt-2 italic">
                  {t("hoursResponse")}
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow-sm border border-amazon-border p-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-amazon-text mb-4">
                {t("quickLinksTitle")}
              </h2>
              <div className="space-y-1">
                {quickLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="flex items-center gap-2.5 px-3 py-2.5 -mx-3 rounded-md text-sm text-amazon-text hover:bg-neutral-50 hover:text-amazon-link transition-colors group"
                  >
                    <link.icon className="w-4 h-4 text-amazon-textMuted group-hover:text-amazon-link transition-colors" />
                    <span className="flex-1 font-medium">{link.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-amazon-link transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Process Steps */}
            <div className="bg-white rounded-lg shadow-sm border border-amazon-border p-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-amazon-text mb-5">
                {t("processTitle")}
              </h2>
              <div className="space-y-4">
                {processSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-amazon-btnSecondary text-amazon-text flex items-center justify-center text-xs font-black">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-neutral-700 pt-0.5">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Contact Form ── */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-amazon-border p-6 md:p-8 sticky top-24">
              <h2 className="text-lg font-black text-amazon-text mb-6 flex items-center gap-2">
                <Send className="w-4.5 h-4.5 text-amazon-link" />
                {t("formTitle")}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-bold uppercase tracking-wider text-amazon-textMuted mb-1.5"
                  >
                    {t("formName")}
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    placeholder={t("formNamePlaceholder")}
                    className="w-full px-4 py-2.5 text-sm border border-amazon-border rounded-md bg-white text-amazon-text placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amazon-btnSecondary focus:border-transparent transition-shadow"
                  />
                </div>

                {/* Email + Phone row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-bold uppercase tracking-wider text-amazon-textMuted mb-1.5"
                    >
                      {t("formEmail")}
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      placeholder={t("formEmailPlaceholder")}
                      className="w-full px-4 py-2.5 text-sm border border-amazon-border rounded-md bg-white text-amazon-text placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amazon-btnSecondary focus:border-transparent transition-shadow"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-phone"
                      className="block text-xs font-bold uppercase tracking-wider text-amazon-textMuted mb-1.5"
                    >
                      {t("formPhone")}
                    </label>
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      placeholder={t("formPhonePlaceholder")}
                      className="w-full px-4 py-2.5 text-sm border border-amazon-border rounded-md bg-white text-amazon-text placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amazon-btnSecondary focus:border-transparent transition-shadow"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label
                    htmlFor="contact-subject"
                    className="block text-xs font-bold uppercase tracking-wider text-amazon-textMuted mb-1.5"
                  >
                    {t("formSubject")}
                  </label>
                  <select
                    id="contact-subject"
                    name="subject"
                    required
                    defaultValue=""
                    className="w-full px-4 py-2.5 text-sm border border-amazon-border rounded-md bg-white text-amazon-text focus:outline-none focus:ring-2 focus:ring-amazon-btnSecondary focus:border-transparent transition-shadow"
                  >
                    <option value="" disabled>
                      {t("formSubjectPlaceholder")}
                    </option>
                    {subjects.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-bold uppercase tracking-wider text-amazon-textMuted mb-1.5"
                  >
                    {t("formMessage")}
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={5}
                    placeholder={t("formMessagePlaceholder")}
                    className="w-full px-4 py-2.5 text-sm border border-amazon-border rounded-md bg-white text-amazon-text placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amazon-btnSecondary focus:border-transparent transition-shadow resize-none"
                  />
                </div>

                {/* Note */}
                <p className="text-[11px] text-amazon-textMuted italic">
                  {t("formNote")}
                </p>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-6 bg-amazon-btnPrimary text-amazon-text font-black uppercase tracking-widest text-sm rounded-md border border-amazon-border shadow-sm hover:brightness-95 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? t("formSubmitting") : t("formSubmit")}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
