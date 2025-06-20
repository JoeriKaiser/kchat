import { toast } from "solid-sonner";

interface ApiUser {
	id: number;
	email: string;
	username: string;
	first_name: string;
	last_name: string;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

interface LoginApiResponse {
	data: ApiUser;
	message: string;
	token: string;
}

interface RegisterApiResponse {
	data: ApiUser;
	message: string;
	token: string;
}

export interface User {
	id: number;
	email: string;
	username: string;
	firstName: string;
	lastName: string;
}

interface SaveApiKeyResponse {
	message: string;
	success: boolean;
}

interface GetApiKeyResponse {
	data: {
		openrouter_key: string | null;
		masked_key: string | null;
	};
	message: string;
}

export const loginApi = async (
	email: string,
	password: string,
): Promise<{ user: User; token: string }> => {
	const apiUrl =
		import.meta.env.VITE_LOGIN_URL || "http://localhost:8080/api/v1/auth/login";

	const response = await fetch(apiUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ email, password }),
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({
			message: `Request failed with status ${response.status}`,
		}));
		toast.error(errorData.message || "An unknown error occurred.");
		throw new Error(errorData.message || "An unknown error occurred.");
	}

	const responseData: LoginApiResponse = await response.json();

	const user: User = {
		id: responseData.data.id,
		email: responseData.data.email,
		username: responseData.data.username,
		firstName: responseData.data.first_name,
		lastName: responseData.data.last_name,
	};

	return {
		user,
		token: responseData.token,
	};
};

export const registerApi = async (
	email: string,
	password: string,
	username: string,
	firstName: string,
	lastName: string,
): Promise<{ user: User; token: string }> => {
	const apiUrl =
		import.meta.env.VITE_REGISTER_URL ||
		"http://localhost:8080/api/v1/auth/register";

	const response = await fetch(apiUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			email,
			password,
			username,
			first_name: firstName,
			last_name: lastName,
		}),
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({
			message: `Request failed with status ${response.status}`,
		}));
		toast.error(errorData.message || "An unknown error occurred.");
		throw new Error(errorData.message || "An unknown error occurred.");
	}

	const responseData: RegisterApiResponse = await response.json();

	const user: User = {
		id: responseData.data.id,
		email: responseData.data.email,
		username: responseData.data.username,
		firstName: responseData.data.first_name,
		lastName: responseData.data.last_name,
	};

	return {
		user,
		token: responseData.token,
	};
};

export const saveOpenRouterKey = async (
	apiKey: string,
	token: string,
): Promise<SaveApiKeyResponse> => {
	const apiUrl =
		`${import.meta.env.VITE_API_URL}/users/openrouter-key` ||
		"http://localhost:8080/api/v1/users/openrouter-key";

	const response = await fetch(apiUrl, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ openrouter_key: apiKey }),
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({
			message: `Request failed with status ${response.status}`,
		}));
		toast.error(errorData.message || "Failed to save API key.");
		throw new Error(errorData.message || "Failed to save API key.");
	}

	const responseData: SaveApiKeyResponse = await response.json();
	return responseData;
};

export const getOpenRouterKey = async (token: string): Promise<boolean> => {
	const apiUrl =
		`${import.meta.env.VITE_API_URL}/users/openrouter-key/status` ||
		"http://localhost:8080/api/v1/users/openrouter-key/status";

	const response = await fetch(apiUrl, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({
			message: `Request failed with status ${response.status}`,
		}));
		toast.error(errorData.message || "Failed to fetch API key status.");
		throw new Error(errorData.message || "Failed to fetch API key status.");
	}

	try {
		const data = await response.json();

		if (typeof data.has_key === "boolean") {
			console.log("Backend response has_key:", data.has_key);
			return data.has_key;
			// biome-ignore lint/style/noUselessElse: <explanation>
		} else {
			const errorMessage =
				"Backend response for /openrouter-key/status did not contain a boolean 'has_key' field.";
			console.warn(errorMessage, data);
			toast.error(errorMessage);
			throw new Error(errorMessage);
		}
	} catch (e) {
		const errorMessage = `Failed to parse or interpret API key status response: ${e instanceof Error ? e.message : String(e)}`;
		console.error(errorMessage, e);
		toast.error(errorMessage);
		throw new Error(errorMessage);
	}
};
