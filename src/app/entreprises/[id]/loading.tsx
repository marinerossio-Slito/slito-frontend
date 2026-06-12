import { Skeleton, SkeletonStack } from '@/components/Skeleton';

function HeroSkeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-xl bg-white/10 ${className}`} />;
}

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col bg-cream">
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="bg-forest" style={{ backgroundColor: '#334534' }}>
        <div className="h-56" />

        <div className="pb-8">
          <div className="mx-auto w-full max-w-6xl px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex items-end gap-5">
                <HeroSkeleton className="-mt-12 h-24 w-24 shrink-0 rounded-full border-4 border-white/20" />
                <div className="flex flex-col gap-2 pb-2">
                  <HeroSkeleton className="h-7 w-48" />
                  <HeroSkeleton className="h-4 w-32" />
                  <HeroSkeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="pb-2">
                <HeroSkeleton className="h-10 w-36 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contenu ──────────────────────────────────────────────────────────── */}
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-5">
          {/* À propos */}
          <div className="rounded-2xl border border-sand bg-warm-white p-7">
            <Skeleton className="mb-4 h-6 w-32" />
            <SkeletonStack count={3} className="h-4" gap="gap-2" />
          </div>

          {/* Services */}
          <div className="rounded-2xl border border-sand bg-warm-white p-7">
            <Skeleton className="mb-4 h-6 w-44" />
            <SkeletonStack count={3} className="h-20 rounded-lg" />
          </div>
        </div>

        {/* Réservation + infos pratiques */}
        <aside className="flex flex-col gap-4">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </aside>
      </div>
    </div>
  );
}
