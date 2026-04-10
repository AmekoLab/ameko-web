"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, Rocket, Pencil,Settings, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { assemblyService } from "@/src/services/assembly.service";
import { AssemblyLog } from "@/src/types/assembly.types";
import UpdateLogModal from "./UpdateLogModal";
import AddAdhocStepModal from "./AddAdhocStepModal";
import DeleteLogModal from "./DeleteLogModal";

interface Props {
  orderItemId: string;
  role: "shop" | "user";
  isCancelled?: boolean;
  onReadyChange?: (itemId: string, isReady: boolean) => void;
}

export default function AssemblyTimeline({ orderItemId, role, isCancelled, onReadyChange }: Props) {
  const [logs, setLogs] = useState<AssemblyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AssemblyLog | null>(null);

  const [isAdhocModalOpen, setIsAdhocModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<AssemblyLog | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await assemblyService.getTrackingLogs(orderItemId);
      if (res.success && res.data) {
        const sorted = [...res.data].sort((a, b) => a.stepOrder - b.stepOrder);
        setLogs(sorted);
      }
    } catch {
      toast.error("Failed to load assembly timeline");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderItemId]);

  useEffect(() => {
    if (onReadyChange) {
      if (isCancelled) {
        onReadyChange(orderItemId, false);
        return;
      }
      const isFullyCompleted = logs.length > 0 && logs.every(log => log.status === 2);
      onReadyChange(orderItemId, isFullyCompleted);
    }
  }, [logs, isCancelled, onReadyChange, orderItemId]);

  const handleInitialize = async () => {
    setInitializing(true);
    try {
      const res = await assemblyService.initializeTracking(orderItemId);
      if (res.success) {
        toast.success("Tracking timeline initialized successfully");
        fetchLogs();
      } else {
        toast.error(res.message || "Failed to initialize tracking");
      }
    } catch {
      toast.error("Failed to initialize tracking");
    } finally {
      setInitializing(false);
    }
  };

  const handleEditClick = (log: AssemblyLog) => {
    setSelectedLog(log);
    setIsUpdateModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-amazon-textMuted py-4 ml-3">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-[10px] font-medium">
          Loading Timeline...
        </span>
      </div>
    );
  }

  if (logs.length === 0) {
    if (!isCancelled && role === "shop") {
      return (
        <div className="py-2 ml-3">
          <button
            onClick={handleInitialize}
            disabled={initializing}
            className="bg-amazon-btnPrimary text-amazon-text font-medium text-[10px] px-4 py-2 rounded-sm flex items-center gap-2 hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {initializing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amazon-text" />
            ) : (
              <Rocket className="w-3.5 h-3.5" />
            )}
            Initialize Assembly
          </button>
        </div>
      );
    }
    return (
      <div className="py-2 ml-3">
        <div className="text-[10px] font-medium text-amazon-textMuted">
          No assembly tracking yet.
        </div>
        {isCancelled && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 text-red-600 text-[11px] font-medium rounded-sm text-center">Assembly stopped. Order cancelled.</div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h4 className="text-[10px] font-medium text-amazon-text mb-4 pl-3">
        Assembly Timeline
      </h4>
      <div className="border-l border-amazon-border ml-3 pl-4 space-y-4">
        {logs.map((log) => {
          let dotColor = "bg-neutral-300";
          if (log.status === 1) dotColor = "bg-blue-500";
          if (log.status === 2) dotColor = "bg-green-500";
          if (log.status === 3) dotColor = "bg-red-500";

          return (
            <div key={log.progressLogId} className="relative">
              {/* Dot Indicator */}
              <div
                className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ${dotColor} border border-white`}
              />
              
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 w-full">
                    <p className="text-[11px] font-medium text-amazon-text flex-1">
                      {log.stepName}
                    </p>
                    {role === "shop" && !isCancelled && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleEditClick(log)}
                          className="p-1 text-amazon-textMuted hover:text-amazon-btnPrimary transition-colors rounded-sm"
                          title="Update Status"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLogToDelete(log);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1 text-amazon-textMuted hover:text-red-500 transition-colors rounded-sm"
                          title="Delete Step"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Note */}
                  {log.note && (
                    <div className="mt-1 bg-neutral-50 p-2 rounded-sm border border-amazon-border">
                      <p className="text-[10px] text-amazon-textMuted italic">
                        "{log.note}"
                      </p>
                    </div>
                  )}

                  {/* Completed time */}
                  {log.completedAt && (
                    <p className="mt-1 text-[9px] font-medium text-amazon-textMuted">
                      {new Date(log.completedAt).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Media Image */}
                {log.mediaUrl && (
                  <div className="relative w-16 h-16 rounded-sm overflow-hidden border border-amazon-border flex-shrink-0">
                    <Image
                      src={log.mediaUrl}
                      alt={log.stepName}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Ad-hoc Button */}
        {role === "shop" && !isCancelled && (
          <div className="pt-4 pb-2">
            <button
              onClick={() => setIsAdhocModalOpen(true)}
              className="mt-4 text-[11px] text-amazon-text border border-amazon-border border-dashed rounded-sm px-4 py-2 hover:border-amazon-btnPrimary hover:bg-yellow-50 transition-colors font-medium"
            >
              + Add Ad-hoc Step
            </button>
          </div>
        )}

        {/* Banner if cancelled */}
        {isCancelled && logs.length > 0 && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 text-red-600 text-[11px] font-medium rounded-sm text-center">
            Assembly stopped. Order cancelled.
          </div>
        )}
      </div>

      <UpdateLogModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onSuccess={fetchLogs}
        logToUpdate={selectedLog}
      />

      <AddAdhocStepModal
        isOpen={isAdhocModalOpen}
        onClose={() => setIsAdhocModalOpen(false)}
        onSuccess={fetchLogs}
        orderItemId={orderItemId}
        nextOrder={logs.length > 0 ? Math.max(...logs.map((l) => l.stepOrder)) + 1 : 1}
      />

      <DeleteLogModal
        isOpen={isDeleteModalOpen}
        log={logToDelete}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={fetchLogs}
      />
    </div>
  );
}
