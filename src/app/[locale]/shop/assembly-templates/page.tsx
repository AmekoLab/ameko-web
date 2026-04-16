"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { assemblyService } from "@/src/services/assembly.service";
import { AssemblyTemplate } from "@/src/types/assembly.types";
import AssemblyTemplateFormModal from "./AssemblyTemplateFormModal";
import DeleteTemplateModal from "./DeleteTemplateModal";

export default function AssemblyTemplatesPage() {
  const t = useTranslations("ShopAssemblyTemplatesPage");
  const [templates, setTemplates] = useState<AssemblyTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<AssemblyTemplate | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingTemplate, setDeletingTemplate] =
    useState<AssemblyTemplate | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await assemblyService.getShopTemplates();
      if (res.success && res.data) {
        const sorted = [...res.data].sort((a, b) => a.stepOrder - b.stepOrder);
        setTemplates(sorted);
      }
    } catch {
      toast.error(t("toast.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchTemplates();
  }, [fetchTemplates]);

  return (
    <div className="max-w-[1440px] w-full mx-auto">
      <div className="py-2 px-2 md:px-6 relative bg-amazon-bgSecondary min-h-screen">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-amazon-text flex items-center gap-3">
              {t("header.title")}
            </h1>
          </div>

          {/* Create Button */}
          <button
            onClick={() => {
              setEditingTemplate(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 bg-amazon-btnPrimary text-amazon-text font-medium text-sm px-4 py-2.5 rounded-md hover:brightness-95 transition-all duration-150 shadow-sm"
          >
            <Plus size={16} />
            {t("actions.createTemplate")}
          </button>
        </div>

        {/* ── Table ── */}
        <div className="bg-white border border-amazon-border rounded-md shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-amazon-link" />
            </div>
          ) : templates.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-amazon-textMuted text-sm font-medium">
                {t("empty.noTemplates")}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-amazon-border bg-neutral-50">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-amazon-textMuted">
                    {t("table.order")}
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-amazon-textMuted">
                    {t("table.stepName")}
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-amazon-textMuted">
                    {t("table.required")}
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-amazon-textMuted">
                    {t("table.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {templates.map((template) => (
                  <tr
                    key={template.templateId}
                    className="bg-white border-b border-amazon-border last:border-0 hover:bg-neutral-50 transition-colors duration-100"
                  >
                    {/* Order */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-neutral-100 text-amazon-text text-sm font-medium border border-amazon-border">
                        {template.stepOrder}
                      </span>
                    </td>

                    {/* Step Name */}
                    <td className="px-6 py-4">
                      <span className="text-amazon-text font-medium text-sm">
                        {template.stepName}
                      </span>
                    </td>

                    {/* Required Badge */}
                    <td className="px-6 py-4">
                      {template.isRequired ? (
                        <span className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 px-2.5 py-1 rounded-md text-xs font-semibold">
                          <CheckCircle size={14} />
                          {t("badges.required")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 text-gray-600 px-2.5 py-1 rounded-md text-xs font-semibold">
                          <XCircle size={14} />
                          {t("badges.optional")}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingTemplate(template);
                            setIsFormOpen(true);
                          }}
                          className="p-2 rounded-md text-amazon-textMuted hover:text-amazon-text hover:bg-neutral-100 transition-all duration-150"
                          title={t("tooltips.edit")}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingTemplate(template);
                            setIsDeleteOpen(true);
                          }}
                          className="p-2 rounded-md text-amazon-textMuted hover:text-red-600 hover:bg-red-50 transition-all duration-150"
                          title={t("tooltips.delete")}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AssemblyTemplateFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchTemplates}
        templateToEdit={editingTemplate}
        nextOrder={templates.length + 1}
      />

      <DeleteTemplateModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onSuccess={fetchTemplates}
        template={deletingTemplate}
      />
    </div>
  );
}
