"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { useTranslations } from "next-intl";
import {
  addEdge,
  Background,
  Connection,
  Controls,
  Edge,
  Node,
  NodeMouseHandler,
  Panel,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Image from "next/image";
import { CheckCircle2, Package, Trash2, UploadCloud, X } from "lucide-react";
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

interface SidebarGroup {
  key: string;
  label: string;
  parts: PartItem[];
}

type PartWithSidebarMeta = PartItem & {
  componentId?: string | null;
  ComponentId?: string | null;
  category?: { name?: string | null } | null;
  categoryId?: string | null;
};

interface NodeConfigDrawerProps {
  nodeId: string | null;
  nodes: Node<PartNodeData>[];
  edges: Edge[];
  onClose: () => void;
  onDeleteNode: (nodeId: string) => void;
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

function parseWorkflowFromSpecifications(
  rawSpecifications: unknown,
): WorkflowStep[] {
  if (!rawSpecifications) {
    return [];
  }

  try {
    const specs =
      typeof rawSpecifications === "string"
        ? (JSON.parse(rawSpecifications) as Partial<PartSpecifications>)
        : (rawSpecifications as Partial<PartSpecifications>);

    return Array.isArray(specs.workflow) ? specs.workflow : [];
  } catch {
    return [];
  }
}

function resolveStepNameForPart(
  part: PartItem,
  workflow: WorkflowStep[],
): {
  stepName: string;
  stepIndex: number;
} {
  const matchedStepIndex = workflow.findIndex((step) =>
    doesPartBelongToStep(part, step),
  );

  if (matchedStepIndex >= 0) {
    const step = workflow[matchedStepIndex];
    return {
      stepName:
        step.step?.trim() ||
        step.title?.trim() ||
        `Step ${matchedStepIndex + 1}`,
      stepIndex: matchedStepIndex,
    };
  }

  return {
    stepName: part.categoryName?.trim() || part.name?.trim() || "Custom",
    stepIndex: -1,
  };
}

function isKitLikeToken(value: string | null | undefined): boolean {
  const normalized = normalizeText(value);
  if (!normalized) {
    return false;
  }

  const spaced = normalized.replace(/[_-]/g, " ");
  const collapsed = normalized.replace(/[\s_-]/g, "");

  return /\bkit\b/.test(spaced) || collapsed.includes("basekit");
}

function shouldHideFromSidebar(part: PartItem): boolean {
  const partWithMeta = part as PartWithSidebarMeta;

  const candidates = [
    partWithMeta.componentId,
    partWithMeta.ComponentId,
    partWithMeta.categoryId,
    partWithMeta.category?.name,
    part.categoryName,
  ];

  return candidates.some((value) => isKitLikeToken(value));
}

function resolveSidebarGroupLabel(part: PartItem): string {
  const partWithMeta = part as PartWithSidebarMeta;

  return (
    partWithMeta.componentId?.trim() ||
    partWithMeta.ComponentId?.trim() ||
    partWithMeta.category?.name?.trim() ||
    part.categoryName?.trim() ||
    "Other Components"
  );
}

function NodeConfigDrawer({
  nodeId,
  nodes,
  edges,
  onClose,
  onDeleteNode,
}: NodeConfigDrawerProps) {
  const tCustomPartNode = useTranslations("CustomPartNode");
  const { updateNodeData } = useReactFlow<Node<PartNodeData>, Edge>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeNode = useMemo(() => {
    if (!nodeId) {
      return null;
    }

    return nodes.find((node) => node.id === nodeId) || null;
  }, [nodeId, nodes]);

  const generatedTagsPreview = useMemo(() => {
    if (!activeNode) {
      return "";
    }

    const sourceNodeKeys: Record<string, string> = {};

    nodes.forEach((node) => {
      const outgoingEdges = edges.filter((edge) => edge.source === node.id);

      if (outgoingEdges.length > 0) {
        const rawSuffix = node.id.split("-").pop()?.substring(0, 6) ?? "";
        const safeSuffix = rawSuffix.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        sourceNodeKeys[node.id] = `grp-${safeSuffix || uuidv4().slice(0, 6)}`;
      }
    });

    const incomingEdges = edges.filter((edge) => edge.target === activeNode.id);

    return Array.from(
      new Set(
        incomingEdges
          .map((edge) => sourceNodeKeys[edge.source])
          .filter((key): key is string => Boolean(key)),
      ),
    ).join(",");
  }, [activeNode, edges, nodes]);

  if (!activeNode) {
    return null;
  }

  const previewUrl = activeNode.data.existingLayerUrl || null;

  const hasUploadedImage = Boolean(
    activeNode.data.customLayerFile || activeNode.data.existingLayerUrl,
  );

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    updateNodeData(activeNode.id, { customLayerFile: file });
    event.target.value = "";
  };

  const handleStepNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateNodeData(activeNode.id, { stepName: event.target.value });
  };

  const handleDeleteNode = () => {
    onDeleteNode(activeNode.id);
    onClose();
  };

  return (
    <Panel
      position="top-right"
      className="!m-0 !h-full !w-[360px] !max-w-full !rounded-none !bg-transparent !p-0"
    >
      <div className="pointer-events-auto flex h-full w-full flex-col border-l border-neutral-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-200 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Node Config
            </p>
            <p className="truncate text-sm font-bold text-neutral-900">
              {activeNode.data.part.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-neutral-200 p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto p-4">
          <div className="space-y-1.5">
            <label
              htmlFor={`step-name-${activeNode.id}`}
              className="text-xs font-semibold uppercase tracking-wider text-neutral-500"
            >
              Step Name
            </label>
            <input
              id={`step-name-${activeNode.id}`}
              value={activeNode.data.stepName}
              onChange={handleStepNameChange}
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-colors focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor={`generated-tags-${activeNode.id}`}
              className="text-xs font-semibold uppercase tracking-wider text-neutral-500"
            >
              Generated Tags
            </label>
            <input
              id={`generated-tags-${activeNode.id}`}
              value={
                generatedTagsPreview || "Auto-generated from incoming edges"
              }
              readOnly
              className="w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700"
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Layer Image
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={handleChooseFile}
              className="flex w-full items-center justify-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2 py-2 text-sm font-medium transition-colors hover:bg-neutral-50"
            >
              {hasUploadedImage ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <UploadCloud className="h-4 w-4 text-neutral-500" />
              )}
              <span
                className={
                  hasUploadedImage ? "text-emerald-700" : "text-neutral-600"
                }
              >
                {hasUploadedImage
                  ? tCustomPartNode("uploadedImage")
                  : tCustomPartNode("uploadImage")}
              </span>
            </button>

            {activeNode.data.customLayerFile && (
              <p className="text-xs text-neutral-500">
                Selected file: {activeNode.data.customLayerFile.name}
              </p>
            )}

            {previewUrl && (
              <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            )}
          </div>

          <div className="border-t border-neutral-200 pt-4">
            <button
              type="button"
              onClick={handleDeleteNode}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4" />
              {tCustomPartNode("deleteTitle")}
            </button>
          </div>
        </div>
      </div>
    </Panel>
  );
}

export default function VisualRuleBuilder({
  baseKit,
  allParts,
  existingConfig,
  onSave,
}: Props) {
  const t = useTranslations("VisualRuleBuilder");
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<PartNodeData>>(
    [],
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [lastAddedNodeId, setLastAddedNodeId] = useState<string | null>(null);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  const initBoard = useCallback(() => {
    const rawSpecifications = baseKit.specifications as unknown;

    if (!rawSpecifications) {
      setNodes([]);
      setEdges([]);
      setLastAddedNodeId(null);
      setActiveNodeId(null);
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
            }
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
        // SCENARIO 2: BRAND NEW KIT
        // Keep canvas empty; user adds parts from the sidebar.
        // ==========================================
      }

      setNodes(initialNodes);
      setEdges(initialEdges);
      setLastAddedNodeId(null);
      setActiveNodeId(null);
    } catch (error) {
      console.error("Failed to parse specifications", error);
      setNodes([]);
      setEdges([]);
      setLastAddedNodeId(null);
      setActiveNodeId(null);
    }
  }, [
    allParts,
    baseKit.specifications,
    existingConfig,
    setNodes,
    setEdges,
    setLastAddedNodeId,
    setActiveNodeId,
  ]);

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

  const workflow = useMemo(() => {
    const rawSpecifications = baseKit.specifications as unknown;
    return parseWorkflowFromSpecifications(rawSpecifications);
  }, [baseKit.specifications]);

  const sidebarGroups = useMemo<SidebarGroup[]>(() => {
    const groups = new Map<string, SidebarGroup>();

    allParts.forEach((part) => {
      if (shouldHideFromSidebar(part)) {
        return;
      }

      const label = resolveSidebarGroupLabel(part);
      const key = normalizeText(label) || "other-components";
      const group = groups.get(key);

      if (group) {
        group.parts.push(part);
        return;
      }

      groups.set(key, {
        key,
        label,
        parts: [part],
      });
    });

    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        parts: [...group.parts].sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [allParts]);

  const handleAddPartToCanvas = useCallback(
    (part: PartItem) => {
      const resolved = resolveStepNameForPart(part, workflow);
      const laneIndex =
        resolved.stepIndex >= 0 ? resolved.stepIndex : workflow.length;
      const laneX = laneIndex * LANE_WIDTH;

      const laneNodes = nodes.filter(
        (node) => Math.abs(node.position.x - laneX) < 1,
      );

      const nextY =
        laneNodes.length > 0
          ? Math.max(...laneNodes.map((node) => node.position.y)) +
            ROW_HEIGHT +
            20
          : 0;

      const newNodeId = uuidv4();

      const newNode: Node<PartNodeData> = {
        id: newNodeId,
        type: "customPart",
        position: {
          x: laneX,
          y: nextY,
        },
        data: {
          part,
          stepName: resolved.stepName,
          isFirst: workflow.length > 0 && resolved.stepIndex === 0,
          isLast:
            workflow.length > 0 && resolved.stepIndex === workflow.length - 1,
          existingLayerUrl: null,
          tags: "",
          nextRule: "",
        },
      };

      setNodes((currentNodes) => currentNodes.concat(newNode));

      if (
        lastAddedNodeId &&
        nodes.some((node) => node.id === lastAddedNodeId)
      ) {
        setEdges((currentEdges) =>
          currentEdges.concat({
            id: `auto-${lastAddedNodeId}-${newNodeId}-${uuidv4().slice(0, 8)}`,
            source: lastAddedNodeId,
            target: newNodeId,
            type: "smoothstep",
            animated: true,
          }),
        );
      }

      setLastAddedNodeId(newNodeId);
    },
    [lastAddedNodeId, nodes, setEdges, setNodes, workflow],
  );

  const handlePaneClick = useCallback(() => {
    setLastAddedNodeId(null);
  }, []);

  const handleNodeDoubleClick: NodeMouseHandler<Node<PartNodeData>> =
    useCallback((_event, node) => {
      setActiveNodeId(node.id);
    }, []);

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((currentNodes) =>
        currentNodes.filter((node) => node.id !== nodeId),
      );
      setEdges((currentEdges) =>
        currentEdges.filter(
          (edge) => edge.source !== nodeId && edge.target !== nodeId,
        ),
      );
      setLastAddedNodeId((currentNodeId) =>
        currentNodeId === nodeId ? null : currentNodeId,
      );
      setActiveNodeId((currentNodeId) =>
        currentNodeId === nodeId ? null : currentNodeId,
      );
    },
    [setEdges, setNodes],
  );

  const handleSaveRules = useCallback(async () => {
    if (edges.length === 0) {
      toast.warning(t("toastNoConnection"));
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

    toast.success(t("toastSaveSuccess"));
  }, [baseKit.id, edges, nodes, onSave, t]);

  return (
    <div className="relative flex h-[750px] w-full flex-col rounded-md border border-neutral-200 bg-neutral-50 shadow-sm">
      <div className="z-10 flex items-center justify-between rounded-t-md border-b border-neutral-200 bg-white p-4">
        <div>
          <h3 className="text-base font-bold text-neutral-900">
            {t("panelTitle", { kitName: baseKit.name })}
          </h3>
          <p className="mt-0.5 text-xs text-neutral-500">
            {lastAddedNodeId
              ? "Auto-connect active. Click empty canvas to reset chain."
              : t("panelSubtitle")}
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
            {t("saveButton")}
          </button>
        </div>
      </div>

      <div className="flex h-full min-h-0 flex-1">
        <div className="h-full flex-1 bg-slate-50/50">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onPaneClick={handlePaneClick}
            onNodeDoubleClick={handleNodeDoubleClick}
            nodeTypes={nodeTypes}
            fitView
            className="react-flow-custom"
          >
            <Background color="#cbd5e1" gap={20} size={1.5} />
            <Controls className="fill-neutral-600 shadow-sm" />
            <NodeConfigDrawer
              nodeId={activeNodeId}
              nodes={nodes}
              edges={edges}
              onClose={() => setActiveNodeId(null)}
              onDeleteNode={handleDeleteNode}
            />
          </ReactFlow>
        </div>

        <aside className="h-full w-80 overflow-y-auto border-l border-neutral-200 bg-white">
          <div className="sticky top-0 z-10 border-b border-neutral-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Parts
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Components only. Click to add and auto-connect in sequence.
            </p>
          </div>

          <div className="space-y-4 p-3">
            {sidebarGroups.length === 0 && (
              <p className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 px-3 py-4 text-center text-xs text-neutral-500">
                No component parts available in this kit.
              </p>
            )}

            {sidebarGroups.map((group) => (
              <section key={group.key} className="space-y-2">
                <div className="sticky top-[65px] z-[1] rounded-sm bg-white py-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    {group.label}
                  </p>
                </div>

                <div className="space-y-2">
                  {group.parts.map((part) => (
                    <button
                      key={part.id}
                      type="button"
                      onClick={() => handleAddPartToCanvas(part)}
                      className="flex w-full items-center gap-2 rounded-md border border-neutral-200 bg-white px-2 py-2 text-left transition-colors hover:border-blue-400 hover:bg-blue-50"
                    >
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-sm border border-neutral-200 bg-neutral-50">
                        {part.thumbnailUrl ? (
                          <Image
                            src={part.thumbnailUrl}
                            alt={part.name}
                            width={36}
                            height={36}
                            className="h-full w-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <Package className="h-4 w-4 text-neutral-300" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-neutral-900">
                          {part.name}
                        </p>
                        <p className="truncate text-[10px] text-neutral-500">
                          {part.categoryName || "Part"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
