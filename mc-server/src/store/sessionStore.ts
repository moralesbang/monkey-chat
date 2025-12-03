import type { ConversationState } from "../types";

// In-memory store for Phase 1
class SessionStore {
  private sessions: Map<string, ConversationState> = new Map();

  set(sessionId: string, state: ConversationState): void {
    this.sessions.set(sessionId, state);
  }

  get(sessionId: string): ConversationState | undefined {
    return this.sessions.get(sessionId);
  }

  delete(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  exists(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  getAll(): ConversationState[] {
    return Array.from(this.sessions.values());
  }

  clear(): void {
    this.sessions.clear();
  }
}

export const sessionStore = new SessionStore();
