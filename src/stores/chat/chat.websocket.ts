import { produce } from "solid-js/store";
import type { Chat, ChatMessage } from "./chat.types";
import { setChatStore } from "./index";

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
			const newChatData = message.data as Chat;
			setChatStore(
				produce((state) => {
					const existingChat = state.chats.find((c) => c.id === newChatData.id);
					if (!existingChat) {
						state.chats = [newChatData, ...state.chats];
					} else {
						Object.assign(existingChat, newChatData);
					}
					if (newChatData.messages) {
						const targetChat = state.chats.find((c) => c.id === newChatData.id);
						if (targetChat) {
							if (!targetChat.messages) {
								targetChat.messages = [];
							}
							for (const newMessage of newChatData.messages) {
								const existingMessage = targetChat.messages?.find(
									(m) => m.id === newMessage.id,
								);
								if (!existingMessage) {
									targetChat.messages?.push(newMessage);
								} else {
									Object.assign(existingMessage, newMessage);
								}
							}
						}
					}
				}),
			);
			break;
		}

		case "message_created": {
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
							if (
								!chat.last_message ||
								new Date(newMessageData.created_at) >
									new Date(chat.last_message.created_at)
							) {
								chat.last_message = newMessageData;
							}
						}
					}
				}),
			);
			break;
		}

		case "chat_deleted": {
			const { id: deletedChatId } = message.data as { id: number };
			setChatStore(
				produce((state) => {
					state.chats = state.chats.filter((c) => c.id !== deletedChatId);
					if (state.activeChat === deletedChatId) {
						state.activeChat =
							state.chats.length > 0 ? state.chats[0].id : null;
					}
				}),
			);
			break;
		}

		case "chat_updated": {
			const updatedChatData = message.data as Chat;
			setChatStore(
				produce((state) => {
					const chatIndex = state.chats.findIndex(
						(c) => c.id === updatedChatData.id,
					);
					if (chatIndex !== -1) {
						Object.assign(state.chats[chatIndex], updatedChatData);
					}
				}),
			);
			break;
		}

		case "message_updated": {
			const updatedMessageData = message.data as ChatMessage;
			setChatStore(
				produce((state) => {
					const chat = state.chats.find(
						(c) => c.id === updatedMessageData.chat_id,
					);
					if (chat?.messages) {
						const messageIndex = chat.messages.findIndex(
							(m) => m.id === updatedMessageData.id,
						);
						if (messageIndex !== -1) {
							Object.assign(chat.messages[messageIndex], updatedMessageData);
							if (
								chat.last_message &&
								chat.last_message.id === updatedMessageData.id
							) {
								chat.last_message = updatedMessageData;
							}
						}
					}
				}),
			);
			break;
		}

		default:
			console.warn(
				`Unhandled WebSocket message type: ${message.type}`,
				message,
			);
			break;
	}
};
