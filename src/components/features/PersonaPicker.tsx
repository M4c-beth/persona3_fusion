"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import type { Persona } from "@/types/game";

interface Props {
  personas: Persona[];
  value: Persona | null;
  onChange: (persona: Persona | null) => void;
  label: string;
}

export function PersonaPicker({ personas, value, onChange, label }: Props) {
  return (
    <Combobox
      items={personas}
      value={value}
      onValueChange={(p) => onChange(p)}
      itemToStringLabel={(p: Persona) => p.name}
      isItemEqualToValue={(a: Persona, b: Persona) => a.name === b.name}
      limit={60}
      autoHighlight
    >
      <ComboboxInput
        placeholder="Choose a persona…"
        aria-label={label}
        showClear={!!value}
        className="h-11 w-full bg-card/60 text-base"
      />
      <ComboboxContent>
        <ComboboxEmpty>No persona found.</ComboboxEmpty>
        <ComboboxList>
          {(p: Persona) => (
            <ComboboxItem key={p.name} value={p}>
              <span className="w-6 text-right font-mono text-xs tabular-nums text-muted-foreground">{p.level}</span>
              <span className="flex-1 truncate">{p.name}</span>
              <span className="text-xs text-muted-foreground">{p.arcana}</span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
