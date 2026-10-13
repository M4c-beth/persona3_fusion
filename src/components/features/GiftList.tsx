import type { Gift } from "@/types/game";
import { cn } from "@/lib/utils";

function Group({ title, gifts, loved }: { title: string; gifts: Gift[]; loved?: boolean }) {
  if (gifts.length === 0) return null;
  return (
    <div className="space-y-2">
      <h3 className={cn("font-heading text-xs font-bold uppercase tracking-[0.18em]", loved ? "text-p3r-red" : "text-p3r-sky")}>
        {title}
      </h3>
      <ul className="grid grid-cols-2 gap-2">
        {gifts.map((g) => (
          <li key={g.name} className={cn("border bg-card px-3 py-2", loved && "border-p3r-red/40")}>
            <span className="block font-medium text-p3r-white">
              {loved ? <span aria-hidden className="mr-1.5 text-p3r-red">♥</span> : null}
              {g.name}
            </span>
            <span className="block text-xs text-muted-foreground">{g.where}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function GiftList({ loves, likes }: { loves: Gift[]; likes: Gift[] }) {
  return (
    <div className="space-y-5">
      <Group title="Loves" gifts={loves} loved />
      <Group title="Likes" gifts={likes} />
    </div>
  );
}
