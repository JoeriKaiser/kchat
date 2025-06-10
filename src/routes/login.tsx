import { createRoute, useNavigate } from "@tanstack/solid-router";
import LogIn from "lucide-solid/icons/log-in";
import { Show, createResource, createSignal } from "solid-js";
import { rootRoute } from "..";
import { loginApi } from "../lib/auth";
import { useUser } from "../stores/user-store";

const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/login",
	component: function Index() {
		const userStore = useUser();
		const navigate = useNavigate();

		const [email, setEmail] = createSignal("");
		const [password, setPassword] = createSignal("");
		const [loginTrigger, setLoginTrigger] = createSignal();

		const [loginResource] = createResource(loginTrigger, async () => {
			if (!loginTrigger()) return;

			try {
				const loginData = await loginApi(email(), password());
				userStore.login(loginData);
				navigate({ to: "/" });
				return loginData.token;
			} catch (err) {
				// biome-ignore lint/complexity/noUselessCatch: Not useless
				throw err;
			}
		});

		const handleSubmit = (e: SubmitEvent) => {
			e.preventDefault();
			setLoginTrigger({ email: email(), password: password() });
		};

		return (
			<div class="min-h-screen bg-background-primary flex items-center justify-center p-4 transition-colors duration-300">
				<div class="w-full max-w-md p-8 space-y-6 bg-background-secondary/60 backdrop-blur-lg rounded-xl shadow-lg border border-border-primary/30 transition-colors duration-300">
					<h2 class="text-3xl font-bold text-center bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent transition-colors duration-300">
						Welcome Back!
					</h2>
					<form class="space-y-6" onSubmit={handleSubmit}>
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
								required
								value={email()}
								onInput={(e) => setEmail(e.currentTarget.value)}
								class="w-full px-4 py-3 bg-background-tertiary/50 border border-border-secondary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary/50 text-text-primary placeholder:text-text-muted transition-all duration-300 hover:bg-background-tertiary/80 backdrop-blur-sm shadow-sm focus:shadow-md"
							/>
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
								required
								value={password()}
								onInput={(e) => setPassword(e.currentTarget.value)}
								class="w-full px-4 py-3 bg-background-tertiary/50 border border-border-secondary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary/50 text-text-primary placeholder:text-text-muted transition-all duration-300 hover:bg-background-tertiary/80 backdrop-blur-sm shadow-sm focus:shadow-md"
							/>
						</div>

						<Show when={loginResource.error}>
							<div class="p-3 rounded-md bg-red-500/20 border border-red-500 text-red-700 dark:text-red-300 transition-colors duration-300 shadow-sm">
								<p class="text-sm">{loginResource.error.message}</p>
							</div>
						</Show>

						<div>
							<button
								type="submit"
								disabled={loginResource.loading}
								class="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-gradient-to-r from-accent-primary to-accent-secondary hover:from-accent-secondary hover:to-accent-primary text-white rounded-xl transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:ring-offset-2 focus:ring-offset-background-primary shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden disabled:opacity-60 disabled:cursor-wait"
							>
								<div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
								<Show
									when={!loginResource.loading}
									fallback={<span class="z-10">Logging in...</span>}
								>
									<LogIn size={20} class="text-white z-10" />
									<span class="text-white font-semibold z-10">Log In</span>
								</Show>
							</button>
						</div>
					</form>
				</div>
			</div>
		);
	},
});

export default indexRoute;
