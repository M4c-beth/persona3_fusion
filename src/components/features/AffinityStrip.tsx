import { ElementIcon } from "@/components/icons/ElementIcon";
import { SKILL_TYPE_LABEL } from "@/lib/game/labels";
import { ELEMENTS, type Persona } from "@/types/game";
import { AffinityCell } from "./AffinityCell";

export function AffinityStrip({ affinities }: { affinities: Persona["affinities"] }) {
  return (
    <dl className="grid grid-cols-9 divide-x divide-border/60 rounded-md border bg-card/60">
      {ELEMENTS.map((el) => (
        <div key={el} className="flex flex-col items-center gap-1.5 py-2.5">
          <dt>
            <ElementIcon type={el} title={SKILL_TYPE_LABEL[el]} />
          </dt>
          <dd>
            <AffinityCell affinity={affinities[el]} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
