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

  // Only show rows that have a value
  const rows = allRows.filter((row) => row.value);

  return (
    <div className="w-full">
      {/* HEADER GIỐNG ẢNH MẪU */}
      <h3 className="text-xl lg:text-2xl font-black uppercase tracking-tight mb-8 font-oswald text-black">
        Winning Ingredients
      </h3>

      {/* TABLE CONTENT */}
      <div className="flex flex-col">
        {rows.map((row, idx) => (
          <div
            key={idx}
            className="grid grid-cols-1 md:grid-cols-12 py-4 border-b border-gray-100 gap-2 md:gap-4 group hover:bg-gray-50 transition-colors"
          >
            <div className="md:col-span-4 font-bold text-sm text-black">
              {row.label}:
            </div>

            <div className="md:col-span-8 text-sm text-gray-700 font-medium">
              {row.value || "N/A"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
