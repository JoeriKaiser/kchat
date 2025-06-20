import { createSignal } from "solid-js";
import { handleWebSocketMessage } from "../stores/chat";

interface ClientConnectedPayload {
	type: "client_connected";
	data: {
		client_id: string;
	};
}

interface OtherMessagePayload {
	type: "chat_created" | "message_added" | "chat_deleted" | "message_deleted";
	data: Record<string, unknown>;
}

type WebSocketMessage = ClientConnectedPayload | OtherMessagePayload;

const WS_URL =
	import.meta.env.VITE_WEBSOCKET_URL || "ws://localhost:8080/api/v1/auth/ws";
const RECONNECT_INTERVAL = 5000;

const [webSocket, setWebSocket] = createSignal<WebSocket | null>(null);
const [isConnected, setIsConnected] = createSignal(false);
const [latestMessage, setLatestMessage] = createSignal<WebSocketMessage | null>(
	null,
);
const [clientId, setClientId] = createSignal<string>("");

let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let currentToken: string | null = null;

function connectWebSocket(token: string, isConnectionManagedByStore = false) {
	if (webSocket() && webSocket()?.readyState === WebSocket.OPEN) {
		console.log("WebSocket already connected.");
		return;
	}

	if (
		webSocket() &&
		(webSocket()?.readyState === WebSocket.CONNECTING || currentToken === token)
	) {
		console.log("WebSocket already connecting with the same token.");
		return;
	}

	if (reconnectTimeout) {
		clearTimeout(reconnectTimeout);
		reconnectTimeout = null;
	}

	currentToken = token;
	console.log("Attempting to connect WebSocket...");
	const ws = new WebSocket(`${WS_URL}?token=${token}`);

	ws.onopen = () => {
		console.log("WebSocket connected!");
		setWebSocket(ws);
		setIsConnected(true);
		currentToken = token;

		sendWebSocketMessage("client_connect", {});
	};

	ws.onmessage = (event) => {
		try {
			const message = JSON.parse(event.data) as WebSocketMessage;
			setLatestMessage(message);

			switch (message.type) {
				case "client_connected":
					setClientId(message.data.client_id);
					console.log("Client ID received:", message.data.client_id);
					break;

				default:
					handleWebSocketMessage(message);
					break;
			}
		} catch (e) {
			console.error("Failed to parse WebSocket message:", e, event.data);
		}
	};

	ws.onclose = (event) => {
		console.warn(
			`WebSocket disconnected. Code: ${event.code}, Reason: ${event.reason}`,
		);
		setWebSocket(null);
		setIsConnected(false);
		setClientId("");

		if (currentToken && event.code !== 1000 && !isConnectionManagedByStore) {
			console.log(
				`Attempting to reconnect in ${RECONNECT_INTERVAL / 1000}s...`,
			);
			reconnectTimeout = setTimeout(
				// biome-ignore lint/style/noNonNullAssertion: currentToken is checked above
				() => connectWebSocket(currentToken!),
				RECONNECT_INTERVAL,
			);
		} else {
			console.log(
				"Not attempting reconnect: no token or clean close or store is managing.",
			);
			currentToken = null;
		}
	};

	ws.onerror = (error) => {
		console.error("WebSocket error:", error);
	};
}

function disconnectWebSocket() {
	if (webSocket()) {
		console.log("Disconnecting WebSocket...");
		webSocket()?.close(1000, "User logged out or session ended");
		setWebSocket(null);
		setIsConnected(false);
		setClientId("");
		currentToken = null;
		if (reconnectTimeout) {
			clearTimeout(reconnectTimeout);
			reconnectTimeout = null;
		}
	} else {
		console.log("WebSocket is not connected, no need to disconnect.");
	}
}

function sendWebSocketMessage<T>(type: string, data: T) {
	const ws = webSocket();
	if (ws && ws.readyState === WebSocket.OPEN) {
		const message = JSON.stringify({
			type,
			data,
			client_id: clientId(),
		});
		ws.send(message);
	} else {
		console.warn("WebSocket is not connected. Cannot send message.");
	}
}

function getClientId(): string {
	return clientId();
}

export {
	webSocket,
	isConnected,
	latestMessage,
	clientId,
	connectWebSocket,
	disconnectWebSocket,
	sendWebSocketMessage,
	getClientId,
};
