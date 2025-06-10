import {
	type Component,
	Show,
	createEffect,
	createMemo,
	createSignal,
} from "solid-js";
import {
	chatActions,
	getActiveChat,
	isLoading,
	streamingMessage,
} from "../../stores/chat-store";
import { useUser } from "../../stores/user-store";
import ModelSelector from "../model-selector";
import ChatHeader from "./chat-header";
import EmptyState from "./empty";
import MessageInput from "./message-input";
import MessageList from "./message-list";
import "highlight.js/styles/obsidian.css";

const ChatArea: Component = () => {
	let chatContainerRef: HTMLDivElement | undefined;

	const scrollToBottom = (smooth = false) => {
		if (chatContainerRef) {
			chatContainerRef.scrollTo({
				top: chatContainerRef.scrollHeight,
				behavior: smooth ? "smooth" : "auto",
			});
		}
	};

	const userStore = useUser();
	const [messageInput, setMessageInput] = createSignal("");

	const activeChat = createMemo(() => getActiveChat());
	const messages = createMemo(() => {
		const chat = activeChat();
		return chat?.messages || [];
	});

	const handleSendMessage = async () => {
		const token = userStore.jwt;
		const content = messageInput().trim();
		if (!content || isLoading()) return;

		const chatId = activeChat()?.id;

		if (!token) return;

		if (chatId) {
			chatActions.sendMessage(token, chatId, content);
		} else {
			chatActions.createDirectMessage(
				token,
				content,
				"google/gemini-2.0-flash-lite-001",
			);
		}

		setMessageInput("");
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	const handleInputChange = (e: Event) => {
		const target = e.target as HTMLTextAreaElement;
		setMessageInput(target.value);
	};

	createEffect(
		() => {
			streamingMessage();
			isLoading();
			requestAnimationFrame(() => scrollToBottom(true));
		},
		{ defer: true },
	);

	return (
		<div class="flex-1 flex flex-col h-full bg-background-primary/80 backdrop-blur-sm transition-colors duration-300">
			<Show when={activeChat()}>
				{/* biome-ignore lint/style/noNonNullAssertion: <explanation> */}
				<ChatHeader chat={activeChat()!} />
			</Show>

			<div
				ref={chatContainerRef}
				class="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border-primary/50 scrollbar-track-transparent p-4"
			>
				<Show when={messages().length > 0} fallback={<EmptyState />}>
					<MessageList messages={messages} isLoading={isLoading} />
				</Show>
			</div>

			<div class="px-4 pb-2 bg-background-secondary/60 backdrop-blur-sm transition-colors duration-300">
				<ModelSelector />
			</div>

			<MessageInput
				messageInput={messageInput}
				onInputChange={handleInputChange}
				onKeyDown={handleKeyDown}
				onSendMessage={handleSendMessage}
				isLoading={isLoading}
			/>
		</div>
	);
};

export default ChatArea;
