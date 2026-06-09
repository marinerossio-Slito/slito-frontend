/**
 * Types reflétant les réponses des endpoints de messagerie
 * (cf. slito-backend/src/Controller/Api/MessagingController.php — les champs
 * correspondent exactement à `serializeConversation` et `serializeMessage`).
 *
 * Modèle : une `Conversation` relie un client et une entreprise. Elle peut
 * contenir des `Message` (créés via `POST /api/messages`). Chaque message a
 * un `sender` qui est la référence utilisateur (id + prénom/nom).
 *
 * Note sur l'identité côté client : le payload JWT ne contient que `username`
 * (= email) et `roles`, jamais l'id de l'utilisateur. On ne peut donc pas
 * identifier les propres messages de l'utilisateur via le sender.id sans
 * appel API supplémentaire — les composants affichent simplement le nom de
 * l'expéditeur à côté de chaque message.
 */

/** Référence légère à un expéditeur de message (User). */
export interface MessageSender {
  id: number;
  firstName: string | null;
  lastName: string | null;
}

/** Message individuel (`serializeMessage`). */
export interface ConversationMessage {
  id: number;
  content: string;
  /** Date d'envoi au format ATOM. */
  sentAt: string;
  isRead: boolean;
  attachment: string | null;
  sender: MessageSender | null;
}

/** Référence légère à l'entreprise dans une conversation. */
export interface ConversationBusinessRef {
  id: number;
  name: string;
}

/** Référence légère au profil client dans une conversation. */
export interface ConversationCustomerRef {
  id: number;
  firstName: string | null;
  lastName: string | null;
}

/**
 * Conversation dans la liste (`GET /api/conversations`, `withMessages=false`).
 * Contient le dernier message et le nombre de messages non lus, mais pas
 * l'intégralité des messages.
 */
export interface Conversation {
  id: number;
  business: ConversationBusinessRef | null;
  customer: ConversationCustomerRef | null;
  isBlocked: boolean;
  createdAt: string;
  lastMessage: ConversationMessage | null;
  unreadCount: number;
}

/**
 * Détail d'une conversation (`GET /api/conversations/{id}`, `withMessages=true`).
 * Étend `Conversation` avec la liste complète des messages.
 */
export interface ConversationDetail extends Conversation {
  messages: ConversationMessage[];
}

/** Corps de `POST /api/messages` (cf. `SendMessageRequest` côté back-end). */
export interface SendMessagePayload {
  /**
   * Identifiant d'une conversation existante (pour répondre à un fil).
   * Mutuellement exclusif avec `businessId`.
   */
  conversationId?: number;
  /**
   * Identifiant de l'entreprise (pour créer une nouvelle conversation côté client).
   * Mutuellement exclusif avec `conversationId`.
   */
  businessId?: number;
  /** Contenu du message (obligatoire, max 5000 caractères). */
  content: string;
  /** Pièce jointe (URL ou nom de fichier, max 255 caractères, optionnel). */
  attachment?: string;
}
