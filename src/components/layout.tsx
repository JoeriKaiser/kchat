import { Outlet } from "@tanstack/solid-router";
import { type Component, Show, createEffect, onCleanup } from "solid-js";
import { useTheme } from "../stores/theme-store";
import { useUser } from "../stores/user-store";

export const Layout: Component = () => {
	const userStore = useUser();
	const store = useTheme();

	createEffect(() => {
		const theme = store.theme;
		const root = document.documentElement;

		const applyTheme = (isDark: boolean) => {
			root.classList.toggle("dark", isDark);
		};

		if (theme() === "system") {
			const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

			applyTheme(mediaQuery.matches);

			const listener = (e: MediaQueryListEvent) => applyTheme(e.matches);
			mediaQuery.addEventListener("change", listener);

			onCleanup(() => {
				mediaQuery.removeEventListener("change", listener);
			});
		} else {
			applyTheme(theme() === "dark");
		}
	});

	return (
		<>
			<main>
				<Show when={!userStore.isLoading} fallback={<div>Loading user...</div>}>
					<Outlet />
				</Show>
			</main>
		</>
	);
};
