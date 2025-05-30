import axios from 'axios';
import type {
  LoginResponse,
  MostOrderedRecord,
  Order,
  PaginatedResponse,
  RecordItem,
  UserInfo,
} from './types';

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || process.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('Request config:', config);
  return config;
});

export const getUser = async (): Promise<UserInfo> => {
  const response = await api.get<UserInfo>('/auth/me');
  return response.data;
};

export const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>('/auth/login', {
      email,
      password,
    });

    if (response.status === 200 && response.data.access_token) {
      localStorage.setItem('jwtToken', response.data.access_token);
      return response.data;
    }

    throw new Error('Login failed');
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errorMessage = error.response.data.message || 'Login failed';
      throw new Error(errorMessage);
    }
    throw new Error('Login failed');
  }
};

export const fetchRecords = async (): Promise<
  PaginatedResponse<RecordItem>
> => {
  const response = await api.get<PaginatedResponse<RecordItem>>(
    '/records?page=1&limit=100',
  );
  return response.data;
};

export const createRecord = async (
  data: Partial<RecordItem>,
): Promise<RecordItem> => {
  const response = await api.post<RecordItem>('/records', data);
  return response.data;
};

export const updateRecord = async (
  id: string,
  data: Partial<RecordItem>,
): Promise<RecordItem> => {
  const response = await api.put<RecordItem>(`/records/${id}`, data, {});
  return response.data;
};

export const createOrder = async (
  recordId: string,
  quantity: number,
): Promise<Order> => {
  try {
    const response = await api.post<Order>(`/orders`, { recordId, quantity });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errorMessage =
        error.response.data.message || 'Order creation failed';
      throw new Error(errorMessage);
    }
    throw new Error('Order creation failed');
  }
};

export const fetchMostOrderedRecords = async (): Promise<
  MostOrderedRecord[]
> => {
  const response = await api.get<MostOrderedRecord[]>('/orders/most-ordered');
  return response.data;
};
