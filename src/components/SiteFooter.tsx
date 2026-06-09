import Link from 'next/link';

const FOOTER_COLS = [
  {
    heading: 'Explorer',
    links: [
      { label: 'Trouver un artisan', href: '/recherche' },
      { label: 'Toutes les catégories', href: '/recherche' },
    ],
  },
  {
    heading: 'Artisans',
    links: [
      { label: 'Inscrire mon entreprise', href: '/inscription' },
      { label: 'Espace artisan', href: '/artisan' },
    ],
  },
  {
    heading: 'Compte',
    links: [
      { label: 'Se connecter', href: '/connexion' },
      { label: 'Créer un compte', href: '/inscription' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-ink text-white/70">
      <div className="mx-auto max-w-6xl px-8">
        {/* Grille 4 colonnes */}
        <div className="grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
          {/* Colonne marque */}
          <div>
            <span className="font-serif text-2xl font-bold leading-none">
              <span className="text-terra-light">Sli</span>
              <span className="text-white/80">to</span>
            </span>
            <p className="mt-3 text-sm leading-relaxed text-white/55">
              La plateforme de réservation d&apos;artisans certifiés. Trouvez le bon professionnel
              près de chez vous.
            </p>
          </div>

          {/* Colonnes liens */}
          {FOOTER_COLS.map((col) => (
            <div key={col.heading}>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">
                {col.heading}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/65 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Barre de copyright */}
        <div className="border-t border-white/10 py-6 text-center text-xs text-white/40">
          © {new Date().getFullYear()} Slito — Projet pédagogique — interface consommant l&apos;API slito-backend.
        </div>
      </div>
    </footer>
  );
}
