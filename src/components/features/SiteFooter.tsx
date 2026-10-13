import { DATA_SOURCE } from "@/lib/game/data";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t">
      <div className="mx-auto max-w-6xl space-y-1 px-4 py-8 text-xs text-muted-foreground">
        <p>
          Unofficial fan project. Persona 3 Reload © ATLUS / SEGA. Not affiliated with or endorsed by either.
        </p>
        <p>
          Game data from{" "}
          <a
            href={`https://github.com/${DATA_SOURCE.repo}`}
            className="underline decoration-dotted underline-offset-2 hover:text-foreground"
            target="_blank"
            rel="noreferrer"
          >
            {DATA_SOURCE.repo}
          </a>{" "}
          (public domain), imported {DATA_SOURCE.importedAt}.
        </p>
      </div>
    </footer>
  );
}
