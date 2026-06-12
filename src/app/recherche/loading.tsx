import { Skeleton, SkeletonStack } from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col">
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <div
        className="border-b border-sand bg-sand-light px-8 py-10"
        style={{ backgroundColor: '#f0e8d5' }}
      >
        <Skeleton className="mb-3 h-4 w-32 bg-warm-white" />
        <Skeleton className="mb-4 h-9 w-64 bg-warm-white" />
        <Skeleton className="h-12 w-full max-w-2xl rounded-xl bg-warm-white" />
      </div>

      {/* ── Mise en page deux colonnes ─────────────────────────────────────── */}
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-8 py-8 lg:grid-cols-[280px_1fr]">
        {/* Sidebar filtres */}
        <aside className="hidden rounded-2xl border border-sand bg-warm-white p-6 lg:block">
          <Skeleton className="mb-6 h-6 w-24" />
          <SkeletonStack count={4} className="h-10" gap="gap-6" />
        </aside>

        {/* Résultats */}
        <div>
          <Skeleton className="mb-6 h-4 w-32" />
          <SkeletonStack count={5} className="h-28 rounded-2xl" gap="gap-4" />
        </div>
      </div>
    </div>
  );
}
