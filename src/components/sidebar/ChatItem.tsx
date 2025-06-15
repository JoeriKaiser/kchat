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
			class={`
				relative p-3 mx-1 rounded-xl cursor-pointer transition-all duration-300 group
				backdrop-blur-sm border border-transparent
				hover:bg-background-secondary/60 hover:border-border-secondary/30
				hover:shadow-md hover:scale-[1.02] active:scale-[0.98]
				${props.isActive
					? "bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 border-accent-primary/30 shadow-lg shadow-accent-primary/10"
					: "hover:shadow-sm"
				}
			`}
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
				// biome-ignore lint/style/useSelfClosingElements: <explanation>
				<div class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-accent-primary to-accent-secondary rounded-r-full"></div>
			)}

			<div class="flex items-center justify-between">
				<div class="flex-1 min-w-0 flex items-center gap-3">
					<div
						class={`
							p-2 rounded-lg transition-all duration-300 flex-shrink-0
							${props.isActive
								? "bg-accent-primary/20 shadow-sm"
								: "bg-background-secondary/50 group-hover:bg-background-tertiary/60"
							}
						`}
					>
						<MessageSquare
							size={16}
							class={`
								transition-all duration-300
								${props.isActive
									? "text-accent-primary"
									: "text-text-muted group-hover:text-text-secondary"
								}
							`}
						/>
					</div>

					<div class="flex-1 min-w-0">
						<h3
							class={`
								font-semibold truncate transition-all duration-300 text-sm
								${props.isActive
									? "text-text-primary"
									: "text-text-secondary group-hover:text-text-primary"
								}
							`}
						>
							{props.chat.title}
						</h3>
						<p class="text-xs text-text-muted truncate mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
							Last message preview...
						</p>
					</div>
				</div>

				<button
					type="button"
					class={`
						p-2 rounded-lg transition-all duration-300 flex-shrink-0
						opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95
						hover:bg-background-tertiary/80 focus:outline-none
						focus:ring-2 focus:ring-accent-primary/50 focus:ring-offset-2
						focus:ring-offset-background-primary
						${props.isActive ? "opacity-60 hover:opacity-100" : ""}
					`}
					onClick={(e: MouseEvent) => {
						e.stopPropagation();
						props.onChatOptions(props.chat.id, e);
					}}
					aria-label={`More options for ${props.chat.title}`}
				>
					<MoreHorizontal
						size={16}
						class="text-text-muted hover:text-text-secondary transition-colors duration-300"
					/>
				</button>
			</div>

			<div class="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-accent-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
		</div>
	);
};

export default ChatItem;
