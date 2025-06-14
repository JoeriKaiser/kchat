import { createStore } from "solid-js/store";
import { chatActions } from "./chat.actions";
import * as chatSelectors from "./chat.selectors";
import type { ChatState } from "./chat.types";
import { handleWebSocketMessage } from "./chat.websocket";

export * from "./chat.types";

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

export { chatActions, chatSelectors, handleWebSocketMessage, initialState };

export const resetChatStore = () => setChatStore(initialState);
