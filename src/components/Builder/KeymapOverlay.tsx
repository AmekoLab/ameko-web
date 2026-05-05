"use client";

import { FC, useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { BuilderProduct, SelectedPart } from "@/src/types/builder";

// ─── PROPS ──────────────────────────────────────────────────────────────────

export interface KeymapOverlayProps {
  onAddonSelected: (position: string, partId: string) => void;
  onAddonRemoved: (componentId: string) => void;
  selectedAddons: Record<string, SelectedPart>;
  availableAddons: BuilderProduct[];
  isLoadingAddons: boolean;
  fetchAddons: () => void;
  isProcessing: boolean;
}

// ─── 75% KEYBOARD LAYOUT ───────────────────────────────────────────────────
// Each key: [label, flex-value]
// flex-value mirrors keycap unit widths (1U = flex:1, 1.5U = flex:1.5, etc.)

type KeyDef = [string, number];

const KEYBOARD_ROWS: KeyDef[][] = [
  // Row 0: Function row
  [
    ["Esc", 1],
    ["F1", 1],
    ["F2", 1],
    ["F3", 1],
    ["F4", 1],
    ["F5", 1],
    ["F6", 1],
    ["F7", 1],
    ["F8", 1],
    ["F9", 1],
    ["F10", 1],
    ["F11", 1],
    ["F12", 1],
    ["PrtSc", 0.8],
    ["Del", 1.2],
  ],
  // Row 1: Number row
  [
    ["`", 1],
    ["1", 1],
    ["2", 1],
    ["3", 1],
    ["4", 1],
    ["5", 1],
    ["6", 1],
    ["7", 1],
    ["8", 1],
    ["9", 1],
    ["0", 1],
    ["-", 1],
    ["=", 1],
    ["Backspace", 1.6],
    ["Home", 1],
  ],
  // Row 2: QWERTY top
  [
    ["Tab", 1.5],
    ["Q", 1],
    ["W", 1],
    ["E", 1],
    ["R", 1],
    ["T", 1],
    ["Y", 1],
    ["U", 1],
    ["I", 1],
    ["O", 1],
    ["P", 1],
    ["[", 1],
    ["]", 1],
    ["\\", 1.5],
    ["PgUp", 1],
  ],
  // Row 3: Home row
  [
    ["Caps", 1.75],
    ["A", 1],
    ["S", 1],
    ["D", 1],
    ["F", 1],
    ["G", 1],
    ["H", 1],
    ["J", 1],
    ["K", 1],
    ["L", 1],
    [";", 1],
    ["'", 1],
    ["Enter", 2.25],
    ["PgDn", 1],
  ],
  // Row 4: Shift row
  [
    ["LShift", 2.25],
    ["Z", 1],
    ["X", 1],
    ["C", 1],
    ["V", 1],
    ["B", 1],
    ["N", 1],
    ["M", 1],
    [",", 1],
    [".", 1],
    ["/", 1],
    ["RShift", 1.7],
    ["↑", 1],
    ["End", 1],
  ],
  // Row 5: Bottom row
  [
    ["Ctrl", 1.25],
    ["Win", 1.25],
    ["Alt", 1.25],
    ["Space", 6],
    ["Alt", 1.25],
    ["Fn", 1],
    ["←", 1],
    ["↓", 1],
    ["→", 1],
  ],
];

const KEYMAP_CALIBRATION = {
  pTop: 7,
  pBottom: 14,
  pLeft: 13,
  pRight: 12.5,
  rowGap: 1.6,
  colGap: 0.7,
};

// ─── SECONDARY LEGENDS (Shift-layer characters) ────────────────────────────
const SUB_LEGENDS: Record<string, string> = {
  "`": "~",
  "1": "!",
  "2": "@",
  "3": "#",
  "4": "$",
  "5": "%",
  "6": "^",
  "7": "&",
  "8": "*",
  "9": "(",
  "0": ")",
  "-": "_",
  "=": "+",
  "[": "{",
  "]": "}",
  "\\": "|",
  ";": ":",
  "'": '"',
  ",": "<",
  ".": ">",
  "/": "?",
};

// ─── HELPERS ────────────────────────────────────────────────────────────────

const formatKeycapPosition = (rawName: string) => {
  return rawName.replace(
    /\(Position:\s*R(\d+)-([^-]+)-\d+\)/g,
    (_, rowNum, keyName) => {
      return `(Position: ${keyName} - Row ${rowNum})`;
    },
  );
};

/** Generate a unique key ID from row + column index + label */
function keyId(rowIdx: number, colIdx: number, label: string): string {
  return `R${rowIdx}-${label}-${colIdx}`;
}

/** Check if a key position has an addon selected */
function findAddonForKey(
  kid: string,
  selectedAddons: Record<string, SelectedPart>,
): [string, SelectedPart] | null {
  for (const [componentId, part] of Object.entries(selectedAddons)) {
    if (part.name.includes(`(Position: ${kid})`)) {
      return [componentId, part];
    }
  }
  return null;
}

// ─── COMPONENT ──────────────────────────────────────────────────────────────

const KeymapOverlay: FC<KeymapOverlayProps> = ({
  onAddonSelected,
  onAddonRemoved,
  selectedAddons,
  availableAddons,
  isLoadingAddons,
  fetchAddons,
  isProcessing,
}) => {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [showInstruction, setShowInstruction] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveKey(null);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleKeyClick = useCallback(
    (kid: string) => {
      setActiveKey(kid);
      setShowInstruction(false);
      // Lazy-load addons on first open
      if (availableAddons.length === 0 && !isLoadingAddons) {
        fetchAddons();
      }
    },
    [availableAddons, isLoadingAddons, fetchAddons],
  );

  const handleSelectAddon = useCallback(
    (partId: string) => {
      if (!activeKey || isProcessing) return;
      onAddonSelected(activeKey, partId);
      setActiveKey(null);
    },
    [activeKey, isProcessing, onAddonSelected],
  );

  const handleRemoveAddon = useCallback(
    (componentId: string) => {
      if (isProcessing) return;
      onAddonRemoved(componentId);
      setActiveKey(null);
    },
    [isProcessing, onAddonRemoved],
  );

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setActiveKey(null);
    }
  }, []);

  // Current addon for the active modal key
  const activeAddon = activeKey
    ? findAddonForKey(activeKey, selectedAddons)
    : null;

  return (
    <>
      {/* ── KEYBOARD GRID OVERLAY ── */}
      <div
        className="absolute inset-0 z-[999] pointer-events-auto text-[8px] tracking-[0.7px]"
        style={{
          paddingTop: `${KEYMAP_CALIBRATION.pTop}%`,
          paddingBottom: `${KEYMAP_CALIBRATION.pBottom}%`,
          paddingLeft: `${KEYMAP_CALIBRATION.pLeft}%`,
          paddingRight: `${KEYMAP_CALIBRATION.pRight}%`,
        }}
      >
        {/* ── ONBOARDING COACHMARK ── */}
        {showInstruction && (
          <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 z-[100] animate-bounce pointer-events-none flex flex-col items-center drop-shadow-2xl">
            <div className="bg-neutral-900/90 backdrop-blur-md px-6 py-3.5 rounded-full border border-orange-500/50 flex items-center gap-4 shadow-[0_10px_30px_rgba(249,115,22,0.3)]">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 text-white shrink-0">
                <svg
                  className="w-5 h-5 animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                  />
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.15em] text-orange-400 mb-0.5">
                  Start customizing
                </p>
                <p className="text-[12px] font-medium text-white/90">
                  Click on any key on the model to select an Artisan Keycap!
                </p>
              </div>
            </div>
            <div className="w-0.5 h-10 bg-gradient-to-b from-orange-500/80 to-transparent mt-1 rounded-full"></div>
          </div>
        )}

        {/* ── 3D PERSPECTIVE CONTAINER ── */}
        <div className="w-full h-full" style={{ perspective: "1200px" }}>
          {/* Keyboard case shell — pop-in entrance */}
          <div
            className="w-full h-full rounded-xl p-[2.5%] animate-[keyboardPopIn_0.5s_cubic-bezier(0.175,0.885,0.32,1.275)_both]"
            style={{
              background: "linear-gradient(180deg, #1e1e1e 0%, #463b38ff 100%)",
              boxShadow:
                "0 12px 48px rgba(0,0,0,0.8), 0 2px 0 0 #2a2a2a, inset 0 1px 0 0 rgba(255,255,255,0.06)",
              transform: "rotateX(22deg)",
              transformOrigin: "center bottom",
              transformStyle: "preserve-3d",
            }}
          >
            {/* Recessed plate */}
            <div
              className="w-full h-full flex flex-col rounded-lg p-[1.5%]"
              style={{
                gap: `${KEYMAP_CALIBRATION.rowGap}%`,
                background: "#0d0d0d",
                boxShadow:
                  "inset 0 2px 12px rgba(0,0,0,0.9), inset 0 0 4px rgba(0,0,0,0.6)",
              }}
            >
            {KEYBOARD_ROWS.map((row, rowIdx) => (
              <div
                key={rowIdx}
                className="flex flex-1"
                style={{
                  gap: `${KEYMAP_CALIBRATION.colGap}%`,
                  marginBottom:
                    rowIdx === 0 ? `${KEYMAP_CALIBRATION.rowGap}%` : undefined,
                }}
              >
                {row.map(([label, flexVal], colIdx) => {
                  const kid = keyId(rowIdx, colIdx, label);
                  const addon = findAddonForKey(kid, selectedAddons);
                  const hasAddon = !!addon;

                  return (
                    <button
                      key={kid}
                      onClick={() => handleKeyClick(kid)}
                      style={{
                        flex: flexVal,
                        minHeight: "1.8em",
                        background: hasAddon
                          ? "linear-gradient(180deg, rgba(251,146,60,0.22) 0%, rgba(217,119,6,0.13) 100%)"
                          : "linear-gradient(180deg, #4b5563 0%, #374151 100%)",
                        boxShadow: hasAddon
                          ? "0 0 14px 2px rgba(251,146,60,0.45), inset 0 1px 0 0 rgba(251,146,60,0.3), 0 2px 0 0 #92400e, 0 4px 0 0 #78350f, 0 6px 8px rgba(0,0,0,0.5)"
                          : "inset 0 1px 0 0 rgba(255,255,255,0.09), 0 2px 0 0 #374151, 0 4px 0 0 #1f2937, 0 6px 8px rgba(0,0,0,0.45)",
                      }}
                      className={`
                        relative rounded-[4px] select-none
                        flex flex-col justify-start pt-[2px] pl-[4px]
                        font-bold uppercase leading-tight
                        transition-[transform,filter] duration-100 ease-out
                        hover:brightness-[1.2]
                        active:translate-y-[3px] active:brightness-100
                        ${
                          hasAddon
                            ? "border border-orange-400/70 text-orange-300 hover:text-orange-200"
                            : "border border-white/[0.06] text-white/50 hover:text-white/80"
                        }
                      `}
                      title={
                        hasAddon
                          ? `${addon[1].name} — Click to manage`
                          : `Customize: ${label}`
                      }
                    >
                      {SUB_LEGENDS[label] ? (
                        <>
                          <span className="text-[0.85em] opacity-60 leading-none">
                            {SUB_LEGENDS[label]}
                          </span>
                          <span className="text-[1em] opacity-90 leading-none">
                            {label}
                          </span>
                        </>
                      ) : (
                        <span className="text-[1em] leading-none">{label}</span>
                      )}
                      {hasAddon && (
                        <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-orange-400 rounded-full shadow-[0_0_6px_rgba(251,146,60,0.8)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── ADDON MODAL ── */}
      {activeKey && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={handleOverlayClick}
        >
          <div
            ref={modalRef}
            className="w-full max-w-sm bg-white rounded-lg shadow-2xl border border-amazon-border overflow-hidden animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-amazon-border bg-neutral-50">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-amazon-textMuted">
                  Customize Key
                </p>
                <h3 className="text-lg font-black text-amazon-text uppercase tracking-tight">
                  {`${activeKey.split("-")[1]} - Row ${activeKey.split("-")[0].replace("R", "")}`}
                </h3>
              </div>
              <button
                onClick={() => setActiveKey(null)}
                className="p-2 hover:bg-neutral-200 rounded-full transition-colors text-amazon-textMuted"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Current addon (if exists) */}
            {activeAddon && (
              <div className="px-5 py-4 border-b border-amazon-border bg-orange-50/50">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-amazon-textMuted mb-2">
                  Currently Installed
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 relative rounded border border-orange-200 bg-white shrink-0 overflow-hidden">
                    <Image
                      src={activeAddon[1].thumbnailUrl}
                      alt={activeAddon[1].name}
                      fill
                      className="object-contain p-1"
                      sizes="48px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-amazon-text truncate">
                      {formatKeycapPosition(activeAddon[1].name)}
                    </p>
                    <p className="text-[11px] text-amazon-price font-bold">
                      +{activeAddon[1].price.toLocaleString()}₫
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveAddon(activeAddon[0])}
                    disabled={isProcessing}
                    className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-red-600 border border-red-200 rounded-sm hover:bg-red-50 transition-all disabled:opacity-50"
                  >
                    {isProcessing ? "..." : "Remove"}
                  </button>
                </div>
              </div>
            )}

            {/* Addon list */}
            <div className="px-5 py-4 max-h-[300px] overflow-y-auto custom-scrollbar">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-amazon-textMuted mb-3">
                {activeAddon ? "Replace With" : "Choose Addon"}
              </p>

              {isLoadingAddons ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin w-7 h-7 border-[3px] border-amazon-border border-t-amazon-btnSecondary rounded-full" />
                </div>
              ) : availableAddons.length === 0 ? (
                <p className="text-xs text-amazon-textMuted text-center py-8 font-medium">
                  No addons available
                </p>
              ) : (
                <div className="space-y-2">
                  {availableAddons.map((addon) => (
                    <button
                      key={addon.optionId}
                      onClick={() => handleSelectAddon(addon.partId)}
                      disabled={isProcessing}
                      className="w-full flex items-center gap-3 p-3 rounded-sm border border-amazon-border bg-white hover:border-amazon-focus hover:shadow-sm transition-all group disabled:opacity-50"
                    >
                      <div className="w-11 h-11 relative rounded border border-amazon-border bg-neutral-50 shrink-0 overflow-hidden">
                        <Image
                          src={addon.thumbnailUrl}
                          alt={addon.name}
                          fill
                          className="object-contain p-1 group-hover:scale-110 transition-transform duration-200"
                          sizes="44px"
                        />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-[11px] font-black text-amazon-text uppercase tracking-wide truncate">
                          {addon.name}
                        </p>
                        <p className="text-[11px] text-amazon-price font-bold">
                          +{addon.price.toLocaleString()}₫
                        </p>
                      </div>
                      <svg
                        className="w-3.5 h-3.5 text-amazon-textMuted shrink-0 group-hover:text-amazon-link transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KeymapOverlay;
