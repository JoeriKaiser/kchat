import type { Chat } from "./chat.types";
import { chatStore } from "./index";

export const getActiveChat = (): Chat | null => {
	return (
		chatStore.chats.find((chat) => chat.id === chatStore.activeChat) || null
	);
};

export const getFilteredChats = (): Chat[] => {
	const term = chatStore.searchTerm.toLowerCase().trim();
	if (!term) return chatStore.chats;
	return chatStore.chats.filter(
		(chat) =>
			chat.title.toLowerCase().includes(term) ||
			chat.last_message?.content.toLowerCase().includes(term),
	);
};

export const isLoading = (): boolean => chatStore.loading;
export const streamingMessage = (): string => chatStore.streamingMessage;
export const getChatModel = (): string => chatStore.model;
