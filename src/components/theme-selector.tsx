import Monitor from "lucide-solid/icons/monitor";
import Moon from "lucide-solid/icons/moon";
import Sun from "lucide-solid/icons/sun";

import { useTheme } from "../stores/theme-store";

export const ThemeSelector = () => {
	const { theme, setTheme } = useTheme();

	const themes = [
		{ value: "light" as const, label: "Light", icon: Sun },
		{ value: "dark" as const, label: "Dark", icon: Moon },
		{ value: "system" as const, label: "System", icon: Monitor },
	];

	return (
		<div class="flex gap-2 p-2 bg-isabelline-600 dark:bg-timberwolf-200 rounded-lg">
			{themes.map((themeOption) => (
				// biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
				<button
					type="button"
					onClick={() => setTheme(themeOption.value)}
					class={`
            px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
            flex flex-col items-center justify-center
            ${
							theme() === themeOption.value
								? "bg-linen-400 text-isabelline-100 dark:bg-champagne_pink-400 dark:text-timberwolf-100"
								: "text-isabelline-200 dark:text-timberwolf-600 hover:text-isabelline-100 dark:hover:text-timberwolf-800"
						}
          `}
				>
					<themeOption.icon size={16} />
					{themeOption.label}
				</button>
			))}
		</div>
	);
};
