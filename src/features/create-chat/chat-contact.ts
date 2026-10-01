import type { ChatContact } from "@/entities/chat/model/chat-store";

import type { GreenApiClient } from "@/shared/api/green-api/green-api-client";
import type { GetContactInfoResponse } from "@/shared/api/green-api/types";

const toChatContact = (info: GetContactInfoResponse): ChatContact | undefined => {
  const name = info.contactName?.trim() || info.name?.trim() || "";
  const avatar = info.avatar?.trim() || undefined;
  if (!name && !avatar) return undefined;
  return avatar ? { name, avatar } : { name };
};

export const fetchChatContact = async (
  client: Pick<GreenApiClient, "getContactInfo">,
  chatId: string,
): Promise<ChatContact | undefined> => {
  try {
    return toChatContact(await client.getContactInfo({ chatId }));
  } catch {
    return undefined;
  }
};
