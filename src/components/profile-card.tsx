import { useNavigate } from "@tanstack/solid-router";
import LogOut from "lucide-solid/icons/log-out";
import User from "lucide-solid/icons/user";
import { type Component, Show, createEffect } from "solid-js";
import { useUser } from "../stores/user-store";

const UserProfileCard: Component = () => {
	const user = useUser();
	const navigate = useNavigate();

	createEffect(() => {
		if (!user.isLoading && !user.isLoggedIn) {
			navigate({ to: "/login" });
		}
	});

	return (
		<div class="p-4 bg-background-primary/90 backdrop-blur-md border-t border-border-primary/20">
			<Show when={user.isLoggedIn && user.user}>
				{(u) => (
					<div class="flex items-center justify-between group">
						<div class="flex items-center gap-3 flex-1 min-w-0">
							<div class="relative">
								<div class="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary shadow-lg flex items-center justify-center transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
									<User size={20} class="text-white" />
								</div>
								<div class="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 border-2 border-background-primary rounded-full shadow-sm" />
							</div>

							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2 mb-1">
									<p class="font-semibold text-text-primary truncate transition-colors duration-300 group-hover:text-accent-primary">
										{u().firstName} {u().lastName}
									</p>
									<span class="px-2 py-0.5 text-xs font-medium bg-accent-primary/20 text-accent-primary rounded-full">
										Pro
									</span>
								</div>
								<p class="text-sm text-text-muted truncate transition-colors duration-300">
									{u().email}
								</p>
							</div>
						</div>

						<div class="flex items-center gap-2">
							<button
								type="button"
								onClick={() => navigate({ to: "/personalization" })}
								class="p-2.5 rounded-xl bg-background-secondary/50 hover:bg-background-tertiary/80 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:ring-offset-2 focus:ring-offset-background-primary shadow-sm hover:shadow-md hover:scale-105 active:scale-95 backdrop-blur-sm border border-border-secondary/30"
								aria-label="User settings"
							>
								<User
									size={16}
									class="text-text-secondary hover:text-accent-primary transition-colors duration-300"
								/>
							</button>

							<button
								type="button"
								onClick={user.logout}
								class="p-2.5 rounded-xl bg-background-secondary/50 hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-background-primary shadow-sm hover:shadow-md hover:scale-105 active:scale-95 backdrop-blur-sm border border-border-secondary/30 group/logout"
								aria-label="Log out"
							>
								<LogOut
									size={16}
									class="text-text-secondary group-hover/logout:text-red-500 transition-all duration-300 group-hover/logout:rotate-12"
								/>
							</button>
						</div>
					</div>
				)}
			</Show>

			{/* Loading State */}
			<Show when={user.isLoading}>
				<div class="flex items-center gap-3 animate-pulse">
					<div class="w-12 h-12 rounded-xl bg-background-secondary/50" />
					<div class="flex-1 space-y-2">
						<div class="h-4 bg-background-secondary/50 rounded-lg w-3/4" />
						<div class="h-3 bg-background-secondary/30 rounded-lg w-1/2" />
					</div>
					<div class="w-8 h-8 bg-background-secondary/50 rounded-lg" />
				</div>
			</Show>

			{/* Subtle background effect */}
			<div class="absolute inset-0 bg-gradient-to-r from-accent-primary/5 via-transparent to-accent-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-t-xl" />
		</div>
	);
};

export default UserProfileCard;
