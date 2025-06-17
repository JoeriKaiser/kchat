import { createForm } from "@felte/solid";
import { validator } from "@felte/validator-zod";
import { createRoute, useNavigate } from "@tanstack/solid-router";
import ArrowLeft from "lucide-solid/icons/arrow-left";
import CheckCircle from "lucide-solid/icons/check-circle";
import Eye from "lucide-solid/icons/eye";
import EyeOff from "lucide-solid/icons/eye-off";
import Key from "lucide-solid/icons/key";
import Save from "lucide-solid/icons/save";
import { Show, createResource, createSignal, onMount } from "solid-js";
import { z } from "zod";
import { rootRoute } from "..";
import { getOpenRouterKey, saveOpenRouterKey } from "../lib/auth";
import { useUser } from "../stores/user-store";

const apiKeySchema = z.object({
  apiKey: z
    .string()
    .min(1, "API key is required")
    .regex(/^sk-or-v1-[a-f0-9]{64}$/, "Please enter a valid OpenRouter API key (starts with sk-or-v1-)"),
});

type ApiKeyForm = z.infer<typeof apiKeySchema>;

const personalizationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/personalization",
  component: function Personalization() {
    const userStore = useUser();
    const navigate = useNavigate();

    const [showApiKey, setShowApiKey] = createSignal(false);
    const [saveSuccess, setSaveSuccess] = createSignal(false);
    const [saveTrigger, setSaveTrigger] = createSignal<ApiKeyForm | null>(null);
    const [currentKeyInfo, setCurrentKeyInfo] = createSignal<{ maskedKey: string | null; hasKey: boolean } | null>(null);

    onMount(() => {
      if (!userStore.user || !userStore.jwt) {
        navigate({ to: "/login" });
      }
    });

    const [keyInfoResource] = createResource(
      () => userStore.jwt,
      async (jwt) => {
        if (!jwt) return null;
        try {
          const keyInfo = await getOpenRouterKey(jwt);
          setCurrentKeyInfo(keyInfo);
          return keyInfo;
        } catch (err) {
          console.error("Failed to fetch API key info:", err);
          return null;
        }
      }
    );

    const [saveResource] = createResource(saveTrigger, async (formData) => {
      if (!formData || !userStore.jwt) return;

      try {
        const result = await saveOpenRouterKey(formData.apiKey, userStore.jwt);
        setSaveSuccess(true);

        const updatedKeyInfo = await getOpenRouterKey(userStore.jwt);
        setCurrentKeyInfo(updatedKeyInfo);

        setTimeout(() => setSaveSuccess(false), 3000);

        return result;
      } catch (err) {
        console.error(err);
      }
    });

    const { form, errors, isValid, isSubmitting, reset } = createForm<ApiKeyForm>({
      extend: validator({ schema: apiKeySchema }),
      onSubmit: (values) => {
        setSaveTrigger(values);
      },
      initialValues: {
        apiKey: "",
      },
    });

    const handleBackClick = () => {
      navigate({ to: "/" });
    };

    return (
      <div class="min-h-screen bg-background-primary py-8 px-4 transition-colors duration-300">
        <div class="max-w-2xl mx-auto">
          <div class="mb-8 flex items-center">
            <button
              onClick={handleBackClick}
              type="button"
              class="mr-4 p-2 rounded-full hover:bg-background-secondary/50 text-text-secondary hover:text-text-primary transition-colors duration-300"
              aria-label="Go back"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 class="text-3xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent transition-colors duration-300">
                Settings
              </h1>
              <p class="text-text-secondary mt-2">
                Manage your account preferences and API configurations
              </p>
            </div>
          </div>

          <div class="bg-background-secondary/60 backdrop-blur-lg rounded-xl shadow-lg border border-border-primary/30 p-6 transition-colors duration-300">
            <div class="flex items-center gap-3 mb-6">
              <div class="flex items-center justify-center w-10 h-10 bg-accent-primary/20 rounded-lg">
                <Key size={20} class="text-accent-primary" />
              </div>
              <div>
                <h2 class="text-xl font-semibold text-text-primary">
                  OpenRouter API Key
                </h2>
                <p class="text-sm text-text-secondary">
                  Configure your personal OpenRouter API key
                </p>
              </div>
            </div>

            <Show when={!keyInfoResource.loading && currentKeyInfo()}>
              <div class="mb-6 p-4 bg-background-tertiary/30 rounded-lg border border-border-secondary/20">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-text-secondary">Current API Key</p>
                    <Show
                      when={currentKeyInfo()?.hasKey}
                      fallback={
                        <p class="text-sm text-text-muted">No API key configured</p>
                      }
                    >
                      <p class="text-sm text-text-primary font-mono">
                        {currentKeyInfo()?.maskedKey || "••••••••••••••••"}
                      </p>
                    </Show>
                  </div>
                  <Show when={currentKeyInfo()?.hasKey}>
                    <div class="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle size={16} />
                      <span class="text-sm font-medium">Active</span>
                    </div>
                  </Show>
                </div>
              </div>
            </Show>

            <Show when={saveSuccess()}>
              <div class="mb-6 p-4 rounded-lg bg-green-500/20 border border-green-500/50 text-green-700 dark:text-green-300 transition-all duration-300">
                <div class="flex items-center gap-2">
                  <CheckCircle size={16} />
                  <p class="text-sm font-medium">API key saved successfully!</p>
                </div>
              </div>
            </Show>

            <form ref={form} class="space-y-6">
              <div>
                <label
                  for="apiKey"
                  class="block text-sm font-medium text-text-secondary mb-2 transition-colors duration-300"
                >
                  OpenRouter API Key
                </label>
                <div class="relative">
                  <input
                    id="apiKey"
                    name="apiKey"
                    type={showApiKey() ? "text" : "password"}
                    placeholder="sk-or-v1-..."
                    disabled={isSubmitting() || saveResource.loading}
                    autocomplete="new-password"
                    class={`w-full px-4 py-3 pr-12 bg-background-tertiary/50 border rounded-xl focus:outline-none focus:ring-2 text-text-primary placeholder:text-text-muted transition-all duration-300 hover:bg-background-tertiary/80 backdrop-blur-sm shadow-sm focus:shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-mono ${errors("apiKey")
                      ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50"
                      : "border-border-secondary/30 focus:ring-accent-primary/50 focus:border-accent-primary/50"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey())}
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors duration-200"
                  >
                    <Show when={showApiKey()} fallback={<Eye size={20} />}>
                      <EyeOff size={20} />
                    </Show>
                  </button>
                </div>
                <Show when={errors("apiKey")}>
                  <p class="mt-2 text-sm text-red-600 dark:text-red-400">
                    {errors("apiKey")?.[0]}
                  </p>
                </Show>
                <p class="mt-2 text-xs text-text-muted">
                  Get your API key from{" "}
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-accent-primary hover:text-accent-secondary transition-colors duration-200 underline"
                  >
                    OpenRouter Dashboard
                  </a>
                </p>
              </div>

              <Show when={saveResource.error}>
                <div class="p-3 rounded-md bg-red-500/20 border border-red-500 text-red-700 dark:text-red-300 transition-colors duration-300 shadow-sm">
                  <p class="text-sm">{saveResource.error.message}</p>
                </div>
              </Show>

              <div class="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={!isValid() || isSubmitting() || saveResource.loading}
                  class="flex-1 flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-accent-primary to-accent-secondary hover:from-accent-secondary hover:to-accent-primary text-white rounded-xl transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:ring-offset-2 focus:ring-offset-background-primary shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <Show
                    when={!isSubmitting() && !saveResource.loading}
                    fallback={
                      <div class="flex items-center gap-2 z-10">
                        <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </div>
                    }
                  >
                    <Save size={18} class="text-white z-10" />
                    <span class="text-white font-semibold z-10">Save API Key</span>
                  </Show>
                </button>

                <button
                  type="button"
                  onClick={() => reset()}
                  disabled={isSubmitting() || saveResource.loading}
                  class="px-4 py-3 bg-background-tertiary/50 hover:bg-background-tertiary/80 text-text-secondary hover:text-text-primary rounded-xl transition-all duration-300 border border-border-secondary/30 hover:border-border-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:ring-offset-2 focus:ring-offset-background-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>

          <div class="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h3 class="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
              About OpenRouter API Keys
            </h3>
            <p class="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
              Your API key is securely stored and used to access OpenRouter's AI models.
              This allows you to use your own quota and potentially access different models
              than the default configuration. Your key is encrypted and never shared.
            </p>
          </div>
        </div>
      </div>
    );
  },
});

export default personalizationRoute;