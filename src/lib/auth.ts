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

export interface User {
	id: number;
	email: string;
	username: string;
	firstName: string;
	lastName: string;
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
