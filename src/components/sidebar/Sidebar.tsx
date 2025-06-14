import MessageSquare from "lucide-solid/icons/message-square";
import Plus from "lucide-solid/icons/plus";
import Search from "lucide-solid/icons/search";
import Settings from "lucide-solid/icons/settings";
import {
	type Component,
	For,
	createEffect,
	createMemo,
	createSignal,
} from "solid-js";
import { chatActions } from "../../stores/chat";
import { chatSelectors, chatStore } from "../../stores/chat";
import { useUser } from "../../stores/user-store";
import UserProfileCard from "../profile-card";
import { ThemeSelector } from "../theme-selector";
import ChatItem from "./ChatItem";
import { createEventHandlers } from "./sidebarHandlers";

const Sidebar: Component = () => {
	const userStore = useUser();
	const handlers = createEventHandlers();

	const [showThemeSelector, setShowThemeSelector] = createSignal(false);

	createEffect(() => {
		if (userStore.isLoggedIn && userStore.jwt) {
			chatActions.loadChats(userStore.jwt);
		}
	});

	const filteredChats = createMemo(() => chatSelectors.getFilteredChats());
	const activeChatId = createMemo(() => chatStore.activeChat);

	const handleSettingsClick = () => {
		setShowThemeSelector(!showThemeSelector());
	};

	return (
		<aside
			class="w-80 bg-background-primary border-r border-border-primary/20 flex flex-col h-full backdrop-blur-sm"
			aria-label="Chat sidebar"
		>
			<header class="p-4 border-b border-border-primary/10 bg-background-primary/80 backdrop-blur-md sticky top-0 z-10">
				<div class="flex items-center justify-between mb-4">
					<div class="flex items-center gap-3">
						<div class="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-lg">
							<MessageSquare size={16} class="text-white" />
						</div>
						<h1 class="text-xl font-bold text-text-primary bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text">
							K-Chat
						</h1>
					</div>
					<div class="flex items-center gap-2 relative">
						<button
							type="button"
							class="p-2.5 rounded-xl bg-background-secondary/50 hover:bg-background-tertiary/80 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:ring-offset-2 focus:ring-offset-background-primary shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 backdrop-blur-sm border border-border-secondary/30"
							onClick={handleSettingsClick}
							aria-label="Settings"
						>
							<Settings
								size={18}
								class="text-text-secondary hover:text-accent-primary transition-all duration-300"
							/>
						</button>
						{showThemeSelector() && (
							<div class="absolute top-full right-0 mt-2 z-20">
								<ThemeSelector />
							</div>
						)}
					</div>
				</div>

				<button
					type="button"
					class="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-gradient-to-r from-accent-primary to-accent-secondary hover:from-accent-secondary hover:to-accent-primary text-white rounded-xl transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:ring-offset-2 focus:ring-offset-background-primary shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
					onClick={() =>
						userStore.jwt && handlers.handleCreateChat(userStore.jwt)
					}
				>
					<div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
					<Plus
						size={20}
						class="text-white group-hover:rotate-90 transition-all duration-300 z-10"
					/>
					<span class="text-white font-semibold z-10">New Chat</span>
				</button>
			</header>

			<div class="p-4 border-b border-border-primary/10 bg-background-primary/60 backdrop-blur-sm">
				<div class="relative group">
					<Search
						size={18}
						class="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted group-focus-within:text-accent-primary transition-all duration-300 pointer-events-none"
					/>
					<input
						type="text"
						placeholder="Search chats..."
						value={chatStore.searchTerm}
						onInput={handlers.handleSearchInput}
						class="w-full pl-10 pr-4 py-3 bg-background-secondary/50 border border-border-secondary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary/50 text-text-primary placeholder:text-text-muted transition-all duration-300 hover:bg-background-tertiary/60 backdrop-blur-sm shadow-sm focus:shadow-md"
						aria-label="Search chats"
					/>
				</div>
			</div>

			<nav
				class="flex-1 overflow-y-auto bg-gradient-to-b from-background-primary/80 to-background-secondary/20 scrollbar-thin scrollbar-thumb-border-primary/30 scrollbar-track-transparent hover:scrollbar-thumb-border-primary/50 transition-all duration-300"
				aria-label="Chat list"
			>
				<div class="p-3 space-y-2">
					<For each={filteredChats()}>
						{(chat) => (
							<ChatItem
								chat={chat}
								isActive={activeChatId() === chat.id}
								onChatClick={() => {
									if (userStore.jwt) {
										handlers.handleChatClick(chat.id, userStore.jwt)();
									}
								}}
								onChatOptions={handlers.handleChatOptions}
							/>
						)}
					</For>
				</div>

				{filteredChats().length === 0 && (
					<div class="p-8 text-center">
						<div class="flex flex-col items-center justify-center h-40 space-y-6">
							<div class="relative">
								<div class="absolute inset-0 bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 rounded-full blur-xl animate-pulse" />
								<div class="relative p-6 rounded-2xl bg-background-secondary/50 border border-border-secondary/30 backdrop-blur-sm shadow-lg">
									<MessageSquare
										size={40}
										class="text-text-muted transition-colors duration-300"
									/>
								</div>
							</div>
							<div class="space-y-3 text-center">
								<h3 class="text-lg font-semibold text-text-secondary transition-colors duration-300">
									{chatStore.searchTerm ? "No matches found" : "No chats yet"}
								</h3>
								<p class="text-sm text-text-muted max-w-xs leading-relaxed transition-colors duration-300">
									{chatStore.searchTerm
										? "Try adjusting your search terms or clear the search to see all chats"
										: "Start a new conversation by clicking the button above"}
								</p>
								{!chatStore.searchTerm && (
									<button
										type="button"
										class="mt-4 px-4 py-2 text-sm font-medium text-accent-primary hover:text-accent-secondary transition-colors duration-300 underline underline-offset-4 hover:underline-offset-2"
										onClick={() =>
											userStore.jwt && handlers.handleCreateChat(userStore.jwt)
										}
									>
										Create your first chat
									</button>
								)}
							</div>
						</div>
					</div>
				)}
			</nav>

			<div class="border-t border-border-primary/10 bg-background-primary/80 backdrop-blur-md">
				<UserProfileCard />
			</div>
		</aside>
	);
};

export default Sidebar;
