import { chatActions } from "../../stores/chat-store";

export interface EventHandlers {
	handleChatClick: (chatId: number, token: string) => () => void;
	handleSearchInput: (e: Event) => void;
	handleCreateChat: (token: string) => void;
	handleChatOptions: (chatId: number) => (e: MouseEvent) => void;
}

export const createEventHandlers = (): EventHandlers => ({
	handleChatClick: (chatId: number, token: string) => () => {
		chatActions.setActiveChat(token, chatId);
	},
	handleSearchInput: (e: Event) => {
		const target = e.target as HTMLInputElement;
		chatActions.setSearchTerm(target.value);
	},
	handleCreateChat: (token: string) => {
		chatActions.setActiveChat(null, null);
	},
	handleChatOptions: (chatId: number) => (e: MouseEvent) => {
		e.stopPropagation();
	},
});
