export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Slito — Plateforme de réservation d&apos;artisans.</p>
        <p>Projet pédagogique — interface consommant l&apos;API slito-backend.</p>
      </div>
    </footer>
  );
}
