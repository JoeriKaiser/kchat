import Bot from "lucide-solid/icons/bot";
import Loader2 from "lucide-solid/icons/loader-2";
import type { Component } from "solid-js";

const LoadingIndicator: Component = () => {
	return (
		<div class="flex items-center gap-3 p-4 bg-background-secondary/50 transition-colors duration-300">
			<div class="w-8 h-8 rounded-full bg-accent-secondary flex items-center justify-center flex-shrink-0 shadow-sm">
				<Bot size={16} class="text-white" />
			</div>
			<div class="flex-1 min-w-0">
				<div class="flex items-center gap-2 mb-1">
					<span class="text-sm font-medium text-text-secondary transition-colors duration-300">
						Assistant
					</span>
					<span class="text-xs text-text-muted transition-colors duration-300">
						Typing...
					</span>
				</div>
				<div class="text-text-primary transition-colors duration-300">
					<Loader2 size={20} class="animate-spin" />
				</div>
			</div>
		</div>
	);
};

export default LoadingIndicator;
