import { formatPhone, parsePhone } from "@/shared/lib/phone";

import { StoredChatsSchema } from "./schemas";
import type { StoredChats } from "./schemas";

export type { StoredChats };

export const STORAGE_CHATS_KEY = "green-api-max-chat.chats";

// Chats created before the libphonenumber-js migration may carry titles in the
// old hand-written format (e.g. "+375 29 12 34-567"); re-format phone-looking
// titles to the canonical display format, leaving custom titles untouched.
const normalizeTitle = (title: string): string => {
  const parsed = parsePhone(title);
  return parsed.ok ? formatPhone(parsed.value) : title;
};

const normalizeStoredChats = (state: StoredChats): StoredChats => ({
  ...state,
  chats: state.chats.map((chat) => ({ ...chat, title: normalizeTitle(chat.title) })),
});

export const loadStoredChats = (): StoredChats | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_CHATS_KEY);
    if (!raw) return null;
    const result = StoredChatsSchema.safeParse(JSON.parse(raw));
    return result.success ? normalizeStoredChats(result.data) : null;
  } catch {
    return null;
  }
};

export const saveStoredChats = (state: StoredChats): void => {
  try {
    if (state.chats.length === 0) {
      window.localStorage.removeItem(STORAGE_CHATS_KEY);
      return;
    }
    window.localStorage.setItem(STORAGE_CHATS_KEY, JSON.stringify(state));
  } catch {}
};
