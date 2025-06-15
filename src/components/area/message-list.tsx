import { type Component, For, Show } from "solid-js";
import type { ChatMessage } from "../../stores/chat";
import LoadingIndicator from "../loading-indicator";
import MessageItem from "./message-item";

interface MessageListProps {
	messages: () => ChatMessage[];
	isLoading: () => boolean;
}

const MessageList: Component<MessageListProps> = (props) => {
	return (
		<div class="space-y-4">
			<For each={props.messages()}>
				{(message) => <MessageItem message={message} />}
			</For>
			<Show when={props.isLoading()}>
				<LoadingIndicator />
			</Show>
			<div class="h-4" />
		</div>
	);
};

export default MessageList;
