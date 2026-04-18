import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import Image from "next/image";
import { CheckCircle2, Copy, Package, UploadCloud } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { PartItem } from "@/src/types/part.types";

export interface PartNodeData extends Record<string, unknown> {
  part: PartItem;
  stepName: string;
  isFirst: boolean;
  isLast: boolean;
  stepOrder?: number;
  customLayerFile?: File | null;
  existingLayerUrl?: string | null;
}

export default function CustomPartNode({
  id,
  data,
}: {
  id: string;
  data: PartNodeData;
}) {
  const { part, stepName, isFirst, isLast } = data;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { updateNodeData, getNodes, setNodes } = useReactFlow();
  const [isHovered, setIsHovered] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (data.customLayerFile) {
      const url = URL.createObjectURL(data.customLayerFile);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (data.existingLayerUrl) {
      setPreviewUrl(data.existingLayerUrl); // Use Cloudinary URL if available
    } else {
      setPreviewUrl(null);
    }
  }, [data.customLayerFile, data.existingLayerUrl]);

  const handleChooseFile = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    updateNodeData(id, { customLayerFile: file });
    event.target.value = "";
  };

  const handleDuplicate = () => {
    const nodes = getNodes();
    const currentNode = nodes.find((n) => n.id === id);

    if (!currentNode) {
      return;
    }

    const newNode = {
      ...currentNode,
      id: uuidv4(),
      position: {
        x: currentNode.position.x,
        y: currentNode.position.y + 110,
      },
      selected: false,
      data: {
        ...currentNode.data,
        customLayerFile: null,
      },
    };

    setNodes((nds) => nds.concat(newNode));
  };

  const hasUploadedImage = Boolean(
    data.customLayerFile || data.existingLayerUrl,
  );

  return (
    <div
      className="group relative w-[240px] overflow-hidden rounded-md border border-neutral-200 bg-white shadow-sm transition-colors hover:border-blue-500"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isFirst && (
        <Handle
          type="target"
          position={Position.Left}
          className="h-3 w-3 rounded-full border-2 border-white bg-blue-500"
        />
      )}

      <div className="flex items-center gap-3 p-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-sm border border-neutral-200 bg-neutral-50">
          {part.thumbnailUrl ? (
            <Image
              src={part.thumbnailUrl}
              alt={part.name}
              width={40}
              height={40}
              className="h-full w-full object-cover"
              unoptimized
            />
          ) : (
            <Package className="h-5 w-5 text-neutral-300" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            {stepName}
          </p>
          <p
            className="truncate text-xs font-bold text-neutral-900"
            title={part.name}
          >
            {part.name}
          </p>
        </div>
      </div>

      <div className="flex gap-2 border-t border-neutral-100 px-3 py-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={handleChooseFile}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-[11px] font-medium transition-colors hover:bg-neutral-50"
        >
          {hasUploadedImage ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <UploadCloud className="h-3.5 w-3.5 text-neutral-500" />
          )}
          <span
            className={
              hasUploadedImage ? "text-emerald-700" : "text-neutral-600"
            }
          >
            {hasUploadedImage ? "Đã up ảnh" : "Upload Ảnh"}
          </span>
        </button>

        <button
          type="button"
          onClick={handleDuplicate}
          title="Nhân bản nhánh này"
          className="flex flex-shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-neutral-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      </div>

      {!isLast && (
        <Handle
          type="source"
          position={Position.Right}
          className="h-3 w-3 rounded-full border-2 border-white bg-emerald-500"
        />
      )}

      {isHovered && previewUrl && (
        <div className="absolute left-[105%] top-0 z-[100] w-56 animate-in zoom-in fade-in rounded-xl border border-neutral-200 bg-white p-2 shadow-2xl duration-200">
          <div className="mb-1.5 flex items-center justify-between px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Ảnh Preview
            </span>
          </div>
          <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-neutral-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Preview"
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
