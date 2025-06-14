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
