'use client';

/**
 * Interface de messagerie — conversations + fil de messages + réponse.
 *
 * Fonctionnalités :
 * - Liste des conversations (gauche sur desktop, plein écran sur mobile si
 *   aucune conversation sélectionnée).
 * - Détail d'une conversation avec fil de messages et formulaire de réponse
 *   (droite sur desktop, plein écran sur mobile si une conversation est ouverte).
 * - Démarrage d'une nouvelle conversation avec une entreprise donnée (via
 *   `initialBusinessId`, passé depuis la fiche entreprise via URL param).
 *
 * Architecture :
 * - Toutes les données sont chargées côté client (le jeton JWT est nécessaire
 *   et n'est disponible que dans le navigateur).
 * - Les resets d'état de chargement (`detail → null`, `detailError → null`)
 *   sont effectués dans les gestionnaires d'événements (onClick, reply…)
 *   plutôt que dans les corps d'effets, ce qui évite d'enfreindre la règle
 *   `react-hooks/set-state-in-effect` et les re-rendus en cascade.
 */

import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';

import { EmptyState } from '@/components/EmptyState';
import { Skeleton, SkeletonStack } from '@/components/Skeleton';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { fetchConversation, fetchConversations, sendMessage } from '@/lib/messaging';
import type {
  Conversation,
  ConversationBusinessRef,
  ConversationCustomerRef,
  ConversationDetail,
} from '@/types/messaging';

/**
 * Nom de l'interlocuteur à afficher comme titre d'une conversation, selon le
 * point de vue : un artisan voit le nom de son client, un client voit le nom
 * de l'entreprise.
 */
function counterpartName(
  conv: { business: ConversationBusinessRef | null; customer: ConversationCustomerRef | null },
  viewerIsArtisan: boolean,
): string {
  if (viewerIsArtisan) {
    const name = `${conv.customer?.firstName ?? ''} ${conv.customer?.lastName ?? ''}`.trim();
    return name || 'Client';
  }

  return conv.business?.name ?? 'Conversation';
}

interface MessagingHubProps {
  /**
   * `businessId` lu depuis `?businessId=` par la page serveur parente.
   * Quand présent, le hub tente de pré-sélectionner ou d'initier une
   * conversation avec cette entreprise.
   */
  initialBusinessId?: number;
  /**
   * `businessName` lu depuis `?businessName=` (optionnel, pour afficher un
   * titre avant que la liste soit chargée).
   */
  initialBusinessName?: string;
}

export function MessagingHub({ initialBusinessId, initialBusinessName }: MessagingHubProps) {
  const { token, hasRole } = useAuth();
  const { showToast } = useToast();
  const viewerIsArtisan = hasRole(['ROLE_ARTISAN']);

  // Liste des conversations (null = en cours de chargement)
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  // Conversation sélectionnée + son détail
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<ConversationDetail | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Réponse dans une conversation existante
  const [replyContent, setReplyContent] = useState('');
  const [replySending, setReplySending] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  // Nouvelle conversation (pas encore de fil pour ce businessId)
  const [newConvContent, setNewConvContent] = useState('');
  const [newConvSending, setNewConvSending] = useState(false);
  const [newConvError, setNewConvError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // === Chargement de la liste ===
  // setState n'est appelé qu'en callback Promise (asynchrone) → pas de violation.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    fetchConversations(token)
      .then((data) => {
        if (cancelled) return;
        setConversations(data);
        if (initialBusinessId) {
          const match = data.find((c) => c.business?.id === initialBusinessId);
          if (match) {
            // Sélectionner la conversation existante avec ce business
            setSelectedId(match.id);
            // `detail` est déjà null (état initial) → pas besoin de le remettre à null
          }
        }
      })
      .catch((err) => {
        if (!cancelled) setListError(err instanceof ApiError ? err.message : 'Chargement échoué.');
      });

    return () => {
      cancelled = true;
    };
  }, [token, initialBusinessId]);

  // === Chargement du détail ===
  // Le reset de `detail` / `detailError` est effectué dans `selectConversation`
  // (gestionnaire d'événement) AVANT que cet effet ne tourne, de sorte que le
  // corps de cet effet n'appelle aucun setState synchrone.
  useEffect(() => {
    if (!token || selectedId === null) return;
    // Si le détail actuel correspond déjà à la conversation sélectionnée, rien à faire
    if (detail !== null && detail.id === selectedId) return;

    let cancelled = false;

    fetchConversation(token, selectedId)
      .then((data) => {
        if (cancelled) return;
        setDetail(data);
        // Défiler vers le dernier message
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      })
      .catch((err) => {
        if (!cancelled) setDetailError(err instanceof ApiError ? err.message : 'Chargement de la conversation échoué.');
      });

    return () => {
      cancelled = true;
    };
  }, [token, selectedId, detail]);

  // État de chargement du détail dérivé (pas de state supplémentaire)
  const detailLoading =
    selectedId !== null &&
    detail === null &&
    detailError === null &&
    conversations !== null;

  // === Sélection d'une conversation ===
  // Les resets d'état sont ici, dans un gestionnaire d'événement.
  function selectConversation(id: number) {
    setDetail(null);      // reset avant le prochain effet de chargement
    setDetailError(null);
    setReplyContent('');
    setReplyError(null);
    setSelectedId(id);
  }

  // === Réponse dans une conversation existante ===
  async function handleReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || selectedId === null || !replyContent.trim()) return;

    setReplySending(true);
    setReplyError(null);

    try {
      await sendMessage(token, { conversationId: selectedId, content: replyContent.trim() });
      setReplyContent('');
      const updated = await fetchConversation(token, selectedId);
      setDetail(updated);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "L'envoi a échoué. Réessayez.";
      setReplyError(message);
      showToast(message, 'error');
    } finally {
      setReplySending(false);
    }
  }

  // === Démarrage d'une nouvelle conversation ===
  async function handleNewConversation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !initialBusinessId || !newConvContent.trim()) return;

    setNewConvSending(true);
    setNewConvError(null);

    try {
      await sendMessage(token, { businessId: initialBusinessId, content: newConvContent.trim() });
      setNewConvContent('');
      const updated = await fetchConversations(token);
      setConversations(updated);
      const match = updated.find((c) => c.business?.id === initialBusinessId);
      if (match) selectConversation(match.id);
      showToast('Message envoyé !', 'success');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "L'envoi a échoué. Réessayez.";
      setNewConvError(message);
      showToast(message, 'error');
    } finally {
      setNewConvSending(false);
    }
  }

  const isNewConversation =
    initialBusinessId !== undefined &&
    conversations !== null &&
    !conversations.some((c) => c.business?.id === initialBusinessId) &&
    selectedId === null;

  const showDetail = selectedId !== null || isNewConversation;

  return (
    <div className="flex flex-1 overflow-hidden rounded-2xl border border-sand bg-warm-white">
      {/* Panneau gauche : liste des conversations */}
      <aside
        className={`flex flex-col border-r border-sand-light ${showDetail ? 'hidden lg:flex lg:w-80 lg:shrink-0' : 'flex w-full'}`}
      >
        <div className="border-b border-sand-light px-4 py-3">
          <h2 className="text-sm font-semibold text-ink">Messages</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {listError && <p className="p-4 text-sm text-red-600">{listError}</p>}

          {conversations === null && !listError && (
            <div className="p-3">
              <SkeletonStack count={3} className="h-16" gap="gap-2" />
            </div>
          )}

          {conversations !== null && conversations.length === 0 && !isNewConversation && (
            <div className="p-4">
              <EmptyState
                message={
                  viewerIsArtisan
                    ? 'Pas encore de conversation. Vos échanges avec vos clients apparaîtront ici.'
                    : 'Pas encore de conversation. Visitez une fiche artisan pour en démarrer une !'
                }
              />
            </div>
          )}

          {conversations !== null && conversations.length > 0 && (
            <ul>
              {conversations.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  viewerIsArtisan={viewerIsArtisan}
                  isSelected={selectedId === conv.id}
                  onClick={() => selectConversation(conv.id)}
                />
              ))}
            </ul>
          )}

          {/* Entrée dans la liste pour la nouvelle conversation en cours */}
          {isNewConversation && (
            <div className="border-l-2 border-terra bg-sand-light px-4 py-3 text-sm">
              <p className="font-medium text-ink">Nouvelle conversation</p>
              <p className="truncate text-ink-light">
                {initialBusinessName ?? `Entreprise #${initialBusinessId}`}
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Panneau droit : détail ou nouvelle conversation */}
      <main className={`flex min-h-0 flex-1 flex-col ${showDetail ? 'flex' : 'hidden lg:flex'}`}>
        {/* Bouton retour (mobile) */}
        {showDetail && (
          <div className="flex items-center gap-2 border-b border-sand-light px-4 py-3 lg:hidden">
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="text-sm font-medium text-terra"
            >
              ← Retour
            </button>
          </div>
        )}

        {/* Nouvelle conversation */}
        {isNewConversation && (
          <NewConversationPanel
            businessId={initialBusinessId!}
            businessName={initialBusinessName}
            content={newConvContent}
            onContentChange={setNewConvContent}
            onSubmit={handleNewConversation}
            isSending={newConvSending}
            error={newConvError}
          />
        )}

        {/* Détail d'une conversation existante */}
        {selectedId !== null && (
          <>
            {detailLoading && (
              <div className="flex flex-1 flex-col gap-4 p-4">
                <Skeleton className="h-5 w-40" />
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-12 w-2/3 rounded-tl-none" />
                  <Skeleton className="ml-auto h-12 w-1/2 rounded-tl-none" />
                  <Skeleton className="h-12 w-3/5 rounded-tl-none" />
                </div>
              </div>
            )}

            {detailError && (
              <div className="flex flex-1 items-center justify-center p-8">
                <p className="text-sm text-red-600">{detailError}</p>
              </div>
            )}

            {detail !== null && !detailLoading && (
              <>
                {/* En-tête */}
                <div className="border-b border-sand-light px-5 py-4">
                  <p className="font-semibold text-ink">
                    {counterpartName(detail, viewerIsArtisan)}
                  </p>
                  {detail.isBlocked && (
                    <span className="mt-1 inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
                      Conversation bloquée
                    </span>
                  )}
                </div>

                {/* Fil de messages */}
                <div className="flex-1 overflow-y-auto p-4">
                  {detail.messages.length === 0 ? (
                    <p className="text-center text-sm text-ink-light">
                      Aucun message dans cette conversation.
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-4">
                      {detail.messages.map((msg) => (
                        <li key={msg.id} className="flex flex-col gap-0.5">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs font-semibold text-ink-mid">
                              {msg.sender
                                ? `${msg.sender.firstName ?? ''} ${msg.sender.lastName ?? ''}`.trim() ||
                                  'Inconnu'
                                : 'Inconnu'}
                            </span>
                            <span className="text-xs text-ink-light">
                              {formatDateTime(msg.sentAt)}
                            </span>
                            {!msg.isRead && (
                              <span className="rounded-full bg-terra px-1.5 py-0.5 text-[10px] font-semibold text-white">
                                Nouveau
                              </span>
                            )}
                          </div>
                          <p className="whitespace-pre-wrap rounded-xl rounded-tl-none bg-cream px-3 py-2 text-sm text-ink">
                            {msg.content}
                          </p>
                          {msg.attachment && (
                            <p className="text-xs text-ink-light">📎 {msg.attachment}</p>
                          )}
                        </li>
                      ))}
                      <div ref={messagesEndRef} />
                    </ul>
                  )}
                </div>

                {/* Formulaire de réponse */}
                <div className="border-t border-sand-light p-4">
                  {detail.isBlocked ? (
                    <p className="text-center text-sm text-ink-light">
                      Cette conversation est bloquée : vous ne pouvez plus envoyer de messages.
                    </p>
                  ) : (
                    <form onSubmit={handleReply} className="flex flex-col gap-2">
                      {replyError && <p className="text-xs text-red-600">{replyError}</p>}
                      <div className="flex gap-2">
                        <textarea
                          rows={2}
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Écrivez votre message…"
                          aria-label="Votre message"
                          maxLength={5000}
                          className="flex-1 resize-none rounded-xl border border-sand bg-warm-white px-3 py-2 text-sm text-ink transition focus:border-terra focus:outline-none focus:ring-2 focus:ring-terra/20"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                              e.currentTarget.form?.requestSubmit();
                            }
                          }}
                        />
                        <button
                          type="submit"
                          disabled={replySending || !replyContent.trim()}
                          className="self-end rounded-full bg-terra px-4 py-2 text-sm font-semibold text-white transition hover:bg-terra-dark disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {replySending ? '…' : 'Envoyer'}
                        </button>
                      </div>
                      <p className="text-right text-xs text-ink-light">Ctrl+Entrée pour envoyer</p>
                    </form>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* Aucune conversation sélectionnée — desktop only */}
        {!showDetail && (
          <div className="hidden flex-1 items-center justify-center lg:flex">
            <p className="text-sm text-ink-light">Sélectionnez une conversation à gauche.</p>
          </div>
        )}
      </main>
    </div>
  );
}

function ConversationItem({
  conversation,
  viewerIsArtisan,
  isSelected,
  onClick,
}: {
  conversation: Conversation;
  viewerIsArtisan: boolean;
  isSelected: boolean;
  onClick: () => void;
}) {
  const title = counterpartName(conversation, viewerIsArtisan);
  const subtitle = conversation.lastMessage?.content ?? 'Pas encore de message';

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={`flex w-full flex-col gap-0.5 px-4 py-3 text-left transition ${
          isSelected ? 'border-l-2 border-terra bg-sand-light' : 'hover:bg-cream'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold text-ink">{title}</span>
          {conversation.unreadCount > 0 && (
            <span className="shrink-0 rounded-full bg-terra px-2 py-0.5 text-[11px] font-semibold text-white">
              {conversation.unreadCount}
            </span>
          )}
        </div>
        <span className="truncate text-xs text-ink-light">{subtitle}</span>
        <span className="text-[11px] text-ink-light">{formatDateTime(conversation.createdAt)}</span>
      </button>
    </li>
  );
}

function NewConversationPanel({
  businessId,
  businessName,
  content,
  onContentChange,
  onSubmit,
  isSending,
  error,
}: {
  businessId: number;
  businessName?: string;
  content: string;
  onContentChange: (v: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isSending: boolean;
  error: string | null;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-sand-light px-5 py-4">
        <p className="font-semibold text-ink">Nouvelle conversation</p>
        <p className="text-sm text-ink-light">
          {businessName ? (
            <>
              Votre premier message à{' '}
              <span className="font-medium text-ink-mid">{businessName}</span>
            </>
          ) : (
            <>Premier message à l&apos;entreprise #{businessId}</>
          )}
        </p>
      </div>

      <div className="flex-1" />

      <div className="border-t border-sand-light p-4">
        <form onSubmit={onSubmit} className="flex flex-col gap-2">
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <textarea
              rows={3}
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="Écrivez votre premier message…"
              aria-label="Votre message"
              maxLength={5000}
              autoFocus
              className="flex-1 resize-none rounded-xl border border-sand bg-warm-white px-3 py-2 text-sm text-ink transition focus:border-terra focus:outline-none focus:ring-2 focus:ring-terra/20"
            />
            <button
              type="submit"
              disabled={isSending || !content.trim()}
              className="self-end rounded-full bg-terra px-4 py-2 text-sm font-semibold text-white transition hover:bg-terra-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSending ? '…' : 'Envoyer'}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-ink-light">
              Votre message sera transmis à l&apos;artisan.
            </p>
            <Link
              href={`/entreprises/${businessId}`}
              className="text-xs text-terra hover:text-terra-dark"
            >
              ← Retour à la fiche
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
