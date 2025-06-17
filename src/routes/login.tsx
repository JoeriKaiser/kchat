import { createForm } from "@felte/solid";
import { validator } from "@felte/validator-zod";
import { createRoute, useNavigate } from "@tanstack/solid-router";
import LogIn from "lucide-solid/icons/log-in";
import { Show, createResource, createSignal } from "solid-js";
import { z } from "zod";
import { rootRoute } from "..";
import { loginApi } from "../lib/auth";
import { useUser } from "../stores/user-store";

const loginSchema = z.object({
	email: z
		.string()
		.min(1, "Email is required")
		.email("Please enter a valid email address"),
	password: z
		.string()
		.min(1, "Password is required")
		.min(6, "Password must be at least 6 characters long"),
});

type LoginForm = z.infer<typeof loginSchema>;

const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/login",
	component: function Index() {
		const userStore = useUser();
		const navigate = useNavigate();

		const [loginTrigger, setLoginTrigger] = createSignal<LoginForm | null>(null);

		const [loginResource] = createResource(loginTrigger, async (formData) => {
			if (!formData) return;

			try {
				const loginData = await loginApi(formData.email, formData.password);
				userStore.login(loginData);
				navigate({ to: "/" });
				return loginData.token;
			} catch (err) {
				console.error(err);
			}
		});

		const { form, errors, isValid, isSubmitting } = createForm<LoginForm>({
			extend: validator({ schema: loginSchema }),
			onSubmit: (values) => {
				setLoginTrigger(values);
			},
			initialValues: {
				email: "",
				password: "",
			},
		});

		return (
			<div class="min-h-screen bg-background-primary flex items-center justify-center p-4 transition-colors duration-300">
				<div class="w-full max-w-md p-8 space-y-6 bg-background-secondary/60 backdrop-blur-lg rounded-xl shadow-lg border border-border-primary/30 transition-colors duration-300">
					<h2 class="text-3xl font-bold text-center bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent transition-colors duration-300">
						Welcome Back!
					</h2>

					<form ref={form} class="space-y-6">
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
								placeholder="your@email.com"
								disabled={isSubmitting() || loginResource.loading}
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
								autocomplete="current-password"
								placeholder="••••••••"
								disabled={isSubmitting() || loginResource.loading}
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

						<Show when={loginResource.error}>
							<div class="p-3 rounded-md bg-red-500/20 border border-red-500 text-red-700 dark:text-red-300 transition-colors duration-300 shadow-sm">
								<p class="text-sm">{loginResource.error.message}</p>
							</div>
						</Show>

						<div>
							<button
								type="submit"
								disabled={!isValid() || isSubmitting() || loginResource.loading}
								class="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-gradient-to-r from-accent-primary to-accent-secondary hover:from-accent-secondary hover:to-accent-primary text-white rounded-xl transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:ring-offset-2 focus:ring-offset-background-primary shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
							>
								<div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
								<Show
									when={!isSubmitting() && !loginResource.loading}
									fallback={
										<div class="flex items-center gap-2 z-10">
											<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
											<span>Logging in...</span>
										</div>
									}
								>
									<LogIn size={20} class="text-white z-10" />
									<span class="text-white font-semibold z-10">Log In</span>
								</Show>
							</button>
							<div class="text-center pt-2">
								<p class="text-sm text-text-secondary">
									Don't have an account?{" "}
									<a
										href="/register"
										class="text-accent-primary hover:text-accent-secondary transition-colors duration-300 font-medium"
									>
										Register
									</a>
								</p>
							</div>
						</div>
					</form>
				</div>
			</div>
		);
	},
});

export default indexRoute;