import { getClientId } from "../../lib/websocket";
import type { Chat } from "./chat.types";

const API_BASE_URL =
	import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

const getAuthHeaders = (token: string | null): HeadersInit => {
	return {
		"Content-Type": "application/json",
		...(token && { Authorization: `Bearer ${token}` }),
	};
};

const handleResponse = async <T>(response: Response): Promise<T> => {
	if (!response.ok) {
		const errorData = await response.json().catch(() => null);
		const errorMessage = errorData?.error || response.statusText;
		throw new Error(errorMessage);
	}
	const data = await response.json();
	return data.data;
};

export const fetchChatsAPI = async (token: string | null): Promise<Chat[]> => {
	const response = await fetch(`${API_BASE_URL}/chats`, {
		headers: getAuthHeaders(token),
	});
	return handleResponse<Chat[]>(response);
};

export const createChatAPI = async (
	token: string | null,
	title: string,
): Promise<Chat> => {
	const response = await fetch(`${API_BASE_URL}/chats`, {
		method: "POST",
		headers: getAuthHeaders(token),
		body: JSON.stringify({ title }),
	});
	return handleResponse<Chat>(response);
};

export const createChatDirectMessageAPI = async (
	token: string | null,
	content: string,
	model: string | undefined,
): Promise<Chat> => {
	const response = await fetch(`${API_BASE_URL}/messages`, {
		method: "POST",
		headers: getAuthHeaders(token),
		body: JSON.stringify({ content, model, client_id: getClientId() }),
	});
	return handleResponse<Chat>(response);
};

export const streamChatResponseAPI = async (
	token: string | null,
	chatId: number,
	model: string,
	onChunk: (chunk: string) => void,
): Promise<void> => {
	const response = await fetch(`${API_BASE_URL}/chats/${chatId}/stream`, {
		method: "POST",
		headers: getAuthHeaders(token),
		body: JSON.stringify({ model, client_id: getClientId() }),
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => null);
		const errorMessage = errorData?.error || response.statusText;
		throw new Error(`Failed to stream response: ${errorMessage}`);
	}

	if (response.body) {
		const reader = response.body.getReader();
		const decoder = new TextDecoder();
		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				const chunk = decoder.decode(value, { stream: true });
				onChunk(chunk);
			}
		} finally {
			reader.releaseLock();
		}
	}
};

export const getChatWithMessagesAPI = async (
	token: string | null,
	chatId: number,
): Promise<Chat> => {
	const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
		headers: getAuthHeaders(token),
	});
	return handleResponse<Chat>(response);
};

export const deleteChatAPI = async (
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

export const sendMessageAPI = async (
	token: string | null,
	chatId: number,
	content: string,
	model: string,
	onChunk: (chunk: string) => void,
): Promise<void> => {
	const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
		method: "POST",
		headers: getAuthHeaders(token),
		body: JSON.stringify({
			content,
			role: "user",
			model,
			client_id: getClientId(),
		}),
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => null);
		const errorMessage = errorData?.error || response.statusText;
		throw new Error(`Failed to send message: ${errorMessage}`);
	}

	if (response.body) {
		const reader = response.body.getReader();
		const decoder = new TextDecoder();
		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				const chunk = decoder.decode(value, { stream: true });
				onChunk(chunk);
			}
		} finally {
			reader.releaseLock();
		}
	}
};
