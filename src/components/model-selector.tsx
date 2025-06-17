import Check from "lucide-solid/icons/check";
import ChevronDown from "lucide-solid/icons/chevron-down";
import Cpu from "lucide-solid/icons/cpu";
import Search from "lucide-solid/icons/search";
import {
	type Component,
	For,
	Show,
	createMemo,
	createSignal,
	onCleanup,
} from "solid-js";
import models from "../constants/models";
import { chatActions, chatStore } from "../stores/chat";
import { chatSelectors } from "../stores/chat/chat.selectors";

interface ModelSelectorProps {
	class?: string;
}

const ModelSelector: Component<ModelSelectorProps> = (props) => {
	const [isOpen, setIsOpen] = createSignal(false);
	let dropdownRef: HTMLDivElement | undefined;
	let buttonRef: HTMLButtonElement | undefined;

	const selectedBaseModel = createMemo(() => chatStore.selectedBaseModel);
	const isOnlineEnabled = createMemo(() => chatSelectors.isOnlineEnabled());

	const canBeOnline = createMemo(() => {
		const currentBase = selectedBaseModel();
		return (
			currentBase.startsWith("openai/") || currentBase.startsWith("google/")
		);
	});

	const handleBaseModelSelect = (model: string) => {
		chatActions.setSelectedBaseModel(model);
		setIsOpen(false);
		const newModelCanBeOnline =
			model.startsWith("openai/") || model.startsWith("google/");
		if (!newModelCanBeOnline && isOnlineEnabled()) {
			chatActions.toggleOnlineEnabled();
		}
	};

	const toggleOnline = () => {
		if (canBeOnline()) {
			chatActions.toggleOnlineEnabled();
		}
	};

	const toggleDropdown = () => {
		setIsOpen(!isOpen());
	};

	const handleClickOutside = (event: MouseEvent) => {
		if (
			dropdownRef &&
			buttonRef &&
			!dropdownRef.contains(event.target as Node) &&
			!buttonRef.contains(event.target as Node)
		) {
			setIsOpen(false);
		}
	};

	document.addEventListener("mousedown", handleClickOutside);

	onCleanup(() => {
		document.removeEventListener("mousedown", handleClickOutside);
	});

	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === "Escape") {
			setIsOpen(false);
		}
	};

	const formatModelName = (model: string) => {
		const displayModel = model.split(":online")[0];
		const parts = displayModel.split("/");
		const modelName = parts[parts.length - 1];
		return modelName
			.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	};

	const getProvider = (model: string) => {
		const parts = model.split("/");
		return parts[0];
	};

	return (
		<div class={`flex items-center gap-2 ${props.class || ""}`}>
			<div class="relative flex-1">
				<button
					ref={buttonRef}
					type="button"
					onClick={toggleDropdown}
					onKeyDown={handleKeyDown}
					class="group flex h-14 w-full items-center justify-between gap-3 rounded-lg border border-border-secondary/30 bg-background-tertiary/50 p-3 text-text-primary shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-background-tertiary/80 hover:shadow-md focus:border-accent-primary/50 focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
					aria-label="Select AI Model"
					aria-expanded={isOpen()}
					aria-haspopup="listbox"
				>
					<div class="flex min-w-0 flex-1 items-center gap-3">
						<div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-accent-primary/30 bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20">
							<Cpu size={16} class="text-accent-primary" />
						</div>
						<div class="min-w-0 flex-1 flex-col items-start">
							<span class="block w-full truncate text-left text-sm font-medium text-text-primary">
								{formatModelName(selectedBaseModel())}
							</span>
							<span class="block w-full truncate text-left text-xs text-text-muted">
								{getProvider(selectedBaseModel())}
							</span>
						</div>
					</div>
					<ChevronDown
						size={16}
						class={`text-text-muted transition-transform duration-200 group-hover:text-text-secondary ${isOpen() ? "rotate-180" : ""
							}`}
					/>
				</button>

				<Show when={isOpen()}>
					{/* biome-ignore lint/a11y/useFocusableInteractive: <explanation> */}
					<div
						ref={dropdownRef}
						class="absolute bottom-full left-0 right-0 z-50 mb-2 max-h-64 overflow-y-auto rounded-lg border border-border-secondary/50 bg-background-secondary/95 p-2 shadow-xl backdrop-blur-md scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border-primary/50"
						// biome-ignore lint/a11y/useSemanticElements: <explanation>
						role="listbox"
					>
						<For each={models}>
							{(model) => (
								<button
									type="button"
									onClick={() => handleBaseModelSelect(model)}
									class="flex w-full items-center justify-between gap-3 rounded-lg p-3 text-left transition-all duration-200 hover:bg-background-tertiary/60 focus:bg-background-tertiary/60 focus:outline-none"
									classList={{
										"border border-accent-primary/30 bg-accent-primary/10":
											selectedBaseModel() === model,
										"border border-transparent": selectedBaseModel() !== model,
									}}
									// biome-ignore lint/a11y/useSemanticElements: <explanation>
									role="option"
									aria-selected={selectedBaseModel() === model}
								>
									<div class="flex min-w-0 flex-1 items-center gap-3">
										<div
											class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-200"
											classList={{
												"border border-accent-primary/50 bg-gradient-to-br from-accent-primary/30 to-accent-secondary/30":
													selectedBaseModel() === model,
												"border border-border-secondary/30 bg-background-tertiary/50":
													selectedBaseModel() !== model,
											}}
										>
											<Cpu
												size={16}
												class={
													selectedBaseModel() === model
														? "text-accent-primary"
														: "text-text-muted"
												}
											/>
										</div>
										<div class="min-w-0 flex-1 flex-col items-start">
											<span
												class="block w-full truncate text-sm font-medium"
												classList={{
													"text-accent-primary": selectedBaseModel() === model,
													"text-text-primary": selectedBaseModel() !== model,
												}}
											>
												{formatModelName(model)}
											</span>
											<span class="block w-full truncate text-xs text-text-muted">
												{getProvider(model)}
											</span>
										</div>
									</div>
									<Show when={selectedBaseModel() === model}>
										<Check size={16} class="flex-shrink-0 text-accent-primary" />
									</Show>
								</button>
							)}
						</For>
					</div>
				</Show>
			</div>
			<button
				type="button"
				onClick={toggleOnline}
				disabled={!canBeOnline()}
				class="flex h-14 flex-shrink-0 items-center gap-2 rounded-lg border border-border-secondary/30 bg-background-tertiary/50 p-3 shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent-secondary/50"
				classList={{
					"cursor-not-allowed opacity-50": !canBeOnline(),
					"hover:bg-background-tertiary/80": canBeOnline(),
				}}
				aria-label="Toggle Web Search"
				title={
					canBeOnline()
						? "Toggle Web Search"
						: "Web search not supported for this model"
				}
			>
				<Search
					size={16}
					class="transition-colors duration-200"
					classList={{
						"text-accent-secondary": isOnlineEnabled(),
						"text-text-muted": !isOnlineEnabled(),
					}}
				/>
				<div
					class="relative h-6 w-10 rounded-full transition-colors duration-200"
					classList={{
						"bg-accent-secondary": isOnlineEnabled(),
						"bg-border-secondary": !isOnlineEnabled(),
					}}
				>
					<div
						class="absolute top-0.5 left-0 h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200"
						classList={{
							"translate-x-4": isOnlineEnabled(),
							"translate-x-0.5": !isOnlineEnabled(),
						}}
					/>
				</div>
			</button>
		</div>
	);
};

export default ModelSelector;