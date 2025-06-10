import Send from "lucide-solid/icons/send";
import type { Component } from "solid-js";

interface MessageInputProps {
	messageInput: () => string;
	onInputChange: (e: Event) => void;
	onKeyDown: (e: KeyboardEvent) => void;
	onSendMessage: () => void;
	isLoading: () => boolean;
}

const MessageInput: Component<MessageInputProps> = (props) => {
	return (
		<div class="p-4 border-t border-border-primary/20 bg-background-secondary/60 backdrop-blur-sm transition-colors duration-300">
			<div class="relative">
				<textarea
					value={props.messageInput()}
					onInput={props.onInputChange}
					onKeyDown={props.onKeyDown}
					rows="1"
					placeholder="Type your message..."
					class="w-full p-3 pr-12 rounded-lg bg-background-tertiary/50 text-text-primary placeholder:text-text-muted border border-border-secondary/30 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary/50 resize-none overflow-hidden max-h-32 transition-all duration-200 hover:bg-background-tertiary/80 backdrop-blur-sm shadow-sm focus:shadow-md"
					style={{ "max-height": "8rem" }}
					aria-label="Message input"
				/>
				<button
					type="button"
					onClick={props.onSendMessage}
					disabled={!props.messageInput().trim() || props.isLoading()}
					class="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-accent-primary text-white hover:bg-accent-secondary disabled:bg-border-primary/50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:ring-offset-2 focus:ring-offset-background-primary"
					aria-label="Send message"
				>
					<Send size={20} />
				</button>
			</div>
		</div>
	);
};

export default MessageInput;
