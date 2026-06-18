'use client';

/**
 * Champ « métier » de la barre de recherche, avec autocomplétion.
 *
 * Pourquoi ce composant : le back-end filtre par *slug* de catégorie
 * (`c.slug = :slug`, cf. BusinessRepository::search), pas par texte libre. Un
 * simple champ texte nommé `category` envoyait donc ce que tapait l'internaute
 * (« plombier ») qui ne correspondait à aucun slug → aucun filtre appliqué.
 *
 * Ici, l'internaute voit et tape des noms de métiers ; on lui propose les
 * catégories correspondantes ; et c'est le *slug* qui est soumis via un champ
 * caché `name="category"`. Taper « plo » propose « Plomberie » et soumet
 * `category=plomberie`.
 *
 * Le composant reste utilisable au clavier (flèches, Entrée, Échap) et à la
 * souris, et se rabat sur une résolution « au mieux » si l'internaute soumet
 * sans choisir explicitement (correspondance exacte, ou préfixe unique).
 */

import { useId, useMemo, useRef, useState } from 'react';

export interface CategoryOption {
  name: string;
  slug: string;
}

/** Minuscule + sans accents, pour des comparaisons tolérantes. */
function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

/**
 * Déduit le slug à soumettre à partir du texte saisi :
 *   1. correspondance exacte (nom ou slug) ;
 *   2. sinon, si un seul métier *contient* le texte, on le retient ;
 *   3. sinon, pas de filtre (chaîne vide).
 */
function resolveSlug(query: string, categories: CategoryOption[]): string {
  const q = normalize(query);
  if (q === '') return '';

  const exact = categories.find((c) => normalize(c.name) === q || normalize(c.slug) === q);
  if (exact) return exact.slug;

  const matches = categories.filter((c) => normalize(c.name).includes(q));
  return matches.length === 1 ? matches[0].slug : '';
}

export function CategoryAutocomplete({
  categories,
  defaultSlug,
  placeholder,
  inputClassName,
  wrapperClassName,
}: {
  categories: CategoryOption[];
  /** Slug pré-sélectionné (ex. au rechargement de la page résultats). */
  defaultSlug?: string;
  placeholder?: string;
  inputClassName?: string;
  /** Classe du conteneur (positionnement dans la barre + `relative`). */
  wrapperClassName?: string;
}) {
  const initialName = defaultSlug
    ? (categories.find((c) => c.slug === defaultSlug)?.name ?? '')
    : '';

  const [query, setQuery] = useState(initialName);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const listboxId = useId();
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const suggestions = useMemo(() => {
    const q = normalize(query);
    const pool = q === '' ? categories : categories.filter((c) => normalize(c.name).includes(q));
    return pool.slice(0, 6);
  }, [query, categories]);

  const submittedSlug = resolveSlug(query, categories);

  function choose(option: CategoryOption) {
    setQuery(option.name);
    setOpen(false);
    setHighlight(-1);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      setOpen(true);
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (event.key === 'Enter') {
      // Si une suggestion est surlignée, on la choisit (sans soumettre le form).
      if (open && highlight >= 0 && highlight < suggestions.length) {
        event.preventDefault();
        choose(suggestions[highlight]);
      }
    } else if (event.key === 'Escape') {
      setOpen(false);
      setHighlight(-1);
    }
  }

  return (
    <div className={wrapperClassName}>
      {/* Slug réellement soumis avec le formulaire. */}
      <input type="hidden" name="category" value={submittedSlug} />

      <input
        type="text"
        role="combobox"
        aria-label="Métier recherché"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        autoComplete="off"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setHighlight(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          // Délai pour laisser un éventuel clic sur une suggestion se produire.
          blurTimer.current = setTimeout(() => setOpen(false), 120);
        }}
        onKeyDown={onKeyDown}
        className={inputClassName}
      />

      {open && suggestions.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-auto rounded-xl border border-sand bg-warm-white py-1 text-left shadow-[0_8px_30px_rgba(26,21,16,0.15)]"
          style={{ backgroundColor: '#fdfaf3' }}
        >
          {suggestions.map((option, index) => (
            <li key={option.slug} role="option" aria-selected={index === highlight}>
              <button
                type="button"
                // onMouseDown se déclenche avant le blur de l'input → évite que
                // le dropdown se ferme avant la prise en compte du clic.
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (blurTimer.current) clearTimeout(blurTimer.current);
                  choose(option);
                }}
                onMouseEnter={() => setHighlight(index)}
                className={`block w-full px-4 py-2 text-left text-sm transition ${
                  index === highlight ? 'bg-sand text-ink' : 'text-ink-mid hover:bg-cream'
                }`}
              >
                {option.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
