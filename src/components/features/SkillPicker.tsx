"use client";

import { useMemo } from "react";
import { ElementIcon } from "@/components/icons/ElementIcon";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { SKILLS } from "@/lib/game/data";
import { inheritBlock, MAX_SKILLS } from "@/lib/game/inheritance";
import { SKILL_TYPE_LABEL } from "@/lib/game/labels";
import { cn } from "@/lib/utils";
import { SKILL_TYPES, type Persona, type Skill } from "@/types/game";

interface Option {
  skill: Skill;
  /** Level the target learns it at; undefined when it must be inherited. */
  nativeLevel?: number;
  /** Why the target can't get this skill through fusion. */
  blocked?: string;
}

interface Group {
  value: string;
  items: Option[];
}

/** Every skill on the Skills tab, grouped: the target's own first, then by type. */
function skillGroups(target: Persona, available: ReadonlySet<string>): Group[] {
  const native = new Map(target.skills.filter((s) => !s.fusionSpell).map((s) => [s.name, s.level]));
  const own: Option[] = [];
  const byType = new Map<string, Option[]>();

  for (const skill of SKILLS) {
    const nativeLevel = native.get(skill.name);
    if (nativeLevel !== undefined) {
      own.push({ skill, nativeLevel });
      continue;
    }
    if (!available.has(skill.name)) continue;
    const block = inheritBlock(target, skill);
    const option: Option = {
      skill,
      blocked: block === "exclusive" ? "Exclusive" : block ? `Can't inherit ${SKILL_TYPE_LABEL[skill.type]}` : undefined,
    };
    byType.set(skill.type, [...(byType.get(skill.type) ?? []), option]);
  }

  own.sort((a, b) => (a.nativeLevel ?? 0) - (b.nativeLevel ?? 0));
  const typed = SKILL_TYPES.filter((t) => byType.has(t)).map((t) => ({
    value: SKILL_TYPE_LABEL[t],
    // Inheritable first, then blocked; each by name.
    items: byType
      .get(t)!
      .sort((a, b) => Number(!!a.blocked) - Number(!!b.blocked) || a.skill.name.localeCompare(b.skill.name)),
  }));
  return [{ value: `${target.name} learns`, items: own }, ...typed];
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
  const groups = useMemo(() => skillGroups(target, available), [target, available]);
  const options = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const selected = value.map((name) => options.find((o) => o.skill.name === name)).filter((o) => o !== undefined);
  const full = selected.length >= MAX_SKILLS;

  return (
    <Combobox
      multiple
      items={groups}
      value={selected}
      onValueChange={(next: Option[]) => onChange(next.map((o) => o.skill.name))}
      itemToStringLabel={(o: Option) => o.skill.name}
      isItemEqualToValue={(a: Option, b: Option) => a.skill.name === b.skill.name}
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
                placeholder={full ? `${MAX_SKILLS} skills max` : chosen.length ? "Add another…" : "Search or browse skills…"}
                className="h-7 px-1 text-sm"
              />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No skill matches.</ComboboxEmpty>
        <ComboboxList className="max-h-[min(24rem,var(--available-height))]">
          {(group: Group) => (
            <ComboboxGroup key={group.value} items={group.items}>
              <ComboboxLabel className="sticky top-0 z-10 bg-popover font-heading text-xs font-bold uppercase tracking-wider text-p3r-blue-light">
                {group.value}
              </ComboboxLabel>
              <ComboboxCollection>
                {(o: Option) => {
                  const taken = selected.some((s) => s.skill.name === o.skill.name);
                  return (
                    <ComboboxItem key={o.skill.name} value={o} disabled={!!o.blocked || (full && !taken)}>
                      <ElementIcon type={o.skill.type} title="" />
                      <span className={cn("flex-1 truncate", o.blocked && "line-through decoration-muted-foreground/50")}>
                        {o.skill.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {o.blocked ??
                          (o.nativeLevel === undefined ? "Inherit" : o.nativeLevel === 0 ? "Innate" : `Lv ${o.nativeLevel}`)}
                      </span>
                    </ComboboxItem>
                  );
                }}
              </ComboboxCollection>
            </ComboboxGroup>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
