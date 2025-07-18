export interface Book {
  id: string;
  title: string;
  author: string;
}

export interface Order {
  book_id: string;
}

export interface OrderResponse {
  message: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface AuthContextType {
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
} 