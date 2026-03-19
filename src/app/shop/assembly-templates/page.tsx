"use client";

import { useState, useEffect } from "react";
import {
  ListOrdered,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { assemblyService } from "@/src/services/assembly.service";
import { AssemblyTemplate } from "@/src/types/assembly.types";
import AssemblyTemplateFormModal from "./AssemblyTemplateFormModal";
import DeleteTemplateModal from "./DeleteTemplateModal";

export default function AssemblyTemplatesPage() {
  const [templates, setTemplates] = useState<AssemblyTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AssemblyTemplate | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingTemplate, setDeletingTemplate] = useState<AssemblyTemplate | null>(null);

  const fetchTemplates = async () => {
    try {
      const res = await assemblyService.getShopTemplates();
      if (res.success && res.data) {
        const sorted = [...res.data].sort(
          (a, b) => a.stepOrder - b.stepOrder,
        );
        setTemplates(sorted);
      }
    } catch {
      toast.error("Failed to load assembly templates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return (
    <div className="bg-black min-h-[calc(100vh-64px)] p-4 md:p-8">
      <div className="max-w-[1440px] w-full mx-auto">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <ListOrdered  className="w-8 h-8 text-[#f5d800]" />
            <h1 className="text-3xl font-oswald font-black text-white mb-2 uppercase tracking-widest flex items-center gap-3">
              Assembly Templates
            </h1>
          </div>

          {/* Create Button */}
          <button
            onClick={() => {
              setEditingTemplate(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 bg-[#f5d800] text-black font-black uppercase tracking-widest text-[11px] px-4 py-2.5 hover:bg-yellow-300 transition-colors duration-150"
          >
            <Plus size={14} />
            Create Template
          </button>
        </div>

        {/* ── Table ── */}
        <div className="bg-[#151515] border border-[#1e2126] rounded-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2
                size={32}
                className="animate-spin text-[#f5d800]"
              />
            </div>
          ) : templates.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-gray-500 text-sm uppercase tracking-widest">
                No assembly templates found.
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1e2126]">
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Order
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Step Name
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Required
                  </th>
                  <th className="text-right px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {templates.map((template, idx) => (
                  <tr
                    key={template.templateId}
                    className={`border-b border-[#1e2126] last:border-0 hover:bg-[#1a1a1a] transition-colors duration-100 ${
                      idx % 2 === 0 ? "bg-transparent" : "bg-[#111111]"
                    }`}
                  >
                    {/* Order */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-sm bg-gray-800 text-gray-300 text-xs font-bold">
                        {template.stepOrder}
                      </span>
                    </td>

                    {/* Step Name */}
                    <td className="px-6 py-4">
                      <span className="text-white font-bold text-[12px] uppercase tracking-wider">
                        {template.stepName}
                      </span>
                    </td>

                    {/* Required Badge */}
                    <td className="px-6 py-4">
                      {template.isRequired ? (
                        <span className="inline-flex items-center gap-1.5 bg-green-900/40 border border-green-700/50 text-green-400 px-2.5 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest">
                          <CheckCircle size={10} />
                          Required
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-gray-800/60 border border-gray-700/50 text-gray-400 px-2.5 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest">
                          <XCircle size={10} />
                          Optional
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
                          className="p-2 rounded-sm text-gray-500 hover:text-white hover:bg-[#202030] transition-all duration-150"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingTemplate(template);
                            setIsDeleteOpen(true);
                          }}
                          className="p-2 rounded-sm text-gray-500 hover:text-red-400 hover:bg-red-950/30 transition-all duration-150"
                          title="Delete"
                        >
                          <Trash2 size={14} />
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
