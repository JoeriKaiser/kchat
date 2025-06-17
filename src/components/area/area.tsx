import "highlight.js/styles/obsidian.css";
import Menu from "lucide-solid/icons/menu";
import {
	type Component,
	Show,
	createEffect,
	createMemo,
	createSignal,
} from "solid-js";
import { chatActions } from "../../stores/chat";
import { chatSelectors } from "../../stores/chat/chat.selectors";
import { useUser } from "../../stores/user-store";
import ModelSelector from "../model-selector";
import ChatHeader from "./chat-header";
import EmptyState from "./empty";
import MessageInput from "./message-input";
import MessageList from "./message-list";

const ChatArea: Component<{ onMenuClick: () => void }> = (props) => {
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

	const activeChat = createMemo(() => chatSelectors.getActiveChat());
	const messages = createMemo(() => {
		const chat = activeChat();
		return chat?.messages || [];
	});
	const selectedModel = createMemo(() => chatSelectors.getEffectiveModel());

	const handleSendMessage = async () => {
		const token = userStore.jwt;
		const content = messageInput().trim();
		if (!content || chatSelectors.isLoading()) return;

		const chatId = activeChat()?.id;
		const currentModel = selectedModel();

		if (!token) return;

		if (chatId) {
			chatActions.sendMessage(token, chatId, content, currentModel);
		} else {
			chatActions.createDirectMessage(token, content, currentModel);
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
			chatSelectors.streamingMessage();
			chatSelectors.isLoading();
			requestAnimationFrame(() => scrollToBottom(true));
		},
		{ defer: true },
	);

	return (
		<main class="flex h-full w-full flex-1 flex-col bg-background-primary/80 backdrop-blur-sm transition-colors duration-300">
			<header class="flex w-full flex-shrink-0 items-center border-b border-border-primary/10">
				<button
					type="button"
					class="p-4 text-text-secondary hover:text-text-primary focus:outline-none md:hidden"
					onClick={props.onMenuClick}
					aria-label="Open menu"
				>
					<Menu size={24} />
				</button>
				<div class="flex-grow">
					<Show when={activeChat()}>
						{/* biome-ignore lint/style/noNonNullAssertion: <explanation> */}
						<ChatHeader chat={activeChat()!} />
					</Show>
				</div>
			</header>

			<div
				ref={chatContainerRef}
				class="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border-primary/50"
			>
				<Show when={messages().length > 0} fallback={<EmptyState />}>
					<MessageList
						messages={messages}
						isLoading={() => chatSelectors.isLoading()}
					/>
				</Show>
			</div>

			<div class="bg-background-secondary/60 px-4 pb-2 backdrop-blur-sm transition-colors duration-300">
				<ModelSelector />
			</div>

			<MessageInput
				messageInput={messageInput}
				onInputChange={handleInputChange}
				onKeyDown={handleKeyDown}
				onSendMessage={handleSendMessage}
				isLoading={() => chatSelectors.isLoading()}
			/>
		</main>
	);
};

export default ChatArea;