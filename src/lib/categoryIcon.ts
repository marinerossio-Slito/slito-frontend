/**
 * Conversion d'une icône de catégorie en emoji affichable.
 *
 * Historique : le back-end stocke certaines catégories avec un *nom* d'icône
 * (« hammer », « droplet »…), hérité des jeux de données initiaux
 * (`AppFixtures` / `SeedDemoCommand` côté back-end), tandis que l'interface
 * affiche ce champ tel quel en attendant un emoji (cf. le formulaire admin
 * « Icône (emoji) »). Sans conversion, on voyait le texte « hammer » s'afficher
 * à la place du marteau.
 *
 * Cette fonction fait le pont : elle traduit les noms connus en emoji, laisse
 * passer un emoji déjà saisi (cas de l'admin), et retombe sur une valeur par
 * défaut si le champ est vide.
 */

/** Correspondance nom d'icône (back-end historique) → emoji. */
const ICON_NAME_TO_EMOJI: Record<string, string> = {
  hammer: '🔨',
  droplet: '💧',
  bolt: '⚡',
  'paint-roller': '🎨',
  brick: '🧱',
  leaf: '🌿',
  key: '🔑',
  scissors: '✂️',
  'spray-can': '🧴',
  wrench: '🔧',
  screwdriver: '🪛',
  brush: '🖌️',
  plug: '🔌',
};

/**
 * Renvoie l'emoji à afficher pour une icône de catégorie.
 *
 * @param icon     Valeur du champ `category.icon` (nom d'icône, emoji, ou null).
 * @param fallback Emoji utilisé si `icon` est vide. Défaut : 🛠️.
 */
export function categoryIcon(icon?: string | null, fallback = '🛠️'): string {
  if (!icon) {
    return fallback;
  }

  return ICON_NAME_TO_EMOJI[icon] ?? icon;
}
