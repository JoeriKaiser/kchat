import MessageSquare from "lucide-solid/icons/message-square";
import MoreHorizontal from "lucide-solid/icons/more-horizontal";
import type { Component } from "solid-js";
import type { Chat } from "../../stores/chat/chat.types";

interface ChatItemProps {
	chat: Chat;
	isActive: boolean;
	onChatClick: (chatId: number) => void;
	onChatOptions: (chatId: number, event: MouseEvent) => void;
}

const ChatItem: Component<ChatItemProps> = (props) => {
	return (
		<div
			class="group relative mx-1 cursor-pointer rounded-xl border border-transparent p-3 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-border-secondary/30 hover:bg-background-secondary/60 hover:shadow-md active:scale-[0.98]"
			classList={{
				"border-accent-primary/30 bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 shadow-lg shadow-accent-primary/10":
					props.isActive,
				"hover:shadow-sm": !props.isActive,
			}}
			onClick={() => props.onChatClick(props.chat.id)}
			onKeyDown={(e: KeyboardEvent) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					props.onChatClick(props.chat.id);
				}
			}}
			tabindex="0"
			aria-pressed={props.isActive}
			aria-label={`Chat: ${props.chat.title}`}
		>
			{props.isActive && (
				<div class="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-accent-primary to-accent-secondary" />
			)}

			<div class="flex items-center justify-between">
				<div class="flex min-w-0 flex-1 items-center gap-3">
					<div
						class="flex-shrink-0 rounded-lg p-2 transition-all duration-300"
						classList={{
							"bg-accent-primary/20 shadow-sm": props.isActive,
							"bg-background-secondary/50 group-hover:bg-background-tertiary/60":
								!props.isActive,
						}}
					>
						<MessageSquare
							size={16}
							class="transition-all duration-300"
							classList={{
								"text-accent-primary": props.isActive,
								"text-text-muted group-hover:text-text-secondary":
									!props.isActive,
							}}
						/>
					</div>

					<div class="min-w-0 flex-1">
						<h3
							class="truncate text-sm font-semibold transition-all duration-300"
							classList={{
								"text-text-primary": props.isActive,
								"text-text-secondary group-hover:text-text-primary":
									!props.isActive,
							}}
						>
							{props.chat.title}
						</h3>
						<p class="mt-0.5 truncate text-xs text-text-muted opacity-0 transition-opacity duration-300 group-hover:opacity-100">
							Last message preview...
						</p>
					</div>
				</div>

				<button
					type="button"
					class="flex-shrink-0 rounded-lg p-2 opacity-0 transition-all duration-300 group-hover:opacity-100 hover:scale-110 hover:bg-background-tertiary/80 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:ring-offset-2 focus:ring-offset-background-primary active:scale-95"
					classList={{
						"opacity-60 hover:opacity-100": props.isActive,
					}}
					onClick={(e: MouseEvent) => {
						e.stopPropagation();
						props.onChatOptions(props.chat.id, e);
					}}
					aria-label={`More options for ${props.chat.title}`}
				>
					<MoreHorizontal
						size={16}
						class="text-text-muted transition-colors duration-300 hover:text-text-secondary"
					/>
				</button>
			</div>

			<div class="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-accent-primary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
		</div>
	);
};

export default ChatItem;