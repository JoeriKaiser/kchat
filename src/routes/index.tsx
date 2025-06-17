import { createRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import { rootRoute } from "..";
import ChatArea from "../components/area/area";
import Sidebar from "../components/sidebar/sidebar";

const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/",
	component: function Index() {
		const [isSidebarOpen, setIsSidebarOpen] = createSignal(false);

		return (
			<div class="relative flex h-screen w-full overflow-hidden bg-linen-500">
				<Sidebar
					isOpen={isSidebarOpen()}
					onClose={() => setIsSidebarOpen(false)}
				/>
				<ChatArea onMenuClick={() => setIsSidebarOpen(true)} />
			</div>
		);
	},
});

export default indexRoute;
