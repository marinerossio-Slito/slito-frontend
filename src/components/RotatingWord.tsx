'use client';

/**
 * Mot qui s'écrit puis s'efface en boucle, à la manière d'une machine à écrire,
 * en passant d'une entrée à la suivante (ex. « l'artisan » → « le plombier » →
 * « l'électricien » …). Utilisé dans le titre de la page d'accueil.
 *
 * Accessibilité : le titre porte une version statique lisible par les lecteurs
 * d'écran (cf. page d'accueil) ; ce composant est purement décoratif et marqué
 * aria-hidden par son parent. L'animation est désactivée si l'utilisateur a
 * demandé une réduction des animations (prefers-reduced-motion).
 */

import { useEffect, useState } from 'react';

export function RotatingWord({
  words,
  className,
}: {
  words: readonly string[];
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  // On démarre sur le premier mot entièrement écrit : le rendu serveur affiche
  // donc un libellé complet (pas de flash vide avant l'hydratation).
  const [sub, setSub] = useState(words[0] ?? '');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Respect de prefers-reduced-motion : on laisse le mot figé.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const full = words[index % words.length];
    const atFullWord = !deleting && sub === full;
    const atEmptyWord = deleting && sub === '';

    // Pause longue quand le mot est complet, brève quand il est effacé, sinon
    // cadence de frappe/effacement. Toutes les mises à jour d'état se font dans
    // le callback (asynchrone) pour ne pas enchaîner des rendus synchrones.
    const delay = atFullWord ? 1800 : atEmptyWord ? 250 : deleting ? 45 : 85;

    const timer = setTimeout(() => {
      if (atFullWord) {
        setDeleting(true);
      } else if (atEmptyWord) {
        setDeleting(false);
        setIndex((current) => (current + 1) % words.length);
      } else {
        setSub((current) =>
          deleting ? full.slice(0, current.length - 1) : full.slice(0, current.length + 1),
        );
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [sub, deleting, index, words]);

  return (
    <span className={className}>
      {sub}
      <span className="ml-0.5 inline-block animate-pulse font-light" aria-hidden>
        |
      </span>
    </span>
  );
}
