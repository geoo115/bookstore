import axios, { AxiosInstance } from 'axios';
import { Book, Order, LoginCredentials, LoginResponse, OrderResponse } from '../types';

export interface User {
  username: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export interface UserProfileUpdate {
  email: string;
  full_name: string;
}

export interface OrderHistory {
  id: string;
  book_id: string;
  book_title: string;
  book_author: string;
  order_date: string;
  status: string;
  username: string;
}

export interface BookStats {
  total_books: number;
  top_authors: Array<{ author: string; count: number }>;
  last_updated: string;
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:8080',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth Service
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await this.api.post('/login', credentials);
    return response.data;
  }

  // User Service
  async getUserProfile(): Promise<User> {
    const response = await this.api.get('/profile');
    return response.data;
  }

  async updateUserProfile(profile: UserProfileUpdate): Promise<User> {
    const response = await this.api.put('/profile', profile);
    return response.data;
  }

  async getAllUsers(): Promise<User[]> {
    const response = await this.api.get('/users');
    return response.data;
  }

  // Book Service
  async getBooks(): Promise<Book[]> {
    const response = await this.api.get('/books');
    return response.data;
  }

  async getBook(id: string): Promise<Book> {
    const response = await this.api.get(`/books/${id}`);
    return response.data;
  }

  async createBook(book: Book): Promise<Book> {
    const response = await this.api.post('/books', book);
    return response.data;
  }

  async deleteBook(id: string): Promise<void> {
    await this.api.delete(`/books/${id}`);
  }

  async getBookStats(): Promise<BookStats> {
    const response = await this.api.get('/books/stats');
    return response.data;
  }

  // Order Service
  async placeOrder(order: Order): Promise<OrderResponse> {
    const response = await this.api.post('/order', order);
    return response.data;
  }

  async getOrderHistory(): Promise<OrderHistory[]> {
    const response = await this.api.get('/orders');
    return response.data;
  }

  async getAllOrders(): Promise<OrderHistory[]> {
    const response = await this.api.get('/orders/all');
    return response.data;
  }
}

export const apiService = new ApiService(); 