"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ARCANA, type Arcana } from "@/types/game";

const ALL = "all";
const ITEMS = [{ value: ALL, label: "All arcana" }, ...ARCANA.map((a) => ({ value: a, label: a }))];

export function ArcanaSelect({ value, onChange }: { value: Arcana | null; onChange: (arcana: Arcana | null) => void }) {
  return (
    <Select
      items={ITEMS}
      value={value ?? ALL}
      onValueChange={(v) => onChange(v === ALL || v === null ? null : (v as Arcana))}
    >
      <SelectTrigger className="h-10 w-full data-[size=default]:h-10 sm:w-44" aria-label="Filter by arcana">
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} className="max-h-80">
        {ITEMS.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
