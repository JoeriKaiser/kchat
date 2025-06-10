import { createRoute } from "@tanstack/solid-router";
import { rootRoute } from "..";
import ChatArea from "../components/area/area";
import Sidebar from "../components/sidebar/Sidebar";

const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/",
	component: function Index() {
		return (
			<div class="h-screen flex bg-linen-500">
				<Sidebar />
				<ChatArea />
			</div>
		);
	},
});

export default indexRoute;
