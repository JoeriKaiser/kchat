import { createStore } from "solid-js/store";
import { chatActions } from "./chat.actions";
import type { ChatState } from "./chat.types";
import { handleWebSocketMessage } from "./chat.websocket";

const DEFAULT_BASE_MODEL = "google/gemini-2.5-flash-lite-preview-06-17";

const getInitialState = (): ChatState => ({
	chats: [],
	activeChat: null,
	searchTerm: "",
	loading: false,
	streamingMessage: "",
	isStreaming: false,
	error: null,
	wsConnection: null,
	isConnected: false,
	selectedBaseModel: DEFAULT_BASE_MODEL,
	isOnlineEnabled: false,
});

export const [chatStore, setChatStore] = createStore<ChatState>(
	getInitialState(),
);

export { chatActions, handleWebSocketMessage };
