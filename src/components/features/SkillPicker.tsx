"use client";

import { useMemo } from "react";
import { ElementIcon } from "@/components/icons/ElementIcon";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { PERSONAS, SKILLS } from "@/lib/game/data";
import { canInherit, MAX_SKILLS } from "@/lib/game/inheritance";
import type { Persona, Skill } from "@/types/game";

interface Option {
  skill: Skill;
  /** Level the target learns it at; undefined when it must be inherited. */
  nativeLevel?: number;
}

const LEARNABLE = new Set(PERSONAS.flatMap((p) => p.skills.filter((s) => !s.fusionSpell).map((s) => s.name)));

/** Skills the target can end up with: its own, plus any it can inherit that some persona learns. */
function skillOptions(target: Persona, available: ReadonlySet<string>): Option[] {
  const native = new Map(target.skills.filter((s) => !s.fusionSpell).map((s) => [s.name, s.level]));
  return SKILLS.filter(
    (s) => native.has(s.name) || (LEARNABLE.has(s.name) && available.has(s.name) && canInherit(target, s)),
  )
    .map((skill) => ({ skill, nativeLevel: native.get(skill.name) }))
    .sort(
      (a, b) =>
        Number(a.nativeLevel === undefined) - Number(b.nativeLevel === undefined) ||
        (a.nativeLevel ?? 0) - (b.nativeLevel ?? 0) ||
        a.skill.name.localeCompare(b.skill.name),
    );
}

interface Props {
  target: Persona;
  /** Skills learned by personas currently available (respects DLC). */
  available: ReadonlySet<string>;
  value: string[];
  onChange: (skills: string[]) => void;
}

export function SkillPicker({ target, available, value, onChange }: Props) {
  const anchor = useComboboxAnchor();
  const options = useMemo(() => skillOptions(target, available), [target, available]);
  const selected = options.filter((o) => value.includes(o.skill.name));
  const full = selected.length >= MAX_SKILLS;

  return (
    <Combobox
      multiple
      items={full ? selected : options}
      value={selected}
      onValueChange={(next: Option[]) => onChange(next.map((o) => o.skill.name))}
      itemToStringLabel={(o: Option) => o.skill.name}
      isItemEqualToValue={(a: Option, b: Option) => a.skill.name === b.skill.name}
      limit={80}
      autoHighlight
    >
      <ComboboxChips ref={anchor} className="min-h-11 bg-card/60 px-2 py-1.5">
        <ComboboxValue>
          {(chosen: Option[]) => (
            <>
              {chosen.map((o) => (
                <ComboboxChip key={o.skill.name} className="h-7 gap-1.5 bg-secondary px-2 text-sm">
                  <ElementIcon type={o.skill.type} title="" className="size-3.5" />
                  {o.skill.name}
                </ComboboxChip>
              ))}
              <ComboboxChipsInput
                aria-label="Add a skill"
                placeholder={full ? `${MAX_SKILLS} skills max` : chosen.length ? "Add another…" : "Add skills (optional)…"}
                className="h-7 px-1 text-sm"
              />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No skill {target.name} can learn or inherit matches.</ComboboxEmpty>
        <ComboboxList>
          {(o: Option) => (
            <ComboboxItem key={o.skill.name} value={o}>
              <ElementIcon type={o.skill.type} title="" />
              <span className="flex-1 truncate">{o.skill.name}</span>
              <span className="text-xs text-muted-foreground">
                {o.nativeLevel === undefined ? "Inherit" : o.nativeLevel === 0 ? "Innate" : `Lv ${o.nativeLevel}`}
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
