import { createForm } from "@felte/solid";
import { validator } from "@felte/validator-zod";
import { createRoute, useNavigate } from "@tanstack/solid-router";
import UserPlus from "lucide-solid/icons/user-plus";
import { Show, createResource, createSignal } from "solid-js";
import { z } from "zod";
import { rootRoute } from "..";
import { registerApi } from "../lib/auth";
import { useUser } from "../stores/user-store";

const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters long")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters long")
    .max(50, "Last name must be less than 50 characters"),
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters long")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters long")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one lowercase letter, one uppercase letter, and one number"),
  confirmPassword: z
    .string()
    .min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: function Register() {
    const userStore = useUser();
    const navigate = useNavigate();

    const [registerTrigger, setRegisterTrigger] = createSignal<RegisterForm | null>(null);

    const [registerResource] = createResource(registerTrigger, async (formData) => {
      if (!formData) return;

      try {
        const registerData = await registerApi(
          formData.email,
          formData.password,
          formData.username,
          formData.firstName,
          formData.lastName
        );
        userStore.login(registerData);
        navigate({ to: "/" });
        return registerData.token;
      } catch (err) {
        console.error(err);
      }
    });

    const { form, errors, isValid, isSubmitting } = createForm<RegisterForm>({
      extend: validator({ schema: registerSchema }),
      onSubmit: (values) => {
        setRegisterTrigger(values);
      },
      initialValues: {
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      },
    });

    return (
      <div class="min-h-screen bg-background-primary flex items-center justify-center p-4 transition-colors duration-300">
        <div class="w-full max-w-lg p-8 space-y-6 bg-background-secondary/60 backdrop-blur-lg rounded-xl shadow-lg border border-border-primary/30 transition-colors duration-300">
          <h2 class="text-3xl font-bold text-center bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent transition-colors duration-300">
            Create Account
          </h2>

          <form ref={form} class="space-y-5">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  for="firstName"
                  class="block text-sm font-medium text-text-secondary transition-colors duration-300"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autocomplete="given-name"
                  placeholder="John"
                  disabled={isSubmitting() || registerResource.loading}
                  class={`w-full px-4 py-3 bg-background-tertiary/50 border rounded-xl focus:outline-none focus:ring-2 text-text-primary placeholder:text-text-muted transition-all duration-300 hover:bg-background-tertiary/80 backdrop-blur-sm shadow-sm focus:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${errors("firstName")
                    ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50"
                    : "border-border-secondary/30 focus:ring-accent-primary/50 focus:border-accent-primary/50"
                    }`}
                />
                <Show when={errors("firstName")}>
                  <p class="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors("firstName")?.[0]}
                  </p>
                </Show>
              </div>

              <div>
                <label
                  for="lastName"
                  class="block text-sm font-medium text-text-secondary transition-colors duration-300"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autocomplete="family-name"
                  placeholder="Doe"
                  disabled={isSubmitting() || registerResource.loading}
                  class={`w-full px-4 py-3 bg-background-tertiary/50 border rounded-xl focus:outline-none focus:ring-2 text-text-primary placeholder:text-text-muted transition-all duration-300 hover:bg-background-tertiary/80 backdrop-blur-sm shadow-sm focus:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${errors("lastName")
                    ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50"
                    : "border-border-secondary/30 focus:ring-accent-primary/50 focus:border-accent-primary/50"
                    }`}
                />
                <Show when={errors("lastName")}>
                  <p class="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors("lastName")?.[0]}
                  </p>
                </Show>
              </div>
            </div>

            <div>
              <label
                for="username"
                class="block text-sm font-medium text-text-secondary transition-colors duration-300"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autocomplete="username"
                placeholder="johndoe"
                disabled={isSubmitting() || registerResource.loading}
                class={`w-full px-4 py-3 bg-background-tertiary/50 border rounded-xl focus:outline-none focus:ring-2 text-text-primary placeholder:text-text-muted transition-all duration-300 hover:bg-background-tertiary/80 backdrop-blur-sm shadow-sm focus:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${errors("username")
                  ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50"
                  : "border-border-secondary/30 focus:ring-accent-primary/50 focus:border-accent-primary/50"
                  }`}
              />
              <Show when={errors("username")}>
                <p class="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors("username")?.[0]}
                </p>
              </Show>
            </div>

            <div>
              <label
                for="email"
                class="block text-sm font-medium text-text-secondary transition-colors duration-300"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autocomplete="email"
                placeholder="john@example.com"
                disabled={isSubmitting() || registerResource.loading}
                class={`w-full px-4 py-3 bg-background-tertiary/50 border rounded-xl focus:outline-none focus:ring-2 text-text-primary placeholder:text-text-muted transition-all duration-300 hover:bg-background-tertiary/80 backdrop-blur-sm shadow-sm focus:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${errors("email")
                  ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50"
                  : "border-border-secondary/30 focus:ring-accent-primary/50 focus:border-accent-primary/50"
                  }`}
              />
              <Show when={errors("email")}>
                <p class="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors("email")?.[0]}
                </p>
              </Show>
            </div>

            <div>
              <label
                for="password"
                class="block text-sm font-medium text-text-secondary transition-colors duration-300"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autocomplete="new-password"
                placeholder="••••••••"
                disabled={isSubmitting() || registerResource.loading}
                class={`w-full px-4 py-3 bg-background-tertiary/50 border rounded-xl focus:outline-none focus:ring-2 text-text-primary placeholder:text-text-muted transition-all duration-300 hover:bg-background-tertiary/80 backdrop-blur-sm shadow-sm focus:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${errors("password")
                  ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50"
                  : "border-border-secondary/30 focus:ring-accent-primary/50 focus:border-accent-primary/50"
                  }`}
              />
              <Show when={errors("password")}>
                <p class="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors("password")?.[0]}
                </p>
              </Show>
            </div>

            <div>
              <label
                for="confirmPassword"
                class="block text-sm font-medium text-text-secondary transition-colors duration-300"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autocomplete="new-password"
                placeholder="••••••••"
                disabled={isSubmitting() || registerResource.loading}
                class={`w-full px-4 py-3 bg-background-tertiary/50 border rounded-xl focus:outline-none focus:ring-2 text-text-primary placeholder:text-text-muted transition-all duration-300 hover:bg-background-tertiary/80 backdrop-blur-sm shadow-sm focus:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${errors("confirmPassword")
                  ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50"
                  : "border-border-secondary/30 focus:ring-accent-primary/50 focus:border-accent-primary/50"
                  }`}
              />
              <Show when={errors("confirmPassword")}>
                <p class="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors("confirmPassword")?.[0]}
                </p>
              </Show>
            </div>

            <Show when={registerResource.error}>
              <div class="p-3 rounded-md bg-red-500/20 border border-red-500 text-red-700 dark:text-red-300 transition-colors duration-300 shadow-sm">
                <p class="text-sm">{registerResource.error.message}</p>
              </div>
            </Show>

            {/* Submit Button */}
            <div class="pt-2">
              <button
                type="submit"
                disabled={!isValid() || isSubmitting() || registerResource.loading}
                class="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-gradient-to-r from-accent-primary to-accent-secondary hover:from-accent-secondary hover:to-accent-primary text-white rounded-xl transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:ring-offset-2 focus:ring-offset-background-primary shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Show
                  when={!isSubmitting() && !registerResource.loading}
                  fallback={
                    <div class="flex items-center gap-2 z-10">
                      <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </div>
                  }
                >
                  <UserPlus size={20} class="text-white z-10" />
                  <span class="text-white font-semibold z-10">Create Account</span>
                </Show>
              </button>
            </div>

            <div class="text-center pt-2">
              <p class="text-sm text-text-secondary">
                Already have an account?{" "}
                <a
                  href="/login"
                  class="text-accent-primary hover:text-accent-secondary transition-colors duration-300 font-medium"
                >
                  Sign in
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  },
});

export default registerRoute;