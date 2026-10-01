import { beforeEach, expect, it } from "vitest";

import { loadStoredChats, STORAGE_CHATS_KEY } from "./stored-chats";

const storedState = {
  chats: [
    { id: "79991234567@mail.ru", title: "+7 999 123-45-67", createdAt: 1 },
    { id: "375291234567@mail.ru", title: "+375 29 12 34-567", createdAt: 2 },
    { id: "vasya", title: "Вася", createdAt: 3 },
  ],
  messagesByChatId: {},
  activeChatId: "79991234567@mail.ru",
};

beforeEach(() => {
  window.localStorage.clear();
});

it("re-formats previously stored phone titles to the current format", () => {
  window.localStorage.setItem(STORAGE_CHATS_KEY, JSON.stringify(storedState));
  const loaded = loadStoredChats();
  expect(loaded?.chats.map((chat) => chat.title)).toEqual([
    "+7 999 123 45 67",
    "+375 29 123 45 67",
    "Вася",
  ]);
});

it("keeps already normalized state intact", () => {
  window.localStorage.setItem(
    STORAGE_CHATS_KEY,
    JSON.stringify({
      ...storedState,
      chats: [{ id: "79991234567@mail.ru", title: "+7 999 123 45 67", createdAt: 1 }],
    }),
  );
  expect(loadStoredChats()?.chats[0].title).toBe("+7 999 123 45 67");
});

it("returns null for corrupted storage", () => {
  window.localStorage.setItem(STORAGE_CHATS_KEY, "{not json");
  expect(loadStoredChats()).toBeNull();
});

it("returns null for missing storage", () => {
  expect(loadStoredChats()).toBeNull();
});
