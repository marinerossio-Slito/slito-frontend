/**
 * Message neutre affiché à la place d'une liste lorsqu'elle ne contient
 * encore aucun résultat (catégories, entreprises, recherche...).
 */
export function EmptyState({ message }: { message: string }) {
  return <p className="rounded-xl border border-dashed border-sand p-8 text-center text-ink-light">{message}</p>;
}
