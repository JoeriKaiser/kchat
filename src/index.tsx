import {
  RouterProvider,
  createRootRoute,
  createRouter,
} from "@tanstack/solid-router";
import { TanStackRouterDevtools } from "@tanstack/solid-router-devtools";
import { render } from "solid-js/web";
import "./index.css";
import { Toaster } from "solid-sonner";
import { Layout } from "./components/layout";
import indexRoute from "./routes";
import loginRoute from "./routes/login";
import personalizationRoute from "./routes/personalization";
import registerRoute from "./routes/register";
import { UserProvider } from "./stores/user-store";

export const rootRoute = createRootRoute({
  component: () => (
    <UserProvider>
      <Toaster />
      <Layout />
      {/* <TanStackRouterDevtools /> */}
    </UserProvider>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  personalizationRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/solid-router" {
  interface Register {
    router: typeof router;
  }
}

// biome-ignore lint/style/noNonNullAssertion: This is a valid assertion
const rootElement = document.getElementById("root")!;

if (!rootElement.innerHTML) {
  render(() => <RouterProvider router={router} />, rootElement);
}