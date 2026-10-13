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

/** Average glyph width of the heavy display face, as a fraction of its size. */
const GLYPH_WIDTH = 0.65;
/** Same for the title, which is set tighter and heavier. */
const TITLE_GLYPH_WIDTH = 0.72;
const TITLE_SIZE = "min(4.5rem, 10.5vw)";
const CONTENT_WIDTH = "(min(100vw, 1184px) - 32px)";
/** Bar, padding and breathing room between title and backdrop. */
const GAP = "120px";

/**
 * Size the backdrop word to fit the space right of the title (and at most half the
 * page), so it never runs into the title however long either one is.
 */
function backdropSize(word: string, title: string): string {
  const span = GLYPH_WIDTH * word.length;
  const longest = Math.max(...title.split(" ").map((w) => w.length));
  const titleWidth = `${TITLE_SIZE} * ${(TITLE_GLYPH_WIDTH * longest).toFixed(2)}`;
  return [
    "13rem",
    `calc(${CONTENT_WIDTH} * 0.5 / ${span.toFixed(2)})`,
    `calc((${CONTENT_WIDTH} - ${titleWidth} - ${GAP}) / ${span.toFixed(2)})`,
  ].reduce((acc, v) => `min(${acc}, ${v})`);
}

/** Title card: royal-blue bar, heavy stacked words, faded giant word behind. */
export function PageHeader({ title, kicker = "Persona 3 Reload", backdrop, children, className }: Props) {
  const word = backdrop ?? title;
  return (
    <header className={cn("relative isolate pb-2", className)}>
      <span
        aria-hidden
        className="backdrop-word absolute -top-4 right-0 -z-10 hidden whitespace-nowrap sm:block"
        style={{ fontSize: backdropSize(word, title) }}
      >
        {word}
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
