import type { SkillType } from "@/types/game";
import { SKILL_TYPE_LABEL } from "@/lib/game/labels";
import { cn } from "@/lib/utils";

/** Hand-drawn 24×24 glyphs; filled shapes use currentColor. */
const GLYPHS: Record<SkillType, React.ReactNode> = {
  slash: (
    <>
      <path d="M2.5 21.5 18 4l4-2-2 4L4.5 23.5Z" />
      <path d="M1 15.5 11 4.5l3-1.5-1.5 3-10 11Z" opacity=".6" />
    </>
  ),
  strike: (
    <path d="M7 3h3v2h2V4h3v2h2a2 2 0 0 1 2 2v6l-3 4v4H8v-4l-4-4V9h3V3Zm-1 8v2.2L9.6 17h5.8l2.6-3.6V8h-2v3h-2V6h-1v5h-2V5H9v6H6Z" />
  ),
  pierce: <path d="M12 1.5 16.5 10 13 8.8V22.5h-2V8.8L7.5 10Z" />,
  fire: (
    <path d="M12.5 1.5c.6 3.4 2.6 5.2 4.3 7.2 1.7 2 2.7 4 2.7 6.3A7.5 7.5 0 0 1 12 22.5 7.5 7.5 0 0 1 4.5 15c0-2.6 1.3-4.6 2.8-6 .2 1.9.9 3.2 2.1 4 0-4.2 1.3-8.4 3.1-11.5Zm-.3 11.2c-1.4 1.6-2.2 2.9-2.2 4.4a2 2 0 0 0 4 0c0-1.5-.6-2.8-1.8-4.4Z" />
  ),
  ice: (
    <path d="M11 1h2v4.2l2.6-2.6 1.4 1.4-4 4v2.3l2-1.2 1.5-5.4 1.9.5-1 3.5 3.6-2.1 1 1.7-3.6 2.1 3.5 1-.5 1.9-5.4-1.5-2 1.2 2 1.2 5.4-1.5.5 1.9-3.5 1 3.6 2.1-1 1.7-3.6-2.1 1 3.5-1.9.5-1.5-5.4-2-1.2V15l4 4-1.4 1.4-2.6-2.6V23h-2v-5.2l-2.6 2.6L7 19l4-4v-2.3l-2 1.2-1.5 5.4-1.9-.5 1-3.5-3.6 2.1-1-1.7 3.6-2.1-3.5-1 .5-1.9 5.4 1.5 2-1.2-2-1.2-5.4 1.5-.5-1.9 3.5-1-3.6-2.1 1-1.7 3.6 2.1-1-3.5 1.9-.5 1.5 5.4 2 1.2V9L7 5l1.4-1.4L11 6.2Z" />
  ),
  elec: <path d="M14.5 1 4 13.5h6.5L8.5 23 20 9.5h-6.6Z" />,
  wind: (
    <path d="M2 8h11.5a2.5 2.5 0 1 0-2.4-3.2l-1.9-.6A4.5 4.5 0 1 1 13.5 10H2Zm0 4h17.5a3.5 3.5 0 1 1-3.4 4.4l1.9-.5a1.5 1.5 0 1 0 1.5-1.9H2Zm0 4h8v2H2Z" />
  ),
  light: (
    <path d="M12 1 13.8 8.4 20.5 3.5 15.6 10.2 23 12l-7.4 1.8 4.9 6.7-6.7-4.9L12 23l-1.8-7.4-6.7 4.9 4.9-6.7L1 12l7.4-1.8L3.5 3.5l6.7 4.9Z" />
  ),
  dark: (
    <path d="M14.5 2A10 10 0 1 0 22 16.5 8 8 0 0 1 14.5 2ZM18 3l.8 2.2L21 6l-2.2.8L18 9l-.8-2.2L15 6l2.2-.8Z" />
  ),
  almighty: (
    <>
      <path d="M12 0 14 10 24 12 14 14 12 24 10 14 0 12 10 10Z" />
      <path d="m4.2 4.2 5 3.6-1.4 1.4Zm15.6 0-3.6 5-1.4-1.4Zm0 15.6-5-3.6 1.4-1.4Zm-15.6 0 3.6-5 1.4 1.4Z" opacity=".55" />
    </>
  ),
  ailment: (
    <path d="M12 1.5c3.6 5 7 8.6 7 12.5a7 7 0 0 1-14 0c0-3.9 3.4-7.5 7-12.5Zm0 9.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
  ),
  recovery: <path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7Z" />,
  support: <path d="m12 2 8 8-1.4 1.4L12 4.8l-6.6 6.6L4 10Zm0 7 8 8-1.4 1.4-6.6-6.6-6.6 6.6L4 17Zm-1 9h2v4h-2Z" />,
  special: <path d="M12 1 23 12 12 23 1 12Zm0 4.2L5.2 12l6.8 6.8 6.8-6.8Zm0 3.3 3.5 3.5-3.5 3.5L8.5 12Z" />,
  passive: <path d="M12 1.5 21 6.7v10.6l-9 5.2-9-5.2V6.7Zm0 2.3L5 7.9v8.2l7 4.1 7-4.1V7.9Zm0 4.2 3.5 2v4L12 16l-3.5-2v-4Z" />,
};

export function ElementIcon({
  type,
  className,
  title,
}: {
  type: SkillType;
  className?: string;
  /** Accessible name; defaults to the type label. Pass "" when a visible label sits next to it. */
  title?: string;
}) {
  const label = title ?? SKILL_TYPE_LABEL[type];
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      fillRule="evenodd"
      className={cn("size-4 shrink-0", className)}
      style={{ color: `var(--elem-${type})` }}
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
    >
      {label ? <title>{label}</title> : null}
      {GLYPHS[type]}
    </svg>
  );
}
