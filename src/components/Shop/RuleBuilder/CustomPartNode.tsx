import { Handle, Position } from "@xyflow/react";
import Image from "next/image";
import { Package } from "lucide-react";
import { PartItem } from "@/src/types/part.types";

export interface PartNodeData extends Record<string, unknown> {
  part: PartItem;
  stepName: string;
  isFirst: boolean;
  isLast: boolean;
  stepOrder?: number;
  customLayerFile?: File | null;
  existingLayerUrl?: string | null;
  tags?: string;
  nextRule?: string;
}

export default function CustomPartNode({
  data,
}: {
  id: string;
  data: PartNodeData;
}) {
  const { part, isFirst, isLast } = data;

  return (
    <div className="relative w-[210px] rounded-md border border-neutral-200 bg-white px-2 py-2 shadow-sm transition-colors hover:border-blue-500">
      {!isFirst && (
        <Handle
          type="target"
          position={Position.Left}
          className="!h-3 !w-3 rounded-full border-2 border-white bg-blue-500 shadow-sm"
        />
      )}

      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-sm border border-neutral-200 bg-neutral-50">
          {part.thumbnailUrl ? (
            <Image
              src={part.thumbnailUrl}
              alt={part.name}
              width={32}
              height={32}
              className="h-full w-full object-cover"
              unoptimized
            />
          ) : (
            <Package className="h-4 w-4 text-neutral-300" />
          )}
        </div>

        <p
          className="truncate text-xs font-semibold text-neutral-900"
          title={part.name}
        >
          {part.name}
        </p>
      </div>

      {!isLast && (
        <Handle
          type="source"
          position={Position.Right}
          className="!h-3 !w-3 rounded-full border-2 border-white bg-emerald-500 shadow-sm"
        />
      )}
    </div>
  );
}
