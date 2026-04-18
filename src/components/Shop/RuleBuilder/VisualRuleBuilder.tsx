"use client";

import { useCallback, useEffect } from "react";
import {
  addEdge,
  Background,
  Connection,
  Controls,
  Edge,
  Node,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import { PartItem, PartSpecifications } from "@/src/types/part.types";
import CustomPartNode, { PartNodeData } from "./CustomPartNode";

const nodeTypes = {
  customPart: CustomPartNode,
};

const LANE_WIDTH = 350;
const ROW_HEIGHT = 90;

type WorkflowStep = PartSpecifications["workflow"][number];

interface RulePayload {
  BaseKitId: string;
  ComponentId: string;
  StepName: string;
  StepOrder: number;
  IsDefault: boolean;
  Tags: string | null;
  NextStepFilterRule: string | null;
  LayerImageFile?: File | Blob | string;
  ExistingLayerUrl?: string;
}

interface ExistingConfigOption {
  optionId?: string;
  partId?: string;
  PartId?: string;
  componentId?: string;
  ComponentId?: string;
  layerImageUrl?: string | null;
  tags?: string | null;
  Tags?: string | null;
  nextStepFilterRule?: string | null;
  NextStepFilterRule?: string | null;
}

interface ExistingConfigStep {
  stepName?: string;
  StepName?: string;
  options?: ExistingConfigOption[];
  Options?: ExistingConfigOption[];
}

interface ExistingConfigData {
  steps?: ExistingConfigStep[];
  Steps?: ExistingConfigStep[];
}

interface Props {
  baseKit: PartItem;
  allParts: PartItem[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  existingConfig?: any;
  onSave?: (payloads: RulePayload[]) => void;
}

function normalizeText(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function getStepTokens(step: WorkflowStep): string[] {
  const tokens = [step.step, step.title]
    .map((value) => normalizeText(value))
    .filter(Boolean);

  return [...new Set(tokens)];
}

function doesPartBelongToStep(part: PartItem, step: WorkflowStep): boolean {
  const partWithExtras = part as PartItem & {
    category?: { name?: string | null } | null;
    categoryId?: string | null;
  };

  const categoryName = normalizeText(
    partWithExtras.category?.name ?? part.categoryName,
  );
  const categoryId = normalizeText(partWithExtras.categoryId);
  const partName = normalizeText(part.name);
  const stepTokens = getStepTokens(step);

  return stepTokens.some((token) => {
    return (
      categoryName.includes(token) ||
      partName.includes(token) ||
      (!!categoryId && categoryId === token)
    );
  });
}

export default function VisualRuleBuilder({
  baseKit,
  allParts,
  existingConfig,
  onSave,
}: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<PartNodeData>>(
    [],
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const initBoard = useCallback(() => {
    const rawSpecifications = baseKit.specifications as unknown;

    if (!rawSpecifications) {
      setNodes([]);
      setEdges([]);
      return;
    }

    try {
      const specs =
        typeof rawSpecifications === "string"
          ? (JSON.parse(rawSpecifications) as Partial<PartSpecifications>)
          : (rawSpecifications as Partial<PartSpecifications>);
      const workflow = Array.isArray(specs.workflow) ? specs.workflow : [];

      const initialNodes: Node<PartNodeData>[] = [];
      const initialEdges: Edge[] = [];

      // Safely parse existing config
      const config = existingConfig as ExistingConfigData | null;
      const savedSteps = config?.steps || config?.Steps || [];
      const hasSavedData = savedSteps.some((s) => {
        const opts = s.options || s.Options;
        return Array.isArray(opts) && opts.length > 0;
      });

      if (hasSavedData) {
        // ==========================================
        // SCENARIO 1: LOAD EXISTING SAVED CONFIGURATION
        // ==========================================
        workflow.forEach((step, colIndex) => {
          const stepName =
            step.step?.trim() || step.title?.trim() || `Step ${colIndex + 1}`;
          const stepTokens = getStepTokens(step);

          const partsInStep = allParts.filter((part) =>
            doesPartBelongToStep(part, step),
          );

          const optionsInStep = savedSteps
            .filter((savedStep) => {
              const savedStepName = normalizeText(
                savedStep.stepName || savedStep.StepName,
              );

              if (!savedStepName) {
                return false;
              }

              return stepTokens.includes(savedStepName);
            })
            .flatMap((savedStep) => {
              const options = savedStep.options || savedStep.Options;
              return Array.isArray(options) ? options : [];
            });

          let verticalIndex = 0;

          partsInStep.forEach((part) => {
            const partOptions = optionsInStep.filter((option) => {
              const optionPartId =
                option.partId ||
                option.PartId ||
                option.componentId ||
                option.ComponentId ||
                "";

              return optionPartId === part.id;
            });

            if (partOptions.length > 0) {
              partOptions.forEach((option) => {
                initialNodes.push({
                  id: option.optionId || uuidv4(),
                  type: "customPart",
                  position: {
                    x: colIndex * LANE_WIDTH,
                    y: verticalIndex * (ROW_HEIGHT + 40),
                  },
                  data: {
                    part,
                    stepName,
                    isFirst: colIndex === 0,
                    isLast: colIndex === workflow.length - 1,
                    existingLayerUrl: option.layerImageUrl || null,
                    tags: option.tags || option.Tags || "",
                    nextRule:
                      option.nextStepFilterRule ||
                      option.NextStepFilterRule ||
                      "",
                  },
                });

                verticalIndex += 1;
              });

              return;
            }

            initialNodes.push({
              id: `${stepName}-${part.id}`,
              type: "customPart",
              position: {
                x: colIndex * LANE_WIDTH,
                y: verticalIndex * (ROW_HEIGHT + 40),
              },
              data: {
                part,
                stepName,
                isFirst: colIndex === 0,
                isLast: colIndex === workflow.length - 1,
                existingLayerUrl: null,
                tags: "",
                nextRule: "",
              },
            });

            verticalIndex += 1;
          });
        });

        // Reconstruct Edges based on rules
        initialNodes.forEach((sourceNode) => {
          const rule =
            typeof sourceNode.data.nextRule === "string"
              ? sourceNode.data.nextRule
              : "";

          if (!rule) {
            return;
          }

          const [targetStep, targetTag] = rule.split(":");
          const safeTargetStep = targetStep?.trim().toLowerCase();
          const safeTargetTag = targetTag?.trim();

          if (!safeTargetStep || !safeTargetTag) {
            return;
          }

          const targetNodes = initialNodes.filter((n) => {
            const isCorrectStep =
              n.data.stepName.toLowerCase() === safeTargetStep;
            const nodeTags = typeof n.data.tags === "string" ? n.data.tags : "";
            const hasMatchingTag = nodeTags.includes(safeTargetTag);
            return isCorrectStep && hasMatchingTag;
          });

          targetNodes.forEach((targetNode) => {
            initialEdges.push({
              id: `edge-${sourceNode.id}-${targetNode.id}`,
              source: sourceNode.id,
              target: targetNode.id,
              animated: true,
              style: { stroke: "#3b82f6", strokeWidth: 2 },
            });
          });
        });
      } else {
        // ==========================================
        // SCENARIO 2: BRAND NEW KIT (Original Logic)
        // ==========================================
        workflow.forEach((step, colIndex) => {
          const stepName =
            step.step?.trim() || step.title?.trim() || `Step ${colIndex + 1}`;
          const partsForThisStep = allParts.filter((part) =>
            doesPartBelongToStep(part, step),
          );

          partsForThisStep.forEach((part, rowIndex) => {
            initialNodes.push({
              id: `${stepName}-${part.id}`,
              type: "customPart",
              position: {
                x: colIndex * LANE_WIDTH,
                y: rowIndex * ROW_HEIGHT,
              },
              data: {
                part,
                stepName,
                isFirst: colIndex === 0,
                isLast: colIndex === workflow.length - 1,
              },
            });
          });
        });
      }

      setNodes(initialNodes);
      setEdges(initialEdges);
    } catch (error) {
      console.error("Failed to parse specifications", error);
      setNodes([]);
      setEdges([]);
    }
  }, [allParts, baseKit.specifications, existingConfig, setNodes, setEdges]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      initBoard();
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [initBoard]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((currentEdges) => addEdge(params, currentEdges));
    },
    [setEdges],
  );

  const handleSaveRules = useCallback(async () => {
    if (edges.length === 0) {
      toast.warning("Vui lòng kết nối ít nhất 1 quy trình!");
      return;
    }

    const optionsPayloads: RulePayload[] = [];

    // Each source node owns one shared group key for all of its children.
    const sourceNodeKeys: Record<string, string> = {};
    nodes.forEach((node) => {
      const outgoingEdges = edges.filter((edge) => edge.source === node.id);

      if (outgoingEdges.length > 0) {
        const rawSuffix = node.id.split("-").pop()?.substring(0, 6) ?? "";
        const safeSuffix = rawSuffix.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        sourceNodeKeys[node.id] = `grp-${safeSuffix || uuidv4().slice(0, 6)}`;
      }
    });

    nodes.forEach((node) => {
      const data = node.data;
      const incomingEdges = edges.filter((edge) => edge.target === node.id);
      const outgoingEdges = edges.filter((edge) => edge.source === node.id);

      if (incomingEdges.length === 0 && outgoingEdges.length === 0) {
        return;
      }

      let nextStepRules: string | null = null;
      if (outgoingEdges.length > 0) {
        const targetNodeId = outgoingEdges[0].target;
        const targetNode = nodes.find((item) => item.id === targetNodeId);
        const targetStep = targetNode?.data.stepName ?? "";
        const sourceKey = sourceNodeKeys[node.id];

        if (targetStep && sourceKey) {
          nextStepRules = `${targetStep}:${sourceKey}`;
        }
      }

      const myTags = Array.from(
        new Set(
          incomingEdges
            .map((edge) => sourceNodeKeys[edge.source])
            .filter((key): key is string => Boolean(key)),
        ),
      ).join(",");

      optionsPayloads.push({
        BaseKitId: baseKit.id,
        ComponentId: data.part.id,
        StepName: data.stepName,
        StepOrder: 0,
        IsDefault: false,
        Tags: incomingEdges.length > 0 ? myTags : null,
        NextStepFilterRule: nextStepRules,

        // 1. Chỉ gửi File vật lý nếu CÓ file mới (để Backend upload Cloudinary)
        LayerImageFile: data.customLayerFile || undefined,

        // 2. ✅ GỬI LINK CŨ: Để Backend biết đường giữ lại ảnh xịn, không đè ảnh mặc định
        ExistingLayerUrl: data.existingLayerUrl || "",

        // Lưu ý: data.part.layerImageFile sẽ để Backend tự xử lý nếu cả 2 cái trên đều trống
      });
    });

    console.log("PARENT-GROUP ALGORITHM PAYLOAD:", optionsPayloads);

    if (onSave) {
      onSave(optionsPayloads);
      return;
    }

    toast.success("Đã sinh Rule thành công! Xem Console.");
  }, [baseKit.id, edges, nodes, onSave]);

  return (
    <div className="relative flex h-[750px] w-full flex-col rounded-md border border-neutral-200 bg-neutral-50 shadow-sm">
      <div className="z-10 flex items-center justify-between rounded-t-md border-b border-neutral-200 bg-white p-4">
        <div>
          <h3 className="text-base font-bold text-neutral-900">
            Thiết lập tương thích: {baseKit.name}
          </h3>
          <p className="mt-0.5 text-xs text-neutral-500">
            Kéo thả các điểm (Handles) để kết nối các linh kiện hợp lệ với nhau.
          </p>
        </div>

        <div className="space-x-3">
          {/* <button
            onClick={initBoard}
            className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50"
          >
            Làm mới (Reset)
          </button> */}
          <button
            onClick={handleSaveRules}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-neutral-800"
          >
            Lưu Quy Trình
          </button>
        </div>
      </div>

      <div className="h-full flex-1 bg-slate-50/50">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="react-flow-custom"
        >
          <Background color="#cbd5e1" gap={20} size={1.5} />
          <Controls className="fill-neutral-600 shadow-sm" />
        </ReactFlow>
      </div>
    </div>
  );
}
