/**
 * Petits formatteurs partagés entre les composants/pages qui affichent des
 * données du catalogue (cartes, fiche détaillée, recherche...). Centralisés
 * ici pour garder un rendu cohérent (devises, durées) sur tout le site.
 */

const PRICE_FORMATTER = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

/**
 * Met en forme un montant en euros. Accepte aussi bien un nombre
 * (ex. `priceFrom`, calculé côté back-end) qu'une chaîne décimale telle que
 * sérialisée par Doctrine pour `Service.price` (ex. `"45.00"`).
 */
export function formatPrice(amount: number | string): string {
  const value = typeof amount === 'string' ? Number(amount) : amount;

  return PRICE_FORMATTER.format(Number.isFinite(value) ? value : 0);
}

/**
 * Met en forme une durée exprimée en minutes (ex. `Service.duration`) sous
 * une forme lisible : "30 min", "1 h", "1 h 30".
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  return rest === 0 ? `${hours} h` : `${hours} h ${rest}`;
}
