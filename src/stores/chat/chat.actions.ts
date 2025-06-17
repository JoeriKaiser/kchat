import { produce } from "solid-js/store";
import {
	createChatDirectMessageAPI,
	deleteChatAPI,
	fetchChatsAPI,
	getChatWithMessagesAPI,
	sendMessageAPI,
	streamChatResponseAPI,
} from "./chat.api";
import type { ChatMessage } from "./chat.types";
import { chatStore, setChatStore } from "./index";

const DEFAULT_BASE_MODEL = "google/gemini-2.0-flash-lite-001";

export const chatActions = {
	setSelectedBaseModel: (model: string) => {
		setChatStore("selectedBaseModel", model);
	},

	toggleOnlineEnabled: () => {
		setChatStore("isOnlineEnabled", (prev) => !prev);
	},

	loadChats: async (token: string | null) => {
		if (!token) return;
		setChatStore("loading", true);
		setChatStore("error", null);
		try {
			const chats = await fetchChatsAPI(token);
			setChatStore("chats", Array.isArray(chats) ? chats : []);
		} catch (error) {
			setChatStore(
				"error",
				error instanceof Error ? error.message : "Failed to load chats",
			);
			setChatStore("chats", []);
		} finally {
			setChatStore("loading", false);
		}
	},

	createDirectMessage: async (
		token: string | null,
		content: string,
		baseModel?: string,
		onlineEnabled?: boolean,
	): Promise<number | null> => {
		setChatStore("loading", true);
		setChatStore("error", null);

		const modelToUse = onlineEnabled
			? `${baseModel || DEFAULT_BASE_MODEL}:online`
			: baseModel || DEFAULT_BASE_MODEL;

		try {
			const newChat = await createChatDirectMessageAPI(
				token,
				content,
				modelToUse,
			);

			setChatStore("isStreaming", true);
			setChatStore("streamingMessage", "");

			const assistantMessageId = Date.now();
			const assistantMessage: ChatMessage = {
				id: assistantMessageId,
				chat_id: newChat.id,
				role: "assistant",
				content: "",
				model: modelToUse,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			};

			const initialMessages: ChatMessage[] = [];
			if (newChat.last_message) {
				initialMessages.push(newChat.last_message);
			}
			initialMessages.push(assistantMessage);

			newChat.messages = initialMessages;
			newChat.message_count = initialMessages.length;

			setChatStore("chats", (prevChats) => {
				const currentChats = prevChats || [];
				return [newChat, ...currentChats];
			});
			setChatStore("activeChat", newChat.id);

			await new Promise((resolve) => setTimeout(resolve, 10));

			await streamChatResponseAPI(
				token,
				newChat.id,
				modelToUse,
				(chunk: string) => {
					setChatStore("streamingMessage", (prev) => prev + chunk);
					setChatStore(
						"chats",
						(c) => c.id === newChat.id,
						"messages",
						(m) => m.id === assistantMessageId,
						"content",
						(prev) => prev + chunk,
					);
				},
			);
			return newChat.id;
		} catch (error) {
			setChatStore(
				"error",
				error instanceof Error ? error.message : "Failed to create chat",
			);
			return null;
		} finally {
			setChatStore("loading", false);
			setChatStore("isStreaming", false);
			setChatStore("streamingMessage", "");
		}
	},

	setActiveChat: async (token: string | null, chatId: number | null) => {
		if (!chatId) {
			setChatStore("activeChat", null);
		} else {
			setChatStore("activeChat", chatId);
			await chatActions.loadChatMessages(token, chatId);
		}
	},

	loadChatMessages: async (token: string | null, chatId: number) => {
		setChatStore("loading", true);
		setChatStore("error", null);
		try {
			const chatWithMessages = await getChatWithMessagesAPI(token, chatId);
			setChatStore(
				"chats",
				(chat) => chat.id === chatId,
				"messages",
				chatWithMessages.messages || [],
			);
			setChatStore(
				"chats",
				(chat) => chat.id === chatId,
				produce((chat) => {
					chat.last_message = chatWithMessages.last_message;
					chat.message_count = chatWithMessages.message_count;
				}),
			);
		} catch (error) {
			setChatStore(
				"error",
				error instanceof Error ? error.message : "Failed to load messages",
			);
		} finally {
			setChatStore("loading", false);
		}
	},

	sendMessage: async (
		token: string | null,
		chatId: number,
		content: string,
		baseModel?: string,
		onlineEnabled?: boolean,
	) => {
		setChatStore("loading", true);
		setChatStore("error", null);

		const modelToUse = onlineEnabled
			? `${baseModel || DEFAULT_BASE_MODEL}:online`
			: baseModel || DEFAULT_BASE_MODEL;

		const userMessage: ChatMessage = {
			id: Date.now(),
			chat_id: chatId,
			role: "user",
			content,
			model: modelToUse,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};

		setChatStore(
			"chats",
			(c) => c.id === chatId,
			produce((chat) => {
				if (!chat.messages) chat.messages = [];
				chat.messages.push(userMessage);
				chat.last_message = userMessage;
				chat.message_count = (chat.message_count || 0) + 1;
			}),
		);

		setChatStore("isStreaming", true);
		setChatStore("streamingMessage", "");

		const assistantMessageId = Date.now() + 1;
		const assistantMessage: ChatMessage = {
			id: assistantMessageId,
			chat_id: chatId,
			role: "assistant",
			content: "",
			model: modelToUse,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};

		setChatStore(
			"chats",
			(c) => c.id === chatId,
			produce((chat) => {
				if (!chat.messages) chat.messages = [];
				chat.messages.push(assistantMessage);
			}),
		);

		try {
			await sendMessageAPI(
				token,
				chatId,
				content,
				modelToUse,
				(chunk: string) => {
					setChatStore("streamingMessage", (prev) => prev + chunk);
					setChatStore(
						"chats",
						(c) => c.id === chatId,
						"messages",
						(m) => m.id === assistantMessageId,
						"content",
						(prev) => prev + chunk,
					);
				},
			);
		} catch (error) {
			setChatStore(
				"error",
				error instanceof Error ? error.message : "Failed to send message",
			);
			setChatStore(
				"chats",
				(c) => c.id === chatId,
				produce((chat) => {
					if (chat.messages) {
						chat.messages = chat.messages.filter(
							(m) => m.id !== userMessage.id && m.id !== assistantMessageId,
						);
						chat.last_message =
							chat.messages.length > 0
								? chat.messages[chat.messages.length - 1]
								: undefined;
						chat.message_count = chat.messages.length;
					}
				}),
			);
		} finally {
			setChatStore("isStreaming", false);
			setChatStore("streamingMessage", "");
			setChatStore("loading", false);
		}
	},

	deleteChat: async (token: string | null, chatId: number) => {
		try {
			await deleteChatAPI(token, chatId);
			const currentActive = chatStore.activeChat;
			const remainingChats = chatStore.chats.filter((c) => c.id !== chatId);
			setChatStore("chats", remainingChats);

			if (currentActive === chatId) {
				const newActiveId =
					remainingChats.length > 0 ? remainingChats[0].id : null;
				setChatStore("activeChat", newActiveId);
				if (newActiveId) {
					await chatActions.loadChatMessages(token, newActiveId);
				}
			}
		} catch (error) {
			setChatStore(
				"error",
				error instanceof Error ? error.message : "Failed to delete chat",
			);
		}
	},

	setSearchTerm: (term: string) => setChatStore("searchTerm", term),
	clearError: () => setChatStore("error", null),
};
