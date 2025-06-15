import Bot from "lucide-solid/icons/bot";
import User from "lucide-solid/icons/user";
import { type Component, createMemo, createSignal, onMount } from "solid-js";
import { parseAndSanitize } from "../../lib/markdown";
import type { ChatMessage } from "../../stores/chat";

interface MessageItemProps {
	message: ChatMessage;
}

const MessageItem: Component<MessageItemProps> = (props) => {
	const isUser = () => props.message.role === "user";
	const processedContent = createMemo(() =>
		parseAndSanitize(props.message.content),
	);

	let contentRef: HTMLDivElement | undefined;
	const [copiedButtons, setCopiedButtons] = createSignal<Set<HTMLElement>>(
		new Set(),
	);

	const copyToClipboard = async (text: string, button: HTMLElement) => {
		try {
			await navigator.clipboard.writeText(text);

			const newCopiedButtons = new Set(copiedButtons());
			newCopiedButtons.add(button);
			setCopiedButtons(newCopiedButtons);

			button.innerHTML = `
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
				</svg>
			`;
			button.title = "Copied!";

			setTimeout(() => {
				button.innerHTML = `
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
						<path d="m4 16c-1.1 0-2-.9-2 2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
					</svg>
				`;
				button.title = "Copy code";

				const newCopiedButtons = new Set(copiedButtons());
				newCopiedButtons.delete(button);
				setCopiedButtons(newCopiedButtons);
			}, 2000);
		} catch (err) {
			console.error("Failed to copy text: ", err);
		}
	};

	onMount(() => {
		const copyButtons = contentRef?.querySelectorAll(".copy-code-btn");

		if (copyButtons) {
			for (const button of copyButtons) {
				button.addEventListener("click", (e) => {
					e.preventDefault();
					const codeData = (e.currentTarget as HTMLElement).getAttribute(
						"data-code",
					);
					if (codeData) {
						const decodedCode = decodeURIComponent(codeData);
						copyToClipboard(decodedCode, e.currentTarget as HTMLElement);
					}
				});
			}
		}
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
					class={`text-text-primary whitespace-pre-wrap markdown-content max-w-full break-words transition-colors duration-300
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
