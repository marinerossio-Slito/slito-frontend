/**
 * Accès aux endpoints de messagerie (cf. MessagingController côté back-end).
 * Toutes ces fonctions nécessitent un jeton JWT (`token`).
 */

import { apiFetch } from '@/lib/api';
import type { Conversation, ConversationDetail, ConversationMessage, SendMessagePayload } from '@/types/messaging';

/**
 * Liste les conversations de l'utilisateur courant (`GET /api/conversations`).
 * Renvoie les conversations sans leurs messages, triées par `createdAt` desc.
 * Agrège les conversations côté client et côté artisan si l'utilisateur
 * possède les deux profils.
 */
export function fetchConversations(token: string): Promise<Conversation[]> {
  return apiFetch<Conversation[]>('/api/conversations', { token });
}

/**
 * Charge le détail d'une conversation avec tous ses messages
 * (`GET /api/conversations/{id}`). Accessible uniquement aux participants.
 */
export function fetchConversation(token: string, id: number): Promise<ConversationDetail> {
  return apiFetch<ConversationDetail>(`/api/conversations/${id}`, { token });
}

/**
 * Envoie un message (`POST /api/messages`).
 * - Passer `conversationId` pour répondre dans un fil existant.
 * - Passer `businessId` pour qu'un client démarre une nouvelle conversation
 *   avec une entreprise (la conversation est créée côté serveur si elle n'existe pas).
 * Renvoie le message créé.
 */
export function sendMessage(token: string, payload: SendMessagePayload): Promise<ConversationMessage> {
  return apiFetch<ConversationMessage>('/api/messages', {
    method: 'POST',
    token,
    body: payload,
  });
}
