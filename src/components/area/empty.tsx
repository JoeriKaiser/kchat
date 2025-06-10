import MessageSquare from "lucide-solid/icons/message-square";
import type { Component } from "solid-js";

const EmptyState: Component = () => {
	return (
		<div class="flex-1 flex items-center justify-center p-8">
			<div class="text-center space-y-4">
				<div class="p-6 rounded-full bg-background-secondary/50 border border-border-secondary/30 backdrop-blur-sm shadow-lg mx-auto w-fit">
					<MessageSquare
						size={48}
						class="text-text-muted transition-colors duration-300"
					/>
				</div>
				<div class="space-y-2">
					<h3 class="text-lg font-medium text-text-secondary transition-colors duration-300">
						Start the conversation
					</h3>
					<p class="text-sm text-text-muted max-w-sm transition-colors duration-300">
						Send a message to begin chatting with the AI assistant
					</p>
				</div>
			</div>
		</div>
	);
};

export default EmptyState;
