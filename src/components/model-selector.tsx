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
	const effectiveModel = createMemo(() => chatSelectors.getEffectiveModel());


	const canBeOnline = createMemo(() => {
		const currentBase = selectedBaseModel();
		return (
			currentBase.startsWith("openai/") || currentBase.startsWith("google/")
		);
	});

	const handleBaseModelSelect = (model: string) => {
		chatActions.setSelectedBaseModel(model);
		setIsOpen(false);
		if (!canBeOnline()) {
			if (isOnlineEnabled()) {
				chatActions.toggleOnlineEnabled();
			}
		}
	};

	const toggleOnline = () => {
		chatActions.toggleOnlineEnabled();
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
		<div class={`relative ${props.class || ""}`}>
			<button
				ref={buttonRef}
				type="button"
				onClick={toggleDropdown}
				onKeyDown={handleKeyDown}
				class="w-full flex items-center justify-between gap-3 p-3 rounded-lg bg-background-tertiary/50 text-text-primary border border-border-secondary/30 hover:bg-background-tertiary/80 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary/50 transition-all duration-200 backdrop-blur-sm shadow-sm hover:shadow-md group"
				aria-label="Select AI Model"
				aria-expanded={isOpen()}
				aria-haspopup="listbox"
			>
				<div class="flex items-center gap-3 min-w-0 flex-1">
					<div class="w-8 h-8 rounded-full bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 border border-accent-primary/30 flex items-center justify-center flex-shrink-0">
						<Cpu size={16} class="text-accent-primary" />
					</div>
					<div class="flex flex-col items-start min-w-0 flex-1">
						<span class="text-sm font-medium text-text-primary truncate w-full text-left">
							{formatModelName(selectedBaseModel())}
							<Show when={isOnlineEnabled()}>
								<span class="text-xs text-text-muted ml-1">(Online)</span>
							</Show>
						</span>
						<span class="text-xs text-text-muted truncate w-full text-left">
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
					class="absolute bottom-full left-0 right-0 mb-2 p-2 rounded-lg bg-background-secondary/95 backdrop-blur-md border border-border-secondary/50 shadow-xl z-50 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-border-primary/50 scrollbar-track-transparent"
					// biome-ignore lint/a11y/useSemanticElements: <explanation>
					role="listbox"
				>
					<For each={models}>
						{(model) => (
							<button
								type="button"
								onClick={() => handleBaseModelSelect(model)}
								class={`w-full flex items-center justify-between gap-3 p-3 rounded-lg text-left transition-all duration-200 hover:bg-background-tertiary/60 focus:outline-none focus:bg-background-tertiary/60 ${selectedBaseModel() === model
									? "bg-accent-primary/10 border border-accent-primary/30"
									: "border border-transparent"
									}`}
								// biome-ignore lint/a11y/useSemanticElements: <explanation>
								role="option"
								aria-selected={selectedBaseModel() === model}
							>
								<div class="flex items-center gap-3 min-w-0 flex-1">
									<div
										class={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${selectedBaseModel() === model
											? "bg-gradient-to-br from-accent-primary/30 to-accent-secondary/30 border border-accent-primary/50"
											: "bg-background-tertiary/50 border border-border-secondary/30"
											}`}
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
									<div class="flex flex-col items-start min-w-0 flex-1">
										<span
											class={`text-sm font-medium truncate w-full ${selectedBaseModel() === model
												? "text-accent-primary"
												: "text-text-primary"
												}`}
										>
											{formatModelName(model)}
										</span>
										<span class="text-xs text-text-muted truncate w-full">
											{getProvider(model)}
										</span>
									</div>
								</div>
								<Show when={selectedBaseModel() === model}>
									<Check size={16} class="text-accent-primary flex-shrink-0" />
								</Show>
							</button>
						)}
					</For>

					{/* Online Toggle Section */}
					<div class="border-t border-border-secondary/50 pt-2 mt-2">
						<button
							type="button"
							onClick={toggleOnline}
							disabled={!canBeOnline()}
							class={`w-full flex items-center justify-between gap-3 p-3 rounded-lg text-left transition-all duration-200 ${!canBeOnline()
								? "opacity-50 cursor-not-allowed"
								: "hover:bg-background-tertiary/60 focus:outline-none focus:bg-background-tertiary/60"
								} ${isOnlineEnabled()
									? "bg-accent-secondary/10 border border-accent-secondary/30"
									: "border border-transparent"
								}`}
						>
							<div class="flex items-center gap-3 min-w-0 flex-1">
								<div
									class={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${isOnlineEnabled()
										? "bg-gradient-to-br from-accent-secondary/30 to-accent-tertiary/30 border border-accent-secondary/50"
										: "bg-background-tertiary/50 border border-border-secondary/30"
										}`}
								>
									<Search
										size={16}
										class={
											isOnlineEnabled() ? "text-accent-secondary" : "text-text-muted"
										}
									/>
								</div>
								<div class="flex flex-col items-start min-w-0 flex-1">
									<span
										class={`text-sm font-medium truncate w-full ${isOnlineEnabled()
											? "text-accent-secondary"
											: "text-text-primary"
											}`}
									>
										Enable Web Search
									</span>
									<span
										class={`text-xs truncate w-full ${canBeOnline() ? "text-text-muted" : "text-red-400"
											}`}
									>
										{canBeOnline()
											? "Adds internet access to the model"
											: "Not supported by current model"}
									</span>
								</div>
							</div>
							<div
								class={`relative w-10 h-6 rounded-full transition-colors duration-200 ${isOnlineEnabled() ? "bg-accent-secondary" : "bg-border-secondary"
									}`}
							>
								<div
									class={`absolute left-0 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${isOnlineEnabled() ? "translate-x-4" : "translate-x-0.5"
										}`}
								/>
							</div>
						</button>
					</div>
				</div>
			</Show>
		</div>
	);
};

export default ModelSelector;
