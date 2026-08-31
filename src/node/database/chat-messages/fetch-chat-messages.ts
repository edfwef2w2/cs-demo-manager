import type { ChatMessage } from 'csdm/common/types/chat-message';
import { chatMessageRowToChatMessage } from './chat-message-row-to-chat-message';
import type { ChatMessageTable } from './chat-message-table';
import { readMatchEvents } from 'csdm/node/store/match-io';
import { getOverriddenSteamName } from 'csdm/node/store/steam-name';

export async function fetchChatMessages(checksum: string, steamIds?: string[]): Promise<ChatMessage[]> {
  let rows = await readMatchEvents<ChatMessageTable>(checksum, 'chatMessages');
  if (Array.isArray(steamIds) && steamIds.length > 0) {
    const steamIdSet = new Set(steamIds);
    rows = rows.filter((row) => steamIdSet.has(row.sender_steam_id));
  }

  const chatMessages: ChatMessage[] = rows.map((row) => {
    return chatMessageRowToChatMessage({
      ...row,
      sender_name: getOverriddenSteamName(row.sender_steam_id, row.sender_name),
    });
  });

  return chatMessages;
}
