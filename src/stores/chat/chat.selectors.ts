import { createMemo } from "solid-js";
import type { Chat } from "./chat.types";
import { chatStore } from "./index";

const getActiveChat = createMemo((): Chat | null => {
	if (chatStore.activeChat) {
		return (
			chatStore.chats.find((chat) => chat.id === chatStore.activeChat) || null
		);
	}
	return null;
});

const getFilteredChats = createMemo((): Chat[] => {
	const term = chatStore.searchTerm.toLowerCase().trim();
	if (!term) return chatStore.chats;
	return chatStore.chats.filter(
		(chat) =>
			chat.title.toLowerCase().includes(term) ||
			// biome-ignore lint/complexity/useOptionalChain: <explanation>
			(chat.last_message?.content &&
				chat.last_message.content.toLowerCase().includes(term)),
	);
});

const isLoading = createMemo((): boolean => chatStore.loading);

const streamingMessage = createMemo((): string => chatStore.streamingMessage);

const getSelectedBaseModel = createMemo(
	(): string => chatStore.selectedBaseModel,
);

const isOnlineEnabled = createMemo((): boolean => chatStore.isOnlineEnabled);

const getEffectiveModel = createMemo((): string =>
	chatStore.isOnlineEnabled
		? `${chatStore.selectedBaseModel}:online`
		: chatStore.selectedBaseModel,
);

const getChats = createMemo((): Chat[] => chatStore.chats);

const getError = createMemo((): string | null => chatStore.error);

export const chatSelectors = {
	getActiveChat,
	getFilteredChats,
	isLoading,
	streamingMessage,
	getSelectedBaseModel,
	isOnlineEnabled,
	getEffectiveModel,
	getChats,
	getError,
};
