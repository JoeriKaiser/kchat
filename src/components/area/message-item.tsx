import User from "lucide-solid/icons/user";
import { type Component, createMemo, onCleanup, onMount } from "solid-js";
import { parseAndSanitize, setupCodeCopyHandlers } from "../../lib/markdown";
import type { ChatMessage } from "../../stores/chat/chat.types";

interface MessageItemProps {
	message: ChatMessage;
}

const MessageItem: Component<MessageItemProps> = (props) => {
	const isUser = () => props.message.role === "user";
	const processedContent = createMemo(() =>
		parseAndSanitize(props.message.content)
	);

	let contentRef: HTMLDivElement | undefined;
	let cleanupHandlers: (() => void) | undefined;

	onMount(() => {
		if (contentRef) {
			cleanupHandlers = setupCodeCopyHandlers(contentRef);
		}
	});

	onCleanup(() => {
		cleanupHandlers?.();
	});

	return (
		<div
			class={`flex gap-3 p-4 transition-colors duration-300 items-start
        ${isUser()
					? "bg-transparent justify-end"
					: "bg-background-secondary/50 hover:bg-background-secondary/70"
				}
      `}
		>
			{!isUser() && (
				<div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300 shadow-sm backdrop-blur-sm bg-accent-secondary">
					<img src="/assistant.webp" alt="K-Chat Logo" class="w-6 h-6" />
				</div>
			)}

			<div
				class={`flex flex-col ${isUser() ? "items-end" : "items-start"} flex-1 min-w-0`}
			>
				<div class="flex items-center gap-2 mb-1">
					<span class="text-sm font-medium text-text-secondary transition-colors duration-300">
						{isUser() ? "You" : "Assistant"}
					</span>
				</div>
				<div
					ref={contentRef}
					class={`text-text-primary markdown-content max-w-full break-words transition-colors duration-300
            p-3 rounded-lg
            ${isUser()
							? "bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10 border border-accent-primary/30 shadow-md"
							: "bg-background-tertiary/60 border border-border-secondary/30 shadow-sm hover:shadow-md"
						}
            backdrop-blur-sm
          `}
					innerHTML={processedContent()}
				/>
			</div>

			{isUser() && (
				<div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300 shadow-sm backdrop-blur-sm bg-accent-primary">
					<User size={16} class="text-white" />
				</div>
			)}
		</div>
	);
};

export default MessageItem;
