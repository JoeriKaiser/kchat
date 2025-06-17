import MessageSquare from "lucide-solid/icons/message-square";
import Plus from "lucide-solid/icons/plus";
import Search from "lucide-solid/icons/search";
import Settings from "lucide-solid/icons/settings";
import X from "lucide-solid/icons/x";
import {
	type Component,
	For,
	Show,
	createEffect,
	createMemo,
	createSignal,
} from "solid-js";
import { chatActions } from "../../stores/chat";
import { chatStore } from "../../stores/chat";
import { chatSelectors } from "../../stores/chat/chat.selectors";
import { useUser } from "../../stores/user-store";
import UserProfileCard from "../profile-card";
import { ThemeSelector } from "../theme-selector";
import ChatItem from "./chat-item";
import { createEventHandlers } from "./sidebarHandlers";

const Sidebar: Component<{ isOpen: boolean; onClose: () => void }> = (
	props,
) => {
	const userStore = useUser();
	const handlers = createEventHandlers();

	const [showThemeSelector, setShowThemeSelector] = createSignal(false);

	createEffect(() => {
		if (userStore.isLoggedIn && userStore.jwt) {
			chatActions.loadChats(userStore.jwt);
		}
	});

	const filteredChats = createMemo(() => chatSelectors.getFilteredChats() || []);
	const activeChatId = createMemo(() => chatStore.activeChat);

	const handleSettingsClick = () => {
		setShowThemeSelector(!showThemeSelector());
	};

	return (
		<>
			<aside
				class="fixed inset-y-0 left-0 z-30 flex h-full w-80 transform flex-col border-r border-border-primary/20 bg-background-primary backdrop-blur-sm transition-transform duration-300 ease-in-out md:relative md:translate-x-0"
				classList={{
					"translate-x-0": props.isOpen,
					"-translate-x-full": !props.isOpen,
				}}
				aria-label="Chat sidebar"
			>
				<header class="sticky top-0 z-10 border-b border-border-primary/10 bg-background-primary/80 p-4 backdrop-blur-md">
					<div class="mb-4 flex items-center justify-between">
						<div class="flex items-center gap-3">
							<img src="/logo.png" alt="K-Chat Logo" class="h-8 w-8" />
							<h1 class="bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text text-xl font-bold text-text-primary">
								Jin
							</h1>
						</div>
						<div class="relative flex items-center gap-2">
							<button
								type="button"
								class="rounded-xl border border-border-secondary/30 bg-background-secondary/50 p-2.5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-background-tertiary/80 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:ring-offset-2 focus:ring-offset-background-primary active:scale-95"
								onClick={handleSettingsClick}
								aria-label="Settings"
							>
								<Settings
									size={18}
									class="text-text-secondary transition-all duration-300 hover:text-accent-primary"
								/>
							</button>
							<Show when={showThemeSelector()}>
								<div class="absolute top-full right-0 z-20 mt-2">
									<ThemeSelector />
								</div>
							</Show>
							<button
								type="button"
								class="rounded-xl border border-border-secondary/30 bg-background-secondary/50 p-2.5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-background-tertiary/80 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:ring-offset-2 focus:ring-offset-background-primary active:scale-95 md:hidden"
								onClick={props.onClose}
								aria-label="Close sidebar"
							>
								<X
									size={18}
									class="text-text-secondary transition-all duration-300 hover:text-accent-primary"
								/>
							</button>
						</div>
					</div>

					<button
						type="button"
						class="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary px-4 py-3.5 text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:from-accent-secondary hover:to-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:ring-offset-2 focus:ring-offset-background-primary active:scale-[0.98]"
						onClick={() =>
							userStore.jwt && handlers.handleCreateChat(userStore.jwt)
						}
					>
						<div class="absolute inset-0 -skew-x-12 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]" />
						<Plus
							size={20}
							class="z-10 text-white transition-all duration-300 group-hover:rotate-90"
						/>
						<span class="z-10 font-semibold text-white">New Chat</span>
					</button>
				</header>

				<div class="border-b border-border-primary/10 bg-background-primary/60 p-4 backdrop-blur-sm">
					<div class="group relative">
						<Search
							size={18}
							class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transform text-text-muted transition-all duration-300 group-focus-within:text-accent-primary"
						/>
						<input
							type="text"
							placeholder="Search chats..."
							value={chatStore.searchTerm}
							onInput={handlers.handleSearchInput}
							class="w-full rounded-xl border border-border-secondary/30 bg-background-secondary/50 py-3 pl-10 pr-4 text-text-primary shadow-sm backdrop-blur-sm transition-all duration-300 placeholder:text-text-muted hover:bg-background-tertiary/60 focus:border-accent-primary/50 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:shadow-md"
							aria-label="Search chats"
						/>
					</div>
				</div>

				<nav
					class="flex-1 overflow-y-auto bg-gradient-to-b from-background-primary/80 to-background-secondary/20 transition-all duration-300 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border-primary/30 hover:scrollbar-thumb-border-primary/50"
					aria-label="Chat list"
				>
					<div class="space-y-2 p-3">
						<For each={filteredChats()}>
							{(chat) => (
								<ChatItem
									chat={chat}
									isActive={activeChatId() === chat.id}
									onChatClick={() => {
										if (userStore.jwt) {
											handlers.handleChatClick(chat.id, userStore.jwt)();
										}
										props.onClose();
									}}
									onChatOptions={handlers.handleChatOptions}
								/>
							)}
						</For>
					</div>

					<Show when={filteredChats().length === 0}>
						<div class="p-8 text-center">
							<div class="flex h-40 flex-col items-center justify-center space-y-6">
								<div class="relative">
									<div class="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 blur-xl" />
									<div class="relative rounded-2xl border border-border-secondary/30 bg-background-secondary/50 p-6 shadow-lg backdrop-blur-sm">
										<MessageSquare
											size={40}
											class="text-text-muted transition-colors duration-300"
										/>
									</div>
								</div>
								<div class="space-y-3 text-center">
									<h3 class="text-lg font-semibold text-text-secondary transition-colors duration-300">
										{chatStore.searchTerm
											? "No matches found"
											: "No chats yet"}
									</h3>
									<p class="max-w-xs text-sm leading-relaxed text-text-muted transition-colors duration-300">
										{chatStore.searchTerm
											? "Try adjusting your search terms or clear the search to see all chats"
											: "Start a new conversation by clicking the button above"}
									</p>
									<Show when={!chatStore.searchTerm}>
										<button
											type="button"
											class="mt-4 px-4 py-2 text-sm font-medium text-accent-primary underline-offset-4 transition-colors duration-300 hover:text-accent-secondary hover:underline-offset-2"
											onClick={() =>
												userStore.jwt &&
												handlers.handleCreateChat(userStore.jwt)
											}
										>
											Create your first chat
										</button>
									</Show>
								</div>
							</div>
						</div>
					</Show>
				</nav>

				<div class="border-t border-border-primary/10 bg-background-primary/80 backdrop-blur-md">
					<UserProfileCard />
				</div>
			</aside>
			<Show when={props.isOpen}>
				<div
					class="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm md:hidden"
					onClick={props.onClose}
					on:keydown={(e) => {
						if (e.key === "Escape") {
							props.onClose();
						}
					}}
					aria-hidden="true"
				/>
			</Show>
		</>
	);
};

export default Sidebar;