import Bot from "lucide-solid/icons/bot";
import type { Component } from "solid-js";
import type { Chat } from "../../stores/chat-store";

interface ChatHeaderProps {
	chat: Chat;
}

const ChatHeader: Component<ChatHeaderProps> = (props) => {
	return (
		<header class="px-6 py-4 border-b border-border-primary/20 bg-background-secondary/60 backdrop-blur-sm transition-colors duration-300 sticky top-0 z-10">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-lg">
					<Bot size={20} class="text-white" />
				</div>
				<div>
					<h2 class="font-semibold text-text-primary transition-colors duration-300">
						{props.chat.title || "New Chat"}
					</h2>
					<p class="text-sm text-text-muted transition-colors duration-300">
						AI Assistant • Online
					</p>
				</div>
			</div>
		</header>
	);
};

export default ChatHeader;
