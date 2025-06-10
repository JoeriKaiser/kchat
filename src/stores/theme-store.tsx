import { createSignal, onMount } from "solid-js";
import { persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";

export type Theme = "light" | "dark" | "system";

interface ThemeState {
	theme: Theme;
	isDark: boolean;
	setTheme: (theme: Theme) => void;
	toggleTheme: () => void;
	initializeTheme: () => void;
}

const getIsDark = (theme: Theme): boolean => {
	if (theme === "system") {
		return window.matchMedia("(prefers-color-scheme: dark)").matches;
	}
	return theme === "dark";
};

const applyTheme = (isDark: boolean) => {
	const root = document.documentElement;
	root.classList.toggle("dark", isDark);
	root.setAttribute("data-theme", isDark ? "dark" : "light");
};

export const themeStore = createStore<ThemeState>()(
	persist(
		(set, get) => ({
			theme: "system",
			isDark: false,

			setTheme: (theme: Theme) => {
				const isDark = getIsDark(theme);
				applyTheme(isDark);
				set({ theme, isDark });
			},

			toggleTheme: () => {
				const currentTheme = get().theme;
				const newTheme = currentTheme === "dark" ? "light" : "dark";
				get().setTheme(newTheme);
			},

			initializeTheme: () => {
				const { theme } = get();
				const isDark = getIsDark(theme);
				applyTheme(isDark);
				set({ isDark });

				if (theme === "system") {
					const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
					const handleChange = (e: MediaQueryListEvent) => {
						if (get().theme === "system") {
							applyTheme(e.matches);
							set({ isDark: e.matches });
						}
					};

					mediaQuery.addEventListener("change", handleChange);

					return () => mediaQuery.removeEventListener("change", handleChange);
				}
			},
		}),
		{
			name: "theme-storage",
			partialize: (state) => ({ theme: state.theme }),
			onRehydrateStorage: () => (state) => {
				if (state) {
					state.initializeTheme();
				}
			},
		},
	),
);

export const useTheme = () => {
	const [theme, setTheme] = createSignal<Theme>(themeStore.getState().theme);
	const [isDark, setIsDark] = createSignal<boolean>(
		themeStore.getState().isDark,
	);

	onMount(() => {
		const unsubscribe = themeStore.subscribe((state) => {
			setTheme(state.theme);
			setIsDark(state.isDark);
		});

		themeStore.getState().initializeTheme();

		return unsubscribe;
	});

	return {
		theme,
		isDark,
		setTheme: themeStore.getState().setTheme,
		toggleTheme: themeStore.getState().toggleTheme,
	};
};
