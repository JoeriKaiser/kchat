import {
  type Component,
  type JSX,
  createContext,
  createEffect,
  createResource,
  useContext,
} from "solid-js";
import { createStore } from "solid-js/store";
import {
  connectWebSocket,
  disconnectWebSocket,
  isConnected as isWsConnected,
  latestMessage,
  sendWebSocketMessage,
} from "../lib/websocket";

export interface User {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
}

interface UserState {
  jwt: string | null;
  user: User | null;
  isLoading: boolean;
  wsConnected: boolean;
  wsLatestMessage: ReturnType<typeof latestMessage>;
}

interface UserStore extends UserState {
  isLoggedIn: boolean;
  fullName: string;
  login: (data: { user: User; token: string }) => void;
  logout: () => void;
  sendWsMessage: <T>(type: string, payload: T) => void; // Expose send function
}

const UserContext = createContext<UserStore>();

const fetchInitialUser = async (): Promise<{
  jwt: string;
  user: User;
} | null> => {
  const token = localStorage.getItem("jwt");
  const userJson = localStorage.getItem("user");

  if (!token || !userJson) {
    return null;
  }

  try {
    const user: User = JSON.parse(userJson);
    return { jwt: token, user: user };
  } catch (error) {
    console.error("Invalid user data found in localStorage", error);
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    return null;
  }
};

export const UserProvider: Component<{ children: JSX.Element }> = (props) => {
  const [initialUser] = createResource(fetchInitialUser);

  const [state, setState] = createStore<UserState>({
    jwt: null,
    user: null,
    get isLoading() {
      return initialUser.loading;
    },
    wsConnected: false,
    wsLatestMessage: null,
  });

  createEffect(() => {
    const data = initialUser();
    if (data) {
      setState({ jwt: data.jwt, user: data.user });
    }
  });

  createEffect(() => {
    const currentJwt = state.jwt;
    setState("wsConnected", isWsConnected());
    setState("wsLatestMessage", latestMessage());

    if (currentJwt && !isWsConnected()) {
      console.log("User JWT detected, ensuring WebSocket connection...");
      connectWebSocket(currentJwt);
    } else if (!currentJwt && isWsConnected()) {
      console.log("No JWT, disconnecting WebSocket...");
      disconnectWebSocket();
    }
  });

  createEffect(() => {
    setState("wsLatestMessage", latestMessage());
  });

  createEffect(() => {
    setState("wsConnected", isWsConnected());
  });

  const login = (data: { user: User; token: string }) => {
    localStorage.setItem("jwt", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    setState({
      jwt: data.token,
      user: data.user,
    });
  };

  const logout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    setState({
      jwt: null,
      user: null,
    });
    disconnectWebSocket();
  };

  const store: UserStore = {
    get jwt() {
      return state.jwt;
    },
    get user() {
      return state.user;
    },
    get isLoading() {
      return state.isLoading;
    },
    get isLoggedIn() {
      return !!state.jwt && !state.isLoading;
    },
    get fullName() {
      if (!state.user) return "";
      return `${state.user.firstName} ${state.user.lastName}`;
    },
    get wsConnected() {
      return state.wsConnected;
    },
    get wsLatestMessage() {
      return state.wsLatestMessage;
    },
    login,
    logout,
    sendWsMessage: sendWebSocketMessage,
  };

  return (
    <UserContext.Provider value={store}>{props.children}</UserContext.Provider>
  );
};

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}