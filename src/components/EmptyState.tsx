/**
 * Message neutre affiché à la place d'une liste lorsqu'elle ne contient
 * encore aucun résultat (catégories, entreprises, recherche...).
 */
export function EmptyState({ message }: { message: string }) {
  return <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500">{message}</p>;
}
