"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, Rocket, Pencil } from "lucide-react";
import { toast } from "react-toastify";
import { assemblyService } from "@/src/services/assembly.service";
import { AssemblyLog } from "@/src/types/assembly.types";
import UpdateLogModal from "./UpdateLogModal";
import AddAdhocStepModal from "./AddAdhocStepModal";

interface Props {
  orderItemId: string;
  role: "shop" | "user";
}

export default function AssemblyTimeline({ orderItemId, role }: Props) {
  const [logs, setLogs] = useState<AssemblyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AssemblyLog | null>(null);

  const [isAdhocModalOpen, setIsAdhocModalOpen] = useState(false);

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
      toast.error("An error occurred");
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
      <div className="flex items-center gap-2 text-gray-400 py-4 ml-3">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-[10px] font-bold uppercase tracking-widest">
          Loading Timeline...
        </span>
      </div>
    );
  }

  if (logs.length === 0) {
    if (role === "shop") {
      return (
        <div className="py-2 ml-3">
          <button
            onClick={handleInitialize}
            disabled={initializing}
            className="bg-[#f5d800] text-black font-black uppercase tracking-widest text-[10px] px-4 py-2 rounded-sm flex items-center gap-2 hover:bg-[#ffe500] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {initializing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Rocket className="w-3.5 h-3.5" />
            )}
            Initialize Assembly
          </button>
        </div>
      );
    }
    return (
      <div className="py-2 ml-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
        No assembly tracking yet.
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h4 className="text-[10px] font-black uppercase tracking-widest text-[#f5d800] mb-4 pl-3">
        Assembly Timeline
      </h4>
      <div className="border-l border-gray-700 ml-3 pl-4 space-y-4">
        {logs.map((log) => {
          let dotColor = "bg-gray-600";
          if (log.status === 1) dotColor = "bg-blue-500";
          if (log.status === 2) dotColor = "bg-green-500";
          if (log.status === 3) dotColor = "bg-red-500";

          return (
            <div key={log.progressLogId} className="relative">
              {/* Dot Indicator */}
              <div
                className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ${dotColor} border border-black`}
              />
              
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-bold text-white uppercase tracking-wider">
                      {log.stepName}
                    </p>
                    {role === "shop" && (
                      <button
                        onClick={() => handleEditClick(log)}
                        className="p-1 text-gray-500 hover:text-white transition-colors"
                        title="Update Status"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Note */}
                  {log.note && (
                    <div className="mt-1 bg-[#1a1c20] p-2 rounded-sm border border-[#1e2126]">
                      <p className="text-[10px] text-gray-400 italic">
                        "{log.note}"
                      </p>
                    </div>
                  )}

                  {/* Completed time */}
                  {log.completedAt && (
                    <p className="mt-1 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                      {new Date(log.completedAt).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Media Image */}
                {log.mediaUrl && (
                  <div className="relative w-16 h-16 rounded-sm overflow-hidden border border-[#1e2126] flex-shrink-0">
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
        {role === "shop" && (
          <div className="pt-4 pb-2">
            <button
              onClick={() => setIsAdhocModalOpen(true)}
              className="mt-4 text-[11px] text-[#f5d800] border border-[#f5d800] border-dashed rounded-sm px-4 py-2 hover:bg-[#f5d800] hover:text-black transition-colors uppercase font-bold tracking-widest"
            >
              + Add Ad-hoc Step
            </button>
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
    </div>
  );
}
