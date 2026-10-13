import { cn } from "@/lib/utils";

interface Props {
  /** Stacked one word per line, like the P3R title cards. */
  title: string;
  /** Small line above the title. */
  kicker?: string;
  /** Giant outlined word behind the title; defaults to the title. */
  backdrop?: string;
  children?: React.ReactNode;
  className?: string;
}

/** Title card: royal-blue bar, heavy stacked words, faded giant word behind. */
export function PageHeader({ title, kicker = "Persona 3 Reload", backdrop, children, className }: Props) {
  return (
    <header className={cn("relative isolate pb-2", className)}>
      <span
        aria-hidden
        className="backdrop-word absolute -top-4 right-0 -z-10 hidden max-w-full overflow-hidden whitespace-nowrap text-[10rem] sm:block lg:text-[13rem]"
      >
        {backdrop ?? title}
      </span>
      <div className="flex gap-4 sm:gap-5">
        <span aria-hidden className="w-2 shrink-0 bg-p3r-blue sm:w-3" />
        <div className="min-w-0 space-y-3 py-1">
          <p className="text-sm font-semibold tracking-tight text-p3r-sky">{kicker}</p>
          <h1 className="display text-[clamp(2.25rem,10.5vw,4.5rem)] text-p3r-white">
            {title.split(" ").map((word, i) => (
              <span key={i} className="block">
                {word}
              </span>
            ))}
          </h1>
          {children ? <div className="max-w-xl text-p3r-mist">{children}</div> : null}
        </div>
      </div>
    </header>
  );
}
