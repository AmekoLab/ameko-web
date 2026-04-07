"use client";
import { ProductSpecs as SpecsType } from "@/src/types/product";

interface ProductSpecsProps {
  specs: SpecsType;
}

export const ProductSpecs = ({ specs }: ProductSpecsProps) => {
  const allRows = [
    { label: "Layout Size", value: specs.layout },
    { label: "Mounting Style", value: specs.mounting },
    { label: "PCB Tech", value: specs.pcb },
    { label: "Connection", value: specs.connection },
    { label: "Battery Capacity", value: specs.battery },
    { label: "Polling Rate", value: specs.pollingRate },
    { label: "Anti-Ghosting", value: specs.antiGhosting },
    { label: "Case Material", value: specs.caseMaterial },
    { label: "Plate Material", value: specs.plateMaterial },
    { label: "Weight", value: specs.weight },
    { label: "Warranty", value: specs.warranty },
  ];

  const rows = allRows.filter((row) => row.value);

  return (
    <div className="w-full">
      <div className="flex flex-col">
        {rows.map((row, idx) => (
          <div
            key={idx}
            className="grid grid-cols-1 md:grid-cols-12 py-3.5 border-b border-amazon-border gap-2 md:gap-4 hover:bg-neutral-50 transition-colors"
          >
            <div className="md:col-span-5 text-[10px] font-black uppercase tracking-widest text-amazon-textMuted">
              {row.label}
            </div>
            <div className="md:col-span-7 text-sm text-amazon-text font-medium">
              {row.value || "N/A"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
