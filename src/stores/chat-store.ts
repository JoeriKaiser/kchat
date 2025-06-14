import { createStore, produce } from "solid-js/store";
import { getClientId } from "../lib/websocket";

export interface ChatMessage {
	id: number;
	chat_id: number;
	role: "user" | "assistant";
	content: string;
	tokens_used?: number;
	model?: string;
	created_at: string;
	updated_at: string;
}

export interface Chat {
	id: number;
	user_id: number;
	title: string;
	is_active: boolean;
	created_at: string;
	updated_at: string;
	message_count?: number;
	last_message?: ChatMessage;
	messages?: ChatMessage[];
}

export interface ChatState {
	chats: Chat[];
	activeChat: number | null;
	searchTerm: string;
	model: string;
	loading: boolean;
	streamingMessage: string;
	isStreaming: boolean;
	error: string | null;
	wsConnection: WebSocket | null;
	isConnected: boolean;
}

const API_BASE_URL =
	import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

const getAuthHeaders = (token: string | null): HeadersInit => {
	return {
		"Content-Type": "application/json",
		...(token && { Authorization: `Bearer ${token}` }),
	};
};

const fetchChatsAPI = async (token: string | null): Promise<Chat[]> => {
	const response = await fetch(`${API_BASE_URL}/chats`, {
		headers: getAuthHeaders(token),
	});
	if (!response.ok)
		throw new Error(`Failed to fetch chats: ${response.statusText}`);
	const data = await response.json();
	return data.data || [];
};

const createChatAPI = async (
	token: string | null,
	title: string,
): Promise<Chat> => {
	const response = await fetch(`${API_BASE_URL}/chats`, {
		method: "POST",
		headers: getAuthHeaders(token),
		body: JSON.stringify({ title }),
	});
	if (!response.ok)
		throw new Error(`Failed to create chat: ${response.statusText}`);
	const data = await response.json();
	return data.data;
};

const createChatDirectMessageAPI = async (
	token: string | null,
	content: string,
	model: string | undefined,
): Promise<Chat> => {
	const response = await fetch(`${API_BASE_URL}/messages`, {
		method: "POST",
		headers: getAuthHeaders(token),
		body: JSON.stringify({ content, model, client_id: getClientId() }),
	});
	if (!response.ok)
		throw new Error(`Failed to create chat: ${response.statusText}`);
	const data = await response.json();
	return data.data;
};

const streamChatResponseAPI = async (
	token: string | null,
	chatId: number,
	model: string,
	onChunk?: (chunk: string) => void,
): Promise<void> => {
	const response = await fetch(`${API_BASE_URL}/chats/${chatId}/stream`, {
		method: "POST",
		headers: getAuthHeaders(token),
		body: JSON.stringify({ model }),
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => null);
		const errorMessage = errorData?.error || response.statusText;
		throw new Error(`Failed to stream response: ${errorMessage}`);
	}

	if (response.body && onChunk) {
		const reader = response.body.getReader();
		const decoder = new TextDecoder();
		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				const chunk = decoder.decode(value, { stream: true });
				onChunk(chunk);
			}
		} catch (error) {
			console.error("Streaming error:", error);
			throw error;
		} finally {
			reader.releaseLock();
			setChatStore("isStreaming", false);
			setChatStore("loading", false);
		}
	}
};

const getChatWithMessagesAPI = async (
	token: string | null,
	chatId: number,
): Promise<Chat> => {
	const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
		headers: getAuthHeaders(token),
	});
	if (!response.ok)
		throw new Error(`Failed to fetch chat: ${response.statusText}`);
	const data = await response.json();
	return data.data;
};

const deleteChatAPI = async (
	token: string | null,
	chatId: number,
): Promise<void> => {
	const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
		method: "DELETE",
		headers: getAuthHeaders(token),
	});
	if (!response.ok)
		throw new Error(`Failed to delete chat: ${response.statusText}`);
};

const sendMessageAPI = async (
	token: string | null,
	chatId: number,
	content: string,
	model: string,
	onChunk?: (chunk: string) => void,
): Promise<void> => {
	const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
		method: "POST",
		headers: getAuthHeaders(token),
		body: JSON.stringify({ content, role: "user", model }),
	});

	if (!response.ok) {
		throw new Error(`Failed to send message: ${response.statusText}`);
	}

	if (response.body && onChunk) {
		const reader = response.body.getReader();
		const decoder = new TextDecoder();
		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				const chunk = decoder.decode(value, { stream: true });
				onChunk(chunk);
			}
		} catch (error) {
			console.error("Streaming error:", error);
			throw error;
		}
	}
};

const initialState: ChatState = {
	chats: [],
	activeChat: null,
	searchTerm: "",
	model: "google/gemini-2.0-flash-lite-001",
	loading: false,
	streamingMessage: "",
	isStreaming: false,
	error: null,
	wsConnection: null,
	isConnected: false,
};

export const [chatStore, setChatStore] = createStore<ChatState>(initialState);

export const chatActions = {
	loadChats: async (token: string | null) => {
		if (!token) return;
		setChatStore("loading", true);
		setChatStore("error", null);
		try {
			const chats = await fetchChatsAPI(token);
			setChatStore("chats", chats);
		} catch (error) {
			setChatStore(
				"error",
				error instanceof Error ? error.message : "Failed to load chats",
			);
		} finally {
			setChatStore("loading", false);
		}
	},

	createDirectMessage: async (
		token: string | null,
		content: string,
		model?: string,
	) => {
		setChatStore("loading", true);
		setChatStore("error", null);
		try {
			const newChat = await createChatDirectMessageAPI(token, content, model);

			setChatStore(
				produce((state) => {
					state.chats = [newChat, ...state.chats];
					state.activeChat = newChat.id;
				}),
			);

			setChatStore("isStreaming", true);
			setChatStore("streamingMessage", "");

			const assistantMessageId = Date.now();
			const assistantMessage: ChatMessage = {
				id: assistantMessageId,
				chat_id: newChat.id,
				role: "assistant",
				content: "",
				model: model || "google/gemini-2.0-flash-lite-001",
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			};

			const defaultModel = "google/gemini-2.0-flash-lite-001";
			const modelToUse = model || defaultModel;

			setChatStore(
				"chats",
				(c) => c.id === newChat.id,
				"messages",
				(msgs) => [...(msgs || []), assistantMessage],
			);

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
		model?: string,
	) => {
		const messageModel = model || "google/gemini-2.0-flash-lite-001";
		const userMessage: ChatMessage = {
			id: Date.now(),
			chat_id: chatId,
			role: "user",
			content,
			model: messageModel,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};
		setChatStore(
			"chats",
			(c) => c.id === chatId,
			"messages",
			(msgs) => [...(msgs || []), userMessage],
		);

		setChatStore("isStreaming", true);
		setChatStore("streamingMessage", "");
		setChatStore("error", null);

		const assistantMessageId = Date.now() + 1;
		const assistantMessage: ChatMessage = {
			id: assistantMessageId,
			chat_id: chatId,
			role: "assistant",
			content: "",
			model: messageModel,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};
		setChatStore(
			"chats",
			(c) => c.id === chatId,
			"messages",
			(msgs) => [...(msgs || []), assistantMessage],
		);

		try {
			setChatStore(
				"chats",
				(c) => c.id === chatId,
				"messages",
				(m) => m.id === assistantMessageId,
				assistantMessage,
			);

			await sendMessageAPI(
				token,
				chatId,
				content,
				messageModel,
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
				"messages",
				(msgs) => msgs?.filter((m) => m.id !== assistantMessageId),
			);
		} finally {
			setChatStore("isStreaming", false);
			setChatStore("streamingMessage", "");
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

	setModel: (model: string) => setChatStore("model", model),
	getModel: () => chatStore.model,

	setSearchTerm: (term: string) => setChatStore("searchTerm", term),
	clearError: () => setChatStore("error", null),
	resetStore: () => setChatStore(initialState),
};

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

interface WebSocketMessage<T = unknown> {
	type: string;
	data: T;
	client_id?: string;
}

export const handleWebSocketMessage = (message: WebSocketMessage) => {
	if (message.type !== "client_connected") {
		console.log(`WebSocket sync message received: ${message.type}`, message);
	}

	switch (message.type) {
		case "chat_created": {
			console.log("Syncing new chat from another client:", message);
			const newChatData = message.data as Chat;
			setChatStore(
				produce((state) => {
					const existingChat = state.chats.find((c) => c.id === newChatData.id);
					if (!existingChat) {
						state.chats = [newChatData, ...state.chats];
					} else {
						Object.assign(existingChat, newChatData);
					}
				}),
			);
			break;
		}

		case "message_added": {
			console.log("Syncing new message from another client:", message);
			const newMessageData = message.data as ChatMessage;
			setChatStore(
				produce((state) => {
					const chatIndex = state.chats.findIndex(
						(c) => c.id === newMessageData.chat_id,
					);
					if (chatIndex !== -1) {
						const chat = state.chats[chatIndex];
						if (!chat.messages) {
							chat.messages = [];
						}
						const existingMessage = chat.messages.find(
							(m) => m.id === newMessageData.id,
						);
						if (!existingMessage) {
							chat.messages.push(newMessageData);
							chat.last_message = newMessageData;
							chat.message_count = (chat.message_count || 0) + 1;
						} else {
							Object.assign(existingMessage, newMessageData);
						}
					}
				}),
			);
			break;
		}

		// TODO:
		// case "chat_deleted":
		//     // Handle deletion of a chat by another client
		//     break;
		// case "chat_updated":
		//     // Handle updates to chat properties (e.g., title change)
		//     break;
		default:
			console.warn(
				`Unhandled WebSocket message type: ${message.type}`,
				message,
			);
			break;
	}
};
