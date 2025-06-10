import { chatActions, chatStore } from "../../stores/chat-store";

export interface EventHandlers {
	handleChatClick: (chatId: number, token: string) => () => void;
	handleChatKeyDown: (
		chatId: number,
		token: string,
	) => (e: KeyboardEvent) => void;
	handleSearchInput: (e: Event) => void;
	handleNewMessage: (token: string) => void;
	handleCreateChat: (token: string) => void;
	handleChatOptions: (chatId: number) => (e: MouseEvent) => void;
	handleTheme: () => void;
}

export const createEventHandlers = (): EventHandlers => ({
	handleChatClick: (chatId: number, token: string) => () => {
		chatActions.setActiveChat(token, chatId);
	},
	handleChatKeyDown: (chatId: number, token: string) => (e: KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			chatActions.setActiveChat(token, chatId);
		}
	},
	handleSearchInput: (e: Event) => {
		const target = e.target as HTMLInputElement;
		chatActions.setSearchTerm(target.value);
	},
	handleNewMessage: (token: string) => {
		const chatId = chatStore.activeChat;
		const content = prompt("Enter your message here");
		if (!chatId || !content) return;
		const newChatId = chatActions.sendMessage(token, chatId, content);
	},
	handleCreateChat: (token: string) => {
		chatActions.setActiveChat(null, null);
	},
	handleChatOptions: (chatId: number) => (e: MouseEvent) => {
		e.stopPropagation();
	},
	handleTheme: () => {},
});
